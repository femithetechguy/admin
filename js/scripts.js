console.log('[DEBUG] Page loaded (scripts.js)');
import { renderBehavioralTab } from "./behavioral.js";
import { renderInterviewPrepTab } from "./interview_prep.js";
import { renderResumeTab } from "./resume.js";
import { renderAppliedTab } from "./applied.js";

// --- Ensure Firebase Auth uses local persistence (persist login across reloads) ---
if (window.firebaseAuth && window.firebaseAuth.setPersistence && window.firebaseAuth.Auth && window.firebaseAuth.Auth.Persistence) {
  // Set persistence to local (default, but explicit)
  window.firebaseAuth.setPersistence(window.firebaseAuth.Auth.Persistence.LOCAL).catch(() => {});
}

// --- Ensure all required variables are defined ---
// Replace these with your actual logic/data as needed
let tabs = [];
let appRoot = document.getElementById('app-root') || document.body;
let config = { appName: 'Admin' };
let selectedTabIdx = 0;
let authUser = undefined; // Track auth state (undefined = not checked yet)

// --- DYNAMIC RENDERING: Always use tabs from app.json ---
fetch('json/app.json')
  .then(response => response.json())
  .then(appData => {
    config.appName = appData.appName || 'App';
    const dashboardPage = (appData.pages || []).find(p => p.name === 'Dashboard');
    if (dashboardPage && Array.isArray(dashboardPage.tabs)) {
      tabs = dashboardPage.tabs;
      window.tabs = tabs; // Ensure global reference is always up to date
    }
    console.log('[DEBUG] Tabs loaded:', tabs);
    window.renderAppUI = renderAppUI; // Ensure global reference is always up to date
    maybeRenderApp();
  })
  .catch(err => {
    console.error('Failed to load app.json:', err);
    // Optionally show an error message in the UI
  });

// Call this function after tabs and index variables are set up
function renderAppUI() {
  console.log('[DEBUG] renderAppUI', { authUser, selectedTabIdx });
  if (!config || !config.appName) {
    throw new Error('config must be initialized with appName before calling renderAppUI()');
  }
  appRoot.innerHTML = `
    <div id="login-page" class="flex items-center justify-center min-h-screen px-2">
      <form id="login-form" class="bg-white p-6 sm:p-8 rounded shadow-md w-full max-w-sm">
        <h2 class="text-2xl font-bold mb-6 text-center">${config.appName} Login</h2>
        <div class="mt-6 text-center">
          <button type="button" id="google-signin-btn" class="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-100 flex items-center justify-center gap-2 transition">
            <i class="bi bi-google text-lg text-red-500"></i> Sign in with Google
          </button>
        </div>
        <p id="login-error" class="text-red-500 text-sm mt-4 hidden text-center">Login failed. Please try again.</p>
      </form>
    </div>
    <div id="dashboard" class="hidden min-h-screen flex flex-col">
      <nav class="bg-white shadow sticky top-0 z-10">
        <div class="container mx-auto px-2 sm:px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 relative">
          <span class="text-xl font-bold flex items-center gap-2 mb-2 sm:mb-0">
            <i class="bi bi-kanban"></i> ${config.appName}
          </span>
          <!-- Hamburger for mobile -->
          <button id="hamburger" class="sm:hidden absolute right-2 top-3 text-2xl p-2 rounded focus:outline-none" aria-label="Open menu">
            <i class="bi bi-list"></i>
          </button>
          <ul class="flex flex-col sm:flex-row sm:w-auto sm:max-w-none max-w-xs space-y-2 sm:space-y-0 sm:space-x-4 bg-white sm:bg-transparent absolute sm:static right-0 left-auto top-12 sm:top-0 z-20 shadow sm:shadow-none p-4 sm:p-0 transition-all duration-200 ease-in-out hidden sm:flex" id="tabs-menu">
            ${tabs.map((tab, idx) => renderTabBtn(tab, idx)).join("")}
          </ul>
        </div>
      </nav>
      <main class="flex-1 container mx-auto px-2 sm:px-4 py-4 sm:py-8" id="tabs-content">
        ${tabs.map((tab, idx) => renderTabContent(tab, idx)).join("")}
      </main>
    </div>
  `;
  // Hamburger menu logic
  const hamburger = document.getElementById("hamburger");
  const tabsMenu = document.getElementById("tabs-menu");
  if (hamburger && tabsMenu) {
    hamburger.addEventListener("click", () => {
      tabsMenu.classList.toggle("hidden");
      hamburger.classList.toggle("bg-blue-100");
    });
    // Hide menu on tab click (mobile)
    tabsMenu.addEventListener("click", () => {
      if (window.innerWidth < 640) {
        tabsMenu.classList.add("hidden");
        hamburger.classList.remove("bg-blue-100");
      }
    });
    // Ensure menu is visible on resize
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 640) {
        tabsMenu.classList.remove("hidden");
      } else {
        tabsMenu.classList.add("hidden");
        hamburger.classList.remove("bg-blue-100");
      }
    });
  }
  setupLogic(config);

  // Always toggle dashboard/login visibility after every render
  setTimeout(() => {
    const loginPage = document.getElementById('login-page');
    const dashboard = document.getElementById('dashboard');
    if (authUser) {
      if (loginPage) loginPage.classList.add('hidden');
      if (dashboard) dashboard.classList.remove('hidden');
    } else {
      if (loginPage) loginPage.classList.remove('hidden');
      if (dashboard) dashboard.classList.add('hidden');
    }
  }, 0);
}

