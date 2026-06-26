import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { sendTokenResponse } from '../utils/generateToken.js';
import { logActivity } from '../utils/activityLogger.js';
import jwt from 'jsonwebtoken';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended' });
    }

    await logActivity({
      user: user._id,
      action: 'LOGIN',
      details: `${user.role} signed in`,
      ipAddress: req.ip,
    });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Public
export const logout = async (req, res, next) => {
  try {
    res.cookie('refreshToken', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get new access token from refresh token
// @route   POST /api/auth/refresh
// @access  Public
export const refresh = async (req, res, next) => {
  try {
    let token = req.cookies.refreshToken;

    if (!token && req.body.refreshToken) {
      token = req.body.refreshToken;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || 'supersecret_peka_hrms_refresh_token_key'
    );

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(401).json({ success: false, message: 'Refresh token invalid' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let employeeProfile = null;

    if (user.role === 'Employee') {
      employeeProfile = await Employee.findOne({ user: user._id }).populate('department');
    }

    res.status(200).json({
      success: true,
      user,
      employeeProfile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot Password (dummy request)
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'There is no user with that email' });
    }

    // Return dummy token response for simplicity in test
    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email (simulated)',
      resetToken: 'dummyresettoken12345',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword
// @access  Public
export const resetPassword = async (req, res, next) => {
  const { password, email } = req.body; // In real, use a token. In mock/demo, search by email.
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = password;
    await user.save();

    await logActivity({
      user: user._id,
      action: 'PASSWORD_RESET',
      details: 'Password updated from account settings',
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
