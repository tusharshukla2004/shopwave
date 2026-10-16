const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");

const {
  getSellerProducts,
  getSellerOrders,
  getRevenue,
  getInventory
} = require("../controllers/sellerController");

const router = express.Router();

router.use(protect, authorize("SELLER"));
router.get("/products/:sellerId",getSellerProducts);

router.get("/orders/:sellerId",getSellerOrders);

router.get("/revenue/:sellerId",getRevenue);

router.get("/inventory/:sellerId",getInventory);

module.exports = router;