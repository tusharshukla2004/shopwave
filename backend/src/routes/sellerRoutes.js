const express = require("express");

const {
  getSellerProducts,
  getSellerOrders,
  getRevenue,
  getInventory
} = require("../controllers/sellerController");

const router = express.Router();

router.get("/products/:sellerId",getSellerProducts);

router.get("/orders/:sellerId",getSellerOrders);

router.get("/revenue/:sellerId",getRevenue);

router.get("/inventory/:sellerId",getInventory);

module.exports = router;