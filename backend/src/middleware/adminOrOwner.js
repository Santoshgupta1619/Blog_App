import pool from "../config/db.js";

const adminOrOwner = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ✅ FETCH COMMENT OWNER (FIXED)
    const result = await pool.query(
      "SELECT author_id FROM comments WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // ✅ DEFINE ownerId PROPERLY
    const ownerId = result.rows[0].author_id;

    console.log("👉 ownerId:", ownerId);
    console.log("👉 req.user.id:", req.user.id);

    // ✅ CHECK ACCESS
    if (
      req.user.role !== "admin" &&
      ownerId !== req.user.id
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    next();

  } catch (err) {
    console.error("adminOrOwner error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export default adminOrOwner;