import express from "express";
import { getBookmarks, getUserComments, getUserLikes, getProfile, updatePassword, updateProfile } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/bookmarks", authMiddleware, getBookmarks);
router.get("/likes",authMiddleware, getUserLikes)
router.get("/comments", authMiddleware, getUserComments)

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/password", authMiddleware, updatePassword);

export default router;