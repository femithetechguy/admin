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
