import pool from "../config/db.js";

// Create Category
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: "Category name is required",
      });
    }

    // Prevent duplicates
    const existing = await pool.query(
      "SELECT * FROM categories WHERE LOWER(name) = LOWER($1)",
      [name.trim()]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        error: "Category already exists",
      });
    }

    const result = await pool.query(
      `INSERT INTO categories (name)
       VALUES ($1)
       RETURNING *`,
      [name.trim()]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
};

// Get All Categories
export const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name
       FROM categories
       ORDER BY name ASC`
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
};

// Delete Category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting categories in use
    const used = await pool.query(
      "SELECT id FROM articles WHERE category_id = $1 LIMIT 1",
      [id]
    );

    if (used.rows.length > 0) {
      return res.status(400).json({
        error: "Cannot delete category because it is used by one or more articles.",
      });
    }

    const result = await pool.query(
      "DELETE FROM categories WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Category not found",
      });
    }

    res.json({
      message: "Category deleted successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
};