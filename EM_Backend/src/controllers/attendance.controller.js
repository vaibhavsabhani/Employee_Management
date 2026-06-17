import * as attendanceService from "../services/attendance.service.js";

export const createAttendance = async (req, res) => {
  try {
    const { employeeId, date, status, remarks } = req.body;
    // only admin should mark attendance; protect middleware ensures auth
    const att = await attendanceService.createAttendance({
      employeeId,
      date,
      status,
      remarks,
      markedBy: req.user._id,
    });
    return res.status(201).json({ success: true, data: att });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const att = await attendanceService.updateAttendance({
      id,
      status,
      remarks,
    });
    return res.status(200).json({ success: true, data: att });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    await attendanceService.deleteAttendance(id);
    return res.status(200).json({ success: true, message: "Deleted" });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const getAttendance = async (req, res) => {
  try {
    const result = await attendanceService.queryAttendance(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const att = await attendanceService.getAttendanceById(id);
    return res.status(200).json({ success: true, data: att });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const getMyAttendance = async (req, res) => {
  try {
    const employeeId = req.user._id || req.user.id;
    const q = { ...req.query, employeeId };
    const result = await attendanceService.queryAttendance(q);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const exportAttendance = async (req, res) => {
  try {
    const filter = {};
    const data = await attendanceService.exportAttendance(filter);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const attendanceStatistics = async (req, res) => {
  try {
    const stats = await attendanceService.getAttendanceStatistics();
    return res.status(200).json({ success: true, data: stats });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
