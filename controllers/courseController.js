const Course = require('../models/course');
const User = require('../models/user');

// Fetch all courses with optional filtering
exports.getAllCourses = async (req, res) => {
    try {
        const filters = {};
        const { department, level, day, minSeats } = req.query;

        if (department) filters.department = department;
        if (level) filters.level = level;
        if (day) filters.schedule = { $elemMatch: { day } };
        if (minSeats) filters.availableSeats = { $gte: parseInt(minSeats) };

        const courses = await Course.find(filters).populate('prerequisites');
        res.json({ success: true, data: courses });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Retrieve specific course by ID
exports.getCourseDetails = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('prerequisites');
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        res.json({ success: true, data: course });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Add a new course
exports.addCourse = async (req, res) => {
    try {
        const { courseCode, title, department, level, description, creditHours, totalSeats, availableSeats, schedule, prerequisites } = req.body;
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

        const savedCourse = await newCourse.save();
        res.status(201).json({ success: true, data: savedCourse });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Update existing course
exports.modifyCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        Object.keys(req.body).forEach(key => (course[key] = req.body[key]));
        const updatedCourse = await course.save();

        res.json({ success: true, data: updatedCourse });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Delete a course
exports.removeCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        await course.deleteOne();
        res.json({ success: true, message: 'Course deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Subscribe to notifications for a course
exports.subscribeToCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        if (course.subscribers.includes(req.user._id))
            return res.status(400).json({ success: false, message: 'Already subscribed' });

        course.subscribers.push(req.user._id);
        await course.save();

        res.json({ success: true, message: 'Successfully subscribed to course' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
