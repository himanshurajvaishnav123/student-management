/**
 * models/Student.js — Student schema
 *
 * CHANGES FROM ORIGINAL:
 *  1. REMOVED the manual StudentSchema.index({ email: 1 }) call at the bottom.
 *     The `unique: true` on the email field already tells Mongoose to create
 *     a unique index for email automatically. Declaring it a second time with
 *     .index() produced the Mongoose warning:
 *       "Duplicate schema index on {"email":1}"
 *     and caused Atlas to attempt creating a redundant index on every startup.
 *     The uniqueness constraint is fully preserved — only the duplicate
 *     declaration is removed.
 *
 *  2. Kept StudentSchema.index({ course: 1, semester: 1 }) — that compound
 *     index is NOT duplicated elsewhere so it is safe and useful.
 *
 *  No other logic has been changed.
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const AttendanceRecordSchema = new mongoose.Schema({
  date:    { type: Date,   required: true },
  status:  { type: String, enum: ['present', 'absent'], required: true },
  subject: { type: String, default: 'General' },
}, { _id: false });

const StudentSchema = new mongoose.Schema({
  name: {
    type:      String,
    required:  [true, 'Name is required'],
    trim:      true,
    minlength: [2, 'Name must be at least 2 characters'],
  },
  email: {
    type:      String,
    required:  [true, 'Email is required'],
    unique:    true,   // ← this alone creates the unique index; no .index() needed
    lowercase: true,
    trim:      true,
    match:     [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type:      String,
    required:  [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select:    false,  // Don't return password in queries by default
  },
  role: {
    type:    String,
    default: 'student',
    enum:    ['student', 'admin'],
  },

  // ── Personal Info ────────────────────────────────────────────────────────────
  course: {
    type:     String,
    required: [true, 'Course is required'],
    trim:     true,
  },
  rollNumber: {
    type:   String,
    unique: true,
    sparse: true,   // allows multiple null values (students added before roll is assigned)
  },
  phone:          { type: String, trim: true },
  address:        { type: String, trim: true },
  dateOfBirth:    { type: Date },
  gender:         { type: String, enum: ['Male', 'Female', 'Other', ''] },
  avatar:         { type: String, default: '' },
  semester:       { type: Number, default: 1, min: 1, max: 12 },
  enrollmentYear: { type: Number, default: () => new Date().getFullYear() },

  // ── Attendance ───────────────────────────────────────────────────────────────
  attendance: {
    records:    [AttendanceRecordSchema],
    percentage: { type: Number, default: 0, min: 0, max: 100 },
  },

  // ── Marks (subject-wise) ─────────────────────────────────────────────────────
  marks: {
    type: Map,
    of: {
      obtained: { type: Number, default: 0, min: 0, max: 100 },
      total:    { type: Number, default: 100 },
      grade:    { type: String, default: 'N/A' },
    },
    default: {},
  },

  // ── Fees ─────────────────────────────────────────────────────────────────────
  fees: {
    status:   { type: String, enum: ['paid', 'unpaid', 'partial'], default: 'unpaid' },
    amount:   { type: Number, default: 0 },
    dueDate:  { type: Date },
    paidDate: { type: Date },
    semester: { type: Number },
  },

  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

// ── Pre-save: hash password ──────────────────────────────────────────────────
StudentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Method: compare password ─────────────────────────────────────────────────
StudentSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Method: recalculate attendance percentage ────────────────────────────────
StudentSchema.methods.recalculateAttendance = function () {
  const records = this.attendance.records;
  if (records.length === 0) {
    this.attendance.percentage = 0;
    return;
  }
  const present = records.filter((r) => r.status === 'present').length;
  this.attendance.percentage = Math.round((present / records.length) * 100);
};

// ── Virtual: display info ────────────────────────────────────────────────────
StudentSchema.virtual('displayInfo').get(function () {
  return `${this.name} (${this.course} - Sem ${this.semester})`;
});

// ── Indexes ──────────────────────────────────────────────────────────────────
// NOTE: email unique index is created automatically by { unique: true } above.
//       DO NOT add StudentSchema.index({ email: 1 }) — that was the duplicate.
StudentSchema.index({ course: 1, semester: 1 });  // compound index — safe to keep

module.exports = mongoose.model('Student', StudentSchema);