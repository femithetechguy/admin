
// Dynamic SPA rendering from app.json
const appRoot = document.getElementById('app-root');
let appConfig = null;

fetch('json/app.json')
  .then(res => res.json())
  .then(config => {
    appConfig = config;
    renderApp(config);
  });

function renderApp(config) {
  // Render login and dashboard containers
  appRoot.innerHTML = `
    <div id="login-page" class="flex items-center justify-center min-h-screen px-2">
      <form id="login-form" class="bg-white p-6 sm:p-8 rounded shadow-md w-full max-w-sm">
        <h2 class="text-2xl font-bold mb-6 text-center">${config.appName} Login</h2>
        <div class="mb-4">
          <label class="block mb-1 font-medium" for="username">${config.pages[0].fields[0]}</label>
          <input class="w-full px-3 py-2 border rounded focus:outline-none focus:ring" type="text" id="username" required>
        </div>
        <div class="mb-6">
          <label class="block mb-1 font-medium" for="password">${config.pages[0].fields[1]}</label>
          <input class="w-full px-3 py-2 border rounded focus:outline-none focus:ring" type="password" id="password" required>
        </div>
        <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition flex items-center justify-center">
          <i class="bi bi-box-arrow-in-right mr-2"></i> Login
        </button>
        <p id="login-error" class="text-red-500 text-sm mt-4 hidden text-center">Invalid username or password.</p>
      </form>
    </div>
    <div id="dashboard" class="hidden min-h-screen flex flex-col">
      <nav class="bg-white shadow sticky top-0 z-10">
        <div class="container mx-auto px-2 sm:px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span class="text-xl font-bold flex items-center gap-2 mb-2 sm:mb-0">
            <i class="bi bi-kanban"></i> ${config.appName}
          </span>
          <ul class="flex flex-col sm:flex-row w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-4" id="tabs-menu">
            ${config.pages[1].tabs.map(tab => renderTabBtn(tab)).join('')}
          </ul>
        </div>
      </nav>
      <main class="flex-1 container mx-auto px-2 sm:px-4 py-4 sm:py-8" id="tabs-content">
        ${config.pages[1].tabs.map(tab => renderTabContent(tab)).join('')}
      </main>
    </div>
  `;
  setupLogic(config);
}

function renderTabBtn(tab) {
  const icons = {
    Resume: 'file-earmark-person',
    'Interview Prep': 'chat-dots',
    Applied: 'briefcase',
    Logout: 'box-arrow-right'
  };
  const color = tab.name === 'Logout' ? 'hover:bg-red-100 text-red-600' : 'hover:bg-blue-100';
  return `<li><button class="tab-btn px-3 py-2 rounded ${color} flex items-center" data-tab="${tab.name.toLowerCase().replace(/ /g,'-')}"><i class="bi bi-${icons[tab.name] || 'circle'} mr-1"></i> ${tab.name}</button></li>`;
}

function renderTabContent(tab) {
  if (tab.name === 'Resume') {
    return `<section id="tab-resume" class="tab-content">
      <h3 class="text-xl font-semibold mb-4 flex items-center"><i class="bi bi-file-earmark-person mr-2"></i> ${tab.name}</h3>
      <div class="bg-white p-4 sm:p-6 rounded shadow">
        <p class="mb-2">${tab.content[0]}</p>
        <input type="file" class="mb-2 w-full">
        <textarea class="w-full border rounded p-2 mt-2" rows="3" placeholder="${tab.content[1]}"></textarea>
      </div>
    </section>`;
  }
  if (tab.name === 'Interview Prep') {
    return `<section id="tab-interview-prep" class="tab-content hidden">
      <h3 class="text-xl font-semibold mb-4 flex items-center"><i class="bi bi-chat-dots mr-2"></i> ${tab.name}</h3>
      <div class="bg-white p-4 sm:p-6 rounded shadow overflow-x-auto">
        <table class="w-full mb-4 text-sm">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-2 text-left">Company</th>
              <th class="p-2 text-left">Role</th>
              <th class="p-2 text-left">Date</th>
              <th class="p-2 text-left">Notes</th>
            </tr>
          </thead>
          <tbody id="interview-tasks"></tbody>
        </table>
        <div class="flex flex-col sm:flex-row gap-2 mb-2">
          <input type="text" id="prep-company" class="border rounded p-2 flex-1" placeholder="Company">
          <input type="text" id="prep-role" class="border rounded p-2 flex-1" placeholder="Role">
          <input type="date" id="prep-date" class="border rounded p-2 flex-1">
          <input type="text" id="prep-notes" class="border rounded p-2 flex-1" placeholder="Notes">
          <button id="add-prep-task" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"><i class="bi bi-plus"></i></button>
        </div>
        <div class="text-sm text-gray-500">${tab.content[2]}</div>
      </div>
    </section>`;
  }
  if (tab.name === 'Applied') {
    return `<section id="tab-applied" class="tab-content hidden">
      <h3 class="text-xl font-semibold mb-4 flex items-center"><i class="bi bi-briefcase mr-2"></i> ${tab.name}</h3>
      <div class="bg-white p-4 sm:p-6 rounded shadow overflow-x-auto">
        <table class="w-full mb-4 text-sm">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-2 text-left">Company</th>
              <th class="p-2 text-left">Date</th>
              <th class="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody id="applied-jobs"></tbody>
        </table>
        <div class="flex flex-col sm:flex-row gap-2 mb-2">
          <input type="text" id="applied-company" class="border rounded p-2 flex-1" placeholder="Company">
          <input type="date" id="applied-date" class="border rounded p-2 flex-1">
          <select id="applied-status" class="border rounded p-2 flex-1">
            <option value="Interviewing">Interviewing</option>
            <option value="Rejected">Rejected</option>
            <option value="Offer">Offer</option>
          </select>
          <button id="add-applied-job" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"><i class="bi bi-plus"></i></button>
        </div>
        <div class="text-sm text-gray-500">${tab.content[2]}</div>
      </div>
    </section>`;
  }
  if (tab.name === 'Logout') {
    return '';
  }
  return '';
}

