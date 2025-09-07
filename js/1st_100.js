let allFirst100Questions = [];
let filteredFirst100Questions = [];

window.showQuestionPopup = function(question, answer, title = 'Question Details') {
  // First, close any open video popups
  const videoPopup = document.getElementById('video-iframe-popup');
  if (videoPopup && videoPopup.style.display !== 'none') {
    window.closeVideoIframePopup1st100();
  }
  
  // Decode HTML entities back to readable text for display
  function decodeHtml(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }
  
  const decodedQuestion = decodeHtml(question);
  const decodedAnswer = decodeHtml(answer);
  
  // Get or create the popup
  let popup = document.getElementById('question-popup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'question-popup';
    popup.className = 'note-popup';
    popup.style.display = 'flex';
    popup.innerHTML = `
      <div id="question-popup-inner" class="note-popup-inner">
        <button onclick="window.closeQuestionPopup()" class="note-popup-close">&times;</button>
        <div class="note-popup-title">${title}</div>
        <div class="note-popup-content">
          <div class="mb-4">
            <h4 class="font-semibold text-blue-600 mb-2">Question:</h4>
            <p class="text-gray-800">${decodedQuestion}</p>
          </div>
          <div>
            <h4 class="font-semibold text-green-600 mb-2">Answer:</h4>
            <p class="text-gray-800">${decodedAnswer}</p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(popup);
  } else {
    // Update existing popup
    const titleDiv = popup.querySelector('.note-popup-title');
    const contentDiv = popup.querySelector('.note-popup-content');
    if (titleDiv) titleDiv.textContent = title;
    if (contentDiv) {
      contentDiv.innerHTML = `
        <div class="mb-4">
          <h4 class="font-semibold text-blue-600 mb-2">Question:</h4>
          <p class="text-gray-800">${decodedQuestion}</p>
        </div>
        <div>
          <h4 class="font-semibold text-green-600 mb-2">Answer:</h4>
          <p class="text-gray-800">${decodedAnswer}</p>
        </div>
      `;
    }
    popup.style.display = 'flex';
  }
};

window.closeQuestionPopup = function() {
  const popup = document.getElementById('question-popup');
  if (popup) popup.style.display = 'none';
};

window.showVideoIframe1st100 = function(youtubeId, btn) {
  if (!youtubeId) {
    console.error('No YouTube ID provided');
    return;
  }

  // Validate YouTube ID format (more lenient check)
  if (!/^[a-zA-Z0-9_-]{8,15}$/.test(youtubeId)) {
    console.error('Invalid YouTube ID format:', youtubeId);
    return;
  }

  // Helper to close any open video
  function closeCurrentVideo() {
    if (window._currentVideo && window._currentVideo.type === 'mobile' && window._currentVideo.element && window._currentVideo.button) {
      window._currentVideo.element.innerHTML = '';
      window._currentVideo.element.classList.add('hidden');
      window._currentVideo.button.textContent = 'Watch';
    } else if (window._currentVideo && window._currentVideo.type === 'desktop' && window._currentVideo.element) {
      window._currentVideo.element.innerHTML = '';
      const popup = document.getElementById('video-iframe-popup');
      if (popup) popup.style.display = 'none';
    }
    if (window._currentVideo) {
      window._currentVideo = { type: null, element: null, button: null };
    }
  }

  if (window.innerWidth <= 768) {
    // Mobile: inline card
    const card = btn.closest('.bg-white');
    if (!card) {
      console.error('Could not find card container');
      return;
    }
    const iframeDiv = card.querySelector('.video-iframe');
    if (!iframeDiv) {
      console.error('Could not find video iframe container');
      return;
    }
    const isOpening = iframeDiv.classList.contains('hidden');
    
    if (isOpening) {
      closeCurrentVideo();
      iframeDiv.innerHTML = `
        <iframe 
          width="100%" 
          height="200" 
          src="https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1" 
          frameborder="0" 
          allowfullscreen
          onerror="console.error('Failed to load video: ${youtubeId}')"
        ></iframe>`;
      iframeDiv.classList.remove('hidden');
      btn.textContent = 'Hide';
      if (!window._currentVideo) window._currentVideo = {};
      window._currentVideo = { type: 'mobile', element: iframeDiv, button: btn };
    } else {
      iframeDiv.innerHTML = '';
      iframeDiv.classList.add('hidden');
      btn.textContent = 'Watch';
      if (!window._currentVideo) window._currentVideo = {};
      window._currentVideo = { type: null, element: null, button: null };
    }
  } else {
    // Desktop: popup
    closeCurrentVideo();
    const popup = document.getElementById('video-iframe-popup');
    const container = document.getElementById('video-iframe-container');
    if (popup && container) {
      container.innerHTML = `
        <iframe 
          width="100%" 
          height="400" 
          src="https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1" 
          frameborder="0" 
          allowfullscreen
          onerror="console.error('Failed to load video: ${youtubeId}')"
        ></iframe>`;
      popup.style.display = 'flex';
      if (!window._currentVideo) window._currentVideo = {};
      window._currentVideo = { type: 'desktop', element: container, button: null };
    } else {
      console.error('Could not find video popup elements');
    }
  }
};

window.closeVideoIframePopup1st100 = function() {
  const popup = document.getElementById('video-iframe-popup');
  if (popup) popup.style.display = 'none';
  const container = document.getElementById('video-iframe-container');
  if (container) container.innerHTML = '';
  if (window._currentVideo) {
    window._currentVideo = { type: null, element: null, button: null };
  }
};

window.render1st100Tab = function() {
  // Load the 100 interview questions data
  fetch('json/100_interview_questions.json')
    .then(response => response.json())
    .then(data => {
      allFirst100Questions = data;
      filteredFirst100Questions = [...data];
      renderFirst100Content();
    })
    .catch(error => {
      console.error('Error loading 100 interview questions:', error);
      document.getElementById('1st_100-content').innerHTML = `
        <div class="text-center py-8">
          <p class="text-red-500">Failed to load interview questions.</p>
        </div>
      `;
    });
};

function renderFirst100Content() {
  const contentDiv = document.getElementById('1st_100-content');
  if (!contentDiv) return;

  const categories = [...new Set(filteredFirst100Questions.map(q => q.category))].sort();
  
  // Debug video links
  console.log('=== Video Links Debug ===');
  filteredFirst100Questions.forEach(q => {
    if (q.related_video_link) {
      const youtubeId = extractYouTubeId(q.related_video_link);
      console.log(`Question #${q.serial_no}: ${q.related_video_link} -> ${youtubeId || 'INVALID'}`);
    }
  });
  
  contentDiv.innerHTML = `
    <div class="mb-6">
      <h2 class="text-2xl font-bold mb-4">First 100 Interview Questions</h2>
      
      <!-- Filters -->
      <div class="bg-white p-4 rounded shadow mb-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label for="category-filter-1st100" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select id="category-filter-1st100" class="w-full px-3 py-2 border border-gray-300 rounded-md" onchange="filterFirst100Questions()">
              <option value="">All Categories</option>
              ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
            </select>
          </div>
          <div>
            <label for="search-filter-1st100" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input type="text" id="search-filter-1st100" placeholder="Search questions..." class="w-full px-3 py-2 border border-gray-300 rounded-md" onkeyup="filterFirst100Questions()">
          </div>
          <div class="flex items-end">
            <button onclick="resetFirst100Filters()" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition">
              Reset Filters
            </button>
          </div>
        </div>
      </div>
      
      <!-- Stats -->
      <div class="bg-blue-50 p-4 rounded mb-4">
        <p class="text-sm text-blue-800">
          Showing ${filteredFirst100Questions.length} of ${allFirst100Questions.length} questions
        </p>
      </div>
    </div>
    
    <!-- Questions Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="questions-grid">
      ${filteredFirst100Questions.map(question => renderQuestionCard(question)).join('')}
    </div>
    
    <!-- Video popup for desktop -->
    <div id="video-iframe-popup" class="video-iframe-popup" style="display: none;">
      <div class="video-popup-inner">
        <button onclick="window.closeVideoIframePopup1st100()" class="video-popup-close">&times;</button>
        <div id="video-iframe-container"></div>
      </div>
    </div>
  `;
  
  // Add event delegation for button clicks
  setupEventListeners();
}

