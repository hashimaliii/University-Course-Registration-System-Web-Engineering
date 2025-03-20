const express = require('express');
const router = express.Router();
const seedController = require('../../controllers/seedController');

// Seed initial data
router.post('/', seedController.seedInitialData);

module.exports = router;