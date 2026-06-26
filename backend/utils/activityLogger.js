import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async ({ user, action, details = '', ipAddress = '' }) => {
  try {
    if (!user || !action) return;

    await ActivityLog.create({
      user,
      action,
      details,
      ipAddress,
    });
  } catch (error) {
    console.error(`Activity log failed: ${error.message}`);
  }
};
