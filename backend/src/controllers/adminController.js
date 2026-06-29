const db = require("../config/db");

// Get All Users
const getUsers = async (req, res) => {

  const [users] = await db.query(
    "SELECT id,name,email,role FROM users"
  );

  res.status(200).json({
    success:true,
    users
  });

};

// Get All Products
const getProducts = async (req, res) => {

  const [products] = await db.query(
    "SELECT * FROM products"
  );

  res.status(200).json({
    success:true,
    products
  });

};

// Get All Orders
const getOrders = async (req, res) => {

  const [orders] = await db.query(
    "SELECT * FROM orders"
  );

  res.status(200).json({
    success:true,
    orders
  });

};

// Dashboard Analytics
const getDashboard = async (req, res) => {

  const [users] = await db.query(
    "SELECT COUNT(*) totalUsers FROM users"
  );

  const [products] = await db.query(
    "SELECT COUNT(*) totalProducts FROM products"
  );

  const [orders] = await db.query(
    "SELECT COUNT(*) totalOrders FROM orders"
  );

  const [revenue] = await db.query(
    `
    SELECT SUM(total_amount)
    totalRevenue

    FROM orders
    `
  );

  res.status(200).json({
    success:true,

    totalUsers: users[0].totalUsers,

    totalProducts: products[0].totalProducts,

    totalOrders: orders[0].totalOrders,

    totalRevenue: revenue[0].totalRevenue
  });

};

// Delete Product
const deleteProduct = async (req, res) => {
  try {
    await db.query(
      "DELETE FROM products WHERE id=?",
      [req.params.id]
    );

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Update User Role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    await db.query(
      "UPDATE users SET role=? WHERE id=?",
      [role, req.params.id]
    );

    res.status(200).json({
      success: true,
      message: "Role updated successfully",
    });
  } catch (error) {
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