import express from 'express';
import {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  applyForJob,
  getApplications,
  updateApplicationStatus,
} from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getJobs);
router.post('/apply', upload.single('resume'), applyForJob);

// Protected routes (HR/Admin)
router.post('/', protect, authorize('HR', 'Super Admin'), createJob);
router.route('/:id')
  .put(protect, authorize('HR', 'Super Admin'), updateJob)
  .delete(protect, authorize('HR', 'Super Admin'), deleteJob);

router.get('/applications', protect, authorize('HR', 'Super Admin'), getApplications);
router.put('/applications/:id', protect, authorize('HR', 'Super Admin'), updateApplicationStatus);

export default router;
