const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const db = require("../config/db");
const {
  expirePendingOrder,
  expirePendingOrders,
} = require("../services/orderInventory");

const refundExpiredPayment = async (payment) => {
  let gatewayPayment = await razorpay.payments.fetch(payment.razorpay_payment_id);
  const amountInPaise = Math.round(Number(payment.amount) * 100);

  if (
    gatewayPayment.order_id !== payment.razorpay_order_id ||
    Number(gatewayPayment.amount) !== amountInPaise ||
    gatewayPayment.currency !== "INR"
  ) {
    throw new Error("Razorpay payment details do not match the expired order");
  }

  if (gatewayPayment.status === "authorized") {
    gatewayPayment = await razorpay.payments.capture(
      payment.razorpay_payment_id,
      amountInPaise,
      "INR",
    );
  }
  if (gatewayPayment.status !== "captured") {
    throw new Error(`Late Razorpay payment is not refundable (${gatewayPayment.status})`);
  }

  const refunds = await razorpay.payments.fetchMultipleRefund(
    payment.razorpay_payment_id,
    { count: 100 },
  );
  const refundedAmount = (refunds.items || [])
    .filter((refund) => ["processed", "pending"].includes(refund.status))
    .reduce((total, refund) => total + Number(refund.amount || 0), 0);

  if (refundedAmount >= amountInPaise) {
    return refunds.items.some((refund) => refund.status === "pending")
      ? "REFUND_PENDING"
      : "REFUNDED";
  }

  const refund = await razorpay.payments.refund(
    payment.razorpay_payment_id,
    { amount: amountInPaise - refundedAmount },
  );
  return refund.status === "processed" ? "REFUNDED" : "REFUND_PENDING";
};

const createPaymentOrder = async (req, res) => {
  let connection;
  try {
    const order_id = req.body?.order_id;
    const parsedOrderId = Number(order_id);
    if (!Number.isInteger(parsedOrderId) || parsedOrderId <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid order_id is required",
      });
    }

    await expirePendingOrders();
    connection = await db.getConnection();
    await connection.beginTransaction();
    const [orders] = await connection.query(
      "SELECT total_amount, status FROM orders WHERE id=? AND user_id=? FOR UPDATE",
      [parsedOrderId, req.user.id],
    );
    if (!orders.length) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    if (await expirePendingOrder(connection, parsedOrderId)) {
      orders[0].status = "EXPIRED";
    }
    if (orders[0].status !== "PENDING") {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: orders[0].status === "EXPIRED"
          ? "Order reservation has expired; please place a new order"
          : orders[0].status === "TEST"
            ? "Test orders cannot be paid or shipped"
            : "Only pending orders can be paid",
      });
    }
    if (!razorpay) {
      await connection.rollback();
      return res.status(503).json({
        success: false,
        message: "Razorpay is not configured",
      });
    }

    const amount = Math.round(Number(orders[0].total_amount) * 100);
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Order amount must be greater than zero",
      });
    }

    const options = {
      amount,
      currency: "INR",
      receipt: `order_${parsedOrderId}`,
    };

    const order = await razorpay.orders.create(options);

    await connection.query(
      `INSERT INTO payments (order_id, razorpay_order_id, amount)
       VALUES (?, ?, ?)`,
      [parsedOrderId, order.id, amount / 100],
    );
    await connection.commit();

    return res.status(200).json({
      success: true,
      key_id: process.env.RAZORPAY_KEY_ID,
      testMode: process.env.RAZORPAY_KEY_ID.startsWith("rzp_test_"),
      order,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Failed to create Razorpay order:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create payment order",
    });
  } finally {
    if (connection) connection.release();
  }
};

