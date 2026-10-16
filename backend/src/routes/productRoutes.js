const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

const router = express.Router();

router.post("/", protect, authorize("SELLER", "ADMIN"), createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", protect, authorize("SELLER", "ADMIN"), updateProduct);
router.delete("/:id", protect, authorize("SELLER", "ADMIN"), deleteProduct);

module.exports = router;