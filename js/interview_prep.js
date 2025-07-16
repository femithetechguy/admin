// Interview Prep tab logic

export function renderInterviewPrepTab(tab) {
  // Visible placeholder content
  setTimeout(() => {
    fetch('json/interview_prep.json')
      .then(res => res.json())
      .then(data => {
        const questions = Array.isArray(data.questions) ? data.questions : [];
        const container = document.getElementById('interview-prep-questions-container');
        if (!container) return;
        if (questions.length === 0) {
          container.innerHTML = `<div class="text-gray-500 text-center py-8">No interview prep questions found.</div>`;
          return;
        }
        container.innerHTML = `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${questions.map(q => renderInterviewCard(q)).join('')}
          </div>
        `;
      })
      .catch(() => {
        const container = document.getElementById('interview-prep-questions-container');
        if (container) container.innerHTML = `<div class="text-red-500 text-center py-8">Failed to load interview prep questions.</div>`;
      });
  }, 0);
  // Initial skeleton
  return `<section id="tab-interview-prep" class="tab-content">
    <h3 class="text-xl font-semibold mb-4 flex items-center"><i class="bi bi-lightbulb mr-2"></i> ${tab.name}</h3>
    <div id="interview-prep-questions-container" class="min-h-[120px] flex items-center justify-center">
      <div class="w-full flex justify-center py-8">
        <span class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></span>
      </div>
    </div>
  </section>`;
}

function renderInterviewCard(q) {
  // Split answer into S/T/A/R
  let s = '', t = '', a = '', r = '';
  const match = q.answer.match(/S:\s*(.*?)\s*T:\s*(.*?)\s*A:\s*(.*?)\s*R:\s*(.*)/i);
  if (match) {
    s = match[1];
    t = match[2];
    a = match[3];
    r = match[4];
  } else {
    // fallback: show all as one answer
    s = q.answer;
  }
  return `
    <div class="bg-white rounded shadow p-5 hover:shadow-lg transition group border border-gray-100 hover:border-yellow-300 flex flex-col gap-2">
      <div class="flex items-center gap-2 mb-2">
        <span class="inline-block bg-yellow-100 text-yellow-700 rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm">${q.serial_no || ''}</span>
        <i class="bi bi-lightbulb text-yellow-500"></i>
        <span class="font-semibold text-gray-800">${q.question}</span>
      </div>
      <div class="flex flex-wrap gap-2 mb-2">
        ${q.skills && Array.isArray(q.skills) ? q.skills.map(skill => `<span class="bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs font-medium">${skill}</span>`).join('') : ''}
      </div>
      <div class="text-xs text-gray-500 mb-1">Category: ${q.category || ''}</div>
      <div class="flex flex-col gap-1 mt-2">
        <div><span class="font-bold text-yellow-700">S:</span> <span>${s}</span></div>
        <div><span class="font-bold text-yellow-700">T:</span> <span>${t}</span></div>
        <div><span class="font-bold text-yellow-700">A:</span> <span>${a}</span></div>
        <div><span class="font-bold text-yellow-700">R:</span> <span>${r}</span></div>
      </div>
    </div>
  `;
}
