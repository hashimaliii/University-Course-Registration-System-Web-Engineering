require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const PORT = process.env.PORT || 5000;

mongoose
    // .connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .connect(process.env.DB_URL)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error(err));

app.get("/", (req, res) => {
    res.send("University Registration System API is Running");
});

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("subscribe", async (courseId) => {
        socket.join(courseId);
    });

    socket.on("updateSeats", async (courseId) => {
        const course = await Course.findById(courseId);
        io.to(courseId).emit("seatUpdate", course.seats);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
