import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    domain: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    industry: {
      type: String,
      trim: true,
      default: '',
    },
    employeeLimit: {
      type: Number,
      default: 500,
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

const Company = mongoose.model('Company', companySchema);
export default Company;
