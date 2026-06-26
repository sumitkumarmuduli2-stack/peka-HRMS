import express from 'express';
import {
  getHRs,
  createHR,
  updateHR,
  deleteHR,
  getActivityLogs,
  getSystemSettings,
  updateSystemSettings,
  getCompanyProfile,
  updateCompanyProfile,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('Super Admin'));

router.route('/hrs').get(getHRs).post(createHR);
router.route('/hrs/:id').put(updateHR).delete(deleteHR);

router.get('/audit-logs', getActivityLogs);
router.route('/settings').get(getSystemSettings).put(updateSystemSettings);
router.route('/company').get(getCompanyProfile).put(updateCompanyProfile);

export default router;
