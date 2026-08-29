import pool from "../config/db.js";

export const articleOwnerMiddleware = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const articleId = req.params.id;

    // Admin can edit any article
    if (userRole === "admin") {
      return next();
    }

    // Check whether article belongs to logged-in user
    const result = await pool.query(
      `
      SELECT id
      FROM articles
      WHERE id = $1
        AND author_id = $2
      `,
      [articleId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({
        message: "You are not allowed to edit this article.",
      });
    }

    next();
  } catch (err) {
    console.error("ARTICLE OWNER CHECK ERROR:", err);

    res.status(500).json({
      error: "Failed to verify article ownership.",
    });
  }
};