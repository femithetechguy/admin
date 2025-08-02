// PowerBI Prep Videos tab functionality
// This follows the same pattern as masterclass.js for consistency

// Note: We don't redefine showNotePopupB64 and closeNotePopup since they're shared across all tabs

// Track the currently open PowerBI video (for both mobile and desktop)
window._powerbiPrepVideo = {
  type: null, // 'mobile' or 'desktop'
  element: null, // iframeDiv for mobile, container for desktop
  button: null // button element for mobile
};

window.showPowerBIPrepVideoIframe = function(youtubeId, btn) {
  // Helper to close any open video
  function closeCurrentVideo() {
    if (window._powerbiPrepVideo.type === 'mobile' && window._powerbiPrepVideo.element && window._powerbiPrepVideo.button) {
      window._powerbiPrepVideo.element.innerHTML = '';
      window._powerbiPrepVideo.element.style.display = 'none';
      window._powerbiPrepVideo.button.textContent = 'Watch';
    } else if (window._powerbiPrepVideo.type === 'desktop' && window._powerbiPrepVideo.element) {
      window._powerbiPrepVideo.element.innerHTML = '';
      const popup = document.getElementById('powerbi-prep-video-popup');
      if (popup) popup.style.display = 'none';
    }
    window._powerbiPrepVideo = { type: null, element: null, button: null };
  }
  
  // Close any open note popups
  const notePopup = document.getElementById('note-popup');
  if (notePopup && notePopup.style.display !== 'none') {
    window.closeNotePopup();
  }

  if (window.innerWidth <= 768) {
    // Mobile: inline card
    const card = btn.closest('.bg-white');
    const iframeDiv = card.querySelector('.video-iframe');
    const isOpening = iframeDiv.style.display === 'none' || !iframeDiv.style.display;
    // If opening a new video, close any previous
    if (isOpening) {
      closeCurrentVideo();
      iframeDiv.innerHTML = `<iframe width="100%" height="200" src="https://www.youtube.com/embed/${youtubeId}" frameborder="0" allowfullscreen></iframe>`;
      iframeDiv.style.display = 'block';
      btn.textContent = 'Hide';
      window._powerbiPrepVideo = { type: 'mobile', element: iframeDiv, button: btn };
    } else {
      // Closing current video
      iframeDiv.innerHTML = '';
      iframeDiv.style.display = 'none';
      btn.textContent = 'Watch';
      window._powerbiPrepVideo = { type: null, element: null, button: null };
    }
  } else {
    // Desktop: popup
    // If a video is already open, close it
    closeCurrentVideo();
    let popup = document.getElementById('powerbi-prep-video-popup');
    if (!popup) {
      popup = document.createElement('div');
      popup.id = 'powerbi-prep-video-popup';
      popup.className = 'video-iframe-popup';
      popup.style.display = 'none';
      popup.innerHTML = `
        <div class="video-popup-inner">
          <button onclick="window.closePowerBIPrepVideoPopup()" class="video-popup-close">&times;</button>
          <div id="powerbi-prep-video-container"></div>
        </div>
      `;
      document.body.appendChild(popup);
    }
    const container = document.getElementById('powerbi-prep-video-container');
    container.innerHTML = `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${youtubeId}" frameborder="0" allowfullscreen></iframe>`;
    popup.style.display = 'flex';
    window._powerbiPrepVideo = { type: 'desktop', element: container, button: null };
  }
};

// Close the popup and reset the tracker
window.closePowerBIPrepVideoPopup = function() {
  const popup = document.getElementById('powerbi-prep-video-popup');
  const container = document.getElementById('powerbi-prep-video-container');
  if (container) container.innerHTML = '';
  if (popup) popup.style.display = 'none';
  window._powerbiPrepVideo = { type: null, element: null, button: null };
};

// Utility: detect mobile
function isMobile() {
  return window.innerWidth <= 768;
}

