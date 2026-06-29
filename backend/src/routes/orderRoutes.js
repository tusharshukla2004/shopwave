const express = require("express");

const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
} = require("../controllers/orderController");

const router = express.Router();

router.post("/", createOrder);

router.get("/:userId", getOrders);

router.get("/order/:id", getOrderById);

router.put("/:id", updateOrderStatus);

module.exports = router;