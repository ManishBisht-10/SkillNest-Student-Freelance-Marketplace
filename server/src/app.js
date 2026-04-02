import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import jobsRoutes from "./routes/jobs.routes.js";
import bidsRoutes from "./routes/bids.routes.js";
import contractsRoutes from "./routes/contracts.routes.js";
import paymentsRoutes from "./routes/payments.routes.js";
import reviewsRoutes from "./routes/reviews.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import errorHandler from "./middlewares/errorHandler.js";
import path from "path";

dotenv.config();

const app = express();

const allowedOrigins = new Set([
  process.env.CLIENT_URL || "http://localhost:5173",
]);

// Basic security & parsing middleware
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (no Origin header).
      if (!origin) return callback(null, true);

      if (allowedOrigins.has(origin)) return callback(null, true);

      // Local development convenience: allow localhost origins on any port.
      if (
        process.env.NODE_ENV !== "production" &&
        /^https?:\/\/localhost:\d+$/.test(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  })
);
app.use(helmet());
app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
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
app.use("/api/v1/jobs", jobsRoutes);
app.use("/api/v1/bids", bidsRoutes);
app.use("/api/v1/contracts", contractsRoutes);
app.use("/api/v1/payments", paymentsRoutes);
app.use("/api/v1/reviews", reviewsRoutes);
app.use("/api/v1/notifications", notificationsRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/chat", chatRoutes);

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

