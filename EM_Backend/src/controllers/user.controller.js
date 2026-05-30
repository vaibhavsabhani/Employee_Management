import User from "../models/user.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { paginateQuery } from "../utils/paginatedQuery.js";

export const addUser = async (req, res) => {
  try {
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);
    const { firstName, middleName, lastName, email, phoneNumber } = req.body;
    const profilePicture = req.file?.path || "";

    // Validation
    if (!firstName?.trim()) {
      return res.status(400).json({
        message: "First name is required",
      });
    }

    if (!lastName?.trim()) {
      return res.status(400).json({
        message: "Last name is required",
      });
    }

    if (!email?.trim()) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check existing user
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Default password
    const defaultPassword = "Abcde@012024";

    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Create employee
    const employee = await User.create({
      firstName: firstName.trim(),
      middleName: middleName?.trim() || "",
      lastName: lastName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phoneNumber,
      profilePicture,
      role: "employee",
      createdBy: req.user?._id || null,
    });

    // Remove password from response
    const employeeResponse = employee.toObject();
    delete employeeResponse.password;

    return res.status(201).json({
      success: true,
      message: "Employee added successfully",
      employee: employeeResponse,
    });
  } catch (err) {
    console.error("Add Employee Error:", err);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const result = await paginateQuery({
      model: User,
      filter: { isActive: true },
      query: req.query,
      searchFields: ["firstName", "middleName", "lastName", "email"],
      select: "-password",
    });

    return res.status(200).json({
      success: true,
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      users: result.data,
    });
  } catch (error) {
    console.error("Get Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const user = isObjectId
      ? await User.findById(id).select("-password")
      : await User.findOne({ userId: id }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("Get User By ID Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.email) {
      updates.email = updates.email.toLowerCase().trim();
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const idExclusion = isObjectId ? { _id: { $ne: id } } : { userId: { $ne: id } };
      const existing = await User.findOne({
        email: updates.email,
        ...idExclusion,
      });
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const updated = isObjectId
      ? await User.findByIdAndUpdate(id, updates, { new: true }).select("-password")
      : await User.findOneAndUpdate({ userId: id }, updates, { new: true }).select("-password");
    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ success: true, user: updated });
  } catch (err) {
    console.error("Update User Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const user = isObjectId
      ? await User.findByIdAndUpdate(id, { isActive: false }, { new: true })
      : await User.findOneAndUpdate({ userId: id }, { isActive: false }, { new: true });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee deactivated successfully",
    });
  } catch (err) {
    console.error("Deactivate User Error:", err);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
