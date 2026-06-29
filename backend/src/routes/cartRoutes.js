const express = require("express");

const {
  addToCart,
  getCart,
  updateCart,
  removeCartItem,
} = require("../controllers/cartController");

const router = express.Router();

router.post("/", addToCart);

router.get("/:userId", getCart);

router.put("/:itemId", updateCart);

router.delete("/:itemId", removeCartItem);

module.exports = router;