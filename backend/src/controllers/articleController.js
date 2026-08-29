import pool from "../config/db.js";
import slugify from "slugify";

// 🔹 CREATE ARTICLE
// 🔹 CREATE ARTICLE
export const createArticle = async (req, res) => {
  try {
    const {
      title,
      content,
      image_url,
      category_id,
      tags,
      status,
      scheduled_at,
    } = req.body;

    const userId = req.user.id;
    const userRole = req.user.role;

    // ======================================================
    // BASIC VALIDATION
    // ======================================================

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Title is required.",
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Content is required.",
      });
    }

    if (!category_id) {
      return res.status(400).json({
        message: "Category is required.",
      });
    }

    // ======================================================
    // CHECK CATEGORY EXISTS
    // ======================================================

    const categoryResult = await pool.query(
      `
      SELECT id, name
      FROM categories
      WHERE id = $1
      `,
      [category_id]
    );

    if (categoryResult.rows.length === 0) {
      return res.status(404).json({
        message: "Category not found.",
      });
    }

    // ======================================================
    // ADMIN
    // ======================================================

    if (userRole === "admin") {
      // Admin can create in any existing category.
    }

    // ======================================================
    // WRITER
    // ======================================================

    else {
      // Check whether user has an approved writer profile
      const writerResult = await pool.query(
        `
        SELECT id
        FROM writers
        WHERE user_id = $1
        `,
        [userId]
      );

      if (writerResult.rows.length === 0) {
        return res.status(403).json({
          message:
            "You do not have permission to create articles. Please become an approved writer first.",
        });
      }

      // Check whether this category is approved for this writer
      const writerCategory = await pool.query(
        `
        SELECT wc.id
        FROM writer_categories wc

        INNER JOIN writers w
          ON w.id = wc.writer_id

        WHERE w.user_id = $1
          AND wc.category_id = $2
        `,
        [userId, category_id]
      );

      if (writerCategory.rows.length === 0) {
        return res.status(403).json({
          message:
            "You are not approved to write articles in this category.",
        });
      }
    }

    // ======================================================
    // SLUG
    // ======================================================

    const slug = slugify(title, {
      lower: true,
      strict: true,
    });

    // ======================================================
    // CREATE ARTICLE
    // ======================================================

    const articleResult = await pool.query(
      `
      INSERT INTO articles
      (
        title,
        slug,
        content,
        image_url,
        category_id,
        author_id,
        status,
        scheduled_at
      )
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        title.trim(),
        slug,
        content,
        image_url || null,
        category_id,
        userId,
        status || "published",
        status === "scheduled"
          ? scheduled_at || null
          : null,
      ]
    );

    const article = articleResult.rows[0];

    // ======================================================
    // TAGS
    // ======================================================

    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tag of tags) {
        if (!tag || !tag.trim()) {
          continue;
        }

        let tagRes = await pool.query(
          `
          SELECT id
          FROM tags
          WHERE name = $1
          `,
          [tag.trim()]
        );

        let tagId;

        if (tagRes.rows.length === 0) {
          const newTag = await pool.query(
            `
            INSERT INTO tags (name)
            VALUES ($1)
            RETURNING id
            `,
            [tag.trim()]
          );

          tagId = newTag.rows[0].id;
        } else {
          tagId = tagRes.rows[0].id;
        }

        await pool.query(
          `
          INSERT INTO article_tags
          (article_id, tag_id)
          VALUES ($1, $2)
          `,
          [article.id, tagId]
        );
      }
    }

    // ======================================================
    // RESPONSE
    // ======================================================

    res.status(201).json({
      message: "Article created successfully.",
      article,
    });

  } catch (err) {
    console.error("CREATE ARTICLE ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
};



// 🔹 GET ALL ARTICLES (WITH CATEGORY + TAGS)
// 🔹 GET PUBLISHED ARTICLES (PAGINATION)
export const getPublishedArticles = async (req, res) => {
  try {
    // page & limit
    const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 5;
const category = req.query.category || "";
    const offset = (page - 1) * limit;

    // Get paginated articles
    const result = await pool.query(
  `
  SELECT
    a.id,
    a.title,
    a.slug,
    a.content,
    a.created_at,
    a.image_url,
    c.name AS category,

    COALESCE(
      json_agg(DISTINCT t.name)
      FILTER (WHERE t.name IS NOT NULL),
      '[]'
    ) AS tags

  FROM articles a

  LEFT JOIN categories c
    ON a.category_id = c.id

  LEFT JOIN article_tags at
    ON a.id = at.article_id

  LEFT JOIN tags t
    ON at.tag_id = t.id

  WHERE a.status = 'published'
  AND ($3 = '' OR c.name = $3)

  GROUP BY a.id, c.name

  ORDER BY a.created_at DESC

  LIMIT $1 OFFSET $2
  `,
  [limit, offset, category]
);

    // Total articles
    const countResult = await pool.query(
  `SELECT COUNT(*)
FROM articles a
LEFT JOIN categories c
ON a.category_id = c.id
WHERE a.status='published'
AND ($1 = '' OR c.name = $1)`,
  [category]
);


    const total = Number(countResult.rows[0].count);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: result.rows,
    });



  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
};


export const getCategories = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT
        c.id,
        c.name
      FROM categories c
      INNER JOIN articles a
        ON a.category_id = c.id
      WHERE a.status = 'published'
      ORDER BY c.name ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("GET CATEGORIES ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


export const getTrendingArticles = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.id,
        a.title,
        a.slug,
        a.image_url,
        a.created_at,
        c.name AS category,

        COUNT(al.id) AS like_count

      FROM articles a

      LEFT JOIN categories c
        ON c.id = a.category_id

      LEFT JOIN article_likes al
        ON al.article_id = a.id

      WHERE a.status = 'published'

      GROUP BY
        a.id,
        c.name

      ORDER BY
        COUNT(al.id) DESC,
        a.created_at DESC

      LIMIT 5
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("GET TRENDING ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


// 🔹 GET SINGLE ARTICLE BY SLUG
export const getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Logged-in user ID
    const userId = req.user?.id || null;

    const result = await pool.query(
      `
      SELECT 
        a.*,

        c.name AS category,

        -- WRITER INFORMATION
        w.author_name AS writer_name,
        w.image_url AS writer_image_url,

        COALESCE(
          json_agg(DISTINCT t.name)
          FILTER (WHERE t.name IS NOT NULL),
          '[]'
        ) AS tags,

        -- LIKE COUNT
        (
          SELECT COUNT(*)
          FROM article_likes al
          WHERE al.article_id = a.id
        ) AS like_count,

        -- SAFE LIKE
        CASE
          WHEN $2::uuid IS NULL THEN false
          ELSE EXISTS (
            SELECT 1
            FROM article_likes al
            WHERE al.article_id = a.id
              AND al.user_id = $2::uuid
          )
        END AS is_liked,

        -- SAFE BOOKMARK
        CASE
          WHEN $2::uuid IS NULL THEN false
          ELSE EXISTS (
            SELECT 1
            FROM bookmarks b
            WHERE b.article_id = a.id
              AND b.user_id = $2::uuid
          )
        END AS is_bookmarked

      FROM articles a

      LEFT JOIN categories c
        ON a.category_id = c.id

      -- CONNECT ARTICLE → USER → WRITER
      LEFT JOIN writers w
        ON w.user_id = a.author_id

      LEFT JOIN article_tags at
        ON a.id = at.article_id

      LEFT JOIN tags t
        ON at.tag_id = t.id

      WHERE a.slug = $1

      GROUP BY
        a.id,
        c.name,
        w.author_name,
        w.image_url
      `,
      [slug, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Article not found",
      });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error("GET ARTICLE ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
};

export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM articles WHERE id = $1", [id]);

    res.json({ message: "Article deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const toggleBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { articleId } = req.params;

    // check if already bookmarked
    const existing = await pool.query(
      "SELECT * FROM bookmarks WHERE user_id = $1 AND article_id = $2",
      [userId, articleId]
    );

    if (existing.rows.length > 0) {
      // remove bookmark
      await pool.query(
        "DELETE FROM bookmarks WHERE user_id = $1 AND article_id = $2",
        [userId, articleId]
      );

      return res.json({ bookmarked: false });
    } else {
      // add bookmark
      await pool.query(
        "INSERT INTO bookmarks (user_id, article_id) VALUES ($1, $2)",
        [userId, articleId]
      );

      return res.json({ bookmarked: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const toggleLikePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { articleId } = req.params;

    // check if already liked
    const existing = await pool.query(
      "SELECT * FROM article_likes WHERE user_id = $1 AND article_id = $2",
      [userId, articleId]
    );

    if (existing.rows.length > 0) {
      // unlike
      await pool.query(
        "DELETE FROM article_likes WHERE user_id = $1 AND article_id = $2",
        [userId, articleId]
      );

      const count = await pool.query(
        "SELECT COUNT(*) FROM article_likes WHERE article_id = $1",
        [articleId]
      );

      return res.json({
        liked: false,
        totalLikes: Number(count.rows[0].count),
      });
    } else {
      // like
      await pool.query(
        "INSERT INTO article_likes (user_id, article_id) VALUES ($1, $2)",
        [userId, articleId]
      );

      const count = await pool.query(
        "SELECT COUNT(*) FROM article_likes WHERE article_id = $1",
        [articleId]
      );

      return res.json({
        liked: true,
        totalLikes: Number(count.rows[0].count),
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      content,
      image_url,
      category,
      tags,
      status,
      scheduled_at,
    } = req.body;


    let category_id;

    const existingCategory = await pool.query(
      "SELECT id FROM categories WHERE name = $1",
      [category]
    );

    if (existingCategory.rows.length > 0) {
      category_id = existingCategory.rows[0].id;
    } else {
      const newCategory = await pool.query(
        "INSERT INTO categories (name) VALUES ($1) RETURNING id",
        [category]
      );

      category_id = newCategory.rows[0].id;
    }

    const result = await pool.query(
      `UPDATE articles
       SET
         title = $1,
         content = $2,
         image_url = $3,
         category_id = $4,
         status = $5,
         scheduled_at = $6,
         updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [
        title,
        content,
        image_url,
        category_id,
        status || "published",
        status === "scheduled"
          ? scheduled_at
          : null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Article not found",
      });
    }

    const article = result.rows[0];


    // Remove existing tags
    await pool.query(
      "DELETE FROM article_tags WHERE article_id = $1",
      [id]
    );

    // Add new tags
    if (tags && tags.length > 0) {
      for (const tag of tags) {

        let tagRes = await pool.query(
          "SELECT id FROM tags WHERE name = $1",
          [tag]
        );

        let tagId;

        if (tagRes.rows.length === 0) {

          const newTag = await pool.query(
            "INSERT INTO tags (name) VALUES ($1) RETURNING id",
            [tag]
          );

          tagId = newTag.rows[0].id;

        } else {

          tagId = tagRes.rows[0].id;

        }

        await pool.query(
          `INSERT INTO article_tags
           (article_id, tag_id)
           VALUES ($1, $2)`,
          [id, tagId]
        );
      }
    }

    res.json(article);

  } catch (err) {

    console.error("UPDATE ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
};


// 🔹 GET DRAFT ARTICLES
export const getDraftArticles = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.*,
        c.name AS category
      FROM articles a
      LEFT JOIN categories c
        ON a.category_id = c.id
      WHERE a.status = 'draft'
      ORDER BY a.created_at DESC
    `);

    res.json(result.rows);

  } catch (err) {
    console.error("GET DRAFT ARTICLES ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


// 🔹 GET SCHEDULED ARTICLES
export const getScheduledArticles = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.*,
        c.name AS category
      FROM articles a
      LEFT JOIN categories c
        ON a.category_id = c.id
      WHERE a.status = 'scheduled'
        AND a.scheduled_at IS NOT NULL
      ORDER BY a.scheduled_at ASC
    `);

    res.json(result.rows);

  } catch (err) {
    console.error("GET SCHEDULED ARTICLES ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET ALL ARTICLES (ADMIN)
export const getAllArticles = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.*,
        c.name AS category
      FROM articles a
      LEFT JOIN categories c
        ON a.category_id = c.id
      ORDER BY a.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("GET ALL ARTICLES ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        a.*,
        c.name AS category,

        COALESCE(
          json_agg(DISTINCT t.name)
          FILTER (WHERE t.name IS NOT NULL),
          '[]'
        ) AS tags

      FROM articles a

      LEFT JOIN categories c
        ON a.category_id = c.id

      LEFT JOIN article_tags at
        ON a.id = at.article_id

      LEFT JOIN tags t
        ON at.tag_id = t.id

      WHERE a.id = $1

      GROUP BY a.id, c.name
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Article not found",
      });
    }

    res.json(result.rows[0]);

  } catch (err) {

    console.error("GET ARTICLE BY ID ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
};

// 🔹 GET ADMIN'S OWN BOOKMARKS
export const getAdminBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        b.id,
        b.created_at AS bookmarked_at,

        a.id AS article_id,
        a.title,
        a.slug,
        a.image_url,
        a.status

      FROM bookmarks b

      INNER JOIN articles a
        ON b.article_id = a.id

      WHERE b.user_id = $1

      ORDER BY b.created_at DESC
      `,
      [userId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error("GET ADMIN BOOKMARKS ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
};

// ======================================================
// HOMEPAGE CATEGORY CAROUSEL
// ======================================================

export const getHomepageCategory = async (req, res) => {
  try {
    // Get all categories that have published articles
    // Ordered by number of published articles
    const categoryResult = await pool.query(`
      SELECT
        c.id,
        c.name,
        COUNT(a.id) AS total_articles
      FROM categories c
      JOIN articles a
        ON a.category_id = c.id
      WHERE a.status = 'published'
      GROUP BY c.id
      ORDER BY COUNT(a.id) DESC, c.name ASC
    `);

    if (categoryResult.rows.length === 0) {
      return res.json([]);
    }

    // Get latest 4 articles for every category
    const categories = await Promise.all(
      categoryResult.rows.map(async (category) => {
        const articlesResult = await pool.query(
          `
          SELECT
            a.id,
            a.title,
            a.slug,
            a.content,
            a.image_url,
            a.created_at,
            c.name AS category

          FROM articles a

          JOIN categories c
            ON c.id = a.category_id

          WHERE
            a.status = 'published'
            AND a.category_id = $1

          ORDER BY a.created_at DESC

          LIMIT 4
          `,
          [category.id]
        );

        return {
          category: category.name,
          categoryId: category.id,
          totalArticles: Number(category.total_articles),
          articles: articlesResult.rows,
        };
      })
    );

    res.json(categories);

  } catch (err) {
    console.error("GET HOMEPAGE CATEGORIES ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
};

export const getRecommendedArticles = async (req, res) => {
  try {
    const { articleId } = req.params;

    const result = await pool.query(
      `
      SELECT
        a.id,
        a.title,
        a.slug,
        a.image_url,
        a.created_at,
        c.name AS category

      FROM articles a

      JOIN categories c
        ON c.id = a.category_id

      WHERE
        a.id <> $1
        AND a.status = 'published'

      ORDER BY a.created_at DESC

      LIMIT 10
      `,
      [articleId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
};

// ======================================================
// GET ADMIN'S OWN ARTICLES
// ======================================================

export const getAdminArticles = async (req, res) => {
  try {
    const adminId = req.user.id;

    console.log("ADMIN ID:", adminId);
    console.log("ADMIN ROLE:", req.user.role);

    const result = await pool.query(
      `
      SELECT
        a.*,
        c.name AS category
      FROM articles a
      LEFT JOIN categories c
        ON a.category_id = c.id
      WHERE a.author_id = $1
      ORDER BY a.created_at DESC
      `,
      [adminId]
    );

    console.log("ADMIN ARTICLES:", result.rows);

    res.json(result.rows);

  } catch (err) {
    console.error("GET ADMIN ARTICLES ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
};