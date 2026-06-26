import Attendance from '../models/Attendance.js';

// @desc    Clock In
// @route   POST /api/attendance/clockin
// @access  Private (Employee)
export const clockIn = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already clocked in today
    const existing = await Attendance.findOne({
      employee: req.user.id,
      date: today,
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Already clocked in today' });
    }

    const clockInTime = new Date();
    // Simple logic: if clocked in after 9:30 AM, set status as Late
    const limit = new Date(today);
    limit.setHours(9, 30, 0, 0);
    const status = clockInTime > limit ? 'Late' : 'Present';

    const attendance = await Attendance.create({
      employee: req.user.id,
      date: today,
      clockIn: clockInTime,
      status,
    });

    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clock Out
// @route   PUT /api/attendance/clockout
// @access  Private (Employee)
export const clockOut = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: req.user.id,
      date: today,
    });

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'You have not clocked in today' });
    }

    if (attendance.clockOut) {
      return res.status(400).json({ success: false, message: 'Already clocked out today' });
    }

    const clockOutTime = new Date();
    attendance.clockOut = clockOutTime;

    // Calculate difference in hours
    const diffMs = clockOutTime - attendance.clockIn;
    const diffHrs = +(diffMs / (1000 * 60 * 60)).toFixed(2);
    attendance.workingHours = diffHrs;

    // Adjust status based on working hours
    if (diffHrs < 4) {
      attendance.status = 'Half-Day';
    }

    await attendance.save();

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current day status
// @route   GET /api/attendance/today
// @access  Private
export const getTodayStatus = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: req.user.id,
      date: today,
    });

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user attendance history
// @route   GET /api/attendance/history
// @access  Private
export const getHistory = async (req, res) => {
  try {
    const history = await Attendance.find({ employee: req.user.id }).sort({ date: -1 });
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
