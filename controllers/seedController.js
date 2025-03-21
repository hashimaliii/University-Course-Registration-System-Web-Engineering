const User = require('../models/user');

// Initialize default users for the system
exports.initializeDefaultUsers = async (req, res) => {
    try {
        // Check if an admin user already exists
        const existingAdmin = await User.findOne({ role: 'admin' });

        if (!existingAdmin) {
            await User.create({
                rollNumber: 'admin001',
                name: 'Admin User',
                password: 'Admin@1234',
                role: 'admin'
            });
        }

        // Check if the sample student exists
        const studentExists = await User.findOne({ rollNumber: '22F-0000' });

        if (!studentExists) {
            await User.create({
                rollNumber: '22F-0000',
                name: 'Sample Student',
                password: 'Student@0000',
                role: 'student'
            });
        }

        // Optional: Add more sample data or other user roles if required

        res.status(200).json({
            success: true,
            message: 'Default admin and sample student created successfully.'
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Additional function to reset the user collection for development purposes
exports.resetUsers = async (req, res) => {
    try {
        await User.deleteMany({});
        res.status(200).json({
            success: true,
            message: 'All users have been removed from the database.'
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
