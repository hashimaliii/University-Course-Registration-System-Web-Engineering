const express = require('express');
const router = express.Router();
const courseController = require('../../controllers/courseController');
const { verifyAuth, requireAdmin } = require('../../middleware/auth');

// Get all courses or add a new course (Admin only)
router.route('/')
    .get(courseController.getAllCourses)
    .post(verifyAuth, requireAdmin, courseController.addCourse);

// Manage course by ID (Admin required for updates and deletion)
router.route('/:id')
    .get(courseController.getCourseDetails)
    .put(verifyAuth, requireAdmin, courseController.modifyCourse)
    .delete(verifyAuth, requireAdmin, courseController.removeCourse);

// Subscribe to course notifications (Authenticated users only)
router.post('/:id/subscribe', verifyAuth, courseController.subscribeToCourse);

// Get courses based on filters (e.g., department, level)
router.get('/filter', courseController.getAllCourses);

module.exports = router;
