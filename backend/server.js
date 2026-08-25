
import "dotenv/config";
import app from "./src/app.js";
import publishScheduledArticles from "./src/services/scheduler.js";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);

  // Run once when server starts
  publishScheduledArticles();

  // Check every 30 seconds
  setInterval(() => {
    publishScheduledArticles();
  }, 30 * 1000);
});

server.on("error", (err) => {
  console.error("Server failed to start:", err);
});

