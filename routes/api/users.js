const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const { protect, admin } = require('../../middleware/auth');

// Student login
router.post('/login', userController.authUser);

// Admin login
router.post('/admin/login', userController.authAdmin);

// Get user profile
router.get('/profile', protect, userController.getUserProfile);

// Create student (admin only)
router.post('/create-student', protect, admin, userController.createStudent);

// Create admin (admin only)
router.post('/create-admin', protect, admin, userController.createAdmin);

module.exports = router;