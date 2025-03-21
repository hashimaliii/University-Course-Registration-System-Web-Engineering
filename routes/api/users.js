const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const { verifyAuth, requireAdmin } = require('../../middleware/auth');

// Student login
router.post('/login', (req, res, next) => {
    try {
        userController.userLogin(req, res, next);
    } catch (error) {
        res.status(500).json({ message: 'Error logging in as student' });
    }
});

// Admin login
router.post('/admin/login', (req, res, next) => {
    try {
        userController.adminLogin(req, res, next);
    } catch (error) {
        res.status(500).json({ message: 'Error logging in as admin' });
    }
});

// View user profile
router.get('/profile', verifyAuth, (req, res, next) => {
    try {
        userController.getUserProfile(req, res, next);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user profile' });
    }
});

// Create a new student (Admin only)
router.post('/create-student', verifyAuth, requireAdmin, (req, res, next) => {
    try {
        userController.registerStudent(req, res, next);
    } catch (error) {
        res.status(500).json({ message: 'Error creating student' });
    }
});

// Create a new admin (Admin only)
router.post('/create-admin', verifyAuth, requireAdmin, (req, res, next) => {
    try {
        userController.createAdmin(req, res, next);
    } catch (error) {
        res.status(500).json({ message: 'Error creating admin' });
    }
});

// Update user profile
router.put('/profile/update', verifyAuth, (req, res, next) => {
    try {
        userController.updateUserProfile(req, res, next);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user profile' });
    }
});

// Delete a user (Admin only)
router.delete('/:id', verifyAuth, requireAdmin, (req, res, next) => {
    try {
        userController.deleteUser(req, res, next);
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
});

module.exports = router;
