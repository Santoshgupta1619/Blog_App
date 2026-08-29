import express from "express";

import {
  submitWriterRequest,
  getMyWriterProfile,
  updateMyWriterProfile,
  getMyWriterCategories,
  getAvailableCategories,
  getMyWriterArticles,
  getWriterRequests,
  reviewWriterRequest,
  changeWriterPassword,
} from "../controllers/writerController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { deleteArticle } from "../controllers/articleController.js";
import { articleOwnerMiddleware } from "../middleware/articleOwnerMiddleware.js";

const router = express.Router();

// ======================================================
// GET MY WRITER PROFILE / STATUS
// ======================================================

router.get(
  "/profile",
  authMiddleware,
  getMyWriterProfile
);

router.put(
  "/profile",
  authMiddleware,
  updateMyWriterProfile
);

router.put(
  "/password",
  authMiddleware,
  changeWriterPassword
);

// ======================================================
// SUBMIT WRITER CATEGORY REQUEST
// ======================================================

router.post(
  "/request",
  authMiddleware,
  submitWriterRequest
);

// ======================================================
// GET MY APPROVED WRITER CATEGORIES
// ======================================================

router.get(
  "/categories",
  authMiddleware,
  getMyWriterCategories
);

router.get(
  "/available-categories",
  authMiddleware,
  getAvailableCategories
);
// ======================================================
// GET MY ARTICLES
// ======================================================

router.get(
  "/articles",
  authMiddleware,
  getMyWriterArticles
);

router.delete(
  "/articles/:id",
  authMiddleware,
  articleOwnerMiddleware,
  deleteArticle
);

router.get(
  "/admin/requests",
  authMiddleware,
  adminMiddleware,
  getWriterRequests
);

router.put(
  "/admin/requests/:id",
  authMiddleware,
  adminMiddleware,
  reviewWriterRequest
);

export default router;