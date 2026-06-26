import express from 'express';
import {
  clockIn,
  clockOut,
  getTodayStatus,
  getHistory,
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/clockin', clockIn);
router.put('/clockout', clockOut);
router.get('/today', getTodayStatus);
router.get('/history', getHistory);

export default router;
