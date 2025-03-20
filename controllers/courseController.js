const Course = require('../models/course');
const User = require('../models/user');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
    try {
        // Build filter object based on query params
        const filter = {};
        const { department, level, day, minSeats } = req.query;

        if (department) {
            filter.department = department;
        }

        if (level) {
            filter.level = level;
        }

        if (day) {
            filter.schedule = { $elemMatch: { day } };
        }

        if (minSeats) {
            filter.availableSeats = { $gte: parseInt(minSeats) };
        }

        const courses = await Course.find(filter).populate('prerequisites');

        res.json({ success: true, courses });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Public
exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('prerequisites');

        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }

        res.json({ success: true, course });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Admin
exports.createCourse = async (req, res) => {
    try {
        const {
            courseCode,
            title,
            department,
            level,
            description,
            creditHours,
            totalSeats,
            availableSeats,
            schedule,
            prerequisites
        } = req.body;

        const newCourse = new Course({
            courseCode,
            title,
            department,
            level,
            description,
            creditHours,
            totalSeats,
            availableSeats: availableSeats || totalSeats,
            schedule,
            prerequisites
        });

        const createdCourse = await newCourse.save();
        res.status(201).json({ success: true, course: createdCourse });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin
exports.updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }

        Object.keys(req.body).forEach(key => {
            course[key] = req.body[key];
        });

        const updatedCourse = await course.save();
        res.json({ success: true, course: updatedCourse });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }

        await course.deleteOne();
        res.json({ success: true, message: 'Course removed' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Subscribe to course notifications
// @route   POST /api/courses/:id/subscribe
// @access  Private
exports.subscribeToCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }

        // Check if user is already subscribed
        if (course.subscribers.includes(req.user._id)) {
            return res.status(400).json({ success: false, error: 'Already subscribed to this course' });
        }

        // Add user to subscribers
        course.subscribers.push(req.user._id);
        await course.save();

        res.json({ success: true, message: 'Subscribed to course successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};