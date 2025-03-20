const express = require('express');
const router = express.Router();
const reportController = require('../../controllers/reportController');
const { protect, admin } = require('../../middleware/auth');

// Course enrollment report
router.get('/course-enrollment/:courseId', protect, admin, reportController.getCourseEnrollmentReport);

// Available courses report
router.get('/available-courses', protect, admin, reportController.getAvailableCoursesReport);

// Prerequisite issues report
router.get('/prerequisite-issues', protect, admin, reportController.getPrerequisiteIssuesReport);

module.exports = router;