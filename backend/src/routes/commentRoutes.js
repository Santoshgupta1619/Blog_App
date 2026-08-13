import express from "express";
import {
  createComment,
  getCommentsByArticle,
  deleteComment,
  updateComment,
  toggleLikeComment,
  reportComment,
  getReportedComments,
} from "../controllers/commentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import adminOrOwner from "../middleware/adminOrOwner.js";

const router = express.Router();

// Create comment
router.post("/:articleId", authMiddleware, createComment);

// Get comments for article
router.get("/:articleId", getCommentsByArticle);

// Delete comment
router.delete("/:id", authMiddleware,adminOrOwner, deleteComment);

router.put("/:id", authMiddleware, updateComment);
router.post("/:commentId/like", authMiddleware, toggleLikeComment);
router.post("/:commentId/report", authMiddleware, reportComment);
router.get("/reports", authMiddleware, getReportedComments);

export default router;

