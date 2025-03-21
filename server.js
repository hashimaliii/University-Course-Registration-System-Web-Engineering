const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

const app = express();

// Middleware for parsing request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Set the static files directory
app.use(express.static(path.join(__dirname, 'public')));

// Set the view engine
app.set('view engine', 'ejs');

// Define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/courses', require('./routes/api/courses'));
app.use('/api/registrations', require('./routes/api/registrations'));
app.use('/api/reports', require('./routes/api/reports'));
app.use('/api/seed', require('./routes/api/seed'));
app.use('/', require('./routes/index'));

// Error handling for undefined routes
app.use((req, res) => {
    res.status(404).render('error', { message: 'Resource not found' });
});

// Server port configuration
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
