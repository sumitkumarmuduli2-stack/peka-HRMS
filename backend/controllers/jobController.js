import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'Open' }).populate('department');
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a job vacancy
// @route   POST /api/jobs
// @access  Private (HR or Super Admin)
export const createJob = async (req, res) => {
  try {
    const { title, description, requirements, department, location, type, salaryRange } = req.body;

    if (!title || !description || !department || !location) {
      return res.status(400).json({ success: false, message: 'Please provide title, description, department, and location' });
    }

    const job = await Job.create({
      title,
      description,
      requirements,
      department,
      location,
      type,
      salaryRange,
    });

    await logActivity({
      user: req.user.id,
      action: 'JOB_CREATED',
      details: `Created job opening ${title}`,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update job status or details
// @route   PUT /api/jobs/:id
// @access  Private (HR or Super Admin)
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job vacancy not found' });
    }

    await logActivity({
      user: req.user.id,
      action: 'JOB_UPDATED',
      details: `Updated job opening ${job.title}`,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Job
// @route   DELETE /api/jobs/:id
// @access  Private (HR or Super Admin)
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job vacancy not found' });
    }
    // Delete any linked applications
    await Application.deleteMany({ job: req.params.id });

    await logActivity({
      user: req.user.id,
      action: 'JOB_DELETED',
      details: `Deleted job opening ${job.title}`,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, message: 'Job vacancy deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit candidate application
// @route   POST /api/jobs/apply
// @access  Public
export const applyForJob = async (req, res) => {
  try {
    const { jobId, candidateName, candidateEmail, notes } = req.body;

    if (!jobId || !candidateName || !candidateEmail) {
      return res.status(400).json({ success: false, message: 'Name, Email, and Job ID are required' });
    }

    let resumePath = '';
    if (req.file) {
      resumePath = `/uploads/${req.file.filename}`;
    }

    const application = await Application.create({
      job: jobId,
      candidateName,
      candidateEmail,
      resume: resumePath,
      notes,
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all candidate applications
// @route   GET /api/jobs/applications
// @access  Private (HR or Super Admin)
export const getApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate({
        path: 'job',
        populate: { path: 'department' },
      })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update candidate application status/interview details
// @route   PUT /api/jobs/applications/:id
// @access  Private (HR or Super Admin)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, interviewDate, notes } = req.body;

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (status) application.status = status;
    if (interviewDate) application.interviewDate = new Date(interviewDate);
    if (notes) application.notes = notes;

    await application.save();

    await logActivity({
      user: req.user.id,
      action: 'APPLICATION_UPDATED',
      details: `Updated application for ${application.candidateEmail}`,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
