import Payroll from '../models/Payroll.js';
import Employee from '../models/Employee.js';
import { logActivity } from '../utils/activityLogger.js';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// @desc    Get all payroll records (HR view)
// @route   GET /api/payroll
// @access  Private (HR, Super Admin)
export const getAllPayroll = async (req, res) => {
  try {
    const { month, year, status } = req.query;
    const filter = {};
    if (month) filter.month = Number(month);
    if (year)  filter.year  = Number(year);
    if (status) filter.status = status;

    const records = await Payroll.find(filter)
      .populate({ path: 'employee', populate: { path: 'user', select: 'name email' } })
      .populate('generatedBy', 'name')
      .sort({ year: -1, month: -1, createdAt: -1 });

    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payroll for a specific employee (employee self-view)
// @route   GET /api/payroll/my
// @access  Private (Employee)
export const getMyPayroll = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    const payslips = await Payroll.find({ employee: employee._id, status: 'Paid' })
      .sort({ year: -1, month: -1 });

    res.status(200).json({ success: true, data: payslips });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single payroll record
// @route   GET /api/payroll/:id
// @access  Private (HR, Super Admin)
export const getPayrollById = async (req, res) => {
  try {
    const record = await Payroll.findById(req.params.id)
      .populate({ path: 'employee', populate: { path: 'user', select: 'name email' }, select: 'employeeId jobTitle department user' })
      .populate('generatedBy', 'name');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create payroll record
// @route   POST /api/payroll
// @access  Private (HR, Super Admin)
export const createPayroll = async (req, res) => {
  try {
    const {
      employeeId, month, year,
      basicSalary, allowances, overtime, bonus,
      taxDeduction, providentFund, otherDeductions,
      paymentMethod, notes,
    } = req.body;

    if (!employeeId || !month || !year || basicSalary === undefined) {
      return res.status(400).json({ success: false, message: 'Employee, month, year, and basic salary are required' });
    }

    // Check duplicate
    const existing = await Payroll.findOne({ employee: employeeId, month: Number(month), year: Number(year) });
    if (existing) {
      return res.status(400).json({ success: false, message: `Payroll for ${MONTHS[month - 1]} ${year} already exists for this employee` });
    }

    const payroll = await Payroll.create({
      employee: employeeId,
      month: Number(month),
      year: Number(year),
      basicSalary: Number(basicSalary) || 0,
      allowances: Number(allowances) || 0,
      overtime: Number(overtime) || 0,
      bonus: Number(bonus) || 0,
      taxDeduction: Number(taxDeduction) || 0,
      providentFund: Number(providentFund) || 0,
      otherDeductions: Number(otherDeductions) || 0,
      paymentMethod: paymentMethod || 'Bank Transfer',
      notes: notes || '',
      generatedBy: req.user.id,
    });

    await logActivity({
      user: req.user.id,
      action: 'PAYROLL_CREATED',
      details: `Created payroll for employee ${employeeId} — ${MONTHS[month - 1]} ${year}`,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update payroll record
// @route   PUT /api/payroll/:id
// @access  Private (HR, Super Admin)
export const updatePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }
    if (payroll.status === 'Paid') {
      return res.status(400).json({ success: false, message: 'Cannot edit a payroll that has already been paid' });
    }

    const fields = ['basicSalary','allowances','overtime','bonus','taxDeduction','providentFund','otherDeductions','paymentMethod','notes','status','paymentDate'];
    fields.forEach(f => {
      if (req.body[f] !== undefined) payroll[f] = req.body[f];
    });

    await payroll.save();

    await logActivity({
      user: req.user.id,
      action: 'PAYROLL_UPDATED',
      details: `Updated payroll record ${payroll._id}`,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete payroll record
// @route   DELETE /api/payroll/:id
// @access  Private (HR, Super Admin)
export const deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }
    if (payroll.status === 'Paid') {
      return res.status(400).json({ success: false, message: 'Cannot delete a paid payroll record' });
    }

    await payroll.deleteOne();

    await logActivity({
      user: req.user.id,
      action: 'PAYROLL_DELETED',
      details: `Deleted payroll record ${payroll._id}`,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, message: 'Payroll record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark payroll as Paid
// @route   PUT /api/payroll/:id/mark-paid
// @access  Private (HR, Super Admin)
export const markAsPaid = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    payroll.status = 'Paid';
    payroll.paymentDate = new Date();
    await payroll.save();

    await logActivity({
      user: req.user.id,
      action: 'PAYROLL_PAID',
      details: `Marked payroll ${payroll._id} as paid`,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
