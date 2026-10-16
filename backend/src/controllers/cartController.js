const db = require("../config/db");

// Add To Cart
const addToCart = async (req, res) => {
  let connection;
  try {
    const product_id = req.body?.product_id;
    const quantity = req.body?.quantity;
    const parsedUserId = Number(req.user.id);
    const parsedProductId = Number(product_id);
    const parsedQuantity = Number(quantity);

    if (
      !Number.isInteger(parsedUserId) ||
      parsedUserId <= 0 ||
      !Number.isInteger(parsedProductId) ||
      parsedProductId <= 0 ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid user, product, and quantity are required",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();
    const [products] = await connection.query(
      "SELECT stock FROM products WHERE id=? FOR UPDATE",
      [parsedProductId],
    );
    if (!products.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    if (products[0].stock < parsedQuantity) {
      await connection.rollback();
      return res.status(409).json({ success: false, message: "Not enough stock available" });
    }

    const [carts] = await connection.query(
      "INSERT INTO cart(user_id) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)",
      [parsedUserId],
    );
    const cartId = carts.insertId;
    const [existingItems] = await connection.query(
      "SELECT quantity FROM cart_items WHERE cart_id=? AND product_id=? FOR UPDATE",
      [cartId, parsedProductId],
    );
    if ((existingItems[0]?.quantity || 0) + parsedQuantity > products[0].stock) {
      await connection.rollback();
      return res.status(409).json({ success: false, message: "Not enough stock available" });
    }

    await connection.query(
      `INSERT INTO cart_items (cart_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity=quantity + VALUES(quantity)`,
      [cartId, parsedProductId, parsedQuantity],
    );
    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Product added to cart"
    });
  } catch (error) {
    console.error("Failed to add product to cart:", error);
    if (connection) await connection.rollback();
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  } finally {
    if (connection) connection.release();
  }
};

const getCart = async (req, res) => {

  try {

    const userId = req.user.id;

 const [items] = await db.query(
  `
  SELECT
  ci.id,
  p.id AS product_id,
  p.name,
  p.price,
  p.image,
  ci.quantity,
  p.stock,
  p.is_demo

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
    console.error("Failed to load cart:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

const updateCart = async (req, res) => {

  try {

    const itemId = Number(req.params.itemId);
    const quantity = Number(req.body?.quantity);
    if (!Number.isInteger(itemId) || itemId <= 0 || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid cart item id and positive whole-number quantity are required",
      });
    }

    const [items] = await db.query(
      `SELECT p.stock FROM cart_items ci
       JOIN products p ON p.id=ci.product_id
       JOIN cart c ON c.id=ci.cart_id
       WHERE ci.id=? AND c.user_id=?`,
      [itemId, req.user.id],
    );
    if (!items.length) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }
    if (quantity > items[0].stock) {
      return res.status(409).json({ success: false, message: "Requested quantity exceeds stock" });
    }

    const [result] = await db.query(
      `UPDATE cart_items ci
       JOIN products p ON p.id=ci.product_id
       JOIN cart c ON c.id=ci.cart_id
       SET ci.quantity=?
       WHERE ci.id=? AND c.user_id=? AND p.stock>=?`,
      [quantity, itemId, req.user.id, quantity],
    );

    if (result.affectedRows === 0) {
      const [unchangedItems] = await db.query(
        `SELECT ci.id, ci.quantity, p.stock
         FROM cart_items ci
         JOIN products p ON p.id=ci.product_id
         JOIN cart c ON c.id=ci.cart_id
         WHERE ci.id=? AND c.user_id=?`,
        [itemId, req.user.id],
      );
      if (!unchangedItems.length) {
        return res.status(404).json({ success: false, message: "Cart item not found" });
      }
      if (quantity > unchangedItems[0].stock) {
        return res.status(409).json({ success: false, message: "Requested quantity exceeds stock" });
      }
      if (unchangedItems[0].quantity !== quantity) {
        return res.status(409).json({ success: false, message: "Cart item changed; refresh and try again" });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Quantity updated"
    });

  } catch (error) {
    console.error("Failed to update cart item:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

const removeCartItem = async (req, res) => {

  try {
    const itemId = Number(req.params.itemId);
    if (!Number.isInteger(itemId) || itemId <= 0) {
      return res.status(400).json({ success: false, message: "A valid cart item id is required" });
    }
    const [result] = await db.query(
      `DELETE ci FROM cart_items ci
       JOIN cart c ON c.id=ci.cart_id
       WHERE ci.id=? AND c.user_id=?`,
      [itemId, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    res.status(200).json({
      success: true,
      message: "Item removed"
    });

  } catch (error) {
    console.error("Failed to remove cart item:", error);
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
