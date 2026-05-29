import multer from "multer";
import express from "express";
import {
  addUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// router.post("/add", protect, addUser);
const upload = multer({
  dest: "uploads/",
});
router.post("/add", protect, upload.single("profilePicture"), addUser);
router.get("/", protect, getUsers);
router.get("/:id", protect, getUserById);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);

export default router;
