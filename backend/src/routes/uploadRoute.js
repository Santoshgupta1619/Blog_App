import express from "express";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No image uploaded",
      });
    }

    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    res.json({ imageUrl });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

export default router;