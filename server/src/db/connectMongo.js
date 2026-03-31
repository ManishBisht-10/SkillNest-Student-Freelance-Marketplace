import mongoose from "mongoose";

export async function connectMongo() {
  const mongoUri =
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/skillnest";

  if (!process.env.MONGO_URI) {
    // eslint-disable-next-line no-console
    console.warn(
      "[SkillNest] MONGO_URI not set; falling back to localhost for development."
    );
  }

  // Avoid rebuilding indexes on every restart in production; keep it on in dev.
  const autoIndex = process.env.NODE_ENV !== "production";

  mongoose.set("strictQuery", true);

  await mongoose.connect(mongoUri, {
    autoIndex,
    serverSelectionTimeoutMS: 15000,
  });

  // eslint-disable-next-line no-console
  console.log(`[SkillNest] MongoDB connected: ${mongoose.connection.host}`);
}

