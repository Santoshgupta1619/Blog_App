import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendOTPEmail,sendVerificationEmail } from "../utils/sendEmail.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Token valid for 24 hours
    const verificationExpiry = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    const result = await pool.query(
      `INSERT INTO users
       (
         name,
         email,
         password,
         email_verified,
         email_verification_token,
         email_verification_expires
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, created_at, email_verified`,
      [
        name,
        email,
        hashedPassword,
        false,
        verificationToken,
        verificationExpiry,
      ]
    );

    const user = result.rows[0];

    await sendVerificationEmail(
      email,
      verificationToken
    );

    res.status(201).json({
      message:
        "Registration successful. Please verify your email.",
      user,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const result = await pool.query(
      `SELECT id, email_verified, email_verification_expires
       FROM users
       WHERE email_verification_token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid verification link",
      });
    }

    const user = result.rows[0];

    // Already verified
    if (user.email_verified) {
      return res.json({
        message: "Email is already verified",
      });
    }

    // Check expiry
    if (
      !user.email_verification_expires ||
      new Date() > new Date(user.email_verification_expires)
    ) {
      return res.status(400).json({
        message: "Verification link has expired",
      });
    }

    await pool.query(
      `UPDATE users
       SET email_verified = TRUE,
           email_verification_token = NULL,
           email_verification_expires = NULL
       WHERE id = $1`,
      [user.id]
    );

    res.json({
      message: "Email verified successfully",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

if (!isMatch) {
  return res.status(400).json({
    message: "Invalid password",
  });
}

if (!user.email_verified) {
  return res.status(403).json({
    message: "Please verify your email before logging in.",
  });
}


    const token = jwt.sign(
  { id: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      `UPDATE users
       SET otp = $1,
           otp_expiry = $2
       WHERE email = $3`,
      [otp, expiry, email]
    );

    await sendOTPEmail(email, otp);

    res.json({
      message: "OTP sent successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const result = await pool.query(
      "SELECT otp, otp_expiry FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = result.rows[0];

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (new Date() > new Date(user.otp_expiry)) {
      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    res.json({
      message: "OTP verified successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

if (!passwordRegex.test(password)) {
  return res.status(400).json({
    message:
      "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
  });
}

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `UPDATE users
       SET password=$1,
           otp=NULL,
           otp_expiry=NULL
       WHERE email=$2`,
      [hashedPassword, email]
    );

    res.json({
      message: "Password updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};