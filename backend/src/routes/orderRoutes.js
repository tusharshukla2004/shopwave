const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");

const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
} = require("../controllers/orderController");

const router = express.Router();

router.use(protect);
router.post("/", createOrder);

router.get("/:userId", getOrders);

router.get("/order/:id", getOrderById);

router.put("/:id", authorize("ADMIN"), updateOrderStatus);

module.exports = router;