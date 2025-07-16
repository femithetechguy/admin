
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
  // Reorder tabs: Applied first, Interview Prep, Behavioral, others, Resume, Logout
  let tabs = config.pages[1].tabs.slice();
  // Add Behavioral tab if not present
  if (!tabs.some(t => t.name === 'Behavioral')) {
    tabs.push({ name: 'Behavioral', content: ['Behavioral content goes here.'] });
  }
  const appliedIdx = tabs.findIndex(t => t.name === 'Applied');
  const interviewIdx = tabs.findIndex(t => t.name === 'Interview Prep');
  const behavioralIdx = tabs.findIndex(t => t.name === 'Behavioral');
  const resumeIdx = tabs.findIndex(t => t.name === 'Resume');
  const logoutIdx = tabs.findIndex(t => t.name === 'Logout');
  let newTabs = [];
  if (appliedIdx !== -1) newTabs.push(tabs[appliedIdx]);
  if (interviewIdx !== -1) newTabs.push(tabs[interviewIdx]);
  if (behavioralIdx !== -1) newTabs.push(tabs[behavioralIdx]);
  // Add all tabs except Applied, Interview Prep, Behavioral, Resume, Logout
  newTabs = newTabs.concat(tabs.filter((t, i) => i !== appliedIdx && i !== interviewIdx && i !== behavioralIdx && i !== resumeIdx && i !== logoutIdx));
  // Add Resume second to last
  if (resumeIdx !== -1) newTabs.push(tabs[resumeIdx]);
  // Add Logout last
  if (logoutIdx !== -1) newTabs.push(tabs[logoutIdx]);
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
        <div class="container mx-auto px-2 sm:px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 relative">
          <span class="text-xl font-bold flex items-center gap-2 mb-2 sm:mb-0">
            <i class="bi bi-kanban"></i> ${config.appName}
          </span>
          <!-- Hamburger for mobile -->
          <button id="hamburger" class="sm:hidden absolute right-2 top-3 text-2xl p-2 rounded focus:outline-none" aria-label="Open menu">
            <i class="bi bi-list"></i>
          </button>
          <ul class="flex flex-col sm:flex-row sm:w-auto sm:max-w-none max-w-xs space-y-2 sm:space-y-0 sm:space-x-4 bg-white sm:bg-transparent absolute sm:static right-0 left-auto top-12 sm:top-0 z-20 shadow sm:shadow-none p-4 sm:p-0 transition-all duration-200 ease-in-out hidden sm:flex" id="tabs-menu">
            ${newTabs.map(tab => renderTabBtn(tab)).join('')}
          </ul>
        </div>
      </nav>
      <main class="flex-1 container mx-auto px-2 sm:px-4 py-4 sm:py-8" id="tabs-content">
        ${newTabs.map(tab => renderTabContent(tab)).join('')}
      </main>
    </div>
  `;
  // Hamburger menu logic
  const hamburger = document.getElementById('hamburger');
  const tabsMenu = document.getElementById('tabs-menu');
  if (hamburger && tabsMenu) {
    hamburger.addEventListener('click', () => {
      tabsMenu.classList.toggle('hidden');
      hamburger.classList.toggle('bg-blue-100');
    });
    // Hide menu on tab click (mobile)
    tabsMenu.addEventListener('click', () => {
      if (window.innerWidth < 640) {
        tabsMenu.classList.add('hidden');
        hamburger.classList.remove('bg-blue-100');
      }
    });
    // Ensure menu is visible on resize
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 640) {
        tabsMenu.classList.remove('hidden');
      } else {
        tabsMenu.classList.add('hidden');
        hamburger.classList.remove('bg-blue-100');
      }
    });
  }
  setupLogic(config);
}

function renderTabBtn(tab) {
  const icons = {
    Resume: 'file-earmark-person',
    'Interview Prep': 'chat-dots',
    Applied: 'briefcase',
    Behavioral: 'person-lines-fill',
    Logout: 'box-arrow-right'
  };
  const color = tab.name === 'Logout' ? 'hover:bg-red-100 text-red-600' : 'hover:bg-blue-100';
  return `<li><button class="tab-btn px-3 py-2 rounded ${color} flex items-center" data-tab="${tab.name.toLowerCase().replace(/ /g,'-')}"><i class="bi bi-${icons[tab.name] || 'circle'} mr-1"></i> ${tab.name}</button></li>`;
}

function renderTabContent(tab) {
  if (tab.name === 'Behavioral') {
    function renderBehavioral() {
      fetch('json/behavioral.json?_=' + Date.now())
        .then(res => res.json())
        .then(data => {
          const wrap = document.getElementById('behavioral-card-wrap');
          if (!wrap) return;
          wrap.innerHTML = '';
          let idx = 0;
          for (const [question, obj] of Object.entries(data)) {
            let baseClass = idx % 2 === 0 ? 'bg-gray-50' : 'bg-white';
            const card = document.createElement('div');
            card.className = `mb-3 rounded shadow p-3 border-l-4 border-blue-500 transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-xl cursor-pointer ${baseClass}`;
            card.innerHTML = `
              <div class=\"font-bold text-base mb-2 flex items-center\"><i class=\"bi bi-chat-quote mr-2 text-blue-600\"></i>${question}</div>
              <div class=\"mb-1\"><span class=\"font-semibold\">Situation:</span> <span class=\"text-gray-700\">${obj.situation}</span></div>
              <div class=\"mb-1\"><span class=\"font-semibold\">Task:</span> <span class=\"text-gray-700\">${obj.task}</span></div>
              <div class=\"mb-1\"><span class=\"font-semibold\">Action:</span> <span class=\"text-gray-700\">${obj.action}</span></div>
              <div class=\"mb-1\"><span class=\"font-semibold\">Result:</span> <span class=\"text-gray-700\">${obj.result}</span></div>
              ${obj.skills ? `<div class='mb-1'><span class='font-semibold'>Skills:</span> <span class='text-gray-700'>${obj.skills.join(', ')}</span></div>` : ''}
            `;
            wrap.appendChild(card);
            idx++;
          }
        });
    }
    setTimeout(() => {
      renderBehavioral();
      window.behavioralInterval && clearInterval(window.behavioralInterval);
      window.behavioralInterval = setInterval(renderBehavioral, 5000);
    }, 0);
    return `<section id=\"tab-behavioral\" class=\"tab-content hidden\">\n      <h3 class=\"text-xl font-semibold mb-4 flex items-center\"><i class=\"bi bi-person-lines-fill mr-2\"></i> ${tab.name}</h3>\n      <div id=\"behavioral-card-wrap\"></div>\n    </section>`;
  }
  if (tab.name === 'Resume') {
    setTimeout(() => {
      const card = document.createElement('div');
      card.className = 'bg-white p-4 sm:p-6 rounded shadow mt-4 overflow-x-auto';
      card.innerHTML = `
        <h4 class="text-lg font-semibold mb-2 flex items-center"><i class="bi bi-file-earmark-pdf mr-2 text-red-600"></i> Resume Folder (Google Drive)</h4>
        <div class="w-full" style="min-height:500px;">
          <iframe src="https://drive.google.com/embeddedfolderview?id=1gxb2bAIcYI0PffKOTDkHirW6udH3lN-6#grid" class="w-full rounded border border-gray-200" style="min-height:500px; height:75vh; max-height:90vh; border:none;"></iframe>
        </div>
        <div class="mt-2 text-right">
          <a href="https://drive.google.com/drive/u/0/folders/1gxb2bAIcYI0PffKOTDkHirW6udH3lN-6" target="_blank" class="text-blue-600 hover:underline flex items-center justify-end"><i class="bi bi-download mr-1"></i>Open Resume Folder</a>
        </div>
      `;
      const section = document.getElementById('tab-resume');
      if (section) section.appendChild(card);
    }, 0);
    return `<section id="tab-resume" class="tab-content">
      <h3 class="text-xl font-semibold mb-4 flex items-center"><i class="bi bi-file-earmark-person mr-2"></i> ${tab.name}</h3>
      <!-- Resume PDF card will be injected here -->
    </section>`;
  }
  if (tab.name === 'Interview Prep') {
    function renderInterviewQA() {
      fetch('json/interviewqa.json?_=' + Date.now())
        .then(res => res.json())
        .then(data => {
          const wrap = document.getElementById('interviewqa-card-wrap');
          if (!wrap) return;
          wrap.innerHTML = '';
          let idx = 0;
          for (const q of data.questions) {
            let baseClass = idx % 2 === 0 ? 'bg-gray-50' : 'bg-white';
            const card = document.createElement('div');
            card.className = `mb-3 rounded shadow p-3 border-l-4 border-blue-500 transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-xl cursor-pointer ${baseClass}`;
            card.innerHTML = `
              <div class=\"font-bold text-base mb-2 flex items-center\"><i class=\"bi bi-question-circle mr-2 text-blue-600\"></i>${q.question}</div>
              <div class=\"mb-1\"><span class=\"font-semibold\">Answer:</span> <span class=\"text-gray-700\">${q.answer}</span></div>
              <div class=\"mb-1\"><span class=\"font-semibold\">Category:</span> <span class=\"text-gray-700\">${q.category}</span></div>
              <div class=\"mb-1\"><span class=\"font-semibold\">Skills:</span> <span class=\"text-gray-700\">${q.skills.join(', ')}</span></div>
            `;
            wrap.appendChild(card);
            idx++;
          }
        });
    }
    setTimeout(() => {
      renderInterviewQA();
      window.interviewQAInterval && clearInterval(window.interviewQAInterval);
      window.interviewQAInterval = setInterval(renderInterviewQA, 5000);
    }, 0);
    return `<section id=\"tab-interview-prep\" class=\"tab-content hidden\">\n      <h3 class=\"text-xl font-semibold mb-4 flex items-center\"><i class=\"bi bi-chat-dots mr-2\"></i> ${tab.name}</h3>\n      <div id=\"interviewqa-card-wrap\"></div>\n    </section>`;
  }
  if (tab.name === 'Applied') {
    setTimeout(() => {
      function renderJobs(jobs) {
        // Responsive: show table on desktop, cards on mobile
        const tableWrap = document.getElementById('applied-table-wrap');
        const cardWrap = document.getElementById('applied-card-wrap');
        if (!tableWrap || !cardWrap) return;
        // Table (desktop)
        const tbody = document.getElementById('applied-jobs');
        if (tbody) {
          tbody.innerHTML = '';
          jobs.forEach((job, idx) => {
            let baseClass = idx % 2 === 0 ? 'bg-gray-50' : 'bg-white';
            let statusClass = '';
            if (job.status === 'interview') statusClass = 'border-l-4 border-blue-400';
            else if (job.status === 'rejected') statusClass = 'border-l-4 border-red-400';
            else if (job.status === 'offer') statusClass = 'border-l-4 border-green-400';
            else if (job.status === 'submitted') statusClass = 'border-l-4 border-gray-400';
            const row = document.createElement('tr');
            row.className = `transition-all duration-200 ease-in-out transform hover:scale-x-95 hover:shadow-xl cursor-pointer ${baseClass} ${statusClass}`;
            row.innerHTML = `
              <td class='p-2'>${job.company || ''}</td>
              <td class='p-2'>${job.position || ''}</td>
              <td class='p-2'>${job.location || ''}</td>
              <td class='p-2'>${job.dateApplied || ''}</td>
              <td class='p-2'>${job.applicationLink ? `<a href='${job.applicationLink}' target='_blank' class='text-blue-600 underline'>Link</a>` : ''}</td>
              <td class='p-2'>${job.resumeUsed ? `<a href='${job.resumeUsed}' target='_blank' class='text-blue-600 underline'>Resume</a>` : ''}</td>
              <td class='p-2'>${job.coverLetterUsed ? `<a href='${job.coverLetterUsed}' target='_blank' class='text-blue-600 underline'>Cover</a>` : ''}</td>
              <td class='p-2 font-semibold capitalize'>${job.status || ''}</td>
              <td class='p-2'>${job.isActive === false ? '<span class="text-red-500">Closed</span>' : '<span class="text-green-600">Active</span>'}</td>
              <td class='p-2 text-xs text-gray-600'>${job.notes || ''}</td>
            `;
            tbody.appendChild(row);
          });
        }
        // Cards (mobile)
        cardWrap.innerHTML = '';
        jobs.forEach((job, idx) => {
          let baseClass = idx % 2 === 0 ? 'bg-gray-50' : 'bg-white';
          let statusClass = '';
          if (job.status === 'interview') statusClass = 'border-l-4 border-blue-400';
          else if (job.status === 'rejected') statusClass = 'border-l-4 border-red-400';
          else if (job.status === 'offer') statusClass = 'border-l-4 border-green-400';
          else if (job.status === 'submitted') statusClass = 'border-l-4 border-gray-400';
          const card = document.createElement('div');
          card.className = `mb-3 rounded shadow p-3 transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-xl cursor-pointer ${baseClass} ${statusClass}`;
          card.innerHTML = `
            <div class="flex items-center mb-2">
              <span class="font-bold text-base mr-2">${job.company || ''}</span>
              <span class="text-xs text-gray-500">${job.position || ''}</span>
            </div>
            <div class="flex flex-wrap gap-2 mb-1">
              <span class="text-xs bg-gray-200 rounded px-2 py-0.5">${job.location || ''}</span>
              <span class="text-xs bg-blue-100 rounded px-2 py-0.5">${job.dateApplied || ''}</span>
              <span class="text-xs bg-gray-100 rounded px-2 py-0.5">${job.status || ''}</span>
              <span class="text-xs ${job.isActive === false ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'} rounded px-2 py-0.5">${job.isActive === false ? 'Closed' : 'Active'}</span>
            </div>
            <div class="flex flex-wrap gap-2 mb-1">
              ${job.applicationLink ? `<a href='${job.applicationLink}' target='_blank' class='text-blue-600 underline text-xs'>Link</a>` : ''}
              ${job.resumeUsed ? `<a href='${job.resumeUsed}' target='_blank' class='text-blue-600 underline text-xs'>Resume</a>` : ''}
              ${job.coverLetterUsed ? `<a href='${job.coverLetterUsed}' target='_blank' class='text-blue-600 underline text-xs'>Cover</a>` : ''}
            </div>
            <div class="text-xs text-gray-600">${job.notes || ''}</div>
          `;
          cardWrap.appendChild(card);
        });
      }
      function fetchJobs() {
        fetch('json/applied.json?_=' + Date.now())
          .then(res => res.json())
          .then(data => renderJobs(data.jobs || []));
      }
      fetchJobs();
      // Poll for changes every 5 seconds
      window.appliedJobsInterval && clearInterval(window.appliedJobsInterval);
      window.appliedJobsInterval = setInterval(fetchJobs, 5000);
    }, 0);
    return `<section id="tab-applied" class="tab-content hidden">
      <h3 class="text-xl font-semibold mb-4 flex items-center"><i class="bi bi-briefcase mr-2"></i> ${tab.name}</h3>
      <div class="bg-white p-2 sm:p-6 rounded shadow">
        <!-- Table for desktop -->
        <div id="applied-table-wrap" class="hidden sm:block overflow-x-auto">
          <table class="min-w-[700px] w-full mb-4 text-xs sm:text-sm">
            <thead>
              <tr class="bg-gray-100">
                <th class="p-2 text-left whitespace-nowrap">Company</th>
                <th class="p-2 text-left whitespace-nowrap">Position</th>
                <th class="p-2 text-left whitespace-nowrap">Location</th>
                <th class="p-2 text-left whitespace-nowrap">Date Applied</th>
                <th class="p-2 text-left whitespace-nowrap">Link</th>
                <th class="p-2 text-left whitespace-nowrap">Resume</th>
                <th class="p-2 text-left whitespace-nowrap">Cover</th>
                <th class="p-2 text-left whitespace-nowrap">Status</th>
                <th class="p-2 text-left whitespace-nowrap">Active</th>
                <th class="p-2 text-left whitespace-nowrap">Notes</th>
              </tr>
            </thead>
            <tbody id="applied-jobs"></tbody>
          </table>
        </div>
        <!-- Cards for mobile -->
        <div id="applied-card-wrap" class="block sm:hidden"></div>
        <div class="text-sm text-gray-500 mt-2">${tab.content[2]}</div>
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

  // Default: show Applied tab on login
  function showDefaultTab() {
    tabContents.forEach(section => section.classList.add('hidden'));
    const appliedTab = document.getElementById('tab-applied');
    if (appliedTab) appliedTab.classList.remove('hidden');
  }
}
