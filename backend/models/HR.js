import mongoose from 'mongoose';

const hrSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    employeeCode: {
      type: String,
      trim: true,
      default: '',
    },
    departmentFocus: {
      type: String,
      trim: true,
      default: 'People Operations',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const HR = mongoose.model('HR', hrSchema);
export default HR;
