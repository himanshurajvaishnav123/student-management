/**
 * STUDENT MODEL
 * Defines the MongoDB schema for student documents.
 * Includes personal info, attendance, marks, and fees.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AttendanceRecordSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent'], required: true },
  subject: { type: String, default: 'General' },
}, { _id: false });

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't return password in queries by default
  },
  role: {
    type: String,
    default: 'student',
    enum: ['student', 'admin'],
  },
  // ── Personal Info ──────────────────────────────────────────────────────────
  course: {
    type: String,
    required: [true, 'Course is required'],
    trim: true,
  },
  rollNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other', ''] },
  avatar: { type: String, default: '' }, // URL to profile picture
  semester: { type: Number, default: 1, min: 1, max: 12 },
  enrollmentYear: { type: Number, default: () => new Date().getFullYear() },

  // ── Attendance ─────────────────────────────────────────────────────────────
  attendance: {
    records: [AttendanceRecordSchema],
    // Computed percentage stored for quick access
    percentage: { type: Number, default: 0, min: 0, max: 100 },
  },

  // ── Marks (subject-wise) ────────────────────────────────────────────────────
  marks: {
    type: Map,
    of: {
      obtained: { type: Number, default: 0, min: 0, max: 100 },
      total: { type: Number, default: 100 },
      grade: { type: String, default: 'N/A' },
    },
    default: {},
  },

  // ── Fees ───────────────────────────────────────────────────────────────────
  fees: {
    status: { type: String, enum: ['paid', 'unpaid', 'partial'], default: 'unpaid' },
    amount: { type: Number, default: 0 },
    dueDate: { type: Date },
    paidDate: { type: Date },
    semester: { type: Number },
  },

  isActive: { type: Boolean, default: true },
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
});

// ── Pre-save Hook: Hash password before saving ─────────────────────────────
StudentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Method: Compare password ───────────────────────────────────────────────
StudentSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Method: Recalculate attendance percentage ──────────────────────────────
StudentSchema.methods.recalculateAttendance = function () {
  const records = this.attendance.records;
  if (records.length === 0) {
    this.attendance.percentage = 0;
    return;
  }
  const present = records.filter(r => r.status === 'present').length;
  this.attendance.percentage = Math.round((present / records.length) * 100);
};

// ── Virtual: Full display info ─────────────────────────────────────────────
StudentSchema.virtual('displayInfo').get(function () {
  return `${this.name} (${this.course} - Sem ${this.semester})`;
});

// ── Index for faster queries ───────────────────────────────────────────────
StudentSchema.index({ email: 1 });
StudentSchema.index({ course: 1, semester: 1 });

module.exports = mongoose.model('Student', StudentSchema);
