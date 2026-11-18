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

if (!students || students.length === 0) {
    students = [
        { id: 101, name: "Daksh", email: "daksh@college.edu", course: "B.Tech AI", semester: 2, attendance: 96, marks: 88 },
        { id: 102, name: "John", email: "john@college.edu", course: "BCA", semester: 4, attendance: 82, marks: 71 },
        { id: 103, name: "Emma", email: "emma@college.edu", course: "BBA", semester: 6, attendance: 91, marks: 93 },
        { id: 104, name: "Alex", email: "alex@college.edu", course: "B.Tech CSE", semester: 3, attendance: 78, marks: 81 },
        { id: 105, name: "Sarah", email: "sarah@college.edu", course: "BCA", semester: 2, attendance: 89, marks: 76 }
    ];
    saveStudents();
}

function saveStudents() {
    localStorage.setItem("students", JSON.stringify(students));
    updateStats();
}

// DOM elements
const tableBody = document.getElementById("studentsListTable");
const searchInput = document.getElementById("searchInput");
const courseFilter = document.getElementById("courseFilter");
const addStudentBtn = document.getElementById("addStudentBtn");
const studentModal = document.getElementById("studentModal");
const closeModal = document.getElementById("closeModal");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const studentForm = document.getElementById("studentForm");
const modalTitle = document.getElementById("modalTitle");
const editIndexInput = document.getElementById("editIndex");
const exportBtn = document.getElementById("exportBtn");

// Stats elements
const totalCountElem = document.getElementById("totalCount");
const eligibleCountElem = document.getElementById("eligibleCount");
const toppersCountElem = document.getElementById("toppersCount");

function updateStats() {
    if (totalCountElem) totalCountElem.innerText = students.length;
    if (eligibleCountElem) {
        const eligible = students.filter(s => Number(s.attendance || 0) >= 75).length;
        eligibleCountElem.innerText = eligible;
    }
    if (toppersCountElem) {
        const toppers = students.filter(s => Number(s.marks || 0) >= 85).length;
        toppersCountElem.innerText = toppers;
    }
}

