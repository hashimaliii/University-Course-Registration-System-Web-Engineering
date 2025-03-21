const express = require('express');
const router = express.Router();
const seedController = require('../.././controllers/seedController');

// Initialize default data for the system
router.post('/initialize', (req, res, next) => {
    try {
        seedController.initializeDefaultUsers(req, res, next);
    } catch (error) {
        res.status(500).json({ message: 'Error initializing default users' });
    }
});

// Optional: Reset user data (for development purposes)
router.post('/reset', (req, res, next) => {
    try {
        seedController.resetUsers(req, res, next);
    } catch (error) {
        res.status(500).json({ message: 'Error resetting users' });
    }
});

module.exports = router;
