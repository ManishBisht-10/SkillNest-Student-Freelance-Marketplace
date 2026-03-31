import http from "http";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Socket.IO will be wired here in a later step
// and live under src/socket/index.js

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`SkillNest API server running on port ${PORT}`);
});

