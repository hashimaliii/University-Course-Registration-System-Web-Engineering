const express = require('express');
const router = express.Router();
const registrationController = require('../../controllers/registrationController');
const { verifyAuth, requireAdmin } = require('../../middleware/auth');

// View all registrations (Admin only) or register for a course
router.route('/')
    .get(verifyAuth, requireAdmin, (req, res, next) => {
        try {
            registrationController.viewAllRegistrations(req, res, next);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving registrations' });
        }
    })
    .post(verifyAuth, (req, res, next) => {
        try {
            registrationController.enrollInCourse(req, res, next);
        } catch (error) {
            res.status(500).json({ message: 'Error enrolling in course' });
        }
    });

// View student's own registrations
router.get('/my', verifyAuth, (req, res, next) => {
    try {
        registrationController.viewMyRegistrations(req, res, next);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving your registrations' });
    }
});

// Update or cancel a registration (Admin can update, students can cancel)
router.route('/:id')
    .put(verifyAuth, requireAdmin, (req, res, next) => {
        try {
            registrationController.updateRegistration(req, res, next);
        } catch (error) {
            res.status(500).json({ message: 'Error updating registration' });
        }
    })
    .delete(verifyAuth, (req, res, next) => {
        try {
            registrationController.cancelEnrollment(req, res, next);
        } catch (error) {
            res.status(500).json({ message: 'Error canceling enrollment' });
        }
    });

// Fetch registration details by ID
router.get('/:id/details', verifyAuth, (req, res, next) => {
    try {
        registrationController.getRegistrationDetails(req, res, next);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching registration details' });
    }
});

module.exports = router;
