import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: ['Policy', 'Offer Letter', 'Resume', 'Compliance', 'General'],
      default: 'General',
    },
    fileUrl: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    visibleTo: {
      type: [String],
      enum: ['Employee', 'HR', 'Super Admin'],
      default: ['Employee', 'HR', 'Super Admin'],
    },
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model('Document', documentSchema);
export default Document;
