import * as leaveService from "../services/leave.service.js";

export const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason, attachment } = req.body;
    const employeeId = req.user._id || req.user.id;
    const lr = await leaveService.applyLeave({
      employeeId,
      leaveType,
      startDate,
      endDate,
      reason,
      attachment,
    });
    return res.status(201).json({ success: true, data: lr });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const getMyLeaves = async (req, res) => {
  try {
    const employeeId = req.user._id || req.user.id;
    const result = await leaveService.getMyLeaves({
      employeeId,
      query: req.query,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyBalance = async (req, res) => {
  try {
    const employeeId = req.user._id || req.user.id;
    const bal = await leaveService.getLeaveBalance(employeeId);
    return res.status(200).json({ success: true, data: bal });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const cancelLeave = async (req, res) => {
  try {
    const employeeId = req.user._id || req.user.id;
    const { id } = req.params;
    const r = await leaveService.cancelLeave({ employeeId, id });
    return res.status(200).json({ success: true, data: r });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// Admin
export const adminGetLeaves = async (req, res) => {
  try {
    const result = await leaveService.adminGetLeaves(req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getLeaveById = async (req, res) => {
  try {
    const { id } = req.params;
    const lr = await leaveService.getLeaveById(id);
    return res.status(200).json({ success: true, data: lr });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const approveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id || req.user.id;
    const { adminComment } = req.body;
    const result = await leaveService.approveLeave({
      id,
      adminId,
      adminComment,
    });
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id || req.user.id;
    const { rejectionReason, adminComment } = req.body;
    const result = await leaveService.rejectLeave({
      id,
      adminId,
      rejectionReason,
      adminComment,
    });
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const leaveStatistics = async (req, res) => {
  try {
    const stats = await leaveService.getLeaveStatistics();
    return res.status(200).json({ success: true, data: stats });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const leaveReport = async (req, res) => {
  try {
    const filter = req.query || {};
    const data = await leaveService.getLeaveReport(filter);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
