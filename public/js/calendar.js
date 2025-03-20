function renderCalendar(schedule) {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = ""; // Clear previous schedule

    schedule.forEach(course => {
        const div = document.createElement("div");
        div.className = "p-2 bg-blue-500 text-white mb-2 rounded";
        div.textContent = `${course.title} - ${course.schedule.days.join(", ")} (${course.schedule.time})`;
        calendar.appendChild(div);
    });
}
