const Registration = require('../models/registration');
const Course = require('../models/course');
const User = require('../models/user');

// @desc    Get course enrollment report
// @route   GET /api/reports/course-enrollment/:courseId
// @access  Private/Admin
exports.getCourseEnrollmentReport = async (req, res) => {
    try {
        const { courseId } = req.params;

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }

        // Get all registrations for the course
        const registrations = await Registration.find({
            course: courseId,
            status: 'approved'
        }).populate('student', 'name rollNumber');

        res.json({
            success: true,
            course: {
                _id: course._id,
                courseCode: course.courseCode,
                title: course.title,
                totalSeats: course.totalSeats,
                availableSeats: course.availableSeats,
                enrolledStudents: registrations.length
            },
            students: registrations.map(reg => ({
                _id: reg.student._id,
                name: reg.student.name,
                rollNumber: reg.student.rollNumber,
                registrationDate: reg.registrationDate
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get available courses report
// @route   GET /api/reports/available-courses
// @access  Private/Admin
exports.getAvailableCoursesReport = async (req, res) => {
    try {
        // Get all courses with available seats
        const courses = await Course.find({ availableSeats: { $gt: 0 } })
            .select('courseCode title department level availableSeats totalSeats');

        res.json({
            success: true,
            courses: courses.map(course => ({
                _id: course._id,
                courseCode: course.courseCode,
                title: course.title,
                department: course.department,
                level: course.level,
                availableSeats: course.availableSeats,
                totalSeats: course.totalSeats,
                fillingPercentage: Math.round(((course.totalSeats - course.availableSeats) / course.totalSeats) * 100)
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get prerequisite issues report
// @route   GET /api/reports/prerequisite-issues
// @access  Private/Admin
exports.getPrerequisiteIssuesReport = async (req, res) => {
    try {
        // Get all registrations
        const registrations = await Registration.find({
            status: 'approved'
        }).populate('student', 'name rollNumber')
            .populate({
                path: 'course',
                populate: { path: 'prerequisites' }
            });

        const issues = [];

        // Check each registration for prerequisite issues
        for (const registration of registrations) {
            if (!registration.course.prerequisites || registration.course.prerequisites.length === 0) {
                continue;
            }

            const studentId = registration.student._id;
            const course = registration.course;

            // Get all completed courses for the student
            const completedRegistrations = await Registration.find({
                student: studentId,
                status: 'approved',
                _id: { $ne: registration._id } // Exclude current registration
            }).select('course');

            const completedCourseIds = completedRegistrations.map(reg => reg.course.toString());

            // Check if all prerequisites are met
            const unmetPrerequisites = course.prerequisites.filter(
                prereq => !completedCourseIds.includes(prereq._id.toString())
            );

            if (unmetPrerequisites.length > 0) {
                issues.push({
                    student: {
                        _id: registration.student._id,
                        name: registration.student.name,
                        rollNumber: registration.student.rollNumber
                    },
                    course: {
                        _id: course._id,
                        courseCode: course.courseCode,
                        title: course.title
                    },
                    unmetPrerequisites: unmetPrerequisites.map(prereq => ({
                        _id: prereq._id,
                        courseCode: prereq.courseCode,
                        title: prereq.title
                    }))
                });
            }
        }

        res.json({
            success: true,
            issueCount: issues.length,
            issues
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};