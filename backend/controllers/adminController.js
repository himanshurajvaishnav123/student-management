/**
 * ADMIN CONTROLLER
 * Full CRUD for students, attendance management, marks, and fees.
 */

const Student = require('../models/Student');
const Notification = require('../models/Notification');

// Helper: send notification to a student
const sendNotification = async (studentId, title, message, type = 'general', icon = '📢') => {
  try {
    await Notification.create({
      recipient: studentId,
      recipientModel: 'Student',
      title, message, type, icon,
    });
  } catch (e) {
    console.error('Notification error:', e.message);
  }
};

// Helper: compute grade from marks
const computeGrade = (obtained, total) => {
  const pct = (obtained / total) * 100;
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 40) return 'D';
  return 'F';
};

// ── GET All Students (with search/filter/pagination) ─────────────────────
const getAllStudents = async (req, res) => {
  try {
    const { search, course, semester, feesStatus, page = 1, limit = 20, sortBy = 'name', sortOrder = 'asc' } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ];
    }
    if (course) filter.course = { $regex: course, $options: 'i' };
    if (semester) filter.semester = Number(semester);
    if (feesStatus) filter['fees.status'] = feesStatus;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Student.countDocuments(filter);
    const students = await Student.find(filter).sort(sort).skip(skip).limit(Number(limit));

    res.json({
      success: true,
      data: students,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)), limit: Number(limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET Single Student ────────────────────────────────────────────────────
const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── CREATE New Student ────────────────────────────────────────────────────
const createStudent = async (req, res) => {
  try {
    const { name, email, password, course, phone, semester, gender, address, dateOfBirth, enrollmentYear } = req.body;

    const existing = await Student.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered.' });

    const rollNumber = `${course.substring(0, 3).toUpperCase()}-${enrollmentYear || new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const student = await Student.create({
      name, email, password: password || 'Student@123', course, phone, semester,
      gender, address, dateOfBirth, enrollmentYear, rollNumber,
      marks: {
        Mathematics: { obtained: 0, total: 100, grade: 'N/A' },
        Science: { obtained: 0, total: 100, grade: 'N/A' },
        English: { obtained: 0, total: 100, grade: 'N/A' },
        History: { obtained: 0, total: 100, grade: 'N/A' },
        Computer: { obtained: 0, total: 100, grade: 'N/A' },
      }
    });

    await sendNotification(
      student._id,
      'Welcome to the System!',
      `Hello ${name}, your account has been created. Roll No: ${rollNumber}`,
      'general', '🎉'
    );

    res.status(201).json({ success: true, message: 'Student created successfully.', data: student });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Duplicate entry detected.' });
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── UPDATE Student Details ────────────────────────────────────────────────
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const allowedUpdates = ['name', 'email', 'course', 'phone', 'semester', 'gender', 'address', 'dateOfBirth', 'enrollmentYear', 'isActive'];
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const student = await Student.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

    res.json({ success: true, message: 'Student updated successfully.', data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE Student ────────────────────────────────────────────────────────
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    res.json({ success: true, message: `Student "${student.name}" deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── MARK ATTENDANCE ───────────────────────────────────────────────────────
const markAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, date, subject } = req.body; // status: 'present' | 'absent'

    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

    const attendanceDate = date ? new Date(date) : new Date();
    // Check if attendance already marked for this date
    const dateStr = attendanceDate.toDateString();
    const exists = student.attendance.records.some(r => new Date(r.date).toDateString() === dateStr);
    if (exists) {
      // Update existing record
      student.attendance.records = student.attendance.records.map(r =>
        new Date(r.date).toDateString() === dateStr ? { ...r.toObject(), status, subject: subject || r.subject } : r
      );
    } else {
      student.attendance.records.push({ date: attendanceDate, status, subject: subject || 'General' });
    }

    student.recalculateAttendance();
    await student.save();

    // Notify if attendance is low
    if (student.attendance.percentage < 75 && student.attendance.percentage > 0) {
      await sendNotification(
        student._id,
        'Low Attendance Warning ⚠️',
        `Your attendance is ${student.attendance.percentage}%. Minimum required is 75%.`,
        'warning', '⚠️'
      );
    }

    res.json({
      success: true,
      message: `Attendance marked as ${status}.`,
      data: { attendance: student.attendance }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── UPDATE MARKS ──────────────────────────────────────────────────────────
const updateMarks = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, obtained, total } = req.body;

    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

    const grade = computeGrade(obtained, total || 100);
    student.marks.set(subject, { obtained, total: total || 100, grade });
    await student.save();

    await sendNotification(
      student._id,
      'Marks Updated',
      `Your marks for ${subject} have been updated: ${obtained}/${total || 100} (${grade})`,
      'marks', '📊'
    );

    res.json({ success: true, message: 'Marks updated.', data: { marks: Object.fromEntries(student.marks) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── UPDATE FEES STATUS ────────────────────────────────────────────────────
const updateFees = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, amount, dueDate, semester } = req.body;

    const student = await Student.findByIdAndUpdate(
      id,
      { $set: { fees: { status, amount, dueDate, semester, paidDate: status === 'paid' ? new Date() : undefined } } },
      { new: true }
    );
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

    const msg = status === 'paid'
      ? 'Your fee payment has been confirmed. Thank you!'
      : `Your fee of ₹${amount} is ${status}. ${dueDate ? `Due date: ${new Date(dueDate).toLocaleDateString('en-IN')}` : ''}`;

    await sendNotification(student._id, 'Fees Status Updated', msg, 'fees', status === 'paid' ? '✅' : '💰');

    res.json({ success: true, message: 'Fees status updated.', data: { fees: student.fees } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET Dashboard Stats ────────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ isActive: true });
    const feesPaid = await Student.countDocuments({ 'fees.status': 'paid' });
    const feesUnpaid = await Student.countDocuments({ 'fees.status': 'unpaid' });
    const courseWise = await Student.aggregate([
      { $group: { _id: '$course', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const avgAttendance = await Student.aggregate([
      { $group: { _id: null, avg: { $avg: '$attendance.percentage' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        feesPaid,
        feesUnpaid,
        courseWise,
        avgAttendance: avgAttendance[0]?.avg?.toFixed(1) || 0,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllStudents, getStudent, createStudent, updateStudent, deleteStudent, markAttendance, updateMarks, updateFees, getDashboardStats };
