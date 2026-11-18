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

// Student data loading
let students = [];
try {
    const stored = localStorage.getItem("students");
    if (stored) {
        students = JSON.parse(stored);
    }
} catch (e) {
    students = [];
}

// Attendance date setup
const dateInput = document.getElementById("attendanceDate");
const todayStr = new Date().toISOString().slice(0, 10);
if (dateInput) {
    dateInput.value = todayStr;
}

// Attendance state: { studentId: "present" | "absent" }
const attendanceMap = {};
students.forEach(s => {
    attendanceMap[s.id] = "present";
});

// DOM Elements
const tableBody = document.getElementById("attendanceTableBody");
const courseFilter = document.getElementById("courseFilter");
const markAllPresentBtn = document.getElementById("markAllPresentBtn");
const markAllAbsentBtn = document.getElementById("markAllAbsentBtn");
const saveAttendanceBtn = document.getElementById("saveAttendanceBtn");
const notification = document.getElementById("saveNotification");

const attTotalElem = document.getElementById("attTotal");
const attPresentElem = document.getElementById("attPresent");
const attAbsentElem = document.getElementById("attAbsent");
const attRateElem = document.getElementById("attRate");

function updateMetrics() {
    const total = students.length;
    let present = 0;
    let absent = 0;

    students.forEach(s => {
        if (attendanceMap[s.id] === "present") present++;
        else absent++;
    });

    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    if (attTotalElem) attTotalElem.innerText = total;
    if (attPresentElem) attPresentElem.innerText = present;
    if (attAbsentElem) attAbsentElem.innerText = absent;
    if (attRateElem) attRateElem.innerText = rate + "%";
}

function renderAttendanceTable() {
    if (!tableBody) return;
    tableBody.innerHTML = "";

    const selectedCourse = courseFilter ? courseFilter.value : "all";
    const filtered = students.filter(s => selectedCourse === "all" || s.course === selectedCourse);

    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 25px; color:#6b7280;">No students found</td></tr>`;
        return;
    }

    filtered.forEach(s => {
        const isPresent = attendanceMap[s.id] === "present";
        const attendanceColor = s.attendance >= 75 ? "#10b981" : "#ef4444";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>#${s.id}</td>
            <td style="font-weight: 600;">${s.name}</td>
            <td>${s.course}</td>
            <td>
                <span style="font-weight: 600; color: ${attendanceColor};">${s.attendance}%</span>
                <div class="progress-bar" style="width: 140px;">
                    <div class="progress-fill" style="width: ${s.attendance}%; background: ${attendanceColor};"></div>
                </div>
            </td>
            <td style="text-align: center;">
                <div style="display: inline-flex; border-radius: 8px; overflow: hidden; border: 1px solid #d1d5db;">
                    <button type="button" onclick="setAttendance(${s.id}, 'present')" style="padding: 6px 14px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; ${isPresent ? 'background: #10b981; color: white;' : 'background: #f3f4f6; color: #4b5563;'}">
                        ✓ Present
                    </button>
                    <button type="button" onclick="setAttendance(${s.id}, 'absent')" style="padding: 6px 14px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; ${!isPresent ? 'background: #ef4444; color: white;' : 'background: #f3f4f6; color: #4b5563;'}">
                        ✕ Absent
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    updateMetrics();
}

window.setAttendance = function(id, status) {
    attendanceMap[id] = status;
    renderAttendanceTable();
};

if (courseFilter) {
    courseFilter.addEventListener("change", renderAttendanceTable);
}

if (markAllPresentBtn) {
    markAllPresentBtn.addEventListener("click", () => {
        students.forEach(s => {
            attendanceMap[s.id] = "present";
        });
        renderAttendanceTable();
    });
}

if (markAllAbsentBtn) {
    markAllAbsentBtn.addEventListener("click", () => {
        students.forEach(s => {
            attendanceMap[s.id] = "absent";
        });
        renderAttendanceTable();
    });
}

if (saveAttendanceBtn) {
    saveAttendanceBtn.addEventListener("click", () => {
        const date = dateInput ? dateInput.value : todayStr;

        // Update student attendance values
        students.forEach(s => {
            if (attendanceMap[s.id] === "present") {
                s.attendance = Math.min(100, Math.round(s.attendance + 1));
            } else {
                s.attendance = Math.max(0, Math.round(s.attendance - 1));
            }
        });

        localStorage.setItem("students", JSON.stringify(students));
        localStorage.setItem(`attendance_record_${date}`, JSON.stringify(attendanceMap));

        renderAttendanceTable();

        if (notification) {
            notification.style.display = "block";
            notification.innerText = `✓ Attendance for ${date} saved successfully! Student percentages updated.`;
            setTimeout(() => {
                notification.style.display = "none";
            }, 4000);
        }
    });
}

// Initial render
renderAttendanceTable();
