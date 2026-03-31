import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import errorHandler from "./middlewares/errorHandler.js";
import path from "path";

dotenv.config();

const app = express();

// Basic security & parsing middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Basic rate limiter for auth and public routes (will refine later)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use("/api", apiLimiter);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "skillnest-api" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);

// Serve locally uploaded files when Cloudinary keys are not configured.
// (Cloudinary uploads are handled separately in `cloudinary.service.js`.)
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

export default app;

