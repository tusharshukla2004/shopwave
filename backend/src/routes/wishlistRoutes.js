const express = require("express");

const {
  addToWishlist,
  getWishlist,
  removeWishlist
} = require("../controllers/wishlistController");

const router = express.Router();

router.post("/", addToWishlist);

router.get("/:userId", getWishlist);

router.delete("/:id", removeWishlist);

module.exports = router;