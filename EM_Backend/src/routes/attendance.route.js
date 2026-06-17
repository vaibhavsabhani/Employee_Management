import express from "express";
import {
  createAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendance,
  getAttendanceById,
  getMyAttendance,
  exportAttendance,
  attendanceStatistics,
} from "../controllers/attendance.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Simple role authorizer
const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role))
      return res
        .status(403)
        .json({ success: false, message: "Access denied. Unauthorized role." });
    next();
  };

// Admin actions
router.post("/", protect, authorize("admin"), createAttendance);
router.put("/:id", protect, authorize("admin"), updateAttendance);
router.delete("/:id", protect, authorize("admin"), deleteAttendance);
router.get("/export", protect, authorize("admin"), exportAttendance);
router.get("/statistics", protect, attendanceStatistics);

// Queries
router.get("/", protect, authorize("admin"), getAttendance);
router.get("/my", protect, authorize("employee", "admin"), getMyAttendance);
router.get("/:id", protect, authorize("admin"), getAttendanceById);

export default router;
