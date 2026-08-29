import pool from "../config/db.js";
import bcrypt from "bcrypt";
// ======================================================
// GET MY WRITER PROFILE / STATUS
// ======================================================

export const getMyWriterProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const userResult = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        is_writer
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const user = userResult.rows[0];

    // --------------------------------------------------
    // Get writer profile
    // --------------------------------------------------

    const writerResult = await pool.query(
      `
      SELECT
        id,
        author_name,
        bio,
        image_url,
        created_at,
        updated_at
      FROM writers
      WHERE user_id = $1
      `,
      [userId]
    );

    // --------------------------------------------------
    // Get approved categories
    // --------------------------------------------------

    const categoriesResult = await pool.query(
      `
      SELECT
        c.id,
        c.name,
        wc.approved_at
      FROM writer_categories wc

      INNER JOIN writers w
        ON w.id = wc.writer_id

      INNER JOIN categories c
        ON c.id = wc.category_id

      WHERE w.user_id = $1

      ORDER BY wc.approved_at ASC
      `,
      [userId]
    );

    // --------------------------------------------------
    // Get pending request
    // --------------------------------------------------

    const pendingRequestResult = await pool.query(
      `
    SELECT
  r.id,
  r.category_id,
  c.name AS category_name,
  r.requested_category_name,
  r.is_new_category,
  r.status,
  r.admin_note,
  r.created_at
FROM writer_category_requests r

LEFT JOIN categories c
  ON c.id = r.category_id

WHERE r.user_id = $1
  AND r.status = 'pending'

ORDER BY r.created_at DESC
LIMIT 1
      `,
      [userId]
    );

    // --------------------------------------------------
    // Get latest request
    // --------------------------------------------------

    const latestRequestResult = await pool.query(
      `
      SELECT
  r.id,
  r.category_id,
  c.name AS category_name,
  r.requested_category_name,
  r.is_new_category,
  r.status,
  r.admin_note,
  r.created_at,
  r.reviewed_at
FROM writer_category_requests r

LEFT JOIN categories c
  ON c.id = r.category_id

WHERE r.user_id = $1

ORDER BY r.created_at DESC
LIMIT 1
      `,
      [userId]
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_writer: user.is_writer,
      },

      writer: writerResult.rows.length > 0
        ? writerResult.rows[0]
        : null,

      approvedCategories: categoriesResult.rows,

      pendingRequest:
        pendingRequestResult.rows.length > 0
          ? pendingRequestResult.rows[0]
          : null,

      latestRequest:
        latestRequestResult.rows.length > 0
          ? latestRequestResult.rows[0]
          : null,
    });
  } catch (err) {
    console.error("GET MY WRITER PROFILE ERROR:", err);

    res.status(500).json({
      error: "Failed to fetch writer profile.",
    });
  }
};

// ======================================================
// UPDATE MY WRITER PROFILE
// ======================================================

export const updateMyWriterProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { bio } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!bio || !bio.trim()) {
      return res.status(400).json({
        message: "Bio is required.",
      });
    }

    // ==========================================
    // CHECK WRITER PROFILE
    // ==========================================

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
        message: "You do not have a writer profile.",
      });
    }

    const writerId = writerResult.rows[0].id;

    // ==========================================
    // UPDATE BIO
    // ==========================================

    const result = await pool.query(
      `
      UPDATE writers
      SET
        bio = $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING
        id,
        author_name,
        bio,
        image_url,
        created_at,
        updated_at
      `,
      [bio.trim(), writerId]
    );

    return res.json({
      message: "Writer profile updated successfully.",
      writer: result.rows[0],
    });
  } catch (err) {
    console.error("UPDATE MY WRITER PROFILE ERROR:", err);

    return res.status(500).json({
      error: "Failed to update writer profile.",
    });
  }
};

// ======================================================
// SUBMIT WRITER / CATEGORY REQUEST
// ======================================================

