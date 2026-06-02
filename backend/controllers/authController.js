/**
 * AUTH CONTROLLER
 * Handles registration, login, and profile for both students and admins.
 */

const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

// ── Generate JWT Token ────────────────────────────────────────────────────
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ── Student Register ──────────────────────────────────────────────────────
const registerStudent = async (req, res) => {
  try {
    const { name, email, password, course, phone, semester, gender } = req.body;

    // Check for existing student
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    // Generate roll number: COURSE-YEAR-RANDOM
    const rollNumber = `${course.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const student = await Student.create({
      name, email, password, course,
      phone, semester, gender, rollNumber,
      enrollmentYear: new Date().getFullYear(),
      marks: {
        Mathematics: { obtained: 0, total: 100, grade: 'N/A' },
        Science: { obtained: 0, total: 100, grade: 'N/A' },
        English: { obtained: 0, total: 100, grade: 'N/A' },
        History: { obtained: 0, total: 100, grade: 'N/A' },
        Computer: { obtained: 0, total: 100, grade: 'N/A' },
      }
    });

    const token = generateToken(student._id, 'student');

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome aboard.',
      token,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: 'student',
        course: student.course,
        rollNumber: student.rollNumber,
        semester: student.semester,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email or Roll Number already exists.' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Student/Admin Login ───────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    let user, userRole;

    if (role === 'admin') {
      user = await Admin.findOne({ email }).select('+password');
      userRole = 'admin';
    } else {
      user = await Student.findOne({ email }).select('+password');
      userRole = 'student';
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id, userRole);

    // Build response object without password
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: userRole,
      ...(userRole === 'student' && {
        course: user.course,
        rollNumber: user.rollNumber,
        semester: user.semester,
        avatar: user.avatar,
      }),
      ...(userRole === 'admin' && { department: user.department }),
    };

    res.json({ success: true, message: `Welcome back, ${user.name}!`, token, user: userData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get Current User Profile ───────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Change Password ────────────────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const Model = req.userRole === 'admin' ? Admin : Student;

    const user = await Model.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { registerStudent, login, getProfile, changePassword };
