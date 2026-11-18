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

// Load student data
let students = [];
try {
    const stored = localStorage.getItem("students");
    if (stored) {
        students = JSON.parse(stored);
    }
} catch (e) {
    students = [];
}

// Grade calculation helper
function calculateGrade(score) {
    if (score >= 90) return { grade: "A+", label: "Outstanding", color: "#10b981" };
    if (score >= 80) return { grade: "A", label: "Excellent", color: "#2563eb" };
    if (score >= 70) return { grade: "B", label: "Very Good", color: "#3b82f6" };
    if (score >= 60) return { grade: "C", label: "Good", color: "#f59e0b" };
    if (score >= 40) return { grade: "D", label: "Pass", color: "#eab308" };
    return { grade: "F", label: "Fail", color: "#ef4444" };
}

// DOM elements
const tableBody = document.getElementById("marksTableBody");
const searchInput = document.getElementById("marksSearch");
const courseFilter = document.getElementById("courseFilter");
const statusFilter = document.getElementById("statusFilter");

const highestScoreElem = document.getElementById("highestScore");
const classAverageElem = document.getElementById("classAverage");
const passedCountElem = document.getElementById("passedCount");
const marksPassRateElem = document.getElementById("marksPassRate");

const marksModal = document.getElementById("marksModal");
const closeMarksModal = document.getElementById("closeMarksModal");
const cancelMarksModalBtn = document.getElementById("cancelMarksModalBtn");
const marksForm = document.getElementById("marksForm");
const editMarksStudentId = document.getElementById("editMarksStudentId");
const modalStudentName = document.getElementById("modalStudentName");
const newScoreInput = document.getElementById("newScoreInput");

function updateStats() {
    const total = students.length;
    if (total === 0) {
        if (highestScoreElem) highestScoreElem.innerText = "0/100";
        if (classAverageElem) classAverageElem.innerText = "0%";
        if (passedCountElem) passedCountElem.innerText = "0";
        if (marksPassRateElem) marksPassRateElem.innerText = "0%";
        return;
    }

    const highest = Math.max(...students.map(s => Number(s.marks || 0)));
    const sum = students.reduce((acc, s) => acc + Number(s.marks || 0), 0);
    const avg = sum / total;
    const passed = students.filter(s => Number(s.marks || 0) >= 40).length;
    const rate = Math.round((passed / total) * 100);

    if (highestScoreElem) highestScoreElem.innerText = `${highest}/100`;
    if (classAverageElem) classAverageElem.innerText = `${avg.toFixed(1)}%`;
    if (passedCountElem) passedCountElem.innerText = passed;
    if (marksPassRateElem) marksPassRateElem.innerText = `${rate}%`;
}

function renderMarksTable() {
    if (!tableBody) return;
    tableBody.innerHTML = "";

    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const selectedCourse = courseFilter ? courseFilter.value : "all";
    const selectedStatus = statusFilter ? statusFilter.value : "all";

    const filtered = students.filter(student => {
        const matchesQuery =
            student.name.toLowerCase().includes(query) ||
            String(student.id).includes(query);

        const matchesCourse = selectedCourse === "all" || student.course === selectedCourse;

        const score = Number(student.marks || 0);
        let matchesStatus = true;
        if (selectedStatus === "pass") matchesStatus = score >= 40;
        else if (selectedStatus === "fail") matchesStatus = score < 40;
        else if (selectedStatus === "distinction") matchesStatus = score >= 80;

        return matchesQuery && matchesCourse && matchesStatus;
    });

    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 25px; color:#6b7280;">No records found</td></tr>`;
        return;
    }

    filtered.forEach(student => {
        const score = Number(student.marks || 0);
        const gradeInfo = calculateGrade(score);
        const isPass = score >= 40;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>#${student.id}</td>
            <td style="font-weight: 600;">${student.name}</td>
            <td>${student.course}</td>
            <td>Sem ${student.semester}</td>
            <td>
                <span style="font-weight: 700; font-size: 15px;">${score}</span>
                <span style="color: #6b7280; font-size: 12px;"> / 100</span>
            </td>
            <td>
                <span style="display: inline-block; padding: 3px 10px; border-radius: 6px; font-weight: 700; color: white; background: ${gradeInfo.color}; font-size: 13px;">
                    ${gradeInfo.grade}
                </span>
            </td>
            <td>
                <span class="status-pill ${isPass ? 'pass' : 'fail'}">
                    ${isPass ? 'PASSED' : 'FAILED'}
                </span>
            </td>
            <td style="text-align: right;">
                <button class="btn btn-primary btn-sm" onclick="openMarksModal(${student.id})">
                    ✏️ Update
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    updateStats();
}

// Modal handling
window.openMarksModal = function(id) {
    const student = students.find(s => s.id === id);
    if (!student) return;

    editMarksStudentId.value = student.id;
    modalStudentName.value = student.name;
    newScoreInput.value = student.marks;

    if (marksModal) marksModal.classList.add("active");
};

function closeMarksModalHandler() {
    if (marksModal) marksModal.classList.remove("active");
}

if (closeMarksModal) closeMarksModal.addEventListener("click", closeMarksModalHandler);
if (cancelMarksModalBtn) cancelMarksModalBtn.addEventListener("click", closeMarksModalHandler);

window.addEventListener("click", (e) => {
    if (e.target === marksModal) {
        closeMarksModalHandler();
    }
});

// Update marks submission
if (marksForm) {
    marksForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const id = parseInt(editMarksStudentId.value);
        const newScore = parseInt(newScoreInput.value);

        const index = students.findIndex(s => s.id === id);
        if (index !== -1) {
            students[index].marks = newScore;
            localStorage.setItem("students", JSON.stringify(students));
            renderMarksTable();
            closeMarksModalHandler();
        }
    });
}

if (searchInput) searchInput.addEventListener("input", renderMarksTable);
if (courseFilter) courseFilter.addEventListener("change", renderMarksTable);
if (statusFilter) statusFilter.addEventListener("change", renderMarksTable);

// Initial render
renderMarksTable();
