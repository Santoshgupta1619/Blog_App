import express from "express";
import { register, login, forgotPassword, verifyOTP, resetPassword, verifyEmail } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);
router.get("/verify-email/:token", verifyEmail);

export default router;
