const db = require("../config/db");

// Products
const getSellerProducts = async (req, res) => {
  try {
    const [products] = await db.query(
      "SELECT * FROM products WHERE seller_id=? ORDER BY created_at DESC",
      [req.user.id],
    );
    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Failed to load seller products:", error);
    return res.status(500).json({ success: false, message: "Unable to load seller products" });
  }
};

const getSellerOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT DISTINCT o.id, o.total_amount, o.shipping_address, o.status, o.created_at
       FROM orders o
       JOIN order_items oi ON o.id=oi.order_id
       JOIN products p ON oi.product_id=p.id
       WHERE p.seller_id=? AND o.status<>'TEST'
       ORDER BY o.created_at DESC`,
      [req.user.id],
    );
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Failed to load seller orders:", error);
    return res.status(500).json({ success: false, message: "Unable to load seller orders" });
  }
};

const getRevenue = async (req, res) => {
  try {
    const [revenue] = await db.query(
      `SELECT COALESCE(SUM(oi.price*oi.quantity), 0) AS totalRevenue
       FROM order_items oi
       JOIN products p ON oi.product_id=p.id
       JOIN orders o ON o.id=oi.order_id
       WHERE p.seller_id=? AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')`,
      [req.user.id],
    );
    return res.status(200).json({ success: true, revenue });
  } catch (error) {
    console.error("Failed to load seller revenue:", error);
    return res.status(500).json({ success: false, message: "Unable to load seller revenue" });
  }
};

const getInventory = async (req, res) => {
  try {
    const [inventory] = await db.query(
      "SELECT name, stock FROM products WHERE seller_id=? ORDER BY name",
      [req.user.id],
    );
    return res.status(200).json({ success: true, inventory });
  } catch (error) {
    console.error("Failed to load seller inventory:", error);
    return res.status(500).json({ success: false, message: "Unable to load seller inventory" });
  }
};

module.exports = {
  getSellerProducts,
  getSellerOrders,
  getRevenue,
  getInventory
};
