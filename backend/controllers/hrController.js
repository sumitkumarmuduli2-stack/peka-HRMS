import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Leave from '../models/Leave.js';
import Department from '../models/Department.js';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Get all employees
// @route   GET /api/hr/employees
// @access  Private (HR or Super Admin)
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate('user', 'name email role status')
      .populate('department');
    res.status(200).json({ success: true, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create Employee
// @route   POST /api/hr/employees
// @access  Private (HR or Super Admin)
export const createEmployee = async (req, res) => {
  try {
    const { name, email, password, employeeId, jobTitle, departmentId, dateOfJoining } = req.body;

    if (!name || !email || !password || !employeeId || !jobTitle) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const employeeIdExists = await Employee.findOne({ employeeId });
    if (employeeIdExists) {
      return res.status(400).json({ success: false, message: 'Employee ID is already taken' });
    }

    // Create User
    const user = await User.create({
      name,
      email,
      password,
      role: 'Employee',
    });

    // Create Employee Profile
    const employee = await Employee.create({
      user: user._id,
      employeeId,
      jobTitle,
      department: departmentId || null,
      dateOfJoining: dateOfJoining || new Date(),
    });

    await logActivity({
      user: req.user.id,
      action: 'EMPLOYEE_CREATED',
      details: `Created employee ${name} (${employeeId})`,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Employee
// @route   PUT /api/hr/employees/:id
// @access  Private (HR or Super Admin)
export const updateEmployee = async (req, res) => {
  try {
    const { name, email, status, jobTitle, departmentId } = req.body;

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const user = await User.findById(employee.user);
    if (user) {
      if (name) user.name = name;
      if (email) user.email = email;
      if (status) user.status = status;
      await user.save();
    }

    if (jobTitle) employee.jobTitle = jobTitle;
    if (departmentId !== undefined) employee.department = departmentId || null;
    await employee.save();

    await logActivity({
      user: req.user.id,
      action: 'EMPLOYEE_UPDATED',
      details: `Updated employee ${employee.employeeId}`,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Employee (Remove from DB or suspend)
// @route   DELETE /api/hr/employees/:id
// @access  Private (HR or Super Admin)
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Delete corresponding user and profile
    await User.findByIdAndDelete(employee.user);
    await Employee.findByIdAndDelete(req.params.id);

    await logActivity({
      user: req.user.id,
      action: 'EMPLOYEE_DELETED',
      details: `Deleted employee ${employee.employeeId}`,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all leave applications
// @route   GET /api/hr/leaves
// @access  Private (HR or Super Admin)
export const getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('employee', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve/Reject Leave
// @route   PUT /api/hr/leaves/:id
// @access  Private (HR or Super Admin)
export const updateLeaveStatus = async (req, res) => {
  try {
    const { status, hrComments } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Approved or Rejected' });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Leave request has already been processed' });
    }

    leave.status = status;
    leave.approvedBy = req.user.id;
    leave.hrComments = hrComments || '';
    await leave.save();

    await Notification.create({
      recipient: leave.employee,
      title: `Leave ${status}`,
      message: `Your ${leave.leaveType} leave request has been ${status.toLowerCase()}.`,
    });

    // If approved, deduct from employee balance
    if (status === 'Approved') {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const timeDiff = end.getTime() - start.getTime();
      const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

      const employee = await Employee.findOne({ user: leave.employee });
      if (employee) {
        const typeKey = leave.leaveType.toLowerCase();
        employee.leaveBalance[typeKey] = Math.max(0, employee.leaveBalance[typeKey] - diffDays);
        await employee.save();
      }
    }

    await logActivity({
      user: req.user.id,
      action: `LEAVE_${status.toUpperCase()}`,
      details: `${status} ${leave.leaveType} leave request`,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all Departments
// @route   GET /api/hr/departments
// @access  Private
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate('manager', 'name email');
    res.status(200).json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create Department
// @route   POST /api/hr/departments
// @access  Private (HR or Super Admin)
export const createDepartment = async (req, res) => {
  try {
    const { name, description, managerId } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Department name is required' });
    }

    const exists = await Department.findOne({ name });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Department already exists' });
    }

    const department = await Department.create({
      name,
      description,
      manager: managerId || null,
    });

    await logActivity({
      user: req.user.id,
      action: 'DEPARTMENT_CREATED',
      details: `Created department ${name}`,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, data: department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Department
// @route   DELETE /api/hr/departments/:id
// @access  Private (HR or Super Admin)
export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Set employees under this department to null
    await Employee.updateMany({ department: req.params.id }, { department: null });

    await logActivity({
      user: req.user.id,
      action: 'DEPARTMENT_DELETED',
      details: `Deleted department ${department.name}`,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign Task
// @route   POST /api/hr/tasks
// @access  Private (HR or Super Admin)
export const assignTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate } = req.body;

    if (!title || !assignedTo || !dueDate) {
      return res.status(400).json({ success: false, message: 'Title, Assigned Employee, and Due Date are required' });
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

// @desc    Get all tasks assigned by HR
// @route   GET /api/hr/tasks
// @access  Private (HR or Super Admin)
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