function renderQuestionCard(question) {
  let videoButton = '';
  if (question.related_video_link) {
    const youtubeId = extractYouTubeId(question.related_video_link);
    if (youtubeId) {
      videoButton = `<button class="video-btn px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition" data-youtube-id="${youtubeId}">
         Watch
       </button>`;
    } else {
      // Check if it's a placeholder URL
      const isPlaceholder = question.related_video_link.includes('example') || question.related_video_link.includes('PLACEHOLDER');
      videoButton = `<span class="px-3 py-1 bg-gray-300 text-gray-600 text-sm rounded cursor-not-allowed" title="${isPlaceholder ? 'Placeholder video link' : 'Invalid video link'}">
         ${isPlaceholder ? 'Demo Link' : 'Invalid'}
       </span>`;
    }
  }

  return `
    <div class="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
      <div class="flex items-start justify-between mb-2">
        <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">#${question.serial_no}</span>
        <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">${question.category}</span>
      </div>
      
      <h3 class="font-semibold text-gray-900 mb-3 md:line-clamp-3">${question.question}</h3>
      
      <p class="text-gray-600 text-sm mb-4 md:line-clamp-2">${question.answer}</p>
      
      <div class="flex items-center justify-between">
        <button class="question-details-btn px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition" 
                data-question="${escapeHtml(question.question)}" 
                data-answer="${escapeHtml(question.answer)}" 
                data-serial="${question.serial_no}">
          View Details
        </button>
        ${videoButton}
      </div>
      
      <!-- Mobile video container (hidden by default) -->
      <div class="video-iframe mt-4 hidden"></div>
    </div>
  `;
}

