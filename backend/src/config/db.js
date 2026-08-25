import pkg from "pg";

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  ssl: {
    rejectUnauthorized: false,
  },
});

// Set public schema for every new PostgreSQL connection
pool.on("connect", async (client) => {
  try {
    await client.query("SET search_path TO public");
  } catch (error) {
    console.error("❌ Failed to set search_path:", error.message);
  }
});

pool
  .connect()
  .then(async (client) => {
    console.log("✅ PostgreSQL Connected");

    const result = await client.query(`
      SELECT
        current_database() AS database,
        current_schema() AS schema,
        current_user AS user,
        current_setting('search_path') AS search_path,
        EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'articles'
        ) AS articles_exists,
        EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'categories'
        ) AS categories_exists
    `);

    console.log("🔎 DATABASE CHECK:");
    console.log(result.rows[0]);

    client.release();
  })
  .catch((err) => {
    console.error("❌ DB Connection Error:", err.message);
  });

export default pool;