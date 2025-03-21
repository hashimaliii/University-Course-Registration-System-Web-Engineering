const express = require('express');
const router = express.Router();
const seedController = require('../../controllers/seedController');

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

// Seed additional sample data for testing
router.post('/sample-data', (req, res, next) => {
    try {
        seedController.seedSampleData(req, res, next);
    } catch (error) {
        res.status(500).json({ message: 'Error seeding sample data' });
    }
});

module.exports = router;
