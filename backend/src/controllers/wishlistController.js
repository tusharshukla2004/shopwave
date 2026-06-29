 const db = require("../config/db");

// Add To Wishlist
const addToWishlist = async (req, res) => {

  try {

    const {
      user_id,
      product_id
    } = req.body;

    await db.query(
      `
      INSERT INTO wishlist
      (user_id, product_id)
      VALUES (?, ?)
      `,
      [user_id, product_id]
    );

    res.status(201).json({
      success: true,
      message: "Added to wishlist"
    });

  } catch (error) {

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
p.name,
p.price,
p.description,
p.stock,
p.image

      FROM wishlist w

      JOIN products p
      ON w.product_id = p.id

      WHERE w.user_id = ?
      `,
      [req.params.userId]
    );

    res.status(200).json({
      success: true,
      wishlist
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

// Remove Wishlist Item
const removeWishlist = async (req, res) => {

  try {

    await db.query(
      "DELETE FROM wishlist WHERE id=?",
      [req.params.id]
    );

    res.status(200).json({
      success: true,
      message: "Removed from wishlist"
    });

  } catch (error) {

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