export const submitWriterRequest = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      category_id,
      requested_category_name,
      is_new_category,
      author_name,
      bio,
      image_url,
    } = req.body;

    // ======================================================
    // CHECK USER
    // ======================================================

    const userResult = await pool.query(
      `
      SELECT
        id,
        is_writer
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const user = userResult.rows[0];

    // ======================================================
    // CHECK EXISTING WRITER PROFILE
    // ======================================================

    const writerResult = await pool.query(
      `
      SELECT
        id,
        author_name,
        bio,
        image_url
      FROM writers
      WHERE user_id = $1
      `,
      [userId]
    );

    const existingWriter =
      writerResult.rows.length > 0
        ? writerResult.rows[0]
        : null;

    // ======================================================
    // FIRST-TIME WRITER VALIDATION
    // ======================================================

    // If the user is NOT already a writer,
    // author details are required.

    if (!user.is_writer) {
      if (!author_name || !author_name.trim()) {
        return res.status(400).json({
          message: "Author name is required.",
        });
      }

      if (!bio || !bio.trim()) {
        return res.status(400).json({
          message: "Bio is required.",
        });
      }

      if (!image_url || !image_url.trim()) {
        return res.status(400).json({
          message: "Author image is required.",
        });
      }
    }

    // ======================================================
    // ONE PENDING REQUEST AT A TIME
    // ======================================================

    const pendingRequest = await pool.query(
      `
      SELECT id
      FROM writer_category_requests
      WHERE user_id = $1
        AND status = 'pending'
      LIMIT 1
      `,
      [userId]
    );

    if (pendingRequest.rows.length > 0) {
      return res.status(400).json({
        message:
          "You already have a pending category request. Please wait for the admin to review it.",
      });
    }

    // ======================================================
    // CATEGORY VALIDATION
    // ======================================================

    let categoryId = category_id || null;

    const isNewCategory =
      Boolean(is_new_category);

    // ======================================================
    // EXISTING CATEGORY
    // ======================================================

    if (!isNewCategory) {
      if (!categoryId) {
        return res.status(400).json({
          message: "Please select a category.",
        });
      }

      // ------------------------------------------
      // CHECK CATEGORY EXISTS
      // ------------------------------------------

      const categoryResult = await pool.query(
        `
        SELECT id
        FROM categories
        WHERE id = $1
        `,
        [categoryId]
      );

      if (categoryResult.rows.length === 0) {
        return res.status(404).json({
          message: "Selected category not found.",
        });
      }

      // ------------------------------------------
      // CHECK ALREADY APPROVED
      // ------------------------------------------

      if (existingWriter) {
        const alreadyApproved = await pool.query(
          `
          SELECT wc.id
          FROM writer_categories wc
          WHERE wc.writer_id = $1
            AND wc.category_id = $2
          LIMIT 1
          `,
          [
            existingWriter.id,
            categoryId,
          ]
        );

        if (alreadyApproved.rows.length > 0) {
          return res.status(400).json({
            message:
              "You already have this category approved.",
          });
        }
      }
    }

    // ======================================================
    // NEW CATEGORY
    // ======================================================

    if (isNewCategory) {
      if (
        !requested_category_name ||
        !requested_category_name.trim()
      ) {
        return res.status(400).json({
          message:
            "Please enter the category you want to request.",
        });
      }

      const requestedCategory =
        requested_category_name.trim();

      // ------------------------------------------
      // CHECK CATEGORY ALREADY EXISTS
      // ------------------------------------------

      const existingCategory = await pool.query(
        `
        SELECT id
        FROM categories
        WHERE LOWER(name) = LOWER($1)
        LIMIT 1
        `,
        [requestedCategory]
      );

      if (existingCategory.rows.length > 0) {
        return res.status(400).json({
          message:
            "This category already exists. Please select it from the category list.",
        });
      }

      categoryId = null;
    }

    // ======================================================
    // PREPARE WRITER DETAILS
    // ======================================================

    /*
      First-time user:
      Use details submitted from BecomeWriter.

      Existing writer:
      Use details already stored in writers table.
    */

    const finalAuthorName = user.is_writer
      ? existingWriter?.author_name || null
      : author_name.trim();

    const finalBio = user.is_writer
      ? existingWriter?.bio || null
      : bio.trim();

    const finalImageUrl = user.is_writer
      ? existingWriter?.image_url || null
      : image_url.trim();

    // ======================================================
    // SAFETY CHECK FOR EXISTING WRITER
    // ======================================================

    if (user.is_writer && !existingWriter) {
      return res.status(400).json({
        message:
          "Writer profile not found. Please contact the administrator.",
      });
    }

    // ======================================================
    // SUBMIT REQUEST
    // ======================================================

    const result = await pool.query(
      `
      INSERT INTO writer_category_requests
      (
        user_id,
        category_id,
        requested_category_name,
        is_new_category,
        status,
        author_name,
        bio,
        image_url
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        'pending',
        $5,
        $6,
        $7
      )
      RETURNING *
      `,
      [
        userId,

        categoryId,

        isNewCategory
          ? requested_category_name.trim()
          : null,

        isNewCategory,

        finalAuthorName,

        finalBio,

        finalImageUrl,
      ]
    );

    // ======================================================
    // RESPONSE
    // ======================================================

    return res.status(201).json({
      message:
        "Writer category request submitted successfully. Please wait for admin approval.",

      request: result.rows[0],
    });
  } catch (err) {
    console.error(
      "SUBMIT WRITER REQUEST ERROR:",
      err
    );

    return res.status(500).json({
      error: "Failed to submit writer category request.",
    });
  }
};

// ======================================================
// GET MY APPROVED WRITER CATEGORIES
// ======================================================

export const getMyWriterCategories = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        c.id,
        c.name,
        wc.approved_at
      FROM writer_categories wc

      INNER JOIN writers w
        ON w.id = wc.writer_id

      INNER JOIN categories c
        ON c.id = wc.category_id

      WHERE w.user_id = $1

      ORDER BY wc.approved_at ASC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET WRITER CATEGORIES ERROR:", err);

    res.status(500).json({
      error: "Failed to fetch writer categories.",
    });
  }
};

// ======================================================
// GET AVAILABLE CATEGORIES FOR REQUEST
// ======================================================

export const getAvailableCategories = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find writer profile
    const writerResult = await pool.query(
      `
      SELECT id
      FROM writers
      WHERE user_id = $1
      `,
      [userId]
    );

    // If writer profile doesn't exist yet,
    // return every category.
    if (writerResult.rows.length === 0) {
      const result = await pool.query(`
        SELECT
          id,
          name
        FROM categories
        ORDER BY name ASC
      `);

      return res.json(result.rows);
    }

    const writerId = writerResult.rows[0].id;

    // Categories not yet approved for this writer
    const result = await pool.query(
      `
      SELECT
        c.id,
        c.name
      FROM categories c

      WHERE NOT EXISTS (
        SELECT 1
        FROM writer_categories wc
        WHERE wc.category_id = c.id
          AND wc.writer_id = $1
      )

      ORDER BY c.name ASC
      `,
      [writerId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET AVAILABLE CATEGORIES ERROR:", err);

    res.status(500).json({
      error: "Failed to fetch categories.",
    });
  }
};

// ======================================================
// GET MY WRITER ARTICLES
// ======================================================

export const getMyWriterArticles = async (req, res) => {
  try {
    const userId = req.user.id;

    // ==========================================
    // VERIFY WRITER
    // ==========================================

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
          "You do not have a writer profile.",
      });
    }

    // ==========================================
    // GET ONLY USER'S ARTICLES
    // ==========================================

    const result = await pool.query(
      `
      SELECT
        a.id,
        a.title,
        a.slug,
        a.content,
        a.image_url,
        a.category_id,
        c.name AS category,
        a.status,
        a.scheduled_at,
        a.created_at,
        a.updated_at

      FROM articles a

      LEFT JOIN categories c
        ON c.id = a.category_id

      WHERE a.author_id = $1

      ORDER BY a.created_at DESC
      `,
      [userId]
    );

    res.json({
      total: result.rows.length,
      articles: result.rows,
    });
  } catch (err) {
    console.error("GET MY WRITER ARTICLES ERROR:", err);

    res.status(500).json({
      error: "Failed to fetch your articles.",
    });
  }
};

// ======================================================
// ADMIN - GET WRITER CATEGORY REQUESTS
// ======================================================

export const getWriterRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        r.id,
        r.user_id,
        r.category_id,
        r.requested_category_name,
        r.is_new_category,
        r.status,
        r.admin_note,
        r.created_at,
        r.reviewed_at,
        r.reviewed_by,

        r.author_name,
        r.bio,
        r.image_url,

        u.name AS user_name,
        u.email AS user_email,

        c.name AS category_name

      FROM writer_category_requests r

      INNER JOIN users u
        ON u.id = r.user_id

      LEFT JOIN categories c
        ON c.id = r.category_id

      ORDER BY r.created_at DESC
      `
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET WRITER REQUESTS ERROR:", err);

    res.status(500).json({
      error: "Failed to fetch writer requests",
    });
  }
};