function renderTabBtn(tab, idx) {
  const activeClass = idx === selectedTabIdx ? 'bg-blue-100 font-bold' : '';
  const icon = tab.biIcon ? `<i class="bi ${tab.biIcon} mr-2"></i>` : '';
  return `<li><button class="tab-btn ${activeClass}" data-tab-idx="${idx}">${icon}${tab.name}</button></li>`;
}

function renderTabContent(tab, idx) {
  if (idx !== selectedTabIdx) return '';
  if (tab.name === "Behavioral") return renderBehavioralTab(tab);
  if (tab.name === "Interview Prep") return renderInterviewPrepTab(tab);
  if (tab.name === "Resume") return renderResumeTab(tab);
  if (tab.name === "Applied") return renderAppliedTab(tab);
  if (tab.name === "Logout") return '';
  return '';
}

function setupLogic(config) {
  // Attach Google sign-in event listener after UI is rendered
  const googleBtn = document.getElementById('google-signin-btn');
  if (googleBtn) {
    const newBtn = googleBtn.cloneNode(true);
    googleBtn.parentNode.replaceChild(newBtn, googleBtn);
    newBtn.addEventListener('click', async () => {
      newBtn.disabled = true;
      try {
        if (typeof signInWithGoogle === 'function') await signInWithGoogle();
      } finally {
        newBtn.disabled = false;
      }
    });
  }
  // Tab switching logic
  const tabsMenu = document.getElementById('tabs-menu');
  if (tabsMenu) {
    tabsMenu.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-tab-idx'), 10);
        if (!isNaN(idx) && tabs[idx]) {
          const tabName = (typeof tabs[idx].name === 'string') ? tabs[idx].name.trim().toLowerCase() : '';
          console.log('[DEBUG] Tab clicked:', tabName, tabs[idx].name);
          if (tabName === 'logout') {
            if (typeof signOutAndShowLogin === 'function') {
              console.log('[DEBUG] Logging out via Logout tab');
              signOutAndShowLogin();
              selectedTabIdx = 0;
              localStorage.setItem('selectedTabIdx', 0);
              return false;
            }
          } else {
            console.log('[DEBUG] Switching to tab:', tabName);
            selectedTabIdx = idx;
            localStorage.setItem('selectedTabIdx', idx);
            renderAppUI();
            return false;
          }
        }
      });
    });
  }
}

// --- SPA AUTH STATE HANDLING ---
// Wait for Firebase Auth to be ready, then render correct UI
if (window.firebaseAuth) {
  window.firebaseAuth.onAuthStateChanged((user) => {
    authUser = user;
    console.log('[DEBUG] Auth state changed:', authUser);
    maybeRenderApp();
  });
}

function maybeRenderApp() {
  // Only render when both tabs and authUser are ready
  if (Array.isArray(tabs) && tabs.length > 0 && typeof authUser !== 'undefined') {
    handleAuthAndTabsReady();
  }
}

function handleAuthAndTabsReady() {
  console.log('[DEBUG] handleAuthAndTabsReady', { authUser, tabs, selectedTabIdx });
  if (authUser) {
    // Restore last selected tab if valid, else default to 0
    let idx = parseInt(localStorage.getItem('selectedTabIdx'), 10);
    if (isNaN(idx) || idx < 0 || idx >= tabs.length) {
      idx = 0;
    }
    selectedTabIdx = idx;
    localStorage.setItem('selectedTabIdx', selectedTabIdx);
    console.log('[DEBUG] Rendering dashboard for user', { selectedTabIdx, tabs });
    renderAppUI();
    setTimeout(() => {
      const loginPage = document.getElementById('login-page');
      const dashboard = document.getElementById('dashboard');
      if (loginPage) loginPage.classList.add('hidden');
      if (dashboard) dashboard.classList.remove('hidden');
    }, 0);
  } else {
    // User is signed out, show login
    selectedTabIdx = 0;
    localStorage.setItem('selectedTabIdx', 0);
    console.log('[DEBUG] Rendering login page');
    renderAppUI();
    setTimeout(() => {
      const loginPage = document.getElementById('login-page');
      const dashboard = document.getElementById('dashboard');
      if (loginPage) loginPage.classList.remove('hidden');
      if (dashboard) dashboard.classList.add('hidden');
    }, 0);
  }
}

// Make renderAppUI and tabs globally accessible for cross-script calls
window.renderAppUI = renderAppUI;
window.tabs = tabs;

// Restore last selected tab after login
window.restoreTab = function() {
  const idx = parseInt(localStorage.getItem('selectedTabIdx'), 10);
  if (!isNaN(idx) && idx >= 0 && idx < tabs.length) {
    selectedTabIdx = idx;
    renderAppUI();
  }
};

// --- DEMO: Minimal working example for testing ---
// tabs = [
//   { name: "Behavioral" },
//   { name: "Interview Prep" },
//   { name: "Resume" },
//   { name: "Applied" },
//   { name: "Logout" }
// ];
// behavioralIdx = 0;
// interviewIdx = 1;
// resumeIdx = 2;
// appliedIdx = 3;
// logoutIdx = 4;
//
// // Call renderAppUI to test rendering
// renderAppUI();
// --- END DEMO ---

// TODO: Load your real tabs and set index variables here, then call renderAppUI() when ready.
