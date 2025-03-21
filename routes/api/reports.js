const express = require('express');
const router = express.Router();
const reportController = require('../../controllers/reportController');
const { verifyAuth, requireAdmin } = require('../../middleware/auth');

// Enrollment report for a specific course
router.get('/course-enrollment/:courseId', verifyAuth, requireAdmin, (req, res, next) => {
    try {
        reportController.generateCourseEnrollmentReport(req, res, next);
    } catch (error) {
        res.status(500).json({ message: 'Error generating course enrollment report' });
    }
});

// Report of courses with available seats
router.get('/available-courses', verifyAuth, requireAdmin, (req, res, next) => {
    try {
        reportController.availableCoursesReport(req, res, next);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching available courses report' });
    }
});

// Report on unmet prerequisites
router.get('/unmet-prerequisites', verifyAuth, requireAdmin, (req, res, next) => {
    try {
        reportController.unmetPrerequisitesReport(req, res, next);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching unmet prerequisites report' });
    }
});

// Comprehensive report of all course registrations
router.get('/all-registrations', verifyAuth, requireAdmin, (req, res, next) => {
    try {
        reportController.getAllRegistrationsReport(req, res, next);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all registrations report' });
    }
});

module.exports = router;
