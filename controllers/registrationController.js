const Registration = require('../models/registration');
const Course = require('../models/course');
const User = require('../models/user');

// @desc    Register for a course
// @route   POST /api/registrations
// @access  Private
exports.registerForCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const studentId = req.user._id;

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }

        // Check if seats are available
        if (course.availableSeats <= 0) {
            return res.status(400).json({ success: false, error: 'No seats available for this course' });
        }

        // Check if student is already registered
        const existingRegistration = await Registration.findOne({
            student: studentId,
            course: courseId
        });

        if (existingRegistration) {
            return res.status(400).json({ success: false, error: 'Already registered for this course' });
        }

        // Check for schedule conflicts
        const userRegistrations = await Registration.find({
            student: studentId,
            status: 'approved'
        }).populate('course');

        // Get schedule of the course student is trying to register for
        const newCourseSchedule = course.schedule;

        // Check each registration for conflicts
        for (const registration of userRegistrations) {
            const existingCourse = registration.course;

            for (const newSlot of newCourseSchedule) {
                for (const existingSlot of existingCourse.schedule) {
                    if (newSlot.day === existingSlot.day) {
                        // Convert times to minutes for easier comparison
                        const newStart = convertTimeToMinutes(newSlot.startTime);
                        const newEnd = convertTimeToMinutes(newSlot.endTime);
                        const existingStart = convertTimeToMinutes(existingSlot.startTime);
                        const existingEnd = convertTimeToMinutes(existingSlot.endTime);

                        // Check for overlap
                        if ((newStart >= existingStart && newStart < existingEnd) ||
                            (newEnd > existingStart && newEnd <= existingEnd) ||
                            (newStart <= existingStart && newEnd >= existingEnd)) {
                            return res.status(400).json({
                                success: false,
                                error: `Schedule conflict with ${existingCourse.courseCode} on ${newSlot.day}`
                            });
                        }
                    }
                }
            }
        }

        // Check prerequisites
        if (course.prerequisites && course.prerequisites.length > 0) {
            // Get all completed courses for the student
            const completedRegistrations = await Registration.find({
                student: studentId,
                status: 'approved'
            }).select('course');

            const completedCourseIds = completedRegistrations.map(reg => reg.course.toString());

            // Check if all prerequisites are met
            const unmetPrerequisites = course.prerequisites.filter(
                prereq => !completedCourseIds.includes(prereq.toString())
            );

            if (unmetPrerequisites.length > 0) {
                // Get prerequisite details for better error message
                const prereqCourses = await Course.find({
                    _id: { $in: unmetPrerequisites }
                }).select('courseCode title');

                return res.status(400).json({
                    success: false,
                    error: 'Prerequisite requirements not met',
                    prerequisites: prereqCourses
                });
            }
        }

        // Create new registration
        const registration = new Registration({
            student: studentId,
            course: courseId,
            status: 'approved' // Auto-approve for student registrations
        });

        const savedRegistration = await registration.save();

        // Update available seats
        course.availableSeats -= 1;
        await course.save();

        // Add registration to user's registeredCourses
        await User.findByIdAndUpdate(studentId, {
            $push: { registeredCourses: savedRegistration._id }
        });

        // Notify subscribers if this was the last seat
        if (course.availableSeats === 0 && course.subscribers.length > 0) {
            // In a real application, you would send notifications here
            // For now, we'll just update the subscribers array
            course.subscribers = [];
            await course.save();
        }

        res.status(201).json({
            success: true,
            registration: savedRegistration
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get all registrations for admin
// @route   GET /api/registrations
// @access  Private/Admin
exports.getRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find({})
            .populate('student', 'name rollNumber')
            .populate('course', 'courseCode title');

        res.json({ success: true, registrations });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get student's registrations
// @route   GET /api/registrations/my
// @access  Private
exports.getMyRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find({ student: req.user._id })
            .populate('course');

        res.json({ success: true, registrations });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update registration status (admin only)
// @route   PUT /api/registrations/:id
// @access  Private/Admin
exports.updateRegistrationStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const registration = await Registration.findById(req.params.id);

        if (!registration) {
            return res.status(404).json({ success: false, error: 'Registration not found' });
        }

        // Update status
        registration.status = status;
        const updatedRegistration = await registration.save();

        // If registration is rejected and was previously approved, update course seats
        if (status === 'rejected' && registration.status === 'approved') {
            const course = await Course.findById(registration.course);
            if (course) {
                course.availableSeats += 1;
                await course.save();
            }
        }

        // If registration is approved and was previously rejected, update course seats
        if (status === 'approved' && registration.status === 'rejected') {
            const course = await Course.findById(registration.course);
            if (course) {
                course.availableSeats -= 1;
                await course.save();
            }
        }

        res.json({ success: true, registration: updatedRegistration });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Cancel registration (student)
// @route   DELETE /api/registrations/:id
// @access  Private
exports.cancelRegistration = async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);

        if (!registration) {
            return res.status(404).json({ success: false, error: 'Registration not found' });
        }

        // Ensure student can only cancel their own registrations
        if (registration.student.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        // If registration was approved, update course seats
        if (registration.status === 'approved') {
            const course = await Course.findById(registration.course);
            if (course) {
                course.availableSeats += 1;
                await course.save();
            }
        }

        // Remove from user's registeredCourses
        await User.findByIdAndUpdate(registration.student, {
            $pull: { registeredCourses: registration._id }
        });

        await registration.deleteOne();

        res.json({ success: true, message: 'Registration cancelled' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Helper function to convert time string to minutes
function convertTimeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}