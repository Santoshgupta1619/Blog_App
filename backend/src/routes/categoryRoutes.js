import express from "express";
import {
  createCategory,
  getCategories,
  deleteCategory,
} from "../controllers/categoryController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public
router.get("/", getCategories);

// Admin only
router.post("/", authMiddleware, adminMiddleware, createCategory);

router.delete("/:id", authMiddleware, adminMiddleware, deleteCategory);

export default router;