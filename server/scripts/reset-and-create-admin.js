import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User.model.js";

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/skillnest";

async function resetAndCreateAdmin() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 15000,
    });
    console.log("✅ Connected to MongoDB");

    // Delete all users
    console.log("🗑️  Deleting all users...");
    const deleteResult = await User.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} users`);

    // Create new admin user
    const adminEmail = "bishtmanish916@gmail.com";
    const adminPassword = "admin@123";
    const adminName = "Admin User";

    console.log(`\n➕ Creating new admin user...`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    // Create the admin user
    const newAdmin = await User.create({
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: "admin",
      isVerified: true,
      isActive: true,
      isBanned: false,
    });

    console.log(`✅ New admin created successfully!`);
    console.log(`   User ID: ${newAdmin._id}`);
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Role: ${newAdmin.role}`);
    console.log(`   Verified: ${newAdmin.isVerified}`);

    console.log("\n✨ Reset complete! You can now login with the new admin credentials.");

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

resetAndCreateAdmin();
