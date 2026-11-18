// Authentication check
if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "index.html";
}

// Logout handler
const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to logout?")) {
            localStorage.removeItem("loggedIn");
            window.location.href = "index.html";
        }
    });
}

// Theme handler
const themeBtn = document.getElementById("themeBtn");
let theme = localStorage.getItem("theme") || "light";

if (theme === "dark") {
    document.body.classList.add("dark");
    if (themeBtn) themeBtn.innerHTML = "☀";
}

if (themeBtn) {
    themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        if (document.body.classList.contains("dark")) {
            localStorage.setItem("theme", "dark");
            themeBtn.innerHTML = "☀";
        } else {
            localStorage.setItem("theme", "light");
            themeBtn.innerHTML = "🌙";
        }
    });
}

// Student database initialization
let storedStudents = localStorage.getItem("students");
let students = [];

if (storedStudents) {
    try {
        students = JSON.parse(storedStudents);
    } catch (e) {
        students = [];
    }
}

if (!students || students.length === 0) {
    students = [
        { id: 101, name: "Daksh", email: "daksh@college.edu", course: "B.Tech AI", semester: 2, attendance: 96, marks: 88 },
        { id: 102, name: "John", email: "john@college.edu", course: "BCA", semester: 4, attendance: 82, marks: 71 },
        { id: 103, name: "Emma", email: "emma@college.edu", course: "BBA", semester: 6, attendance: 91, marks: 93 },
        { id: 104, name: "Alex", email: "alex@college.edu", course: "B.Tech CSE", semester: 3, attendance: 78, marks: 81 },
        { id: 105, name: "Sarah", email: "sarah@college.edu", course: "BCA", semester: 2, attendance: 89, marks: 76 }
    ];
    localStorage.setItem("students", JSON.stringify(students));
}

// Greeting and date display
const greetingElem = document.getElementById("welcomeGreeting");
const dateElem = document.getElementById("currentDateText");

if (greetingElem) {
    const hour = new Date().getHours();
    let greeting = "Good Evening";
    if (hour < 12) greeting = "Good Morning";
    else if (hour < 17) greeting = "Good Afternoon";
    greetingElem.innerText = `${greeting}, Admin 👋`;
}

if (dateElem) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElem.innerText = new Date().toLocaleDateString(undefined, options);
}

// Calculations for dashboard metrics
const total = students.length;
const presentCount = students.filter(s => s.attendance >= 75).length;
const avgMarks = total > 0 ? (students.reduce((sum, s) => sum + Number(s.marks || 0), 0) / total) : 0;
const passingStudents = students.filter(s => Number(s.marks || 0) >= 40).length;
const passRate = total > 0 ? Math.round((passingStudents / total) * 100) : 0;

// Counter animation
function animateCounter(element, target, suffix = "") {
    if (!element) return;
    if (target <= 0) {
        element.innerHTML = "0" + suffix;
        return;
    }
    let count = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const speed = 25;
    const counter = setInterval(() => {
        count += step;
        if (count >= target) {
            element.innerHTML = target + suffix;
            clearInterval(counter);
        } else {
            element.innerHTML = count + suffix;
        }
    }, speed);
}

const totalElem = document.getElementById("students");
const presentElem = document.getElementById("present");
const avgMarksElem = document.getElementById("avgMarks");
const passRateElem = document.getElementById("passRate");

animateCounter(totalElem, total);
animateCounter(presentElem, presentCount);
if (avgMarksElem) avgMarksElem.innerText = avgMarks.toFixed(1) + "%";
animateCounter(passRateElem, passRate, "%");

// Render students table
const tableBody = document.getElementById("studentTable");

function renderTable(data) {
    if (!tableBody) return;
    tableBody.innerHTML = "";

    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color:#6b7280;">No students found</td></tr>`;
        return;
    }

    data.slice(0, 6).forEach(student => {
        const attendanceColor = student.attendance >= 75 ? "#10b981" : "#ef4444";
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>#${student.id}</td>
            <td style="font-weight: 500;">${student.name}</td>
            <td>${student.course}</td>
            <td>Sem ${student.semester}</td>
            <td>
                <span style="color: ${attendanceColor}; font-weight: 600;">${student.attendance}%</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${student.attendance}%; background: ${attendanceColor};"></div>
                </div>
            </td>
            <td>
                <span style="font-weight: 600;">${student.marks}/100</span>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

renderTable(students);

// Dashboard live search filter
const searchInput = document.getElementById("dashboardSearch");
if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = students.filter(s =>
            s.name.toLowerCase().includes(query) ||
            s.course.toLowerCase().includes(query) ||
            String(s.id).includes(query)
        );
        renderTable(filtered);
    });
}

// Attendance Pie Chart
const pieCtx = document.getElementById("pieChart");
if (pieCtx) {
    new Chart(pieCtx, {
        type: "pie",
        data: {
            labels: ["Eligible / Present", "Defaulter / Absent"],
            datasets: [{
                data: [presentCount, Math.max(0, total - presentCount)],
                backgroundColor: ["#10b981", "#ef4444"],
                borderWidth: 2,
                borderColor: "#ffffff"
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}

// Marks Bar Chart
const barCtx = document.getElementById("barChart");
if (barCtx) {
    new Chart(barCtx, {
        type: "bar",
        data: {
            labels: students.map(s => s.name),
            datasets: [{
                label: "Marks Obtained",
                data: students.map(s => s.marks),
                backgroundColor: "#2563eb",
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            }
        }
    });
}
