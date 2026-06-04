import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createTimeEntry,
  getMyTimeEntries,
  getAllTimeEntries,
  approveTimeEntry,
  rejectTimeEntry,
} from "../controllers/timeEntry.controller.js";

const router = express.Router();

// Middleware to authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Unauthorized role.",
      });
    }
    next();
  };
};

// Employee routes
router.post("/", protect, authorize("employee"), createTimeEntry);
router.get("/my", protect, authorize("employee"), getMyTimeEntries);

// Admin routes
router.get("/", protect, authorize("admin"), getAllTimeEntries);
router.put("/:id/approve", protect, authorize("admin"), approveTimeEntry);
router.put("/:id/reject", protect, authorize("admin"), rejectTimeEntry);

export default router;