function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') {
    console.warn('Invalid YouTube URL:', url);
    return '';
  }
  
  try {
    // Handle different YouTube URL formats
    const patterns = [
      // Standard watch URLs: https://www.youtube.com/watch?v=VIDEO_ID
      /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
      // Short URLs: https://youtu.be/VIDEO_ID
      /(?:youtu\.be\/)([^&\n?#]+)/,
      // Embed URLs: https://www.youtube.com/embed/VIDEO_ID
      /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
      // YouTube mobile URLs: https://m.youtube.com/watch?v=VIDEO_ID
      /(?:m\.youtube\.com\/watch\?v=)([^&\n?#]+)/,
      // YouTube URLs with additional parameters
      /(?:youtube\.com\/.*[?&]v=)([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        const videoId = match[1];
        
        // Check for placeholder/example IDs
        if (videoId.startsWith('example') || videoId === 'PLACEHOLDER') {
          console.warn('Placeholder YouTube ID found:', videoId, 'from URL:', url);
          return '';
        }
        
        // YouTube video IDs are typically 11 characters long and contain alphanumeric chars, hyphens, underscores
        if (videoId.length >= 10 && videoId.length <= 12 && /^[a-zA-Z0-9_-]+$/.test(videoId)) {
          console.log('Extracted YouTube ID:', videoId, 'from URL:', url);
          return videoId;
        } else {
          console.warn('Invalid YouTube ID format:', videoId, 'from URL:', url);
          return '';
        }
      }
    }
    
    console.warn('Could not extract YouTube ID from URL:', url);
    return '';
  } catch (error) {
    console.error('Error extracting YouTube ID:', error, 'URL:', url);
    return '';
  }
}

function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

function setupEventListeners() {
  const questionsGrid = document.getElementById('questions-grid');
  if (!questionsGrid) return;
  
  // Remove any existing listeners
  questionsGrid.removeEventListener('click', handleGridClick);
  
  // Add event delegation for all button clicks
  questionsGrid.addEventListener('click', handleGridClick);
}

function handleGridClick(event) {
  const target = event.target;
  
  // Handle question details button clicks
  if (target.classList.contains('question-details-btn')) {
    event.preventDefault();
    const question = target.getAttribute('data-question');
    const answer = target.getAttribute('data-answer');
    const serial = target.getAttribute('data-serial');
    
    if (question && answer && serial) {
      window.showQuestionPopup(question, answer, `Question #${serial}`);
    }
  }
  
  // Handle video button clicks
  if (target.classList.contains('video-btn')) {
    event.preventDefault();
    const youtubeId = target.getAttribute('data-youtube-id');
    
    if (youtubeId) {
      window.showVideoIframe1st100(youtubeId, target);
    }
  }
}

window.filterFirst100Questions = function() {
  const categoryFilter = document.getElementById('category-filter-1st100').value;
  const searchFilter = document.getElementById('search-filter-1st100').value.toLowerCase();
  
  filteredFirst100Questions = allFirst100Questions.filter(question => {
    const categoryMatch = !categoryFilter || question.category === categoryFilter;
    const searchMatch = !searchFilter || 
      question.question.toLowerCase().includes(searchFilter) || 
      question.answer.toLowerCase().includes(searchFilter) ||
      question.category.toLowerCase().includes(searchFilter);
    
    return categoryMatch && searchMatch;
  });
  
  renderFirst100Content();
};

window.resetFirst100Filters = function() {
  document.getElementById('category-filter-1st100').value = '';
  document.getElementById('search-filter-1st100').value = '';
  filteredFirst100Questions = [...allFirst100Questions];
  renderFirst100Content();
};

// Initialize when tab is activated
document.addEventListener('DOMContentLoaded', function() {
  // This will be called by the main tab system
  window.render1st100Tab = window.render1st100Tab;
});
