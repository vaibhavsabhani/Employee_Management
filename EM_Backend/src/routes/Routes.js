import express from "express";
import userRoutes from "./user.route.js";
import authRoutes from "./auth.route.js";

const router = express.Router();

// Mount user-related routes under /user
router.use("/employee", userRoutes);
router.use("/auth", authRoutes);

export default router;
