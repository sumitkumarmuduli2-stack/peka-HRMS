import express from 'express';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getLeaves,
  updateLeaveStatus,
  getDepartments,
  createDepartment,
  deleteDepartment,
  assignTask,
  getTasks,
} from '../controllers/hrController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('HR', 'Super Admin'));

router.route('/employees').get(getEmployees).post(createEmployee);
router.route('/employees/:id').put(updateEmployee).delete(deleteEmployee);

router.route('/leaves').get(getLeaves);
router.route('/leaves/:id').put(updateLeaveStatus);

router.route('/departments').get(getDepartments).post(createDepartment);
router.route('/departments/:id').delete(deleteDepartment);

router.route('/tasks').get(getTasks).post(assignTask);

export default router;
