const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');

// Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/courses', require('./routes/api/courses'));
app.use('/api/registrations', require('./routes/api/registrations'));
app.use('/api/reports', require('./routes/api/reports'));
app.use('/api/seed', require('./routes/api/seed'));
app.use('/', require('./routes/index'));

// Define port
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));