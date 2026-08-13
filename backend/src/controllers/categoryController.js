import pool from "../config/db.js";

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const result = await pool.query(
      `INSERT INTO categories (name)
       VALUES ($1)
       RETURNING *`,
      [name]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};