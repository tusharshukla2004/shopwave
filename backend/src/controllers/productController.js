const db = require("../config/db");

// Create Product
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      image,
      category_id,
      seller_id
    } = req.body;

    await db.query(
      `INSERT INTO products
      (name,description,price,stock,image,category_id,seller_id)
      VALUES (?,?,?,?,?,?,?)`,
      [
        name,
        description,
        price,
        stock,
        image,
        category_id,
        seller_id
      ]
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully"
    });

  } catch (error) {

    console.log(error);

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

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server Error"
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

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

// Update Product
const updateProduct = async (req, res) => {

  try {

    const {
      name,
      description,
      price,
      stock,
      image
    } = req.body;

    await db.query(
      `
      UPDATE products
      SET
      name=?,
      description=?,
      price=?,
      stock=?,
      image=?
      WHERE id=?
      `,
      [
        name,
        description,
        price,
        stock,
        image,
        req.params.id
      ]
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

// Delete Product
const deleteProduct = async (req, res) => {

  try {

    await db.query(
      "DELETE FROM products WHERE id=?",
      [req.params.id]
    );

    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
};