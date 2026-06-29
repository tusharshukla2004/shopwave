const db = require("../config/db");

// Create Order
const createOrder = async (req, res) => {
  try {

    const { user_id, total_amount, items } = req.body;

    const [order] = await db.query(
      "INSERT INTO orders(user_id,total_amount) VALUES (?,?)",
      [user_id, total_amount]
    );

    const orderId = order.insertId;

    for (let item of items) {

      await db.query(
        `
        INSERT INTO order_items
        (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
        `,
        [
          orderId,
          item.product_id,
          item.quantity,
          item.price
        ]
      );
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      orderId
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

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
      `,
      [req.params.userId]
    );

    res.status(200).json({
      success: true,
      orders
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

// Get Single Order
const getOrderById = async (req, res) => {

  try {

    const [order] = await db.query(
      `
      SELECT *
      FROM orders
      WHERE id=?
      `,
      [req.params.id]
    );

    res.status(200).json({
      success: true,
      order: order[0]
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

// Update Order Status
const updateOrderStatus = async (req, res) => {

  try {

    const { status } = req.body;

    await db.query(
      `
      UPDATE orders
      SET status=?
      WHERE id=?
      `,
      [status, req.params.id]
    );

    res.status(200).json({
      success: true,
      message: "Order status updated"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
};