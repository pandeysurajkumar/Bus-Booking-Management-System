
import "dotenv/config";

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import connectDB from "../src/config/database.js";
import User from "../src/models/User.js";

const seedAdmin = async () => {
  try {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error("Admin seed environment variables are missing");
    }

    if (Buffer.byteLength(ADMIN_PASSWORD, "utf8") > 72) {
      throw new Error("Admin password exceeds bcrypt's 72-byte limit");
    }

    await connectDB();

    const email = ADMIN_EMAIL.trim().toLowerCase();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.role !== "admin") {
        throw new Error("This email already belongs to a non-admin user");
      }

      console.log("Admin account already exists. No changes made.");
      return;
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    await User.create({
      name: ADMIN_NAME,
      email,
      passwordHash,
      role: "admin",
      status: "active"
    });

    console.log("Initial admin account created successfully.");

  } catch (error) {
    console.error("Admin seeding failed:", error.message);
    process.exitCode = 1;

  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin();
