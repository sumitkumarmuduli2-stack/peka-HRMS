import express from 'express';
import {
  getAllPayroll,
  getMyPayroll,
  getPayrollById,
  createPayroll,
  updatePayroll,
  deletePayroll,
  markAsPaid,
} from '../controllers/payrollController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Employee self-view
router.get('/my', getMyPayroll);

// HR / Admin management
router.get('/',    authorize('HR', 'Super Admin'), getAllPayroll);
router.get('/:id', authorize('HR', 'Super Admin'), getPayrollById);
router.post('/',   authorize('HR', 'Super Admin'), createPayroll);
router.put('/:id', authorize('HR', 'Super Admin'), updatePayroll);
router.delete('/:id', authorize('HR', 'Super Admin'), deletePayroll);
router.put('/:id/mark-paid', authorize('HR', 'Super Admin'), markAsPaid);

export default router;
