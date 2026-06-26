import Employee from '../models/Employee.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import { logActivity } from '../utils/activityLogger.js';
import path from 'path';

// @desc    Get current employee profile
// @route   GET /api/employee/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id })
      .populate('user', 'name email role status')
      .populate('department');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee details not found' });
    }

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update employee profile info
// @route   PUT /api/employee/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { personalInfo, emergencyContact, education, experience, skills } = req.body;

    const employee = await Employee.findOne({ user: req.user.id });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee details not found' });
    }

    if (personalInfo) employee.personalInfo = { ...employee.personalInfo, ...personalInfo };
    if (emergencyContact) employee.emergencyContact = { ...employee.emergencyContact, ...emergencyContact };
    if (education) employee.education = education;
    if (experience) employee.experience = experience;
    if (skills) employee.skills = skills;

    await employee.save();

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update employee profile picture
// @route   PUT /api/employee/avatar
// @access  Private
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a photo file' });
    }

    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    // Set avatar path
    employee.profilePhoto = `/uploads/${req.file.filename}`;
    await employee.save();

    res.status(200).json({ success: true, profilePhoto: employee.profilePhoto });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload Resume
// @route   PUT /api/employee/resume
// @access  Private
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a document file' });
    }

    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    // Set resume path
    employee.resume = `/uploads/${req.file.filename}`;
    await employee.save();

    res.status(200).json({ success: true, resume: employee.resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get employee assigned tasks
// @route   GET /api/employee/tasks
// @access  Private
export const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id }).sort({ dueDate: 1 });
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update task status
// @route   PUT /api/employee/tasks/:id
// @access  Private
export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid task status' });
    }

    const task = await Task.findOne({ _id: req.params.id, assignedTo: req.user.id });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.status = status;
    if (status === 'Completed') {
      task.completedAt = new Date();
      await Notification.create({
        recipient: task.assignedBy,
        title: 'Task completed',
        message: `${req.user.name} completed ${task.title}.`,
      });
    } else {
      task.completedAt = null;
    }

    await task.save();

    await logActivity({
      user: req.user.id,
      action: 'TASK_STATUS_UPDATED',
      details: `Updated task ${task.title} to ${status}`,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
