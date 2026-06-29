const db = require("../config/db");

// Add To Cart
const addToCart = async (req, res) => {
  try {
    const { user_id, product_id, quantity } = req.body;

    let [cart] = await db.query(
      "SELECT * FROM cart WHERE user_id=?",
      [user_id]
    );

    let cartId;

    if (cart.length === 0) {

      const [newCart] = await db.query(
        "INSERT INTO cart(user_id) VALUES (?)",
        [user_id]
      );

      cartId = newCart.insertId;

    } else {

      cartId = cart[0].id;

    }

    await db.query(
      `
      INSERT INTO cart_items
      (cart_id, product_id, quantity)
      VALUES (?, ?, ?)
      `,
      [cartId, product_id, quantity]
    );

    res.status(201).json({
      success: true,
      message: "Product added to cart"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

const getCart = async (req, res) => {

  try {

    const userId = req.params.userId;

 const [items] = await db.query(
  `
  SELECT
  ci.id,
  p.id AS product_id,
  p.name,
  p.price,
  p.image,
  ci.quantity

  FROM cart_items ci

  JOIN cart c
  ON ci.cart_id = c.id

  JOIN products p
  ON ci.product_id = p.id

  WHERE c.user_id = ?
  `,
  [userId]
);

    res.status(200).json({
      success: true,
      items
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

const updateCart = async (req, res) => {

  try {

    const { quantity } = req.body;

    await db.query(
      "UPDATE cart_items SET quantity=? WHERE id=?",
      [quantity, req.params.itemId]
    );

    res.status(200).json({
      success: true,
      message: "Quantity updated"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

const removeCartItem = async (req, res) => {

  try {

    await db.query(
      "DELETE FROM cart_items WHERE id=?",
      [req.params.itemId]
    );

    res.status(200).json({
      success: true,
      message: "Item removed"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

module.exports = {
  addToCart,
  getCart,
  removeCartItem,
  updateCart
};
