const db = require("../config/db");

const parseProductInput = (input) => {
  const {
    name,
    description,
    price,
    stock,
    image,
    category_id,
  } = input || {};
  const normalizedName = typeof name === "string" ? name.trim() : "";
  const normalizedDescription = typeof description === "string" ? description.trim() : "";
  const normalizedImage = typeof image === "string" ? image.trim() : "";
  const priceValue = Number(price);
  const stockValue = Number(stock);
  const categoryId = Number(category_id);

  if (
    !normalizedName ||
    normalizedName.length > 255 ||
    !normalizedDescription ||
    !normalizedImage ||
    !Number.isInteger(categoryId) ||
    categoryId <= 0 ||
    !Number.isFinite(priceValue) ||
    priceValue <= 0 ||
    priceValue > 99999999.99 ||
    !Number.isInteger(stockValue) ||
    stockValue < 0 ||
    stockValue > 4294967295
  ) {
    return null;
  }

  return {
    name: normalizedName,
    description: normalizedDescription,
    price: priceValue,
    stock: stockValue,
    image: normalizedImage,
    categoryId,
  };
};

// Create Product
const createProduct = async (req, res) => {
  try {
    const product = parseProductInput(req.body);
    const sellerId = Number(req.user.id);
    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Valid product name, description, image, price, stock, and category are required",
      });
    }
    const [categories] = await db.query(
      "SELECT id FROM categories WHERE id=?",
      [product.categoryId],
    );
    if (!categories.length) {
      return res.status(400).json({ success: false, message: "Selected category does not exist" });
    }

    await db.query(
      `INSERT INTO products
      (name,description,price,stock,is_demo,image,category_id,seller_id)
      VALUES (?,?,?,?,FALSE,?,?,?)`,
      [
        product.name,
        product.description,
        product.price,
        product.stock,
        product.image,
        product.categoryId,
        sellerId
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Product created successfully"
    });

  } catch (error) {

    console.error("Failed to create product:", error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

// Get All Products
const getProducts = async (req, res) => {

  try {

    const [products] = await db.query(`
      SELECT
      p.id,
      p.name,
      p.description,
      p.price,
      p.stock,
      p.is_demo,
      p.image,
      c.id AS category_id,
      c.name AS category,
      u.name AS seller

      FROM products p

      JOIN categories c
      ON p.category_id = c.id

      JOIN users u
      ON p.seller_id = u.id
    `);

    res.status(200).json({
      success: true,
      products
    });

  }catch (error) {
  console.error("Get Products Error:", error);

  res.status(500).json({
    success: false,
      message: "Unable to load products"
  });
}
};

// Get Single Product
const getProductById = async (req, res) => {

  try {

    const [product] = await db.query(
      "SELECT * FROM products WHERE id=?",
      [req.params.id]
    );

    if (product.length === 0) {

      return res.status(404).json({
        success: false,
        message: "Product not found"
      });

    }

    res.status(200).json({
      success: true,
      product: product[0]
    });

  } catch (error) {
    console.error("Failed to load product:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

// Update Product
const updateProduct = async (req, res) => {

  try {
    const productId = Number(req.params.id);
    const product = parseProductInput(req.body);
    if (!Number.isInteger(productId) || productId <= 0 || !product) {
      return res.status(400).json({
        success: false,
        message: "Valid product details are required",
      });
    }
    const [categories] = await db.query(
      "SELECT id FROM categories WHERE id=?",
      [product.categoryId],
    );
    if (!categories.length) {
      return res.status(400).json({ success: false, message: "Selected category does not exist" });
    }

    const params = [
      product.name,
      product.description,
      product.price,
      product.stock,
      product.image,
      product.categoryId,
      productId,
    ];
    const ownershipFilter = req.user.role === "ADMIN" ? "" : " AND seller_id=?";
    if (req.user.role !== "ADMIN") params.push(req.user.id);
    const [result] = await db.query(
      `UPDATE products
       SET name=?, description=?, price=?, stock=?, image=?, category_id=?
       WHERE id=?${ownershipFilter}`,
      params,
    );
    if (result.affectedRows === 0) {
      const [products] = await db.query(
        `SELECT id FROM products WHERE id=?${ownershipFilter}`,
        req.user.role === "ADMIN"
          ? [productId]
          : [productId, req.user.id],
      );
      if (!products.length) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully"
    });

  } catch (error) {
    console.error("Failed to update product:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

// Delete Product
const deleteProduct = async (req, res) => {
  let connection;
  try {
    const productId = Number(req.params.id);
    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ success: false, message: "A valid product id is required" });
    }
    connection = await db.getConnection();
    await connection.beginTransaction();
    const ownershipFilter = req.user.role === "ADMIN" ? "" : " AND seller_id=?";
    const params = [productId];
    if (req.user.role !== "ADMIN") params.push(req.user.id);
    const [products] = await connection.query(
      `SELECT id FROM products WHERE id=?${ownershipFilter} FOR UPDATE`,
      params,
    );
    if (!products.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const [references] = await connection.query(
      "SELECT COUNT(*) AS count FROM order_items WHERE product_id=?",
      [productId],
    );
    if (references[0].count > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: "Products included in orders cannot be deleted",
      });
    }

    await connection.query("DELETE FROM cart_items WHERE product_id=?", [productId]);
    await connection.query("DELETE FROM wishlist WHERE product_id=?", [productId]);
    await connection.query("DELETE FROM products WHERE id=?", [productId]);
    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Failed to delete product:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
};