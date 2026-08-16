import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/authRoutes.js";
import articleRoutes from "./routes/articleRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import uploadRoute from "./routes/uploadRoute.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";




const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));


app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/upload", uploadRoute);



app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/categories", categoryRoutes);


app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;