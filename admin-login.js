const ADMIN_SESSION_KEY = "base6AdminSession";

document.getElementById("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const error = document.getElementById("loginError");

  if (username === "admin" && password === "BASE6@2026") {
    sessionStorage.setItem(ADMIN_SESSION_KEY, "signed-in");
    window.location.href = "tools.html";
    return;
  }

  error.textContent = "Incorrect username or password.";
});

document.querySelectorAll("#loginForm input").forEach((input) => {
  input.addEventListener("input", () => {
    document.getElementById("loginError").textContent = "";
  });
});
