import http from "http";
import dotenv from "dotenv";
import app from "./app.js";
import { connectMongo } from "./db/connectMongo.js";
import { initSocket } from "./socket/index.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function start() {
  await connectMongo();

  const server = http.createServer(app);

  initSocket(server);

  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`SkillNest API server running on port ${PORT}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[SkillNest] Server failed to start:", err);
  process.exit(1);
});

