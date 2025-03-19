const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    department: { type: String, required: true },
    prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    schedule: {
        days: [String], // ["Monday", "Wednesday"]
        time: String,   // "10:00 AM - 11:30 AM"
    },
    seats: { type: Number, required: true },
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
});

module.exports = mongoose.model("Course", CourseSchema);
