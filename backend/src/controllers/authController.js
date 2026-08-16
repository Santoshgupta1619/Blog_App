import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendOTPEmail } from "../utils/sendEmail.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING *",
      [name, email, hashedPassword]
    );

    const user = result.rows[0];

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
      return res.status(400).json({ message: "Invalid password" });
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