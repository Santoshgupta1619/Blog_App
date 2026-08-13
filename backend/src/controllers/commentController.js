import pool from "../config/db.js";

export const createComment = async (req, res) => {
  try {
    const { content, parent_id } = req.body;
    const { articleId } = req.params;
    const author_id = req.user.id;

    if (!content) {
      return res.status(400).json({ message: "Content required" });
    }

    const result = await pool.query(
      `INSERT INTO comments (content, article_id, author_id, parent_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [content, articleId, author_id, parent_id || null]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create comment" });
  }
};

// Get comments for an article
export const getCommentsByArticle = async (req, res) => {
  try {
    const { articleId } = req.params;

    // pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    // 👉 get ONLY top-level comments
    const topLevel = await pool.query(
      `SELECT c.*,
              COUNT(cl.id) AS like_count,
              EXISTS (
                SELECT 1 FROM comment_likes
                WHERE comment_id = c.id AND user_id = $4
              ) AS is_liked
       FROM comments c
       LEFT JOIN comment_likes cl
       ON c.id = cl.comment_id
       WHERE c.article_id = $1
AND c.parent_id IS NULL
AND c.id NOT IN (
  SELECT comment_id FROM comment_reports
  GROUP BY comment_id
  HAVING COUNT(*) >= 3
)
       GROUP BY c.id
       ORDER BY c.created_at DESC
       LIMIT $2 OFFSET $3`,
      [articleId, limit, offset, req.user?.id || null]
    );

    const parentComments = topLevel.rows;

    // 👉 get ALL replies for those comments
    const replies = await pool.query(
      `SELECT c.*,
              COUNT(cl.id) AS like_count
       FROM comments c
       LEFT JOIN comment_likes cl
       ON c.id = cl.comment_id
       WHERE c.article_id = $1
       AND c.parent_id IS NOT NULL
       GROUP BY c.id
       ORDER BY c.created_at ASC`,
      [articleId]
    );

    const allComments = [...parentComments, ...replies.rows];

    // 🧠 Build tree
    const map = {};
    const roots = [];

    allComments.forEach(comment => {
      map[comment.id] = {
        ...comment,
        like_count: Number(comment.like_count),
        is_liked: comment.is_liked || false,
        replies: []
      };
    });

    allComments.forEach(comment => {
      if (comment.parent_id) {
        map[comment.parent_id]?.replies.push(map[comment.id]);
      } else {
        roots.push(map[comment.id]);
      }
    });

    // 👉 total count (for frontend pagination UI)
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM comments
       WHERE article_id = $1 AND parent_id IS NULL`,
      [articleId]
    );

    const total = parseInt(countResult.rows[0].count);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: roots
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM comments WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.json({ message: "Comment deleted permanently" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete comment" });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content required" });
    }

    // Check if comment exists
    const existing = await pool.query(
      "SELECT * FROM comments WHERE id = $1",
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const comment = existing.rows[0];

    // Check ownership
    if (comment.author_id !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update comment
    const updated = await pool.query(
      `UPDATE comments
       SET content = $1
       WHERE id = $2
       RETURNING *`,
      [content, id]
    );

    res.json(updated.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update comment" });
  }
};

// Likes
export const toggleLikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const user_id = req.user.id;

    const existing = await pool.query(
      `SELECT * FROM comment_likes
       WHERE comment_id = $1 AND user_id = $2`,
      [commentId, user_id]
    );

    let liked;

    if (existing.rows.length > 0) {
      // Unlike
      await pool.query(
        `DELETE FROM comment_likes
         WHERE comment_id = $1 AND user_id = $2`,
        [commentId, user_id]
      );
      liked = false;
    } else {
      // Like
      await pool.query(
        `INSERT INTO comment_likes (comment_id, user_id)
         VALUES ($1, $2)`,
        [commentId, user_id]
      );
      liked = true;
    }

    // ✅ GET TOTAL COUNT
    const countRes = await pool.query(
      `SELECT COUNT(*) FROM comment_likes WHERE comment_id = $1`,
      [commentId]
    );

    res.json({
      liked,
      totalLikes: Number(countRes.rows[0].count),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to toggle like" });
  }
};

// report Comment
export const reportComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { reason } = req.body;
    const user_id = req.user.id;

    if (!reason) {
      return res.status(400).json({ message: "Reason is required" });
    }

    // Check if comment exists
    const comment = await pool.query(
      "SELECT * FROM comments WHERE id = $1",
      [commentId]
    );

    if (comment.rows.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if already reported
    const existing = await pool.query(
      `SELECT * FROM comment_reports
       WHERE comment_id = $1 AND user_id = $2`,
      [commentId, user_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Already reported" });
    }

    // Insert report
    await pool.query(
      `INSERT INTO comment_reports (comment_id, user_id, reason)
       VALUES ($1, $2, $3)`,
      [commentId, user_id, reason]
    );

    res.json({ message: "Comment reported successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to report comment" });
  }
};

export const getReportedComments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.content, c.author_id,
              COUNT(cr.id) AS report_count
       FROM comments c
       JOIN comment_reports cr
       ON c.id = cr.comment_id
       GROUP BY c.id
       ORDER BY report_count DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
};


