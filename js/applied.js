// Applied tab logic

// showPopup is expected to be globally available (from popup.js loaded via <script> tag)

window.renderAppliedTab = function(tab) {
  setTimeout(async () => {
    // Wait for Firebase Auth user
    let userId = null;
    if (window.firebaseAuth && window.firebaseAuth.currentUser) {
      userId = window.firebaseAuth.currentUser.uid;
    } else if (window.firebase && window.firebase.auth) {
      const user = window.firebase.auth().currentUser;
      if (user) userId = user.uid;
    }
    fetch('json/applied.json')
      .then(async res => {
        const data = await res.json();
        let jobs = Array.isArray(data.jobs) ? data.jobs : [];
        const statusOptions = Array.isArray(data.statusOptions) ? data.statusOptions : [];
        // --- Firestore jobs logic ---
        let firestoreJobs = {};
        if (userId && window.fetchJobs) {
          try {
            firestoreJobs = await window.fetchJobs(userId);
          } catch (e) { firestoreJobs = {}; }
        }
        jobs = jobs.map((job, i) => {
          const key = String(job.serial_no || i);
          if (firestoreJobs[key]) {
            // Merge Firestore job object (user's edits) with local job (from JSON)
            return { ...job, ...firestoreJobs[key] };
          }
          return job;
        });
        const container = document.getElementById('applied-jobs-container');
        if (!container) return;
        if (jobs.length === 0) {
          container.innerHTML = `<div class=\"text-gray-500 text-center py-8\">No applied jobs found.</div>`;
          return;
        }
        // Responsive: Table on desktop, cards on mobile
        container.innerHTML = `
          <div class="hidden sm:block">
            <table class="min-w-full bg-white rounded shadow overflow-hidden">
              <thead class="bg-blue-50">
                <tr>
                  <th class="px-4 py-2 text-left">#</th>
                  <th class="px-4 py-2 text-left">Company</th>
                  <th class="px-4 py-2 text-left">Position</th>
                  <th class="px-4 py-2 text-left">Location</th>
                  <th class="px-4 py-2 text-left">Date</th>
                  <th class="px-4 py-2 text-left">Status</th>
                  <th class="px-4 py-2 text-left">Notes</th>
                  <th class="px-4 py-2 text-left">Link</th>
                </tr>
              </thead>
              <tbody>
                ${jobs.map((job, i) => `
                  <tr class="hover:bg-blue-50 transition">
                    <td class="px-4 py-2">${job.serial_no}</td>
                    <td class="px-4 py-2 font-semibold">${job.company}</td>
                    <td class="px-4 py-2">${job.position}</td>
                    <td class="px-4 py-2">${job.location}</td>
                    <td class="px-4 py-2">${job.dateApplied}</td>
                    <td class="px-4 py-2">
                      <select class="status-dropdown px-2 py-1 rounded border border-gray-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-200 transition" data-job-idx="${i}">
                        ${statusOptions.map(opt => `<option value="${opt}" ${opt === job.status ? 'selected' : ''}>${opt.charAt(0).toUpperCase() + opt.slice(1)}</option>`).join('')}
                      </select>
                    </td>
                    <td class="px-4 py-2 text-xs text-gray-600">${job.notes || ''}</td>
                    <td class="px-4 py-2">
                      <a href="#" class="text-blue-600 hover:underline applied-link" data-link="${encodeURIComponent(job.applicationLink)}" data-title="${job.position} at ${job.company}">View</a>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="sm:hidden flex flex-col gap-4">
            ${jobs.map((job, i) => `
              <div class="bg-white rounded shadow p-4 hover:shadow-lg transition group border border-gray-100 hover:border-blue-300">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-bold text-blue-700 text-lg">${job.company}</span>
                  <select class="status-dropdown px-2 py-1 rounded border border-gray-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-200 transition" data-job-idx="${i}">
                    ${statusOptions.map(opt => `<option value="${opt}" ${opt === job.status ? 'selected' : ''}>${opt.charAt(0).toUpperCase() + opt.slice(1)}</option>`).join('')}
                  </select>
                </div>
                <div class="text-gray-800 font-semibold mb-1">${job.position}</div>
                <div class="text-gray-500 text-sm mb-1"><i class="bi bi-geo-alt mr-1"></i> ${job.location}</div>
                <div class="text-gray-400 text-xs mb-2">Applied: ${job.dateApplied}</div>
                <div class="text-gray-600 text-xs mb-2">${job.notes || ''}</div>
                <a href="#" class="text-blue-600 hover:underline font-medium applied-link" data-link="${encodeURIComponent(job.applicationLink)}" data-title="${job.position} at ${job.company}">View Application</a>
              </div>
            `).join('')}
          </div>
        `;
        // Attach popup logic to all .applied-link anchors
        container.querySelectorAll('.applied-link').forEach(link => {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            const url = decodeURIComponent(link.getAttribute('data-link'));
            const title = link.getAttribute('data-title') || 'Application';
            // Always show popup with open-in-new-tab message (skip fetch)
            showPopup({
              title,
              html: `<div class='text-center py-8'>
                <div class='text-gray-500 mb-4'>Preview not available for this link due to site restrictions.</div>
                <a href='${url}' target='_blank' rel='noopener' class='inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition'>Open in new tab</a>
              </div>`
            });
          });
        });
        // Attach status dropdown change logic (persist to localStorage)
        container.querySelectorAll('.status-dropdown').forEach(dropdown => {
          dropdown.addEventListener('change', async (e) => {
            const idx = parseInt(dropdown.getAttribute('data-job-idx'), 10);
            const newStatus = dropdown.value;
            // UI only: update the dropdown's style (optional)
            dropdown.classList.add('ring-2', 'ring-blue-400');
            setTimeout(() => dropdown.classList.remove('ring-2', 'ring-blue-400'), 600);
            // Persist the whole job object to Firestore
            const key = String(jobs[idx].serial_no || idx);
            if (userId && window.updateJob) {
              try {
                const updatedJob = { ...jobs[idx], status: newStatus };
                await window.updateJob(userId, key, updatedJob);
                showToast(`Status updated to <b>${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</b>`, 'success');
              } catch (err) {
                showToast('Failed to update job in Firestore', 'error');
              }
            } else {
              showToast('User not authenticated', 'error');
            }
          });
        });

        // Toast utility
        function showToast(message, type = 'info') {
          // Remove any existing toast
          const existing = document.getElementById('custom-toast');
          if (existing) existing.remove();
          const toast = document.createElement('div');
          toast.id = 'custom-toast';
          toast.className = `fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded shadow-lg text-white text-sm font-medium animate-fadeIn pointer-events-none ${type === 'success' ? 'bg-green-600' : 'bg-blue-600'}`;
          toast.innerHTML = message;
          document.body.appendChild(toast);
          setTimeout(() => {
            toast.classList.add('animate-fadeOut');
            setTimeout(() => toast.remove(), 400);
          }, 1800);
        }
      })
      .catch(() => {
        const container = document.getElementById('applied-jobs-container');
        if (container) container.innerHTML = `<div class="text-red-500 text-center py-8">Failed to load applied jobs.</div>`;
      });
  }, 0);
  // Initial skeleton
  return `<section id="tab-applied" class="tab-content">
    <h3 class="text-xl font-semibold mb-4 flex items-center"><i class="bi bi-briefcase mr-2"></i> ${tab.name}</h3>
    <div id="applied-jobs-container" class="min-h-[120px] flex items-center justify-center">
      <div class="w-full flex justify-center py-8">
        <span class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></span>
      </div>
    </div>
  </section>`;
}
