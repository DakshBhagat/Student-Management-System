const loginForm = document.getElementById("loginForm");
const username = document.getElementById("username");
const password = document.getElementById("password");
const showPassword = document.getElementById("showPassword");
const message = document.getElementById("message");

if (localStorage.getItem("loggedIn") === "true") {
    window.location.href = "dashboard.html";
}

if (showPassword) {
    showPassword.addEventListener("change", () => {
        password.type = showPassword.checked ? "text" : "password";
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const user = username.value.trim();
        const pass = password.value.trim();

        if (user === "admin" && pass === "admin123") {
            localStorage.setItem("loggedIn", "true");
            window.location.href = "dashboard.html";
        } else {
            message.style.color = "#ef4444";
            message.innerText = "Invalid Username or Password";
        }
    });
}
