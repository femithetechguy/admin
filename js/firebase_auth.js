console.log('[DEBUG] Page loaded (firebase_auth.js)');
// Initialize Firebase
// Replace the below config object with your actual Firebase project config from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDefgrzPi5Gqq_rIAVvazYH1dGJ3YmNbok",
  authDomain: "kolawolesadmin.firebaseapp.com",
  projectId: "kolawolesadmin",
  storageBucket: "kolawolesadmin.firebasestorage.app",
  messagingSenderId: "305741254750",
  appId: "1:305741254750:web:d2849cf1baebb8d38424cf",
  measurementId: "G-2S91LL8TNC",
};

// Initialize Firebase app (only if not already initialized)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Get the Auth service
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Export for use in other scripts (if using modules, otherwise these are global)
window.firebaseAuth = auth;
window.firebaseGoogleProvider = googleProvider;

// Force sign out on every page load
// firebase.auth().signOut();

// Add global Google sign-in function for use in scripts.js
window.signInWithGoogle = function() {
  auth.signInWithPopup(googleProvider)
    .then((result) => {
      // Show dashboard, hide login
      const loginPage = document.getElementById('login-page');
      const dashboard = document.getElementById('dashboard');
      if (loginPage) loginPage.classList.add('hidden');
      if (dashboard) dashboard.classList.remove('hidden');
      // Always select the first tab after login
      if (window.tabs && window.tabs.length > 0) {
        window.selectedTabIdx = 0;
        localStorage.setItem('selectedTabIdx', 0);
      }
      if (typeof window.renderAppUI === 'function') window.renderAppUI();
    })
    .catch((error) => {
      // Handle Errors here.
      console.error('Google sign-in error:', error);
      const loginError = document.getElementById('login-error');
      if (loginError) {
        loginError.textContent = 'Login failed. Please try again.';
        loginError.classList.remove('hidden');
      }
    });
};

// Add global logout function
window.signOutAndShowLogin = function() {
  console.log('[DEBUG] signOutAndShowLogin called');
  auth.signOut().then(() => {
    // Show login, hide dashboard
    const loginPage = document.getElementById('login-page');
    const dashboard = document.getElementById('dashboard');
    if (loginPage) loginPage.classList.remove('hidden');
    if (dashboard) dashboard.classList.add('hidden');
  });
};
