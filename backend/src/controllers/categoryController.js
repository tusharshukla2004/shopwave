const db = require("../config/db");

// Create Category
const createCategory = async (req, res) => {
  try {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    if (!name || name.length > 150) {
      return res.status(400).json({
        success: false,
        message: "A category name between 1 and 150 characters is required",
      });
    }

    const [existingCategory] = await db.query(
      "SELECT id FROM categories WHERE LOWER(name) = LOWER(?)",
      [name]
    );

    if (existingCategory.length > 0) {
      return res.status(409).json({
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
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }
    console.error("Failed to create category:", error);

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