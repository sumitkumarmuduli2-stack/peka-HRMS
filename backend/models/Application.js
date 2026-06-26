import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    candidateName: {
      type: String,
      required: true,
      trim: true,
    },
    candidateEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    resume: {
      type: String,
      default: '', // file path
    },
    status: {
      type: String,
      enum: ['Applied', 'Shortlisted', 'Interviewed', 'Offered', 'Rejected'],
      default: 'Applied',
    },
    interviewDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Application = mongoose.model('Application', applicationSchema);
export default Application;
