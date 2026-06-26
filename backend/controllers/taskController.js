import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Get tasks for current user or all tasks for HR/Admin
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    const query = req.user.role === 'Employee' ? { assignedTo: req.user.id } : {};
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ dueDate: 1 });

    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create task assignment
// @route   POST /api/tasks
// @access  Private (HR or Super Admin)
export const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate } = req.body;

    if (!title || !assignedTo || !dueDate) {
      return res.status(400).json({ success: false, message: 'Title, assigned employee, and due date are required' });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      assignedBy: req.user.id,
      dueDate,
    });

    await Notification.create({
      recipient: assignedTo,
      title: 'New task assigned',
      message: `${title} is due on ${new Date(dueDate).toLocaleDateString()}.`,
    });

    await logActivity({
      user: req.user.id,
      action: 'TASK_ASSIGNED',
      details: `Assigned task ${title}`,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid task status' });
    }

    const query = req.user.role === 'Employee'
      ? { _id: req.params.id, assignedTo: req.user.id }
      : { _id: req.params.id };

    const task = await Task.findOne(query);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.status = status;
    task.completedAt = status === 'Completed' ? new Date() : null;
    await task.save();

    if (status === 'Completed' && String(task.assignedBy) !== String(req.user.id)) {
      await Notification.create({
        recipient: task.assignedBy,
        title: 'Task completed',
        message: `${req.user.name} completed ${task.title}.`,
      });
    }

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