// ======================================================
// ADMIN - APPROVE / REJECT WRITER CATEGORY REQUEST
// ======================================================

export const reviewWriterRequest = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { action, admin_note } = req.body;

    // ==========================================
    // VALIDATE ACTION
    // ==========================================

    if (!["approved", "rejected"].includes(action)) {
      return res.status(400).json({
        message:
          "Invalid action. Use approved or rejected.",
      });
    }

    await client.query("BEGIN");

    // ==========================================
    // GET REQUEST
    // ==========================================

    const requestResult = await client.query(
      `
      SELECT *
      FROM writer_category_requests
      WHERE id = $1
      FOR UPDATE
      `,
      [id]
    );

    if (requestResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Writer request not found",
      });
    }

    const request = requestResult.rows[0];

    // ==========================================
    // PREVENT DOUBLE REVIEW
    // ==========================================

    if (request.status !== "pending") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message:
          `This request has already been ${request.status}.`,
      });
    }

    // ==========================================
    // REJECT REQUEST
    // ==========================================

    if (action === "rejected") {
      const rejectedRequest = await client.query(
        `
        UPDATE writer_category_requests
        SET
          status = 'rejected',
          admin_note = $1,
          reviewed_at = NOW(),
          reviewed_by = $2
        WHERE id = $3
        RETURNING *
        `,
        [
          admin_note || null,
          req.user.id,
          id,
        ]
      );

      await client.query("COMMIT");

      return res.json({
        message:
          "Writer category request rejected.",
        request: rejectedRequest.rows[0],
      });
    }

    // ==========================================
    // APPROVE REQUEST
    // ==========================================

    let categoryId = request.category_id;

    // ==========================================
    // NEW CATEGORY
    // ==========================================

    if (request.is_new_category === true) {
      if (!request.requested_category_name) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          message:
            "Requested category name is missing.",
        });
      }

      const existingCategory = await client.query(
        `
        SELECT id
        FROM categories
        WHERE LOWER(name) = LOWER($1)
        LIMIT 1
        `,
        [request.requested_category_name.trim()]
      );

      if (existingCategory.rows.length > 0) {
        categoryId = existingCategory.rows[0].id;
      } else {
        const newCategory = await client.query(
          `
          INSERT INTO categories (name)
          VALUES ($1)
          RETURNING id
          `,
          [request.requested_category_name.trim()]
        );

        categoryId = newCategory.rows[0].id;
      }
    }

    // ==========================================
    // VALIDATE CATEGORY
    // ==========================================

    if (!categoryId) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message:
          "Category is missing from this request.",
      });
    }

    // ==========================================
    // VALIDATE WRITER PROFILE
    // ==========================================

    if (
      !request.author_name ||
      !request.author_name.trim()
    ) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message:
          "Author name is missing from this request.",
      });
    }

    if (
      !request.bio ||
      !request.bio.trim()
    ) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message:
          "Writer bio is missing from this request.",
      });
    }

    if (
      !request.image_url ||
      !request.image_url.trim()
    ) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message:
          "Writer profile image is missing from this request.",
      });
    }

    // ==========================================
    // GET EXISTING WRITER
    // ==========================================

    const writerResult = await client.query(
      `
      SELECT id
      FROM writers
      WHERE user_id = $1
      `,
      [request.user_id]
    );

    let writerId;

    // ==========================================
    // CREATE WRITER PROFILE
    // ==========================================

    if (writerResult.rows.length === 0) {
      const newWriter = await client.query(
        `
        INSERT INTO writers
        (
          user_id,
          author_name,
          bio,
          image_url
        )
        VALUES
        ($1, $2, $3, $4)
        RETURNING id
        `,
        [
          request.user_id,
          request.author_name.trim(),
          request.bio.trim(),
          request.image_url.trim(),
        ]
      );

      writerId = newWriter.rows[0].id;
    } else {
      writerId = writerResult.rows[0].id;

      // Update writer profile from latest request
      await client.query(
        `
        UPDATE writers
        SET
          author_name = $1,
          bio = $2,
          image_url = $3,
          updated_at = NOW()
        WHERE id = $4
        `,
        [
          request.author_name.trim(),
          request.bio.trim(),
          request.image_url.trim(),
          writerId,
        ]
      );
    }

    // ==========================================
    // CHECK DUPLICATE APPROVED CATEGORY
    // ==========================================

    const existingWriterCategory = await client.query(
      `
      SELECT id
      FROM writer_categories
      WHERE writer_id = $1
        AND category_id = $2
      `,
      [writerId, categoryId]
    );

    if (existingWriterCategory.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message:
          "This category is already approved for this writer.",
      });
    }

    // ==========================================
    // ADD APPROVED CATEGORY
    // ==========================================

    await client.query(
      `
      INSERT INTO writer_categories
      (
        writer_id,
        category_id,
        approved_at,
        approved_by
      )
      VALUES
      ($1, $2, NOW(), $3)
      `,
      [
        writerId,
        categoryId,
        req.user.id,
      ]
    );

    // ==========================================
    // MAKE USER A WRITER
    // ==========================================

    await client.query(
  `
  UPDATE users
  SET
    name = $1,
    is_writer = TRUE
  WHERE id = $2
  `,
  [
    request.author_name.trim(),
    request.user_id,
  ]
);

    // ==========================================
    // MARK REQUEST APPROVED
    // ==========================================

    const approvedRequest = await client.query(
      `
      UPDATE writer_category_requests
      SET
        status = 'approved',
        category_id = $1,
        admin_note = $2,
        reviewed_at = NOW(),
        reviewed_by = $3
      WHERE id = $4
      RETURNING *
      `,
      [
        categoryId,
        admin_note || null,
        req.user.id,
        id,
      ]
    );

    await client.query("COMMIT");

    return res.json({
      message:
        "Writer category request approved successfully.",
      request: approvedRequest.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error(
      "REVIEW WRITER REQUEST ERROR:",
      err
    );

    return res.status(500).json({
      error: err.message,
    });
  } finally {
    client.release();
  }
};

