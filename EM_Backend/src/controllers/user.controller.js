import User from "../models/user.js";
import bcrypt from "bcryptjs";

export const addUser = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      email,
      phoneNumber,
      profilePicture,
    } = req.body;

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

    const hashedPassword = await bcrypt.hash(
      defaultPassword,
      10
    );

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
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;

    const search = (req.query.search || "").trim();
    const filter = {};
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
      ];
    }

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select("-password")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
    ]);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      users,
    });
  } catch (err) {
    console.error("Get Users Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
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
      const existing = await User.findOne({ email: updates.email, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updated = await User.findByIdAndUpdate(id, updates, { new: true }).select("-password");
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
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ success: true, message: "User deleted" });
  } catch (err) {
    console.error("Delete User Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};