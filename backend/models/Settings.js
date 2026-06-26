import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: 'PEKA HRMS Corp',
    },
    systemEmail: {
      type: String,
      default: 'noreply@peka-hrms.com',
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    allowedIpRanges: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
