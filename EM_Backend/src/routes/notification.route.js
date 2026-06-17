import express from "express";
import {
  getNotifications,
  markRead,
} from "../controllers/notification.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.put("/:id/read", protect, markRead);

export default router;
