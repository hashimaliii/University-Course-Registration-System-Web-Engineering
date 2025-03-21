const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Generate authentication token
const createAuthToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'secure_jwt_secret', { expiresIn: '30d' });
};

// User authentication for login
exports.userLogin = async (req, res) => {
    try {
        const { rollNumber, password } = req.body;
        const user = await User.findOne({ rollNumber });

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = createAuthToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                rollNumber: user.rollNumber,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Admin authentication for login
exports.adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await User.findOne({ rollNumber: username, role: 'admin' });

        if (!admin || !(await admin.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
        }

        const token = createAuthToken(admin._id);

        res.json({
            success: true,
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                username: admin.rollNumber,
                role: admin.role
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Create a new student (Admin only)
exports.registerStudent = async (req, res) => {
    try {
        const { rollNumber, name, password } = req.body;
        const existingStudent = await User.findOne({ rollNumber });

        if (existingStudent) return res.status(400).json({ success: false, message: 'Student already exists' });

        const newStudent = await User.create({
            rollNumber,
            name,
            password,
            role: 'student'
        });

        res.status(201).json({ success: true, student: newStudent });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Fetch user profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'registeredCourses',
            populate: { path: 'course' }
        });

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        res.json({
            success: true,
            profile: {
                id: user._id,
                name: user.name,
                rollNumber: user.rollNumber,
                role: user.role,
                registeredCourses: user.registeredCourses
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
