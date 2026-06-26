import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    jobTitle: {
      type: String,
      required: [true, 'Please add a job title'],
      trim: true,
    },
    dateOfJoining: {
      type: Date,
      default: Date.now,
    },
    personalInfo: {
      phone: { type: String, default: '' },
      address: { type: String, default: '' },
      dob: { type: Date, default: null },
      gender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' },
    },
    emergencyContact: {
      name: { type: String, default: '' },
      relationship: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    education: [
      {
        degree: { type: String },
        institution: { type: String },
        passingYear: { type: Number },
      },
    ],
    experience: [
      {
        company: { type: String },
        role: { type: String },
        duration: { type: String },
      },
    ],
    skills: [{ type: String }],
    profilePhoto: {
      type: String,
      default: '',
    },
    resume: {
      type: String,
      default: '',
    },
    leaveBalance: {
      sick: { type: Number, default: 10 },
      casual: { type: Number, default: 12 },
      annual: { type: Number, default: 15 },
    },
  },
  {
    timestamps: true,
  }
);

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
