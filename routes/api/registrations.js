const express = require('express');
const router = express.Router();
const registrationController = require('../../controllers/registrationController');
const { protect, admin } = require('../../middleware/auth');

// Get all registrations / register for course
router.route('/')
    .get(protect, admin, registrationController.getRegistrations)
    .post(protect, registrationController.registerForCourse);

// Get student's registrations
router.get('/my', protect, registrationController.getMyRegistrations);

// Update or cancel registration
router.route('/:id')
    .put(protect, admin, registrationController.updateRegistrationStatus)
    .delete(protect, registrationController.cancelRegistration);

module.exports = router;