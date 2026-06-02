const express = require('express');
const router = express.Router();
const { getDashboard, updateProfile } = require('../controllers/studentController');
const { protect, studentOnly } = require('../middleware/auth');

router.use(protect, studentOnly);
router.get('/dashboard', getDashboard);
router.put('/profile', updateProfile);

module.exports = router;
