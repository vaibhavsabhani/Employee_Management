import LeaveRequest from "../models/leaveRequest.model.js";
import LeaveBalance from "../models/leaveBalance.model.js";
import Attendance from "../models/attendance.model.js";
import Notification from "../models/notification.model.js";
import mongoose from "mongoose";

// Helper: check overlapping leaves
const hasOverlap = (existing, start, end) => {
  return !(existing.endDate < start || existing.startDate > end);
};

export const applyLeave = async ({
  employeeId,
  leaveType,
  startDate,
  endDate,
  reason,
  attachment,
}) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (end < start) throw new Error("endDate must be after startDate");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (start < today) throw new Error("Cannot apply leave in the past");

  // Prevent overlapping leaves
  const existing = await LeaveRequest.find({
    employee: employeeId,
    status: { $in: ["Pending", "Approved"] },
  });
  for (const ex of existing) {
    if (
      hasOverlap({ startDate: ex.startDate, endDate: ex.endDate }, start, end)
    ) {
      throw new Error("Overlapping leave request exists");
    }
  }

  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  const req = await LeaveRequest.create({
    employee: employeeId,
    leaveType,
    startDate: start,
    endDate: end,
    totalDays: days,
    reason,
    attachment,
    status: "Pending",
  });

  // Notify admins - create a generic notification for admins (frontend will filter by role/route)
  await Notification.create({
    userId: null,
    title: "New Leave Request",
    message: `Employee applied for leave from ${start.toDateString()} to ${end.toDateString()}`,
  });

  return req;
};

export const getMyLeaves = async ({ employeeId, query }) => {
  const { page = 1, limit = 20 } = query || {};
  const skip = (Number(page) - 1) * Number(limit);
  const data = await LeaveRequest.find({ employee: employeeId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));
  const total = await LeaveRequest.countDocuments({ employee: employeeId });
  return {
    data,
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / Number(limit)),
  };
};

export const getLeaveBalance = async (employeeId) => {
  let bal = await LeaveBalance.findOne({ employee: employeeId });
  if (!bal) {
    bal = await LeaveBalance.create({
      employee: employeeId,
      casualLeave: 10,
      sickLeave: 10,
      earnedLeave: 5,
      usedLeaves: 0,
    });
  }
  const obj = bal.toObject();
  obj.remainingLeaves = bal.remainingLeaves;
  return obj;
};

export const cancelLeave = async ({ employeeId, id }) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid id");
  const lr = await LeaveRequest.findById(id);
  if (!lr) throw new Error("Leave not found");
  if (String(lr.employee) !== String(employeeId))
    throw new Error("Not authorized to cancel this leave");
  if (lr.status !== "Pending")
    throw new Error("Only pending leaves can be cancelled");
  lr.status = "Cancelled";
  await lr.save();

  // Notify admin
  await Notification.create({
    userId: null,
    title: "Leave Cancelled",
    message: `Employee cancelled leave request ${id}`,
  });

  return lr;
};

export const adminGetLeaves = async (query) => {
  const { status, page = 1, limit = 20 } = query;
  const filter = {};
  if (status) filter.status = status;
  const skip = (Number(page) - 1) * Number(limit);
  const data = await LeaveRequest.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate("employee", "firstName lastName email role");
  const total = await LeaveRequest.countDocuments(filter);
  return {
    data,
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / Number(limit)),
  };
};

export const getLeaveById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid id");
  return LeaveRequest.findById(id).populate(
    "employee",
    "firstName lastName email role",
  );
};

export const approveLeave = async ({ id, adminId, adminComment }) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid id");
  const lr = await LeaveRequest.findById(id);
  if (!lr) throw new Error("Leave request not found");
  if (lr.status !== "Pending")
    throw new Error("Only pending leaves can be approved");

  lr.status = "Approved";
  lr.approvedBy = adminId;
  lr.approvedAt = new Date();
  lr.adminComment = adminComment || "";
  await lr.save();

  // Update leave balance
  const bal = await LeaveBalance.findOne({ employee: lr.employee });
  if (bal) {
    bal.usedLeaves = (bal.usedLeaves || 0) + lr.totalDays;
    await bal.save();
  }

  // Create attendance entries for each day
  const entries = [];
  const s = new Date(lr.startDate);
  const e = new Date(lr.endDate);
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    const day = new Date(d);
    day.setHours(0, 0, 0, 0);
    try {
      const att = await Attendance.create({
        employee: lr.employee,
        date: day,
        status: "Paid Leave",
        remarks: `Auto-generated for approved leave ${lr._id}`,
        markedBy: adminId,
      });
      entries.push(att);
    } catch (err) {
      // ignore duplicates
    }
  }

  // Notify employee
  await Notification.create({
    userId: lr.employee,
    title: "Leave Approved",
    message: `Your leave from ${lr.startDate.toDateString()} to ${lr.endDate.toDateString()} was approved.`,
  });

  return { lr, createdAttendance: entries };
};

export const rejectLeave = async ({
  id,
  adminId,
  rejectionReason,
  adminComment,
}) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid id");
  const lr = await LeaveRequest.findById(id);
  if (!lr) throw new Error("Leave request not found");
  if (lr.status !== "Pending")
    throw new Error("Only pending leaves can be rejected");

  lr.status = "Rejected";
  lr.rejectionReason = rejectionReason || "";
  lr.adminComment = adminComment || "";
  lr.approvedBy = adminId;
  await lr.save();

  // Notify employee
  await Notification.create({
    userId: lr.employee,
    title: "Leave Rejected",
    message: `Your leave request was rejected. Reason: ${lr.rejectionReason || "No reason provided"}`,
  });

  return lr;
};

export const getLeaveStatistics = async () => {
  const agg = await LeaveRequest.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const stats = { totalRequests: 0, pending: 0, approved: 0, rejected: 0 };
  let total = 0;
  agg.forEach((g) => {
    total += g.count;
    if (g._id === "Pending") stats.pending = g.count;
    if (g._id === "Approved") stats.approved = g.count;
    if (g._id === "Rejected") stats.rejected = g.count;
  });
  stats.totalRequests = total;
  return stats;
};

export const getLeaveReport = async (filter = {}) => {
  // Basic report: return leave requests matching filter
  const data = await LeaveRequest.find(filter).populate(
    "employee",
    "firstName lastName email role",
  );
  return data;
};
