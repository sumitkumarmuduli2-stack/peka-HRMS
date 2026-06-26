import express from 'express';
import {
  login,
  logout,
  refresh,
  getMe,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.get('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword', resetPassword);

export default router;
