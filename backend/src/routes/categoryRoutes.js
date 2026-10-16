const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");

const {
  createCategory,
  getCategories,
} = require("../controllers/categoryController");

const router = express.Router();

router.post("/", protect, authorize("ADMIN"), createCategory);
router.get("/", getCategories);

module.exports = router;