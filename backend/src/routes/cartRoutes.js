const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  addToCart,
  getCart,
  updateCart,
  removeCartItem,
} = require("../controllers/cartController");

const router = express.Router();

router.use(protect);
router.post("/", addToCart);

router.get("/:userId", getCart);

router.put("/:itemId", updateCart);

router.delete("/:itemId", removeCartItem);

module.exports = router;