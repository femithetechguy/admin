document.addEventListener('DOMContentLoaded', function() {
    // PL-300 tab functionality
    const pl300Tab = document.querySelector('[data-tab="PL-300"]');
    
    // Make the render function globally available
    window.renderPL300Tab = renderPL300Tab;
    
    if (pl300Tab) {
        pl300Tab.addEventListener('click', function() {
            console.log('Loading PL-300 content...');
            renderPL300Tab();
        });
    }
});

// Main render function that returns HTML content
function renderPL300Tab(tab) {
    console.log('Rendering PL-300 tab...');
    
    // Return the HTML structure immediately
    const html = `
        <div class="p-6">
            <div class="mb-6">
                <h2 class="text-3xl font-bold mb-2 flex items-center">
                    <i class="bi bi-trophy text-yellow-500 mr-3"></i>
                    Microsoft PL-300: Power BI Data Analyst
                </h2>
                <p class="text-gray-600 mb-4">Comprehensive resources for PL-300 certification preparation</p>
                
                <!-- Certification Overview -->
                <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-6">
                    <h3 class="text-xl font-semibold mb-3">Certification Overview</h3>
                    <div class="grid md:grid-cols-2 gap-4">
                        <div class="flex items-center">
                            <i class="bi bi-clock text-blue-500 mr-2"></i>
                            <span>Exam Duration: 100 minutes</span>
                        </div>
                        <div class="flex items-center">
                            <i class="bi bi-question-circle text-purple-500 mr-2"></i>
                            <span>Question Count: 40-60 questions</span>
                        </div>
                        <div class="flex items-center">
                            <i class="bi bi-percent text-green-500 mr-2"></i>
                            <span>Passing Score: 700/1000</span>
                        </div>
                        <div class="flex items-center">
                            <i class="bi bi-currency-dollar text-orange-500 mr-2"></i>
                            <span>Cost: $165 USD</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Filter and Search -->
            <div class="mb-6 flex flex-wrap gap-4 items-center">
                <div class="flex-1 min-w-64">
                    <input type="text" id="pl300Search" placeholder="Search resources..." 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                <select id="categoryFilter" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">All Categories</option>
                    <option value="study-guide">Study Guides</option>
                    <option value="practice-test">Practice Tests</option>
                    <option value="video">Video Tutorials</option>
                    <option value="documentation">Documentation</option>
                    <option value="hands-on">Hands-on Labs</option>
                </select>
                <select id="difficultyFilter" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                </select>
            </div>

            <!-- Loading state -->
            <div id="pl300Loading" class="flex justify-center items-center h-64">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span class="ml-3 text-lg">Loading PL-300 resources...</span>
            </div>

            <!-- Content Grid -->
            <div id="pl300ResourceGrid" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3" style="display: none;">
                <!-- Resources will be loaded here -->
            </div>

            <!-- Study Plan Section -->
            <div id="pl300StudyPlan" class="mt-8" style="display: none;">
                <h3 class="text-2xl font-semibold mb-4 flex items-center">
                    <i class="bi bi-calendar-check text-blue-500 mr-2"></i>
                    Recommended Study Plan
                </h3>
                <!-- Study plan content will be loaded here -->
            </div>

            <!-- Exam Domains -->
            <div id="pl300ExamDomains" class="mt-8" style="display: none;">
                <h3 class="text-2xl font-semibold mb-4 flex items-center">
                    <i class="bi bi-diagram-3 text-green-500 mr-2"></i>
                    Exam Domains & Weights
                </h3>
                <!-- Exam domains content will be loaded here -->
            </div>
        </div>
    `;
    
    // Load the data asynchronously after rendering
    setTimeout(() => {
        loadPL300Content();
    }, 100);
    
    return html;
}

