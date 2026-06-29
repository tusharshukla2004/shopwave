const express = require("express");

const {
  getUsers,
  getProducts,
  getOrders,
  getDashboard,
  deleteProduct,
  updateUserRole
} = require("../controllers/adminController");

const router = express.Router();

router.get("/users", getUsers);

router.get("/products", getProducts);

router.get("/orders", getOrders);

router.get("/dashboard", getDashboard);

router.delete("/products/:id", deleteProduct);

router.put("/users/:id", updateUserRole);

module.exports = router;