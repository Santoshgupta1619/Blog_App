
import pool from "../config/db.js";

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isTransient = (err) =>
  !err ||
  err.code === "ENOTFOUND" ||
  err.code === "ECONNREFUSED" ||
  err.code === "ECONNRESET" ||
  err.code === "ETIMEDOUT" ||
  err.code === "ENETUNREACH" ||
  err.code === "EAI_AGAIN" ||
  err.code === "57P01" ||
  err.code === "57P02" ||
  err.code === "57P03";

const publishScheduledArticles = async () => {
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      // console.log(
      //   "⏰ Scheduler checking:",
      //   new Date().toISOString()
      // );

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
        // console.log("⏳ No articles ready for publishing.");
      }

      return;
    } catch (err) {
      lastError = err;

      if (!isTransient(err) || attempt === MAX_ATTEMPTS) {
        console.error("❌ Scheduler error:", err.message || err);
        return;
      }

      console.error(
        `⚠️ Scheduler transient error (${err.code || err.message}), retrying ${attempt}/${MAX_ATTEMPTS}...`
      );
      await sleep(RETRY_DELAY_MS * attempt);
    }
  }

  if (lastError) {
    console.error("❌ Scheduler error:", lastError.message || lastError);
  }
};

export default publishScheduledArticles;

