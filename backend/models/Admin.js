/**
 * ADMIN MODEL
 * Separate model for admin users with elevated privileges.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false,
  },
  role: {
    type: String,
    default: 'admin',
    immutable: true, // Cannot be changed once set
  },
  department: { type: String, default: 'Administration' },
  permissions: {
    canAddStudents: { type: Boolean, default: true },
    canDeleteStudents: { type: Boolean, default: true },
    canUpdateMarks: { type: Boolean, default: true },
    canManageFees: { type: Boolean, default: true },
    canMarkAttendance: { type: Boolean, default: true },
  },
}, { timestamps: true });

// Hash password before saving
AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

AdminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Admin', AdminSchema);
