router.get("/courses", async (req, res) => {
    const courses = await Course.find().populate("prerequisites");
    res.json(courses);
});

router.post("/register", async (req, res) => {
    const { studentId, courseId } = req.body;

    const student = await Student.findById(studentId);
    const course = await Course.findById(courseId);

    if (course.seats <= 0) return res.status(400).json({ error: "No seats available" });

    student.registeredCourses.push(courseId);
    course.enrolledStudents.push(studentId);
    course.seats--;

    await student.save();
    await course.save();

    res.json({ message: "Registered successfully" });
});
