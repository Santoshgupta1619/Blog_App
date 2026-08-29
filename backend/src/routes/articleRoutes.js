import express from "express";
import {
  createArticle,
  getPublishedArticles,
  getArticleBySlug,
  getCategories,
  getTrendingArticles,
  getHomepageCategory,
  getRecommendedArticles,
} from "../controllers/articleController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  updateArticle,
  toggleLikePost,
  toggleBookmark,
} from "../controllers/articleController.js";
import { deleteArticle } from "../controllers/articleController.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { optionalAuthMiddleware } from "../middleware/optionalAuthMiddleware.js";
import { articleOwnerMiddleware } from "../middleware/articleOwnerMiddleware.js";

const router = express.Router();

// CREATE (protected)
router.post("/", authMiddleware, createArticle);

// GET ALL (public)
router.get("/categories", getCategories);

router.get("/trending", getTrendingArticles);
router.get("/home-category", getHomepageCategory);

router.get("/", getPublishedArticles);

router.get("/recommended/:articleId", getRecommendedArticles);

// GET BY SLUG (public)
router.get("/:slug", optionalAuthMiddleware, getArticleBySlug);


router.put("/:id", authMiddleware, articleOwnerMiddleware, updateArticle);
router.delete("/:id", authMiddleware, adminMiddleware, deleteArticle);
router.post("/:articleId/like", authMiddleware, toggleLikePost);
router.post("/:articleId/bookmark", authMiddleware, toggleBookmark);

export default router;