// ======================================================
// CHANGE WRITER PASSWORD
// ======================================================

export const changeWriterPassword = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message: "All password fields are required.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New passwords do not match.",
      });
    }

    // Same password rules as resetPassword
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    // ==========================================
    // GET USER
    // ==========================================

    const userResult = await pool.query(
      `
      SELECT
        id,
        password,
        is_writer
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const user = userResult.rows[0];

    // ==========================================
    // VERIFY WRITER
    // ==========================================

    if (!user.is_writer) {
      return res.status(403).json({
        message: "Only writers can use this action.",
      });
    }

    // ==========================================
    // VERIFY CURRENT PASSWORD
    // ==========================================

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect.",
      });
    }

    // ==========================================
    // PREVENT SAME PASSWORD
    // ==========================================

    const samePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (samePassword) {
      return res.status(400).json({
        message:
          "New password must be different from your current password.",
      });
    }

    // ==========================================
    // HASH NEW PASSWORD
    // ==========================================

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    // ==========================================
    // UPDATE PASSWORD
    // ==========================================

    await pool.query(
      `
      UPDATE users
      SET password = $1
      WHERE id = $2
      `,
      [hashedPassword, userId]
    );

    return res.json({
      message: "Password changed successfully.",
    });
  } catch (err) {
    console.error(
      "CHANGE WRITER PASSWORD ERROR:",
      err
    );

    return res.status(500).json({
      error: "Failed to change password.",
    });
  }
};