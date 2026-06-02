const express = require('express');
const router = express.Router();
const { registerStudent, login, getProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerStudent);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
