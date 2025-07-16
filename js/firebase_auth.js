console.log("[DEBUG] Page loaded (firebase_auth.js)");

// Do NOT initialize Firebase here! It is already initialized in your HTML.

// Get the Auth service
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

window.firebaseAuth = auth;
window.firebaseGoogleProvider = googleProvider;

// Add global Google sign-in function for use in scripts.js
window.signInWithGoogle = function () {
  auth
    .signInWithPopup(googleProvider)
    .then((result) => {
      const loginPage = document.getElementById("login-page");
      const dashboard = document.getElementById("dashboard");
      if (loginPage) loginPage.classList.add("hidden");
      if (dashboard) dashboard.classList.remove("hidden");
      if (window.tabs && window.tabs.length > 0) {
        window.selectedTabIdx = 0;
        localStorage.setItem("selectedTabIdx", 0);
      }
      if (typeof window.renderAppUI === "function") window.renderAppUI();
    })
    .catch((error) => {
      console.error("Google sign-in error:", error);
      const loginError = document.getElementById("login-error");
      if (loginError) {
        loginError.textContent = "Login failed. Please try again.";
        loginError.classList.remove("hidden");
      }
    });
};

window.signOutAndShowLogin = function () {
  console.log("[DEBUG] signOutAndShowLogin called");
  auth.signOut().then(() => {
    const loginPage = document.getElementById("login-page");
    const dashboard = document.getElementById("dashboard");
    if (loginPage) loginPage.classList.remove("hidden");
    if (dashboard) dashboard.classList.add("hidden");
  });
};
