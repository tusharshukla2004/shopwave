const db = require("../config/db");
const { deleteProduct } = require("./productController");

// Get All Users
const getUsers = async (req, res) => {
  try {
    const [users] = await db.query("SELECT id,name,email,role FROM users");
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Failed to load admin users:", error);
    return res.status(500).json({ success: false, message: "Unable to load users" });
  }
};

// Get All Products
const getProducts = async (req, res) => {

  try {
    const [products] = await db.query("SELECT * FROM products ORDER BY created_at DESC");
    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Failed to load admin products:", error);
    return res.status(500).json({ success: false, message: "Unable to load products" });
  }
};

// Get All Orders
const getOrders = async (req, res) => {

  try {
    const [orders] = await db.query("SELECT * FROM orders WHERE status<>'TEST' ORDER BY created_at DESC");
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Failed to load admin orders:", error);
    return res.status(500).json({ success: false, message: "Unable to load orders" });
  }
};

// Dashboard Analytics
const getDashboard = async (req, res) => {

  try {
    const [[users]] = await db.query("SELECT COUNT(*) totalUsers FROM users");
    const [[products]] = await db.query("SELECT COUNT(*) totalProducts FROM products");
    const [[orders]] = await db.query("SELECT COUNT(*) totalOrders FROM orders WHERE status<>'TEST'");
    const [[revenue]] = await db.query(
      `SELECT COALESCE(SUM(total_amount), 0) totalRevenue
       FROM orders
       WHERE status IN ('PAID', 'SHIPPED', 'DELIVERED')`,
    );
    return res.status(200).json({
      success: true,
      totalUsers: users.totalUsers,
      totalProducts: products.totalProducts,
      totalOrders: orders.totalOrders,
      totalRevenue: revenue.totalRevenue,
    });
  } catch (error) {
    console.error("Failed to load admin dashboard:", error);
    return res.status(500).json({ success: false, message: "Unable to load dashboard" });
  }
};

// Update User Role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["CUSTOMER", "SELLER", "ADMIN"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid user role" });
    }

    const [result] = await db.query(
      "UPDATE users SET role=? WHERE id=?",
      [role, req.params.id]
    );
    if (result.affectedRows === 0) {
      const [users] = await db.query("SELECT id FROM users WHERE id=?", [req.params.id]);
      if (!users.length) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
    }

    res.status(200).json({
      success: true,
      message: "Role updated successfully",
    });
  } catch (error) {
    console.error("Failed to update user role:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getUsers,
  getProducts,
  getOrders,
  getDashboard,
  deleteProduct,
  updateUserRole
};