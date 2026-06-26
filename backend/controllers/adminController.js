import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import Settings from '../models/Settings.js';
import HRProfile from '../models/HR.js';
import Company from '../models/Company.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Get all HR accounts
// @route   GET /api/admin/hrs
// @access  Private (Super Admin)
export const getHRs = async (req, res) => {
  try {
    const hrs = await User.find({ role: 'HR' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: hrs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create HR Account
// @route   POST /api/admin/hrs
// @access  Private (Super Admin)
export const createHR = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    const hrExists = await User.findOne({ email });
    if (hrExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const hr = await User.create({
      name,
      email,
      password,
      role: 'HR',
    });
    await HRProfile.create({
      user: hr._id,
      employeeCode: req.body.employeeCode || '',
      departmentFocus: req.body.departmentFocus || 'People Operations',
      phone: req.body.phone || '',
    });

    await logActivity({
      user: req.user.id,
      action: 'HR_CREATED',
      details: `Created HR account ${email}`,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, data: hr });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update HR Account
// @route   PUT /api/admin/hrs/:id
// @access  Private (Super Admin)
export const updateHR = async (req, res) => {
  try {
    const { name, email, status } = req.body;

    const hr = await User.findOne({ _id: req.params.id, role: 'HR' });
    if (!hr) {
      return res.status(404).json({ success: false, message: 'HR account not found' });
    }

    if (name) hr.name = name;
    if (email) hr.email = email;
    if (status) hr.status = status;

    await hr.save();
    const profileUpdates = {
      ...(req.body.employeeCode !== undefined && { employeeCode: req.body.employeeCode }),
      ...(req.body.departmentFocus !== undefined && { departmentFocus: req.body.departmentFocus }),
      ...(req.body.phone !== undefined && { phone: req.body.phone }),
    };
    if (Object.keys(profileUpdates).length > 0) {
      await HRProfile.findOneAndUpdate(
        { user: hr._id },
        profileUpdates,
        { upsert: true, new: true }
      );
    }

    await logActivity({
      user: req.user.id,
      action: 'HR_UPDATED',
      details: `Updated HR account ${hr.email}`,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, data: hr });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete HR Account
// @route   DELETE /api/admin/hrs/:id
// @access  Private (Super Admin)
export const deleteHR = async (req, res) => {
  try {
    const hr = await User.findOneAndDelete({ _id: req.params.id, role: 'HR' });
    if (!hr) {
      return res.status(404).json({ success: false, message: 'HR account not found' });
    }
    await HRProfile.findOneAndDelete({ user: hr._id });

    await logActivity({
      user: req.user.id,
      action: 'HR_DELETED',
      details: `Deleted HR account ${hr.email}`,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, message: 'HR account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Activity Audit Logs
// @route   GET /api/admin/audit-logs
// @access  Private (Super Admin)
export const getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find().populate('user', 'name email role').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get company tenant profile
// @route   GET /api/admin/company
// @access  Private (Super Admin)
export const getCompanyProfile = async (req, res) => {
  try {
    let company = await Company.findOne().sort({ createdAt: 1 });
    if (!company) {
      company = await Company.create({ name: 'PEKA HRMS Corp' });
    }

    res.status(200).json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update company tenant profile
// @route   PUT /api/admin/company
// @access  Private (Super Admin)
export const updateCompanyProfile = async (req, res) => {
  try {
    const { name, domain, industry, employeeLimit, status } = req.body;

    let company = await Company.findOne().sort({ createdAt: 1 });
    if (!company) {
      company = await Company.create({ name: name || 'PEKA HRMS Corp' });
    }

    if (name) company.name = name;
    if (domain !== undefined) company.domain = domain;
    if (industry !== undefined) company.industry = industry;
    if (employeeLimit !== undefined) company.employeeLimit = employeeLimit;
    if (status) company.status = status;

    await company.save();

    await logActivity({
      user: req.user.id,
      action: 'COMPANY_UPDATED',
      details: `Updated company profile ${company.name}`,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get System Settings
// @route   GET /api/admin/settings
// @access  Private (Super Admin)
export const getSystemSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update System Settings
// @route   PUT /api/admin/settings
// @access  Private (Super Admin)
export const updateSystemSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    const { companyName, systemEmail, maintenanceMode } = req.body;
    if (companyName) settings.companyName = companyName;
    if (systemEmail) settings.systemEmail = systemEmail;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;

    await settings.save();

    await logActivity({
      user: req.user.id,
      action: 'SETTINGS_UPDATED',
      details: 'Updated system settings',
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
