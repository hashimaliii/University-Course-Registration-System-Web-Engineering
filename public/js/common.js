async function login() {
    const role = document.getElementById("role").value;
    const identifier = document.getElementById("identifier").value;
    const password = document.getElementById("password").value;

    let endpoint, body;

    if (role === "student") {
        endpoint = "/auth/student/login";
        body = { rollNumber: identifier };
    } else {
        endpoint = "/auth/admin/login";
        body = { username: identifier, password };
    }

    const res = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await res.json();

    if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = role === "student" ? "student-dashboard.html" : "admin-dashboard.html";
    } else {
        alert(data.error || "Invalid credentials");
    }
}

document.getElementById("role").addEventListener("change", function () {
    document.getElementById("password").classList.toggle("hidden", this.value === "student");
});