// Render student rows
function renderStudents(list) {
    if (!tableBody) return;
    tableBody.innerHTML = "";

    if (list.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 30px; color:#6b7280;">No student records found</td></tr>`;
        return;
    }

    list.forEach((student, index) => {
        const attendanceColor = student.attendance >= 75 ? "#10b981" : "#ef4444";
        let statusBadge = '<span class="status-pill pass">Good</span>';
        if (student.marks >= 85) {
            statusBadge = '<span class="status-pill excellent">Topper</span>';
        } else if (student.attendance < 75) {
            statusBadge = '<span class="status-pill fail">Defaulter</span>';
        }

        const initials = student.name ? student.name.charAt(0).toUpperCase() : "S";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>#${student.id}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: #2563eb; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">
                        ${initials}
                    </div>
                    <div>
                        <div style="font-weight: 600;">${student.name}</div>
                        <div style="font-size: 12px; color: #6b7280;">${student.email || 'N/A'}</div>
                    </div>
                </div>
            </td>
            <td>${student.course}</td>
            <td>Semester ${student.semester}</td>
            <td style="min-width: 130px;">
                <span style="font-weight: 600; color: ${attendanceColor};">${student.attendance}%</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${student.attendance}%; background: ${attendanceColor};"></div>
                </div>
            </td>
            <td>
                <span style="font-weight: 600;">${student.marks}/100</span>
            </td>
            <td>${statusBadge}</td>
            <td style="text-align: right;">
                <button class="btn btn-primary btn-sm" onclick="openEditModal(${student.id})" style="margin-right: 6px;">
                    ✏️ Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteStudent(${student.id})">
                    🗑️ Delete
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function getFilteredList() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const selectedCourse = courseFilter ? courseFilter.value : "all";

    return students.filter(student => {
        const matchesQuery =
            student.name.toLowerCase().includes(query) ||
            String(student.id).includes(query) ||
            (student.email && student.email.toLowerCase().includes(query)) ||
            student.course.toLowerCase().includes(query);

        const matchesCourse = selectedCourse === "all" || student.course === selectedCourse;

        return matchesQuery && matchesCourse;
    });
}

function applyFilter() {
    renderStudents(getFilteredList());
}

if (searchInput) searchInput.addEventListener("input", applyFilter);
if (courseFilter) courseFilter.addEventListener("change", applyFilter);

// Modal handling
function openModal() {
    if (studentModal) studentModal.classList.add("active");
}

function closeModalHandler() {
    if (studentModal) studentModal.classList.remove("active");
    if (studentForm) studentForm.reset();
    if (editIndexInput) editIndexInput.value = "-1";
}

if (addStudentBtn) {
    addStudentBtn.addEventListener("click", () => {
        modalTitle.innerText = "Add New Student";
        document.getElementById("studentId").disabled = false;
        studentForm.reset();
        editIndexInput.value = "-1";
        openModal();
    });
}

if (closeModal) closeModal.addEventListener("click", closeModalHandler);
if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeModalHandler);

window.addEventListener("click", (e) => {
    if (e.target === studentModal) {
        closeModalHandler();
    }
});

// Edit student
window.openEditModal = function(id) {
    const student = students.find(s => s.id === id);
    if (!student) return;

    modalTitle.innerText = "Edit Student Details";
    editIndexInput.value = id;
    
    document.getElementById("studentId").value = student.id;
    document.getElementById("studentId").disabled = true;
    document.getElementById("studentName").value = student.name;
    document.getElementById("studentEmail").value = student.email || "";
    document.getElementById("studentCourse").value = student.course;
    document.getElementById("studentSemester").value = student.semester;
    document.getElementById("studentAttendance").value = student.attendance;
    document.getElementById("studentMarks").value = student.marks;

    openModal();
};

// Delete student
window.deleteStudent = function(id) {
    const student = students.find(s => s.id === id);
    const studentName = student ? student.name : "this student";

    if (confirm(`Are you sure you want to delete ${studentName}?`)) {
        students = students.filter(s => s.id !== id);
        saveStudents();
        applyFilter();
    }
};

// Form submission (Add / Edit)
if (studentForm) {
    studentForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const editId = parseInt(editIndexInput.value);
        const idVal = parseInt(document.getElementById("studentId").value);
        const nameVal = document.getElementById("studentName").value.trim();
        const emailVal = document.getElementById("studentEmail").value.trim();
        const courseVal = document.getElementById("studentCourse").value;
        const semesterVal = parseInt(document.getElementById("studentSemester").value);
        const attendanceVal = parseInt(document.getElementById("studentAttendance").value);
        const marksVal = parseInt(document.getElementById("studentMarks").value);

        if (editId === -1) {
            // Check for duplicate ID
            const exists = students.some(s => s.id === idVal);
            if (exists) {
                alert("A student with this ID already exists. Please choose a different ID.");
                return;
            }

            students.push({
                id: idVal,
                name: nameVal,
                email: emailVal,
                course: courseVal,
                semester: semesterVal,
                attendance: attendanceVal,
                marks: marksVal
            });
        } else {
            // Update existing student
            const index = students.findIndex(s => s.id === editId);
            if (index !== -1) {
                students[index] = {
                    id: editId,
                    name: nameVal,
                    email: emailVal,
                    course: courseVal,
                    semester: semesterVal,
                    attendance: attendanceVal,
                    marks: marksVal
                };
            }
        }

        saveStudents();
        applyFilter();
        closeModalHandler();
    });
}

// Export to CSV
if (exportBtn) {
    exportBtn.addEventListener("click", () => {
        if (students.length === 0) {
            alert("No student data available to export.");
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "ID,Name,Email,Course,Semester,Attendance(%),Marks\n";

        students.forEach(s => {
            const row = [
                s.id,
                `"${s.name}"`,
                `"${s.email || ''}"`,
                `"${s.course}"`,
                s.semester,
                s.attendance,
                s.marks
            ].join(",");
            csvContent += row + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `student_records_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

// Initial render
updateStats();
applyFilter();
