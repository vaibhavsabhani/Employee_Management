import express from "express";
import userRoutes from "./user.route.js";
import authRoutes from "./auth.route.js";
import { DecodeJwtToken } from "../middleware/authMiddleware.js";
import { getUserData } from "../controllers/user.controller.js";

const router = express.Router();

// Mount user-related routes under /user
router.use("/employee", userRoutes);
router.use("/auth", authRoutes);
router.get("/medata", DecodeJwtToken, getUserData);

export default router;