const verifyPayment = async (req, res) => {
  let connection;
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body || {};

    if (
      !razorpay ||
      typeof razorpay_order_id !== "string" ||
      !razorpay_order_id ||
      typeof razorpay_payment_id !== "string" ||
      !razorpay_payment_id ||
      typeof razorpay_signature !== "string" ||
      !/^[a-f\d]{64}$/i.test(razorpay_signature)
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are required",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(razorpay_signature, "hex");

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment signature is invalid",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();
    const [paymentOrders] = await connection.query(
      `SELECT p.order_id
       FROM payments p
       JOIN orders o ON o.id=p.order_id
       WHERE p.razorpay_order_id=? AND o.user_id=?
       FOR UPDATE`,
      [razorpay_order_id, req.user.id],
    );
    if (!paymentOrders.length) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Payment order not found",
      });
    }
    const expired = await expirePendingOrder(connection, paymentOrders[0].order_id);
    const [payments] = await connection.query(
      `SELECT p.order_id
              , p.amount, p.status AS payment_status,
              p.razorpay_payment_id,
              o.total_amount, o.status AS order_status
       FROM payments p
       JOIN orders o ON o.id=p.order_id
       WHERE p.razorpay_order_id=? AND o.user_id=?
       FOR UPDATE`,
      [razorpay_order_id, req.user.id],
    );
    if (!payments.length) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Payment order not found",
      });
    }

    const payment = payments[0];
    if (expired) payment.order_status = "EXPIRED";
    if (Number(payment.amount) !== Number(payment.total_amount)) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: "Payment amount does not match the order total",
      });
    }
    if (
      payment.payment_status === "SUCCESS" &&
      payment.razorpay_payment_id === razorpay_payment_id &&
      payment.order_status === "PAID"
    ) {
      await connection.commit();
      return res.status(200).json({
        success: true,
        message: "Payment successful",
      });
    }
    if (payment.payment_status === "REFUNDED") {
      await connection.commit();
      return res.status(409).json({
        success: false,
        message: "The order reservation expired and the payment was refunded",
      });
    }
    if (
      payment.payment_status === "REFUND_PENDING" &&
      payment.razorpay_payment_id !== razorpay_payment_id
    ) {
      await connection.commit();
      return res.status(409).json({
        success: false,
        message: "The payment refund is already being processed for different payment details",
      });
    }
    if (payment.payment_status !== "PENDING" || payment.order_status !== "PENDING") {
      if (
        ["PENDING", "REFUND_PENDING"].includes(payment.payment_status) &&
        ["EXPIRED", "CANCELLED"].includes(payment.order_status)
      ) {
        if (payment.payment_status === "PENDING") {
          const [result] = await connection.query(
            `UPDATE payments
             SET razorpay_payment_id=?, status='REFUND_PENDING'
             WHERE razorpay_order_id=? AND status='PENDING'`,
            [razorpay_payment_id, razorpay_order_id],
          );
          if (result.affectedRows !== 1) {
            await connection.rollback();
            return res.status(409).json({
              success: false,
              message: "Payment status changed; retry verification",
            });
          }
        }

        const refundStatus = await refundExpiredPayment({
          ...payment,
          razorpay_order_id,
          razorpay_payment_id,
        });
        await connection.query(
          "UPDATE payments SET status=? WHERE razorpay_order_id=?",
          [refundStatus, razorpay_order_id],
        );
        await connection.commit();
        return res.status(409).json({
          success: false,
          message: refundStatus === "REFUNDED"
            ? "The order reservation expired; your payment was refunded"
            : "The order reservation expired; your payment refund is processing",
        });
      }
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: "Order is no longer awaiting payment",
      });
    }

    const [result] = await connection.query(
      `UPDATE payments
       SET razorpay_payment_id=?, status='SUCCESS'
       WHERE razorpay_order_id=? AND status='PENDING'`,
      [razorpay_payment_id, razorpay_order_id],
    );
    if (result.affectedRows !== 1) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: "Payment order was already verified with different details",
      });
    }

    await connection.query(
      "UPDATE orders SET status='PAID' WHERE id=? AND status='PENDING'",
      [payment.order_id],
    );
    await connection.query(
      `DELETE ci FROM cart_items ci
       JOIN cart c ON c.id=ci.cart_id
       JOIN order_items oi ON oi.product_id=ci.product_id
       WHERE c.user_id=? AND oi.order_id=?`,
      [req.user.id, payment.order_id],
    );
    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Payment successful",
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Failed to verify Razorpay payment:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to verify payment",
    });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment
};