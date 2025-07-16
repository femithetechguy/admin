// Interview Prep tab logic

window.renderInterviewPrepTab = function(tab) {
  // State for filters
  let filterState = {
    showCategory: false,
    showSkill: false,
    selectedCategories: [],
    selectedSkills: []
  };
  let allQuestions = [];

  setTimeout(() => {
    fetch('json/interview_prep.json')
      .then(res => res.json())
      .then(data => {
        allQuestions = Array.isArray(data.questions) ? data.questions : [];
        renderWithFilters();
      })
      .catch(() => {
        const container = document.getElementById('interview-prep-questions-container');
        if (container) container.innerHTML = `<div class="text-red-500 text-center py-8">Failed to load interview prep questions.</div>`;
      });
  }, 0);

  function renderWithFilters() {
    const container = document.getElementById('interview-prep-questions-container');
    if (!container) return;
    if (allQuestions.length === 0) {
      container.innerHTML = `<div class="text-gray-500 text-center py-8">No interview prep questions found.</div>`;
      return;
    }
    // Get all unique categories and skills
    const categories = [...new Set(allQuestions.map(q => q.category).filter(Boolean))];
    const skills = [...new Set(allQuestions.flatMap(q => Array.isArray(q.skills) ? q.skills : []).filter(Boolean))];

    // Filter questions
    let filtered = allQuestions;
    if (filterState.selectedCategories.length > 0) {
      filtered = filtered.filter(q => filterState.selectedCategories.includes(q.category));
    }
    if (filterState.selectedSkills.length > 0) {
      filtered = filtered.filter(q => (q.skills || []).some(skill => filterState.selectedSkills.includes(skill)));
    }

    // Filter UI
    let filterUI = `
      <div class="flex flex-wrap gap-2 mb-4">
        <button id="toggle-category-filter" class="px-3 py-1 rounded border border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 flex items-center gap-1"><i class="bi bi-tags"></i> Category</button>
        <button id="toggle-skill-filter" class="px-3 py-1 rounded border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-1"><i class="bi bi-lightbulb"></i> Skill</button>
        ${(filterState.selectedCategories.length > 0 || filterState.selectedSkills.length > 0)
          ? `<button id="reset-filters" class="px-3 py-1 rounded border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 flex items-center gap-1"><i class="bi bi-x-circle"></i> Reset filter</button>`
          : ''}
      </div>
      <div class="flex flex-wrap gap-4 mb-4">
        ${filterState.showCategory ? `
          <div class="bg-yellow-50 border border-yellow-200 rounded p-2 flex flex-wrap gap-2">
            ${categories.map(cat => `
              <button class="category-filter-btn px-2 py-1 rounded ${filterState.selectedCategories.includes(cat) ? 'bg-yellow-600 text-white' : 'bg-white text-yellow-700 border border-yellow-200'}" data-cat="${cat}">${cat}</button>
            `).join('')}
          </div>
        ` : ''}
        ${filterState.showSkill ? `
          <div class="bg-blue-50 border border-blue-200 rounded p-2 flex flex-wrap gap-2">
            ${skills.map(skill => `
              <button class="skill-filter-btn px-2 py-1 rounded ${filterState.selectedSkills.includes(skill) ? 'bg-blue-600 text-white' : 'bg-white text-blue-700 border border-blue-200'}" data-skill="${skill}">${skill}</button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    // Cards
    let cards = filtered.length > 0
      ? `<div class="grid grid-cols-1 md:grid-cols-2 gap-6">${filtered.map(q => renderInterviewCard(q)).join('')}</div>`
      : `<div class="text-gray-500 text-center py-8">No questions match the selected filter(s).</div>`;

    container.innerHTML = filterUI + cards;

    // Event listeners
    const catBtn = document.getElementById('toggle-category-filter');
    if (catBtn) catBtn.onclick = () => {
      filterState.showCategory = !filterState.showCategory;
      renderWithFilters();
    };
    const skillBtn = document.getElementById('toggle-skill-filter');
    if (skillBtn) skillBtn.onclick = () => {
      filterState.showSkill = !filterState.showSkill;
      renderWithFilters();
    };
    const resetBtn = document.getElementById('reset-filters');
    if (resetBtn) resetBtn.onclick = () => {
      filterState.selectedCategories = [];
      filterState.selectedSkills = [];
      renderWithFilters();
    };
    container.querySelectorAll('.category-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-cat');
        if (!cat) return;
        if (filterState.selectedCategories.includes(cat)) {
          filterState.selectedCategories = filterState.selectedCategories.filter(c => c !== cat);
        } else {
          filterState.selectedCategories.push(cat);
        }
        renderWithFilters();
      });
    });
    container.querySelectorAll('.skill-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const skill = btn.getAttribute('data-skill');
        if (!skill) return;
        if (filterState.selectedSkills.includes(skill)) {
          filterState.selectedSkills = filterState.selectedSkills.filter(s => s !== skill);
        } else {
          filterState.selectedSkills.push(skill);
        }
        renderWithFilters();
      });
    });
  }

  // Initial skeleton
  return `<section id="tab-interview-prep" class="tab-content">
    <h3 class="text-xl font-semibold mb-4 flex items-center"><i class="bi bi-lightbulb mr-2"></i> ${tab.name}</h3>
    <div id="interview-prep-questions-container" class="min-h-[120px] flex flex-col items-center justify-center">
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
