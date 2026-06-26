import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Department from '../models/Department.js';
import Settings from '../models/Settings.js';
import Task from '../models/Task.js';
import Leave from '../models/Leave.js';
import Attendance from '../models/Attendance.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import ContactMessage from '../models/ContactMessage.js';
import Company from '../models/Company.js';
import HRProfile from '../models/HR.js';
import Document from '../models/Document.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/peka_hrms'
    );
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Department.deleteMany({});
    await Settings.deleteMany({});
    await Task.deleteMany({});
    await Leave.deleteMany({});
    await Attendance.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await Notification.deleteMany({});
    await ActivityLog.deleteMany({});
    await ContactMessage.deleteMany({});
    await Company.deleteMany({});
    await HRProfile.deleteMany({});
    await Document.deleteMany({});
    console.log('Existing DB collections wiped clean.');

    // 1. Create Default Settings
    await Settings.create({
      companyName: 'PEKA HRMS Corp',
      systemEmail: 'admin@peka-hrms.com',
      maintenanceMode: false,
    });
    await Company.create({
      name: 'PEKA HRMS Corp',
      domain: 'peka.com',
      industry: 'Enterprise SaaS',
      employeeLimit: 1000,
    });
    console.log('System settings seeded.');

    // 2. Create Default Department
    const engineeringDept = await Department.create({
      name: 'Engineering',
      description: 'Software development, architecture, and tech ops division.',
    });
    const marketingDept = await Department.create({
      name: 'Marketing & Sales',
      description: 'Brand outreach and customer acquisitions.',
    });
    console.log('Departments seeded.');

    // 3. Create Super Admin
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@peka.com',
      password: 'adminpassword123',
      role: 'Super Admin',
      status: 'Active',
    });
    console.log('Super Admin user created (admin@peka.com / adminpassword123).');

    // 4. Create HR manager
    const hr = await User.create({
      name: 'Sarah Jenkins',
      email: 'hr@peka.com',
      password: 'hrpassword123',
      role: 'HR',
      status: 'Active',
    });
    engineeringDept.manager = hr._id;
    await engineeringDept.save();
    await HRProfile.create({
      user: hr._id,
      employeeCode: 'HR1001',
      departmentFocus: 'People Operations',
      phone: '+1 555-0100',
    });
    console.log('HR Manager user created (hr@peka.com / hrpassword123).');

    // 5. Create Employee
    const employeeUser = await User.create({
      name: 'John Doe',
      email: 'employee@peka.com',
      password: 'employeepassword123',
      role: 'Employee',
      status: 'Active',
    });

    const employeeProfile = await Employee.create({
      user: employeeUser._id,
      employeeId: 'EMP1001',
      jobTitle: 'Senior Software Engineer',
      department: engineeringDept._id,
      dateOfJoining: new Date('2025-01-15'),
      personalInfo: {
        phone: '+1 555-0199',
        address: '123 Tech Lane, Silicon Valley, CA',
        dob: new Date('1994-08-22'),
        gender: 'Male',
      },
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '+1 555-0198',
      },
      education: [
        {
          degree: 'Bachelor of Science in Computer Science',
          institution: 'Stanford University',
          passingYear: 2016,
        },
      ],
      experience: [
        {
          company: 'InnovateTech Inc',
          role: 'Software Engineer',
          duration: '3 Years',
        },
      ],
      skills: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'Docker'],
      leaveBalance: {
        sick: 10,
        casual: 12,
        annual: 15,
      },
    });

    console.log('Employee user and profile created (employee@peka.com / employeepassword123).');

    // 6. Seed task, leave, attendance, recruitment, notification, and audit data
    await Task.create([
      {
        title: 'Prepare onboarding checklist',
        description: 'Review the latest onboarding assets and submit final checklist.',
        assignedTo: employeeUser._id,
        assignedBy: hr._id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'Pending',
      },
      {
        title: 'Update sprint handover notes',
        description: 'Add deployment and ownership details for current sprint handover.',
        assignedTo: employeeUser._id,
        assignedBy: hr._id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        status: 'In Progress',
      },
    ]);

    await Leave.create({
      employee: employeeUser._id,
      leaveType: 'Casual',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      reason: 'Family event',
      status: 'Pending',
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const clockIn = new Date(today);
    clockIn.setHours(9, 10, 0, 0);
    const clockOut = new Date(today);
    clockOut.setHours(17, 45, 0, 0);
    await Attendance.create({
      employee: employeeUser._id,
      date: today,
      clockIn,
      clockOut,
      status: 'Present',
      workingHours: 8.58,
    });

    const job = await Job.create({
      title: 'Frontend Engineer',
      description: 'Build polished employee and HR workflows for PEKA HRMS.',
      requirements: 'React, REST APIs, UI systems, and dashboard experience.',
      department: engineeringDept._id,
      location: 'Noida, Remote',
      type: 'Full-time',
      salaryRange: '$80k - $100k',
    });

    await Application.create({
      job: job._id,
      candidateName: 'Aisha Mehta',
      candidateEmail: 'aisha@example.com',
      status: 'Shortlisted',
      interviewDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      notes: 'Strong React portfolio.',
    });

    await Notification.create([
      {
        recipient: employeeUser._id,
        title: 'New task assigned',
        message: 'Prepare onboarding checklist is due soon.',
      },
      {
        recipient: hr._id,
        title: 'Leave approval pending',
        message: 'John Doe requested casual leave.',
      },
    ]);

    await ActivityLog.create([
      {
        user: admin._id,
        action: 'SEED_CREATED',
        details: 'Initial Super Admin account seeded',
        ipAddress: 'system',
      },
      {
        user: hr._id,
        action: 'TASK_ASSIGNED',
        details: 'Assigned onboarding checklist to John Doe',
        ipAddress: 'system',
      },
    ]);

    await ContactMessage.create({
      name: 'Morgan Lee',
      email: 'morgan@example.com',
      subject: 'Enterprise HRMS inquiry',
      message: 'Interested in learning more about PEKA HRMS for a 500-person team.',
    });

    await Document.create({
      title: 'Employee Handbook',
      description: 'Core employee policies and workplace guidelines.',
      category: 'Policy',
      fileUrl: '/uploads/employee-handbook.pdf',
      uploadedBy: hr._id,
      visibleTo: ['Employee', 'HR', 'Super Admin'],
    });

    console.log('Workflow sample data seeded.');
    console.log('Database Seeding Completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error Seeding Database: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