// Get YouTube ID from a YouTube URL
function getYoutubeId(url) {
  if (!url) return '';
  const match = url.match(/[?&]v=([^&#]+)/) || url.match(/youtu\.be\/([^?&#]+)/);
  return match ? match[1] : '';
}

// Main tab rendering function
window.renderPowerBIPrepVidsTab = function(tab) {
  setTimeout(() => {
    fetch('json/videos/interview_prep_vid.json')
      .then(r => r.json())
      .then(data => renderPowerBIPrepVideos(data))
      .catch((err) => {
        const el = document.getElementById('powerbi-videos-container');
        if (el) {
          el.innerHTML = `
            <div class="text-red-500 text-center py-8">
              Failed to load PowerBI tutorial videos.
              <div class="text-sm mt-2 text-gray-700">${err.message || 'Unknown error'}</div>
            </div>
          `;
        }
      });
  }, 0);
  
  return `
    <div class="w-full flex justify-center py-4">
      <span class="text-xl font-bold">PowerBI Tutorial Videos</span>
    </div>
    <div id="powerbi-videos-container" class="p-4 space-y-4">
      <div class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p class="mt-2 text-gray-600">Loading videos...</p>
      </div>
    </div>
  `;
};

// Render videos based on device type
function renderPowerBIPrepVideos(videos) {
  if (isMobile()) {
    renderPowerBIPrepMobileCards(videos);
  } else {
    renderPowerBIPrepDesktopTable(videos);
  }
}

// Render mobile cards
function renderPowerBIPrepMobileCards(videos) {
  const container = document.getElementById('powerbi-videos-container');
  container.innerHTML = videos.map((v, i) => {
    const youtubeId = getYoutubeId(v.URL);
    return `
    <div class="bg-white rounded-lg shadow p-4 mb-4 flex flex-col transition-transform duration-300 ease-out opacity-0 translate-y-4 hover:scale-[1.025] hover:shadow-lg video-fadein" style="animation-delay:${i*60}ms">
      <div class="flex items-center mb-1">
        <span class="font-bold text-gray-700 mr-2">${v.SerialNo}.</span>
        <span class="font-semibold">${v.Title}</span>
      </div>
      <div class="text-xs text-gray-400 mb-2">
        <span class="font-medium">${v.Channel}</span> • 
        <span>${v.Duration}</span>
      </div>
      ${v.Note && v.Note.length > 0 ? `
      <div class="text-gray-500 text-sm mb-2 flex flex-col gap-2">
        <span>${v.Note[0]}</span>
        <button class="bg-gray-200 text-gray-700 rounded px-2 py-1 text-xs w-max hover:bg-gray-300" 
          onclick="window.showNotePopupB64('${btoa(unescape(encodeURIComponent(JSON.stringify(v.Note || []))))}', '${v.Title.replace(/'/g, "\\'")}')">
          Read Note
        </button>
      </div>
      ` : ''}
      <button class="bg-blue-500 text-white rounded px-3 py-1 w-full" 
        onclick="window.showPowerBIPrepVideoIframe('${youtubeId}', this)">
        <i class="bi bi-play-fill mr-1"></i> Watch
      </button>
      <div class="video-iframe mt-2" style="display: none;"></div>
      ${!youtubeId ? '<div class="text-red-500 text-xs mt-2">Invalid or missing YouTube ID</div>' : ''}
    </div>
    `;
  }).join('');
  
  setTimeout(() => {
    document.querySelectorAll('.video-fadein').forEach((el, idx) => {
      el.style.opacity = 1;
      el.style.transform = 'none';
    });
  }, 50);
}

// Render desktop table
function renderPowerBIPrepDesktopTable(videos) {
  const container = document.getElementById('powerbi-videos-container');
  container.innerHTML = `
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white rounded shadow">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-4 py-2 text-left">#</th>
            <th class="px-4 py-2 text-left">Title</th>
            <th class="px-4 py-2 text-left">Duration</th>
            <th class="px-4 py-2 text-left">Description</th>
            <th class="px-4 py-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          ${videos.map((v, i) => {
            const youtubeId = getYoutubeId(v.URL);
            return `
              <tr class="border-b transition-transform duration-300 ease-out opacity-0 translate-y-4 hover:scale-[1.015] hover:bg-blue-50 video-fadein" style="animation-delay:${i*60}ms">
                <td class="px-4 py-2">${v.SerialNo}</td>
                <td class="px-4 py-2 font-semibold">${v.Title}</td>
                <td class="px-4 py-2 text-xs text-gray-400">${v.Duration}</td>
                <td class="px-4 py-2 text-sm text-gray-500 flex flex-col gap-2">
                  <span>${v.Note ? v.Note[0] : ''}</span>
                  ${v.Note && v.Note.length > 0 ? `
                  <button class="bg-gray-200 text-gray-700 rounded px-2 py-1 text-xs w-max hover:bg-gray-300" 
                    onclick="window.showNotePopupB64('${btoa(unescape(encodeURIComponent(JSON.stringify(v.Note || []))))}', '${v.Title.replace(/'/g, "\\'")}')">
                    Read Note
                  </button>
                  ` : ''}
                </td>
                <td class="px-4 py-2">
                  <button class="bg-blue-500 text-white rounded px-3 py-1" onclick="window.showPowerBIPrepVideoIframe('${youtubeId}')">Watch</button>
                  ${!youtubeId ? '<div class="text-red-500 text-xs mt-2">Invalid or missing YouTube ID</div>' : ''}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  setTimeout(() => {
    document.querySelectorAll('.video-fadein').forEach((el, idx) => {
      el.style.opacity = 1;
      el.style.transform = 'none';
    });
  }, 50);
}
