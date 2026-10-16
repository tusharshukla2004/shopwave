const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  addToWishlist,
  getWishlist,
  removeWishlist
} = require("../controllers/wishlistController");

const router = express.Router();

router.use(protect);
router.post("/", addToWishlist);

router.get("/:userId", getWishlist);

router.delete("/:id", removeWishlist);

module.exports = router;