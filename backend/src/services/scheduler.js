
import pool from "../config/db.js";

const publishScheduledArticles = async () => {
  try {
    console.log(
      "⏰ Scheduler checking:",
      new Date().toISOString()
    );

    const result = await pool.query(`
      UPDATE public.articles
      SET
        status = 'published',
        scheduled_at = NULL,
        updated_at = NOW()
      WHERE status = 'scheduled'
        AND scheduled_at IS NOT NULL
        AND scheduled_at <= NOW()
      RETURNING id, title;
    `);

    if (result.rows.length > 0) {
      console.log("✅ Published scheduled articles:");

      result.rows.forEach((article) => {
        console.log(`   - ${article.title} (${article.id})`);
      });
    } else {
      console.log("⏳ No articles ready for publishing.");
    }
  } catch (err) {
    console.error("❌ Scheduler error:", err);
  }
};

export default publishScheduledArticles;

