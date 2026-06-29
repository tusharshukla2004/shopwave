const db = require("../config/db");

// Create Category
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const [existingCategory] = await db.query(
      "SELECT * FROM categories WHERE name = ?",
      [name]
    );

    if (existingCategory.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    await db.query(
      "INSERT INTO categories(name) VALUES (?)",
      [name]
    );

    res.status(201).json({
      success: true,
      message: "Category created successfully",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get All Categories
const getCategories = async (req, res) => {
  try {

    const [categories] = await db.query(
      "SELECT * FROM categories"
    );

    res.status(200).json({
      success: true,
      categories,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};

module.exports = {
  createCategory,
  getCategories,
};