function setupLogic(config) {
  // Credentials
  const DEMO_USER = config.security.dummyCredentials;
  // DOM Elements
  const loginPage = document.getElementById('login-page');
  const dashboard = document.getElementById('dashboard');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const tabsMenu = document.getElementById('tabs-menu');
  const tabContents = document.querySelectorAll('.tab-content');

  // Login logic
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();
      if (username === DEMO_USER.username && password === DEMO_USER.password) {
        loginPage.classList.add('hidden');
        dashboard.classList.remove('hidden');
        loginError.classList.add('hidden');
        showDefaultTab();
      } else {
        loginError.classList.remove('hidden');
      }
    });
  }

  // Tab navigation
  if (tabsMenu) {
    tabsMenu.addEventListener('click', function(e) {
      if (e.target.closest('.tab-btn')) {
        const tab = e.target.closest('.tab-btn').dataset.tab;
        if (tab === 'logout') {
          dashboard.classList.add('hidden');
          loginPage.classList.remove('hidden');
          loginForm.reset();
          return;
        }
        tabContents.forEach(section => {
          section.classList.add('hidden');
        });
        const tabId = tab === 'interview-prep' ? 'tab-interview-prep' : 'tab-' + tab;
        const tabSection = document.getElementById(tabId);
        if (tabSection) tabSection.classList.remove('hidden');
      }
    });
  }

  // Interview Prep: Add Task
  const interviewTasks = document.getElementById('interview-tasks');
  const addPrepTask = document.getElementById('add-prep-task');
  if (addPrepTask) {
    addPrepTask.addEventListener('click', function() {
      const company = document.getElementById('prep-company').value.trim();
      const role = document.getElementById('prep-role').value.trim();
      const date = document.getElementById('prep-date').value;
      const notes = document.getElementById('prep-notes').value.trim();
      if (company && role && date) {
        const row = document.createElement('tr');
        row.innerHTML = `<td class='p-2'>${company}</td><td class='p-2'>${role}</td><td class='p-2'>${date}</td><td class='p-2'>${notes}</td>`;
        interviewTasks.appendChild(row);
        document.getElementById('prep-company').value = '';
        document.getElementById('prep-role').value = '';
        document.getElementById('prep-date').value = '';
        document.getElementById('prep-notes').value = '';
      }
    });
  }

  // Applied: Add Job
  const appliedJobs = document.getElementById('applied-jobs');
  const addAppliedJob = document.getElementById('add-applied-job');
  if (addAppliedJob) {
    addAppliedJob.addEventListener('click', function() {
      const company = document.getElementById('applied-company').value.trim();
      const date = document.getElementById('applied-date').value;
      const status = document.getElementById('applied-status').value;
      if (company && date && status) {
        const row = document.createElement('tr');
        row.innerHTML = `<td class='p-2'>${company}</td><td class='p-2'>${date}</td><td class='p-2'>${status}</td>`;
        appliedJobs.appendChild(row);
        document.getElementById('applied-company').value = '';
        document.getElementById('applied-date').value = '';
        document.getElementById('applied-status').value = 'Interviewing';
      }
    });
  }

  // Default: show Resume tab on login
  function showDefaultTab() {
    tabContents.forEach(section => section.classList.add('hidden'));
    const resumeTab = document.getElementById('tab-resume');
    if (resumeTab) resumeTab.classList.remove('hidden');
  }
}
