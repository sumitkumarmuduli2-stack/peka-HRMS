import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    clockIn: {
      type: Date,
      required: true,
    },
    clockOut: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Half-Day'],
      default: 'Present',
    },
    workingHours: {
      type: Number,
      default: 0, // in hours
    },
  },
  {
    timestamps: true,
  }
);

// Formulate date indexes for employee daily queries
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
