import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    month: {
      type: Number,  // 1–12
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    // Earnings
    basicSalary: { type: Number, default: 0 },
    allowances: { type: Number, default: 0 },
    overtime: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    // Deductions
    taxDeduction: { type: Number, default: 0 },
    providentFund: { type: Number, default: 0 },
    otherDeductions: { type: Number, default: 0 },
    // Computed
    grossPay: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    netPay: { type: Number, default: 0 },
    // Meta
    status: {
      type: String,
      enum: ['Draft', 'Processed', 'Paid'],
      default: 'Draft',
    },
    paymentDate: { type: Date },
    paymentMethod: {
      type: String,
      enum: ['Bank Transfer', 'Cheque', 'Cash'],
      default: 'Bank Transfer',
    },
    notes: { type: String },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate payroll for same employee/month/year
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

// Auto-compute gross, totalDeductions, netPay before save
payrollSchema.pre('save', function (next) {
  this.grossPay = this.basicSalary + this.allowances + this.overtime + this.bonus;
  this.totalDeductions = this.taxDeduction + this.providentFund + this.otherDeductions;
  this.netPay = this.grossPay - this.totalDeductions;
  next();
});

const Payroll = mongoose.model('Payroll', payrollSchema);
export default Payroll;
