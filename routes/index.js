const express = require('express');
const router = express.Router();

// Home page
router.get('/', (req, res) => {
    res.render('index');
});

// Student login page
router.get('/student/login', (req, res) => {
    res.render('student/login');
});

// Admin login page
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

module.exports = router;