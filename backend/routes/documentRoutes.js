import express from 'express';
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
} from '../controllers/documentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getDocuments);
router.post('/', authorize('HR', 'Super Admin'), upload.single('document'), uploadDocument);
router.delete('/:id', authorize('HR', 'Super Admin'), deleteDocument);

export default router;
