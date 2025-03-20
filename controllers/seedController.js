const User = require('../models/user');
const Course = require('../models/course');

// @desc    Seed initial data
// @route   POST /api/seed
// @access  Public (but should be secured in production)
exports.seedInitialData = async (req, res) => {
    try {
        // Check if admin exists
        const adminExists = await User.findOne({ role: 'admin' });

        if (!adminExists) {
            // Create default admin
            await User.create({
                rollNumber: 'admin123',
                name: 'System Administrator',
                password: 'admin123',
                role: 'admin'
            });
        }

        // Create your student account
        const studentExists = await User.findOne({ rollNumber: '22F-3636' });

        if (!studentExists) {
            await User.create({
                rollNumber: '22F-3636',
                name: 'Gohar Ellahi',
                password: 'Fast@3636',
                role: 'student'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Database seeded successfully with initial users'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};