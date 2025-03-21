const express = require('express');
const router = express.Router();

// Render the home page
router.get('/', (req, res) => {
    res.render('index');
});

// Student login view
router.get('/student/login', (req, res) => {
    res.render('student/login');
});

// Admin login view
router.get('/admin/login', (req, res) => {
    res.render('admin/login');
});

// Student dashboard
router.get('/student/dashboard', (req, res) => {
    res.render('student/dashboard');
});

// Admin dashboard
router.get('/admin/dashboard', (req, res) => {
    res.render('admin/dashboard');
});

// Render the about page
router.get('/about', (req, res) => {
    res.render('about');
});

// 404 Error page for undefined routes
router.get('*', (req, res) => {
    res.status(404).render('error', { message: 'Page not found' });
});

module.exports = router;
