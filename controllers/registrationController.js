const Registration = require('../models/registration');
const Course = require('../models/course');
const User = require('../models/user');

// Register a student for a course
exports.enrollInCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const studentId = req.user._id;

        // Validate course existence
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        // Ensure seat availability
        if (course.availableSeats <= 0) return res.status(400).json({ success: false, message: 'No available seats' });

        // Check for duplicate registration
        const alreadyRegistered = await Registration.findOne({ student: studentId, course: courseId });
        if (alreadyRegistered) return res.status(400).json({ success: false, message: 'Already enrolled' });

        // Check schedule conflicts
        const currentRegistrations = await Registration.find({ student: studentId, status: 'approved' }).populate('course');

        for (const registration of currentRegistrations) {
            const existingCourse = registration.course;
            for (const newSlot of course.schedule) {
                for (const existingSlot of existingCourse.schedule) {
                    if (newSlot.day === existingSlot.day) {
                        const [newStart, newEnd] = [timeToMinutes(newSlot.startTime), timeToMinutes(newSlot.endTime)];
                        const [existingStart, existingEnd] = [timeToMinutes(existingSlot.startTime), timeToMinutes(existingSlot.endTime)];

                        if ((newStart < existingEnd && newStart >= existingStart) ||
                            (newEnd > existingStart && newEnd <= existingEnd)) {
                            return res.status(400).json({ success: false, message: `Schedule conflict with ${existingCourse.courseCode}` });
                        }
                    }
                }
            }
        }

        // Create registration and adjust seat count
        const newRegistration = new Registration({ student: studentId, course: courseId, status: 'approved' });
        await newRegistration.save();

        course.availableSeats -= 1;
        await course.save();

        await User.findByIdAndUpdate(studentId, { $push: { registeredCourses: newRegistration._id } });

        res.status(201).json({ success: true, data: newRegistration });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// View all registrations (Admin only)
exports.viewAllRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find().populate('student', 'name rollNumber').populate('course', 'courseCode title');
        res.json({ success: true, data: registrations });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// View a student's own registrations
exports.viewMyRegistrations = async (req, res) => {
    try {
        const studentId = req.user._id;
        const registrations = await Registration.find({ student: studentId }).populate('course');
        res.json({ success: true, data: registrations });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Update registration status (Admin)
exports.updateRegistration = async (req, res) => {
    try {
        const { status } = req.body;
        const registration = await Registration.findById(req.params.id);

        if (!registration) return res.status(404).json({ success: false, message: 'Registration not found' });

        registration.status = status;
        const updated = await registration.save();

        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Cancel a registration (Student)
exports.cancelEnrollment = async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);

        if (!registration) return res.status(404).json({ success: false, message: 'Registration not found' });

        if (registration.student.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized action' });
        }

        await registration.deleteOne();
        res.json({ success: true, message: 'Enrollment canceled' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Helper function to convert time to minutes
function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}
