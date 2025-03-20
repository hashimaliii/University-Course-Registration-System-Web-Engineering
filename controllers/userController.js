const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret', {
        expiresIn: '30d'
    });
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
exports.authUser = async (req, res) => {
    try {
        const { rollNumber, password } = req.body;

        // Find the user
        const user = await User.findOne({ rollNumber });

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid roll number or password' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid roll number or password' });
        }

        // Generate token
        const token = generateToken(user._id);

        // Return user data
        res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                rollNumber: user.rollNumber,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Admin login
// @route   POST /api/users/admin/login
// @access  Public
exports.authAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find the admin user
        const admin = await User.findOne({ rollNumber: username, role: 'admin' });

        if (!admin) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await admin.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(admin._id);

        // Return admin data
        res.json({
            success: true,
            token,
            user: {
                _id: admin._id,
                name: admin.name,
                rollNumber: admin.rollNumber,
                role: admin.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Create a student user (Admin only)
// @route   POST /api/users/create-student
// @access  Private/Admin
exports.createStudent = async (req, res) => {
    try {
        const { rollNumber, name, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ rollNumber });

        if (userExists) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        // Create new user
        const user = await User.create({
            rollNumber,
            name,
            password,
            role: 'student'
        });

        if (user) {
            res.status(201).json({
                success: true,
                user: {
                    _id: user._id,
                    name: user.name,
                    rollNumber: user.rollNumber,
                    role: user.role
                }
            });
        } else {
            res.status(400).json({ success: false, error: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Create an admin user (Super admin only or initial setup)
// @route   POST /api/users/create-admin
// @access  Private/Admin
exports.createAdmin = async (req, res) => {
    try {
        const { rollNumber, name, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ rollNumber });

        if (userExists) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        // Create new admin user
        const admin = await User.create({
            rollNumber,
            name,
            password,
            role: 'admin'
        });

        if (admin) {
            res.status(201).json({
                success: true,
                user: {
                    _id: admin._id,
                    name: admin.name,
                    rollNumber: admin.rollNumber,
                    role: admin.role
                }
            });
        } else {
            res.status(400).json({ success: false, error: 'Invalid admin data' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'registeredCourses',
            populate: { path: 'course' }
        });

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                rollNumber: user.rollNumber,
                role: user.role,
                registeredCourses: user.registeredCourses
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};