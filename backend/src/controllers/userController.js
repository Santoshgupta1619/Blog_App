import pool from "../config/db.js";
import bcrypt from "bcrypt";


export const getBookmarks = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.query(
      `SELECT a.*
       FROM bookmarks b
       JOIN articles a ON a.id = b.article_id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [user_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
};

export const getUserLikes = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.query(
      `SELECT a.id, a.title, a.slug, a.created_at
       FROM article_likes pl
       JOIN articles a ON a.id = pl.article_id
       WHERE pl.user_id = $1
       ORDER BY pl.created_at DESC`,
      [user_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch likes" });
  }
};

export const getUserComments = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.query(
      `SELECT c.id, c.content, c.created_at,
              a.title, a.slug
       FROM comments c
       JOIN articles a ON a.id = c.article_id
       WHERE c.author_id = $1 AND c.is_deleted = false
       ORDER BY c.created_at DESC`,
      [user_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.query(
      `SELECT id, name, email, created_at
       FROM users
       WHERE id = $1`,
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err); // 🔥 ADD THIS
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { name } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET name = $1
       WHERE id = $2
       RETURNING id, name, email`,
      [name, user_id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};      


export const updatePassword = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Password Validation
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character.",
      });
    }

    const userRes = await pool.query(
      `SELECT password FROM users WHERE id = $1`,
      [user_id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const valid = await bcrypt.compare(
      currentPassword,
      userRes.rows[0].password
    );

    if (!valid) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `UPDATE users
       SET password = $1
       WHERE id = $2`,
      [hashed, user_id]
    );

    res.json({
      message: "Password updated successfully",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to update password",
    });
  }
};