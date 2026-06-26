import express from 'express';
import {
  applyLeave,
  getMyLeaves,
  getLeaveBalance,
} from '../controllers/leaveController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/apply', applyLeave);
router.get('/my-leaves', getMyLeaves);
router.get('/balance', getLeaveBalance);

export default router;
