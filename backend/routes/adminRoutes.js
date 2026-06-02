const express = require('express');
const router = express.Router();
const {
  getAllStudents, getStudent, createStudent, updateStudent, deleteStudent,
  markAttendance, updateMarks, updateFees, getDashboardStats
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/students', getAllStudents);
router.get('/students/:id', getStudent);
router.post('/students', createStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);
router.post('/students/:id/attendance', markAttendance);
router.put('/students/:id/marks', updateMarks);
router.put('/students/:id/fees', updateFees);

module.exports = router;
