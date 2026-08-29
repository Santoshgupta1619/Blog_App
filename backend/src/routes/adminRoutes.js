import express from "express";
import { getDraftArticles, getScheduledArticles } from "../controllers/articleController.js";
import { createCategory } from "../controllers/categoryController.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getAdminArticles, getArticleById, getAdminBookmarks} from "../controllers/articleController.js";
import { updateArticle } from "../controllers/articleController.js";
import {
  getWriterRequests,
  reviewWriterRequest,
} from "../controllers/writerController.js";

const router = express.Router();

// Drafts
router.get("/drafts",authMiddleware, adminMiddleware, getDraftArticles);

// Scheduled
router.get("/scheduled",authMiddleware, adminMiddleware, getScheduledArticles);

// Create Category
router.post("/category",authMiddleware, adminMiddleware, createCategory);

router.get("/articles", authMiddleware, adminMiddleware, getAdminArticles);
router.get("/articles/:id", authMiddleware, adminMiddleware, getArticleById);

router.put(
  "/articles/:id",
  authMiddleware,
  adminMiddleware,
  updateArticle
);

router.get(
  "/bookmarks",
  authMiddleware,
  adminMiddleware,
  getAdminBookmarks
);


// ======================================================
// WRITER REQUESTS
// ======================================================

// Get all writer category requests
router.get(
  "/writer-requests",
  authMiddleware,
  adminMiddleware,
  getWriterRequests
);

// Approve / reject writer category request
router.put(
  "/writer-requests/:id",
  authMiddleware,
  adminMiddleware,
  reviewWriterRequest
);

export default router;