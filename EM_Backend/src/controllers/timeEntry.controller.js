import TimeEntry from "../models/timeEntry.model.js";
import User from "../models/user.js";
import mongoose from "mongoose";

// helper to parse time string "HH:mm" to minutes
const parseTimeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

// Create a new manual time entry (Employee)
export const createTimeEntry = async (req, res) => {
  try {
    const { date, startTime, endTime, breakDuration, notes } = req.body;
    const employeeId = req.user._id || req.user.id;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Date, Start Time, and End Time are required.",
      });
    }

    const breakMins = Number(breakDuration) || 0;
    if (breakMins < 0) {
      return res.status(400).json({
        success: false,
        message: "Break duration cannot be negative.",
      });
    }

    const startMins = parseTimeToMinutes(startTime);
    let endMins = parseTimeToMinutes(endTime);

    // If end time is before start time, assume it crosses midnight (adds 24 hours)
    if (endMins < startMins) {
      endMins += 24 * 60;
    }

    const totalMinutes = endMins - startMins - breakMins;
    if (totalMinutes < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Break duration cannot exceed the total duration of the work shift.",
      });
    }

    const newEntry = await TimeEntry.create({
      employee: employeeId,
      date: new Date(date),
      startTime,
      endTime,
      breakDuration: breakMins,
      notes: notes || "",
      duration: totalMinutes,
      status: "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Time entry submitted successfully.",
      data: newEntry,
    });
  } catch (error) {
    console.error("Create Time Entry Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create time entry due to a server error.",
    });
  }
};

// Get logged-in employee's own entries & stats
export const getMyTimeEntries = async (req, res) => {
  try {
    const employeeId = req.user._id || req.user.id;
    const { status, limit = 10, page = 1, days = 30 } = req.query;

    const filter = { employee: employeeId };

    // Apply status filter if provided
    if (status && ["Pending", "Approved", "Rejected"].includes(status)) {
      filter.status = status;
    }

    // Apply date filter if days parameter is specified
    if (days && days !== "all") {
      const daysNum = Number(days);
      if (!isNaN(daysNum)) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysNum);
        filter.date = { $gte: cutoffDate };
      }
    }

    const limitNum = Math.max(1, Number(limit));
    const pageNum = Math.max(1, Number(page));
    const skipNum = (pageNum - 1) * limitNum;

    // Fetch entries
    const entries = await TimeEntry.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skipNum)
      .limit(limitNum);

    const total = await TimeEntry.countDocuments(filter);

    // Calculate Stats for Employee
    // 1. Total pending hours
    const pendingEntries = await TimeEntry.find({
      employee: employeeId,
      status: "Pending",
    });
    const pendingMins = pendingEntries.reduce(
      (acc, entry) => acc + (entry.duration || 0),
      0,
    );
    const pendingHours = Number((pendingMins / 60).toFixed(2));

    // 2. Approved this month hours
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const approvedEntries = await TimeEntry.find({
      employee: employeeId,
      status: "Approved",
      date: { $gte: startOfMonth },
    });
    const approvedMins = approvedEntries.reduce(
      (acc, entry) => acc + (entry.duration || 0),
      0,
    );
    const approvedHours = Number((approvedMins / 60).toFixed(2));

    return res.status(200).json({
      success: true,
      data: entries,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      stats: {
        pendingHours,
        approvedHours,
      },
    });
  } catch (error) {
    console.error("Get My Time Entries Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get all time entries for admin (with search and filter)
export const getAllTimeEntries = async (req, res) => {
  try {
    const { status, employeeId, page = 1, limit = 10, search } = req.query;

    const filter = {};

    if (status && ["Pending", "Approved", "Rejected"].includes(status)) {
      filter.status = status;
    }

    if (employeeId && mongoose.Types.ObjectId.isValid(employeeId)) {
      filter.employee = employeeId;
    }

    const limitNum = Math.max(1, Number(limit));
    const pageNum = Math.max(1, Number(page));
    const skipNum = (pageNum - 1) * limitNum;

    let entriesQuery = TimeEntry.find(filter)
      .populate("employee", "firstName lastName email role")
      .populate("approvedBy", "firstName lastName email")
      .sort({ date: -1, createdAt: -1 });

    let entries = await entriesQuery;

    // Perform filter by search on populated employee names/emails if needed
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      entries = entries.filter((entry) => {
        if (!entry.employee) return false;
        const fullName = `${entry.employee.firstName} ${entry.employee.lastName}`;
        return (
          fullName.match(searchRegex) || entry.employee.email.match(searchRegex)
        );
      });
    }

    const totalFiltered = entries.length;
    const paginatedEntries = entries.slice(skipNum, skipNum + limitNum);

    return res.status(200).json({
      success: true,
      data: paginatedEntries,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalFiltered,
        totalPages: Math.ceil(totalFiltered / limitNum),
      },
    });
  } catch (error) {
    console.error("Get All Time Entries Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Approve a time entry (Admin)
export const approveTimeEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id || req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid time entry ID.",
      });
    }

    const entry = await TimeEntry.findById(id);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Time entry not found.",
      });
    }

    entry.status = "Approved";
    entry.approvedBy = adminId;
    entry.rejectionReason = ""; // clear if previously rejected
    await entry.save();

    return res.status(200).json({
      success: true,
      message: "Time entry approved successfully.",
      data: entry,
    });
  } catch (error) {
    console.error("Approve Time Entry Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Reject a time entry (Admin)
export const rejectTimeEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user._id || req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid time entry ID.",
      });
    }

    const entry = await TimeEntry.findById(id);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Time entry not found.",
      });
    }

    entry.status = "Rejected";
    entry.approvedBy = adminId; // tracks who acted on it
    entry.rejectionReason = reason || "Rejected by administrator";
    await entry.save();

    return res.status(200).json({
      success: true,
      message: "Time entry rejected successfully.",
      data: entry,
    });
  } catch (error) {
    console.error("Reject Time Entry Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
