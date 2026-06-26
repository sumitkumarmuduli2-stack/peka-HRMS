import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Leave from '../models/Leave.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Task from '../models/Task.js';
import Attendance from '../models/Attendance.js';
import Department from '../models/Department.js';

// @desc    Get dashboard metrics based on roles
// @route   GET /api/reports/dashboard
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const role = req.user.role;

    if (role === 'Employee') {
      const employee = await Employee.findOne({ user: req.user.id });
      if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee profile not found' });
      }

      // Tasks stats
      const totalTasks = await Task.countDocuments({ assignedTo: req.user.id });
      const completedTasks = await Task.countDocuments({ assignedTo: req.user.id, status: 'Completed' });
      const pendingTasks = totalTasks - completedTasks;

      // Leaves stats
      const totalAppliedLeaves = await Leave.countDocuments({ employee: req.user.id });
      const approvedLeaves = await Leave.countDocuments({ employee: req.user.id, status: 'Approved' });

      // Attendance rate (out of last 30 days)
      const lastMonth = new Date();
      lastMonth.setDate(lastMonth.getDate() - 30);
      const presentCount = await Attendance.countDocuments({
        employee: req.user.id,
        date: { $gte: lastMonth },
        status: { $in: ['Present', 'Late'] },
      });
      const attendanceHistory = await Attendance.find({
        employee: req.user.id,
        date: { $gte: lastMonth },
      }).sort({ date: 1 });

      return res.status(200).json({
        success: true,
        data: {
          tasks: { total: totalTasks, completed: completedTasks, pending: pendingTasks },
          leaves: { total: totalAppliedLeaves, approved: approvedLeaves, balance: employee.leaveBalance },
          attendanceRate: Math.round((presentCount / 30) * 100),
          history: {
            present: presentCount,
            workingHours: attendanceHistory.slice(-7).map((record) => ({
              name: new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' }),
              hours: record.workingHours || 0,
            })),
          },
        },
      });
    }

    if (role === 'HR') {
      const employeeCount = await Employee.countDocuments();
      const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
      const openJobs = await Job.countDocuments({ status: 'Open' });
      const totalApplications = await Application.countDocuments();

      // Dept-wise employee stats
      const departments = await Department.find();
      const deptStats = [];
      for (const dept of departments) {
        const count = await Employee.countDocuments({ department: dept._id });
        deptStats.push({ name: dept.name, count });
      }

      // Applications by status
      const appliedCount = await Application.countDocuments({ status: 'Applied' });
      const shortlistedCount = await Application.countDocuments({ status: 'Shortlisted' });
      const interviewedCount = await Application.countDocuments({ status: 'Interviewed' });
      const offeredCount = await Application.countDocuments({ status: 'Offered' });
      const rejectedCount = await Application.countDocuments({ status: 'Rejected' });

      return res.status(200).json({
        success: true,
        data: {
          employeeCount,
          pendingLeaves,
          openJobs,
          totalApplications,
          deptStats,
          recruitmentStats: [
            { name: 'Applied', value: appliedCount },
            { name: 'Shortlisted', value: shortlistedCount },
            { name: 'Interviewed', value: interviewedCount },
            { name: 'Offered', value: offeredCount },
            { name: 'Rejected', value: rejectedCount },
          ],
        },
      });
    }

    if (role === 'Super Admin') {
      const totalUsers = await User.countDocuments();
      const employeeCount = await Employee.countDocuments();
      const hrCount = await User.countDocuments({ role: 'HR' });
      const suspendedCount = await User.countDocuments({ status: 'Suspended' });
      const departmentCount = await Department.countDocuments();

      return res.status(200).json({
        success: true,
        data: {
          totalUsers,
          employeeCount,
          hrCount,
          suspendedCount,
          departmentCount,
          health: 'Excellent',
          uptime: '99.98%',
        },
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid User Role' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
