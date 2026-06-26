import express from 'express';
import {
  getTasks,
  createTask,
  updateTask,
} from '../controllers/taskController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getTasks);
router.post('/', authorize('HR', 'Super Admin'), createTask);
router.put('/:id', updateTask);

export default router;
