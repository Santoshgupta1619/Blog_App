import express from "express";
import { 
  createArticle, 
  getPublishedArticles, 
  getArticleBySlug 
} from "../controllers/articleController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { updateArticle,toggleLikePost, toggleBookmark } from "../controllers/articleController.js";
import { deleteArticle } from "../controllers/articleController.js";
import adminMiddleware from "../middleware/adminMiddleware.js"
import {optionalAuthMiddleware} from "../middleware/optionalAuthMiddleware.js";


const router = express.Router();

// CREATE (protected)
router.post("/", authMiddleware,adminMiddleware, createArticle);

// GET ALL (public)
router.get("/", getPublishedArticles);

// GET BY SLUG (public)
router.get("/:slug", optionalAuthMiddleware,getArticleBySlug);

router.put("/:id", authMiddleware,adminMiddleware, updateArticle);
router.delete("/:id", authMiddleware,adminMiddleware, deleteArticle);
router.post("/:articleId/like", authMiddleware, toggleLikePost);
router.post("/:articleId/bookmark", authMiddleware, toggleBookmark);

export default router;