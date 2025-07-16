// Applied tab logic

import { showPopup } from './popup.js';

export function renderAppliedTab(tab) {
  setTimeout(() => {
    fetch('json/applied.json')
      .then(res => res.json())
      .then(data => {
        const jobs = Array.isArray(data.jobs) ? data.jobs : [];
        const container = document.getElementById('applied-jobs-container');
        if (!container) return;
        if (jobs.length === 0) {
          container.innerHTML = `<div class="text-gray-500 text-center py-8">No applied jobs found.</div>`;
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
                      <span class="inline-block px-2 py-1 rounded text-xs font-bold ${job.status === 'submitted' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}">${job.status}</span>
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
                  <span class="inline-block px-2 py-1 rounded text-xs font-bold ${job.status === 'submitted' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}">${job.status}</span>
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
            // Try to fetch the link, if fails (CORS), show fallback message
            fetch(url, { method: 'GET', mode: 'cors' })
              .then(res => {
                if (!res.ok) throw new Error('Not OK');
                return res.text();
              })
              .then(text => {
                // Try to extract <body> if present
                const match = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
                const html = match ? match[1] : text;
                showPopup({ title, html });
              })
              .catch(() => {
                showPopup({
                  title,
                  html: `<div class='text-center py-8'>
                    <div class='text-gray-500 mb-4'>Preview not available for this link due to site restrictions.</div>
                    <a href='${url}' target='_blank' rel='noopener' class='inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition'>Open in new tab</a>
                  </div>`
                });
              });
          });
        });
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
