/**
 * STUDENT CONTROLLER
 * Handles student's own data access - profile, marks, attendance, fees.
 */

const Student = require('../models/Student');

// ── Get Student Dashboard Data ─────────────────────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

    // Calculate stats
    const totalClasses = student.attendance.records.length;
    const presentCount = student.attendance.records.filter(r => r.status === 'present').length;
    const attendancePct = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

    // Marks summary
    const marksArray = Array.from(student.marks?.entries?.() || []);
    const avgMarks = marksArray.length > 0
      ? Math.round(marksArray.reduce((sum, [, val]) => sum + (val.obtained || 0), 0) / marksArray.length)
      : 0;

    res.json({
      success: true,
      data: {
        profile: {
          id: student._id,
          name: student.name,
          email: student.email,
          course: student.course,
          rollNumber: student.rollNumber,
          phone: student.phone,
          address: student.address,
          gender: student.gender,
          semester: student.semester,
          enrollmentYear: student.enrollmentYear,
          avatar: student.avatar,
          dateOfBirth: student.dateOfBirth,
        },
        attendance: {
          records: student.attendance.records.slice(-30), // Last 30 records
          percentage: attendancePct,
          totalClasses,
          presentCount,
          absentCount: totalClasses - presentCount,
        },
        marks: Object.fromEntries(student.marks || []),
        avgMarks,
        fees: student.fees,
        stats: {
          attendanceStatus: attendancePct >= 75 ? 'good' : attendancePct >= 50 ? 'warning' : 'critical',
          feesStatus: student.fees.status,
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Update Student Profile (limited fields) ────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const allowedFields = ['phone', 'address', 'dateOfBirth', 'avatar'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const student = await Student.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: 'Profile updated.', data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboard, updateProfile };
