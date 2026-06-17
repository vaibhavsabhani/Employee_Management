import express from "express";
import userRoutes from "./user.route.js";
import authRoutes from "./auth.route.js";
import timeEntryRoutes from "./timeEntry.route.js";
import attendanceRoutes from "./attendance.route.js";
import leaveRoutes from "./leave.route.js";
import notificationRoutes from "./notification.route.js";
import { DecodeJwtToken } from "../middleware/authMiddleware.js";
import { getUserData } from "../controllers/user.controller.js";

const router = express.Router();

// Mount routes
router.use("/employee", userRoutes);
router.use("/auth", authRoutes);
router.use("/time-tracking", timeEntryRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/leaves", leaveRoutes);
router.use("/notifications", notificationRoutes);
router.get("/medata", DecodeJwtToken, getUserData);

export default router;