async function loadPL300Content() {
    try {
        // Hide loading state and show content sections
        const loadingDiv = document.getElementById('pl300Loading');
        const resourceGrid = document.getElementById('pl300ResourceGrid');
        const studyPlan = document.getElementById('pl300StudyPlan');
        const examDomains = document.getElementById('pl300ExamDomains');
        
        // Load PL-300 data
        const response = await fetch('./json/pl300_resources.json');
        const data = await response.json();
        
        // Hide loading
        if (loadingDiv) loadingDiv.style.display = 'none';
        
        // Populate resource grid
        if (resourceGrid) {
            resourceGrid.innerHTML = renderResourceCards(data.resources || []);
            resourceGrid.style.display = 'grid';
        }
        
        // Populate study plan
        if (studyPlan) {
            studyPlan.querySelector('div') && studyPlan.removeChild(studyPlan.querySelector('div'));
            const studyPlanContent = document.createElement('div');
            studyPlanContent.innerHTML = renderStudyPlan(data.studyPlan || []);
            studyPlan.appendChild(studyPlanContent);
            studyPlan.style.display = 'block';
        }
        
        // Populate exam domains
        if (examDomains) {
            examDomains.querySelector('div') && examDomains.removeChild(examDomains.querySelector('div'));
            const examDomainsContent = document.createElement('div');
            examDomainsContent.innerHTML = renderExamDomains(data.examDomains || []);
            examDomains.appendChild(examDomainsContent);
            examDomains.style.display = 'block';
        }
        
        // Initialize filters and search
        initializePL300Filters();
        
    } catch (error) {
        console.error('Error loading PL-300 content:', error);
        showErrorState();
    }
}

function showErrorState() {
    const loadingDiv = document.getElementById('pl300Loading');
    const resourceGrid = document.getElementById('pl300ResourceGrid');
    
    if (loadingDiv) {
        loadingDiv.innerHTML = `
            <div class="text-center p-8">
                <i class="bi bi-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                <h3 class="text-xl font-semibold mb-2">Error Loading Content</h3>
                <p class="text-gray-600">Unable to load PL-300 resources. Please try again later.</p>
                <button onclick="loadPL300Content()" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    Retry
                </button>
            </div>
        `;
        loadingDiv.style.display = 'flex';
    }
    
    if (resourceGrid) {
        resourceGrid.style.display = 'none';
    }
}

