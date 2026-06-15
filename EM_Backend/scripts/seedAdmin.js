import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/user.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/employee_db";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@12345";
const ADMIN_FIRST_NAME = process.env.ADMIN_FIRST_NAME || "Admin";
const ADMIN_LAST_NAME = process.env.ADMIN_LAST_NAME || "User";

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log(`Admin already exists: ${existing.email}`);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const admin = await User.create({
      firstName: ADMIN_FIRST_NAME,
      middleName: "",
      lastName: ADMIN_LAST_NAME,
      email: ADMIN_EMAIL,
      password: hashed,
      phoneNumber: "",
      role: "admin",
      isActive: true,
      createdBy: null,
    });

    console.log(`Created admin user: ${admin.email}`);
    process.exit(0);
  } catch (err) {
    console.error("Failed to seed admin:", err);
    process.exit(1);
  }
}

main();
