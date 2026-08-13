import pool from "../config/db.js";

const publishScheduledArticles = async () => {
  try {
    const result = await pool.query(`
      UPDATE articles
      SET
        status = 'published',
        scheduled_at = NULL,
        updated_at = NOW()
      WHERE status = 'scheduled'
        AND scheduled_at IS NOT NULL
        AND scheduled_at <= NOW()
      RETURNING id, title
    `);

    if (result.rows.length > 0) {
      console.log("Automatically published:", result.rows);
    }
  } catch (err) {
    console.error("SCHEDULER ERROR:", err);
  }
};

export default publishScheduledArticles;