function renderResourceCards(resources) {
    return resources.map(resource => `
        <div class="resource-card bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6" 
             data-category="${resource.category}" 
             data-difficulty="${resource.difficulty}">
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center">
                    <i class="bi bi-file-text text-2xl mr-3 text-purple-500"></i>
                    <div>
                        <h4 class="font-semibold text-lg">${escapeHtml(resource.title)}</h4>
                        <span class="text-sm text-gray-500">${resource.type}</span>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    ${resource.difficulty ? `<span class="px-2 py-1 bg-gray-100 text-xs rounded-full">${resource.difficulty}</span>` : ''}
                    ${resource.duration ? `<span class="text-sm text-gray-500"><i class="bi bi-clock mr-1"></i>${resource.duration}</span>` : ''}
                </div>
            </div>
            
            <p class="text-gray-600 mb-4 line-clamp-3">${escapeHtml(resource.description)}</p>
            
            <div class="flex items-center justify-between">
                ${resource.url ? `
                    <a href="${resource.url}" target="_blank" 
                       class="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        <i class="bi bi-box-arrow-up-right mr-2"></i>
                        Access Resource
                    </a>
                ` : '<span class="text-gray-400">Coming Soon</span>'}
                
                ${resource.videoId ? `
                    <button onclick="showPL300Video('${resource.videoId}', '${escapeHtml(resource.title)}')" 
                            class="inline-flex items-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                        <i class="bi bi-play-circle mr-2"></i>
                        Watch
                    </button>
                ` : ''}
            </div>
            
            ${resource.tags ? `
                <div class="mt-3 flex flex-wrap gap-2">
                    ${resource.tags.map(tag => `<span class="px-2 py-1 bg-gray-100 text-xs rounded-full">${escapeHtml(tag)}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');
}

function renderStudyPlan(studyPlan) {
    if (!studyPlan.length) {
        return `<p class="text-gray-500 italic">Study plan coming soon...</p>`;
    }
    
    return `
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            ${studyPlan.map((week, index) => `
                <div class="bg-white rounded-lg shadow p-4">
                    <h4 class="font-semibold mb-2 text-blue-600">Week ${index + 1}</h4>
                    <h5 class="font-medium mb-2">${escapeHtml(week.topic)}</h5>
                    <ul class="text-sm text-gray-600 space-y-1">
                        ${week.tasks.map(task => `<li class="flex items-start"><i class="bi bi-check-circle text-green-500 mr-2 mt-0.5"></i>${escapeHtml(task)}</li>`).join('')}
                    </ul>
                    <div class="mt-3 text-xs text-gray-500">
                        <i class="bi bi-clock mr-1"></i>${week.timeCommitment}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderExamDomains(domains) {
    if (!domains.length) {
        return `<p class="text-gray-500 italic">Exam domains information coming soon...</p>`;
    }
    
    return `
        <div class="space-y-4">
            ${domains.map(domain => `
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center justify-between mb-3">
                        <h4 class="text-lg font-semibold">${escapeHtml(domain.name)}</h4>
                        <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">${domain.weight}%</span>
                    </div>
                    <p class="text-gray-600 mb-4">${escapeHtml(domain.description)}</p>
                    <div class="grid md:grid-cols-2 gap-3">
                        ${domain.skills.map(skill => `
                            <div class="flex items-center">
                                <i class="bi bi-check-circle text-green-500 mr-2"></i>
                                <span class="text-sm">${escapeHtml(skill)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function initializePL300Filters() {
    const searchInput = document.getElementById('pl300Search');
    const categoryFilter = document.getElementById('categoryFilter');
    const difficultyFilter = document.getElementById('difficultyFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterPL300Resources);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterPL300Resources);
    }
    
    if (difficultyFilter) {
        difficultyFilter.addEventListener('change', filterPL300Resources);
    }
}

function filterPL300Resources() {
    const searchTerm = document.getElementById('pl300Search')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    const difficultyFilter = document.getElementById('difficultyFilter')?.value || '';
    const resourceCards = document.querySelectorAll('.resource-card');
    
    resourceCards.forEach(card => {
        const title = card.querySelector('h4')?.textContent.toLowerCase() || '';
        const description = card.querySelector('p')?.textContent.toLowerCase() || '';
        const category = card.dataset.category || '';
        const difficulty = card.dataset.difficulty || '';
        
        const matchesSearch = !searchTerm || title.includes(searchTerm) || description.includes(searchTerm);
        const matchesCategory = !categoryFilter || category === categoryFilter;
        const matchesDifficulty = !difficultyFilter || difficulty === difficultyFilter;
        
        if (matchesSearch && matchesCategory && matchesDifficulty) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function showPL300Video(videoId, title) {
    // Reuse the video popup functionality from other tabs
    if (typeof showVideoPopup === 'function') {
        showVideoPopup(videoId, title);
    } else {
        // Fallback: open in new tab
        window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
    }
}

function getResourceIcon(type) {
    const iconMap = {
        'Study Guide': 'bi-book',
        'Practice Test': 'bi-clipboard-check',
        'Video Tutorial': 'bi-play-circle',
        'Documentation': 'bi-file-text',
        'Hands-on Lab': 'bi-laptop',
        'Exam Prep': 'bi-trophy',
        'Reference': 'bi-bookmark'
    };
    return iconMap[type] || 'bi-file-text';
}

function getResourceColor(type) {
    const colorMap = {
        'Study Guide': 'text-blue-500',
        'Practice Test': 'text-green-500',
        'Video Tutorial': 'text-red-500',
        'Documentation': 'text-purple-500',
        'Hands-on Lab': 'text-orange-500',
        'Exam Prep': 'text-yellow-500',
        'Reference': 'text-gray-500'
    };
    return colorMap[type] || 'text-gray-500';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
