const db = require("../config/db");
const {
  RESERVATION_MINUTES,
  expirePendingOrders,
  releaseOrderInventory,
} = require("../services/orderInventory");

// Create Order
const createOrder = async (req, res) => {
  let connection;
  try {
    const items = req.body?.items;
    const userId = Number(req.user.id);
    const rawAddress = req.body?.shipping_address || {};
    const shippingAddress = {
      fullName: typeof rawAddress.fullName === "string" ? rawAddress.fullName.trim() : "",
      phone: typeof rawAddress.phone === "string" ? rawAddress.phone.trim() : "",
      addressLine: typeof rawAddress.addressLine === "string" ? rawAddress.addressLine.trim() : "",
      city: typeof rawAddress.city === "string" ? rawAddress.city.trim() : "",
      state: typeof rawAddress.state === "string" ? rawAddress.state.trim() : "",
      postalCode: typeof rawAddress.postalCode === "string" ? rawAddress.postalCode.trim() : "",
    };
    if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Between 1 and 100 order items are required",
      });
    }

    const requestedItems = items.map((item) => ({
      productId: Number(item?.product_id),
      quantity: Number(item?.quantity),
    }));
    if (requestedItems.some((item) =>
      !Number.isInteger(item.productId) ||
      item.productId <= 0 ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    )) {
      return res.status(400).json({
        success: false,
        message: "Each item must have a valid product and positive whole-number quantity",
      });
    }
    const quantityByProduct = new Map();
    for (const item of requestedItems) {
      quantityByProduct.set(
        item.productId,
        (quantityByProduct.get(item.productId) || 0) + item.quantity,
      );
    }
    const normalizedItems = [...quantityByProduct].map(([productId, quantity]) => ({
      productId,
      quantity,
    }));

    await expirePendingOrders();
    connection = await db.getConnection();
    await connection.beginTransaction();

    const productIds = [...new Set(normalizedItems.map((item) => item.productId))];
    const [products] = await connection.query(
      "SELECT id, price, stock, is_demo FROM products WHERE id IN (?) FOR UPDATE",
      [productIds],
    );
    if (products.length !== productIds.length) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "One or more products are unavailable" });
    }

    const productById = new Map(products.map((product) => [product.id, product]));
    const hasDemoProducts = products.some((product) => product.is_demo);
    if (hasDemoProducts && products.some((product) => !product.is_demo)) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: "Demo products must be ordered separately from regular products",
      });
    }
    if (
      !hasDemoProducts &&
      (
        !shippingAddress.fullName ||
        shippingAddress.fullName.length > 150 ||
        !/^\+?[0-9][0-9\s()-]{7,19}$/.test(shippingAddress.phone) ||
        !shippingAddress.addressLine ||
        shippingAddress.addressLine.length > 500 ||
        !shippingAddress.city ||
        shippingAddress.city.length > 120 ||
        !shippingAddress.state ||
        shippingAddress.state.length > 120 ||
        !/^[A-Za-z0-9 -]{3,20}$/.test(shippingAddress.postalCode)
      )
    ) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Valid delivery name, phone, street address, city, state, and postal code are required",
      });
    }
    for (const item of normalizedItems) {
      if (item.quantity > productById.get(item.productId).stock) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          message: `Not enough stock for product ${item.productId}`,
        });
      }
    }

    const amountInPaise = normalizedItems.reduce(
      (sum, item) => sum + Math.round(Number(productById.get(item.productId).price) * 100) * item.quantity,
      0,
    );
    if (
      !Number.isSafeInteger(amountInPaise) ||
      amountInPaise <= 0 ||
      amountInPaise > 9999999999
    ) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "Order total must be greater than zero" });
    }
    const computedAmount = amountInPaise / 100;

    const [order] = await connection.query(
      `INSERT INTO orders(user_id,total_amount,shipping_address,status)
       VALUES (?,?,?,?)`,
      [
        userId,
        computedAmount,
        hasDemoProducts ? null : JSON.stringify(shippingAddress),
        hasDemoProducts ? "TEST" : "PENDING",
      ],
    );
    const orderId = order.insertId;

    for (const item of normalizedItems) {
      if (!hasDemoProducts) {
        const [stockUpdate] = await connection.query(
          "UPDATE products SET stock=stock-? WHERE id=? AND stock>=?",
          [item.quantity, item.productId, item.quantity],
        );
        if (stockUpdate.affectedRows !== 1) {
          throw new Error(`Stock changed while reserving product ${item.productId}`);
        }
      }
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.productId, item.quantity, productById.get(item.productId).price],
      );
    }

    let expiresAt = null;
    if (!hasDemoProducts) {
      const [reservation] = await connection.query(
        `SELECT DATE_ADD(created_at, INTERVAL ${RESERVATION_MINUTES} MINUTE) AS expires_at
         FROM orders WHERE id=?`,
        [orderId],
      );
      expiresAt = reservation[0].expires_at;
    }
    await connection.commit();
    return res.status(201).json({
      success: true,
      message: hasDemoProducts
        ? "Test order created; no payment or shipment will be made"
        : "Order created successfully",
      orderId,
      total_amount: computedAmount,
      expires_at: expiresAt,
      testMode: hasDemoProducts,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Failed to create order:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  } finally {
    if (connection) connection.release();
  }
};

// Get User Orders
const getOrders = async (req, res) => {

  try {

    const [orders] = await db.query(
      `
      SELECT *
      FROM orders
      WHERE user_id=?
      ORDER BY created_at DESC
      `,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      orders
    });

  } catch (error) {
    console.error("Failed to load orders:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

// Get Single Order
const getOrderById = async (req, res) => {

  try {

    const [orders] = await db.query(
      `
      SELECT *
      FROM orders
      WHERE id=? AND user_id=?
      `,
      [req.params.id, req.user.id]
    );
    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    const [items] = await db.query(
      `SELECT oi.product_id, oi.quantity, oi.price, p.name, p.image, p.is_demo
       FROM order_items oi
       JOIN products p ON p.id=oi.product_id
       WHERE oi.order_id=?`,
      [req.params.id],
    );

    return res.status(200).json({
      success: true,
      order: { ...orders[0], items },
    });

  } catch (error) {
    console.error("Failed to load order details:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

// Update Order Status
const updateOrderStatus = async (req, res) => {
  let connection;
  try {
    const orderId = Number(req.params.id);
    const status = req.body?.status;
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({ success: false, message: "A valid order id is required" });
    }
    if (!["SHIPPED", "DELIVERED", "CANCELLED"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid order status" });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();
    const [orders] = await connection.query(
      "SELECT status FROM orders WHERE id=? FOR UPDATE",
      [orderId],
    );
    if (!orders.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const allowedTransitions = {
      PENDING: ["CANCELLED"],
      PAID: ["SHIPPED"],
      SHIPPED: ["DELIVERED"],
      DELIVERED: [],
      CANCELLED: [],
    };
    if (!allowedTransitions[orders[0].status]?.includes(status)) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: `Order cannot transition from ${orders[0].status} to ${status}`,
      });
    }

    if (status === "CANCELLED" && orders[0].status === "PENDING") {
      await releaseOrderInventory(connection, orderId);
    }
    await connection.query(
      "UPDATE orders SET status=? WHERE id=?",
      [status, orderId],
    );
    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Order status updated"
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Failed to update order status:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
};