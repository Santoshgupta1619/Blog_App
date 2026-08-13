import app from "./src/app.js";
import dotenv from "dotenv";
import publishScheduledArticles from "./src/services/scheduler.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Check immediately when server starts
  publishScheduledArticles();

  // Check every 30 seconds
  setInterval(() => {
    publishScheduledArticles();
  }, 30 * 1000);
});