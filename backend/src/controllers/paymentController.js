const razorpay = require("../config/razorpay");
const db = require("../config/db");

// Create Razorpay Order
const createPaymentOrder = async (req, res) => {
  try {

    const { order_id, amount } = req.body;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `order_${order_id}`
    };

    const order = await razorpay.orders.create(options);

    await db.query(
      `
      INSERT INTO payments
      (order_id, razorpay_order_id, amount)
      VALUES (?, ?, ?)
      `,
      [
        order_id,
        order.id,
        amount
      ]
    );

    res.status(200).json({
      success: true,
      order
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

// Verify Payment
const verifyPayment = async (req, res) => {

  try {

    const {
      razorpay_order_id,
      razorpay_payment_id
    } = req.body;

    await db.query(
      `
      UPDATE payments
      SET
      razorpay_payment_id=?,
      status='SUCCESS'
      WHERE razorpay_order_id=?
      `,
      [
        razorpay_payment_id,
        razorpay_order_id
      ]
    );

    res.status(200).json({
      success: true,
      message: "Payment successful"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment
};