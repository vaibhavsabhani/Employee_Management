import express from "express";
import {
  applyLeave,
  getMyLeaves,
  getMyBalance,
  cancelLeave,
  adminGetLeaves,
  getLeaveById,
  approveLeave,
  rejectLeave,
  leaveStatistics,
  leaveReport,
} from "../controllers/leave.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role))
      return res
        .status(403)
        .json({ success: false, message: "Access denied. Unauthorized role." });
    next();
  };

// Employee
router.post("/", protect, authorize("employee"), applyLeave);
router.get("/my", protect, authorize("employee"), getMyLeaves);
router.get("/my/balance", protect, authorize("employee"), getMyBalance);
router.delete("/:id", protect, authorize("employee"), cancelLeave);

// Admin
router.get("/", protect, authorize("admin"), adminGetLeaves);
router.get("/statistics", protect, authorize("admin"), leaveStatistics);
router.get("/report", protect, authorize("admin"), leaveReport);
router.get("/:id", protect, authorize("admin"), getLeaveById);
router.put("/:id/approve", protect, authorize("admin"), approveLeave);
router.put("/:id/reject", protect, authorize("admin"), rejectLeave);

export default router;
