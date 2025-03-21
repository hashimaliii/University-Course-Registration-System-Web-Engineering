const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Middleware to verify user authentication
exports.verifyAuth = async (req, res, next) => {
    let token;

    // Extract token from headers or cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secure_jwt_secret');
        req.user = await User.findById(decoded.userId);

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Invalid user. Authentication failed.' });
        }

        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token verification failed.' });
    }
};

// Middleware to check admin privileges
exports.requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }
};

// Middleware to restrict access to authenticated users only
exports.requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Please log in to access this resource.' });
    }
    next();
};
