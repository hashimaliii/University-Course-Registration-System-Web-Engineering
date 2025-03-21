const Registration = require('../models/registration');
const Course = require('../models/course');
const User = require('../models/user');

// Generate enrollment report for a specific course
exports.generateCourseEnrollmentReport = async (req, res) => {
    try {
        const { courseId } = req.params;

        // Validate course
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        // Get approved registrations
        const enrolledStudents = await Registration.find({ course: courseId, status: 'approved' }).populate('student', 'name rollNumber');

        res.json({
            success: true,
            courseInfo: {
                courseCode: course.courseCode,
                title: course.title,
                availableSeats: course.availableSeats,
                totalSeats: course.totalSeats,
                enrolledCount: enrolledStudents.length
            },
            students: enrolledStudents.map(reg => ({
                studentId: reg.student._id,
                name: reg.student.name,
                rollNumber: reg.student.rollNumber
            }))
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// List courses with available seats
exports.availableCoursesReport = async (req, res) => {
    try {
        const courses = await Course.find({ availableSeats: { $gt: 0 } }).select('courseCode title availableSeats totalSeats department');

        res.json({
            success: true,
            courses: courses.map(course => ({
                courseCode: course.courseCode,
                title: course.title,
                department: course.department,
                availableSeats: course.availableSeats,
                totalSeats: course.totalSeats
            }))
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Report on unmet prerequisites
exports.unmetPrerequisitesReport = async (req, res) => {
    try {
        const registrations = await Registration.find({ status: 'approved' })
            .populate('student', 'name rollNumber')
            .populate({ path: 'course', populate: { path: 'prerequisites' } });

        const issues = registrations.filter(reg => {
            const requiredCourses = reg.course.prerequisites.map(prereq => prereq._id.toString());
            const completedCourses = reg.student.registeredCourses.map(rc => rc.toString());
            return requiredCourses.some(req => !completedCourses.includes(req));
        });

        const report = issues.map(reg => ({
            student: {
                id: reg.student._id,
                name: reg.student.name,
                rollNumber: reg.student.rollNumber
            },
            course: {
                id: reg.course._id,
                code: reg.course.courseCode,
                title: reg.course.title
            },
            unmetPrerequisites: reg.course.prerequisites.map(prereq => ({
                id: prereq._id,
                code: prereq.courseCode,
                title: prereq.title
            }))
        }));

        res.json({ success: true, issues: report });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
