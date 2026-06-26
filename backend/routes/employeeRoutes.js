import express from 'express';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  uploadResume,
  getMyTasks,
  updateTaskStatus,
} from '../controllers/employeeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/profile').get(protect, getProfile).put(protect, updateProfile);
router.put('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.put('/resume', protect, upload.single('resume'), uploadResume);
router.route('/tasks').get(protect, getMyTasks);
router.put('/tasks/:id', protect, updateTaskStatus);

export default router;
