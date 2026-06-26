import Document from '../models/Document.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Get documents visible to current role
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ visibleTo: req.user.role })
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload a system document
// @route   POST /api/documents
// @access  Private (HR or Super Admin)
export const uploadDocument = async (req, res) => {
  try {
    const { title, description, category, visibleTo } = req.body;

    if (!title || !req.file) {
      return res.status(400).json({ success: false, message: 'Title and document file are required' });
    }

    const parsedVisibleTo = Array.isArray(visibleTo)
      ? visibleTo
      : typeof visibleTo === 'string' && visibleTo
        ? visibleTo.split(',').map((role) => role.trim())
        : ['Employee', 'HR', 'Super Admin'];

    const document = await Document.create({
      title,
      description,
      category,
      visibleTo: parsedVisibleTo,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id,
    });

    await logActivity({
      user: req.user.id,
      action: 'DOCUMENT_UPLOADED',
      details: `Uploaded document ${title}`,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a system document
// @route   DELETE /api/documents/:id
// @access  Private (HR or Super Admin)
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    await logActivity({
      user: req.user.id,
      action: 'DOCUMENT_DELETED',
      details: `Deleted document ${document.title}`,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
