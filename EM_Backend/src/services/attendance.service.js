import Attendance from "../models/attendance.model.js";
import mongoose from "mongoose";

export const createAttendance = async ({
  employeeId,
  date,
  status,
  remarks,
  markedBy,
}) => {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);

  // Prevent future dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (day > today) throw new Error("Cannot mark future attendance");

  const existing = await Attendance.findOne({
    employee: employeeId,
    date: day,
  });
  if (existing)
    throw new Error("Attendance already exists for this employee on this date");

  const att = await Attendance.create({
    employee: employeeId,
    date: day,
    status,
    remarks,
    markedBy,
  });
  // create a notification for the employee (best-effort, don't block attendance)
  try {
    const title = `Attendance marked`;
    const message = `Your attendance for ${day.toDateString()} has been marked as ${status}.`;
    // fire-and-forget
    await createNotification({ userId: employeeId, title, message });
  } catch (e) {
    // log and continue
    console.error("Failed to create attendance notification:", e);
  }
  return att;
};

export const updateAttendance = async ({ id, status, remarks }) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid id");
  const att = await Attendance.findByIdAndUpdate(
    id,
    { status, remarks },
    { new: true },
  );
  return att;
};

export const deleteAttendance = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid id");
  await Attendance.findByIdAndDelete(id);
};

export const getAttendanceById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid id");
  return Attendance.findById(id).populate(
    "employee",
    "firstName lastName email role",
  );
};

export const queryAttendance = async (query) => {
  const {
    employeeId,
    status,
    month,
    year,
    fromDate,
    toDate,
    page = 1,
    limit = 20,
  } = query;
  const filter = {};
  if (employeeId) filter.employee = employeeId;
  if (status) filter.status = status;
  if (month && year) {
    const m = Number(month) - 1;
    const start = new Date(Number(year), m, 1);
    const end = new Date(Number(year), m + 1, 1);
    filter.date = { $gte: start, $lt: end };
  }
  if (fromDate)
    filter.date = { ...(filter.date || {}), $gte: new Date(fromDate) };
  if (toDate) filter.date = { ...(filter.date || {}), $lte: new Date(toDate) };

  const skip = (Number(page) - 1) * Number(limit);
  const data = await Attendance.find(filter)
    .populate("employee", "firstName lastName email role")
    .sort({ date: -1 })
    .skip(skip)
    .limit(Number(limit));
  const total = await Attendance.countDocuments(filter);
  return {
    data,
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / Number(limit)),
  };
};

export const exportAttendance = async (filter = {}) => {
  // Return raw data for export - frontend or util will convert to CSV/Excel
  const data = await Attendance.find(filter).populate(
    "employee",
    "firstName lastName email role",
  );
  return data;
};

export const getAttendanceStatistics = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const match = { date: today };

  const agg = await Attendance.aggregate([
    { $match: match },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const stats = {
    presentToday: 0,
    absentToday: 0,
    halfDayToday: 0,
    wfhToday: 0,
  };
  agg.forEach((g) => {
    if (g._id === "Present") stats.presentToday = g.count;
    if (g._id === "Absent") stats.absentToday = g.count;
    if (g._id === "Half Day") stats.halfDayToday = g.count;
    if (g._id === "Work From Home") stats.wfhToday = g.count;
    if (g._id === "Paid Leave")
      stats.paidLeaveToday = (stats.paidLeaveToday || 0) + g.count;
  });

  // total employees - best effort: count distinct users with role employee
  // Keep this simple: client can request total employees separately.
  return stats;
};
