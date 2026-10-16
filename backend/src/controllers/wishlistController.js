 const db = require("../config/db");

// Add To Wishlist
const addToWishlist = async (req, res) => {

  try {

    const productId = Number(req.body?.product_id);
    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid product_id is required",
      });
    }

    const [products] = await db.query(
      "SELECT id FROM products WHERE id=?",
      [productId],
    );
    if (!products.length) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await db.query(
      `
      INSERT IGNORE INTO wishlist
      (user_id, product_id)
      VALUES (?, ?)
      `,
      [req.user.id, productId]
    );

    res.status(201).json({
      success: true,
      message: "Added to wishlist"
    });

  } catch (error) {
    console.error("Failed to add product to wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

// Get Wishlist
const getWishlist = async (req, res) => {

  try {

    const [wishlist] = await db.query(
      `
      SELECT
w.id,
p.id AS product_id,
p.name,
p.price,
p.description,
p.stock,
p.is_demo,
p.image

      FROM wishlist w

      JOIN products p
      ON w.product_id = p.id

      WHERE w.user_id = ?
      `,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      wishlist
    });

  } catch (error) {
    console.error("Failed to load wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

// Remove Wishlist Item
const removeWishlist = async (req, res) => {

  try {

    const [result] = await db.query(
      "DELETE FROM wishlist WHERE id=? AND user_id=?",
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Wishlist item not found" });
    }

    res.status(200).json({
      success: true,
      message: "Removed from wishlist"
    });

  } catch (error) {
    console.error("Failed to remove wishlist item:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeWishlist
};