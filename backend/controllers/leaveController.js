import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Apply for Leave
// @route   POST /api/leaves/apply
// @access  Private (Employee)
export const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    if (timeDiff < 0) {
      return res.status(400).json({ success: false, message: 'End date cannot be before start date' });
    }

    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    // Check employee leave balance
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    const balance = employee.leaveBalance[leaveType.toLowerCase()];
    if (balance === undefined || balance < diffDays) {
      return res.status(400).json({
        success: false,
        message: `Insufficient leave balance. Requested: ${diffDays} days, Available: ${balance || 0} days`,
      });
    }

    const leave = await Leave.create({
      employee: req.user.id,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
    });

    const reviewers = await User.find({ role: { $in: ['HR', 'Super Admin'] }, status: 'Active' }).select('_id');
    if (reviewers.length) {
      await Notification.insertMany(reviewers.map((reviewer) => ({
        recipient: reviewer._id,
        title: 'Leave approval pending',
        message: `${req.user.name} requested ${diffDays} ${leaveType} leave day${diffDays > 1 ? 's' : ''}.`,
      })));
    }

    await logActivity({
      user: req.user.id,
      action: 'LEAVE_REQUESTED',
      details: `Requested ${diffDays} ${leaveType} leave day${diffDays > 1 ? 's' : ''}`,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in employee leaves list
// @route   GET /api/leaves/my-leaves
// @access  Private
export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get leave balance details
// @route   GET /api/leaves/balance
// @access  Private
export const getLeaveBalance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }
    res.status(200).json({ success: true, balance: employee.leaveBalance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
