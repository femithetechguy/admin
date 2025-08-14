let allNotes = [];
let filteredNotes = [];

window.showNotePopupB64 = function(b64, title = '') {
  // First, close any open video popups
  const videoPopup = document.getElementById('video-iframe-popup');
  if (videoPopup && videoPopup.style.display !== 'none') {
    window.closeVideoIframePopup();
  }
  
  // Process the note data
  let noteArr;
  try {
    noteArr = JSON.parse(decodeURIComponent(escape(atob(b64))));
  } catch (e) {
    noteArr = [];
  }
  const noteHtml = Array.isArray(noteArr) ? noteArr.map(p => `<p>${p}</p>`).join('') : '';
  
  // Get or create the popup
  let popup = document.getElementById('note-popup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'note-popup';
    popup.className = 'note-popup';
    popup.style.display = 'flex';
    popup.innerHTML = `
      <div id="note-popup-inner" class="note-popup-inner">
        <button onclick=\"window.closeNotePopup()\" class=\"note-popup-close\">&times;</button>
        <div class=\"note-popup-title\">${title || 'Note'}</div>
        <div class=\"note-popup-content\">${noteHtml || "<span class='text-gray-400'>No note available.</span>"}</div>
      </div>
    `;
    document.body.appendChild(popup);
  } else {
    // Update existing popup
    const noteDiv = popup.querySelector('.note-popup-content');
    const titleDiv = popup.querySelector('.note-popup-title');
    if (titleDiv) titleDiv.textContent = title || 'Note';
    if (noteDiv) noteDiv.innerHTML = noteHtml || '<span class=\'text-gray-400\'>No note available.</span>';
    popup.style.display = 'flex';
  }
};

window.closeNotePopup = function() {
  const popup = document.getElementById('note-popup');
  if (popup) popup.style.display = 'none';
};

// Track the currently open video (for both mobile and desktop)
window._currentVideo = {
  type: null,
  element: null,
  button: null
};

window.showVideoIframe = function(youtubeId, btn) {
  // Helper to close any open video
  function closeCurrentVideo() {
    if (window._currentVideo.type === 'mobile' && window._currentVideo.element && window._currentVideo.button) {
      window._currentVideo.element.innerHTML = '';
      window._currentVideo.element.classList.add('hidden');
      window._currentVideo.button.textContent = 'Watch';
    } else if (window._currentVideo.type === 'desktop' && window._currentVideo.element) {
      window._currentVideo.element.innerHTML = '';
      const popup = document.getElementById('video-iframe-popup');
      if (popup) popup.classList.add('hidden');
    }
    window._currentVideo = { type: null, element: null, button: null };
  }

  if (window.innerWidth <= 768) {
    // Mobile: inline card
    const card = btn.closest('.bg-white');
    const iframeDiv = card.querySelector('.video-iframe');
    const isOpening = iframeDiv.classList.contains('hidden');
    
    if (isOpening) {
      closeCurrentVideo();
      iframeDiv.innerHTML = `<iframe width="100%" height="200" src="https://www.youtube.com/embed/${youtubeId}" frameborder="0" allowfullscreen></iframe>`;
      iframeDiv.classList.remove('hidden');
      btn.textContent = 'Hide';
      window._currentVideo = { type: 'mobile', element: iframeDiv, button: btn };
    } else {
      iframeDiv.innerHTML = '';
      iframeDiv.classList.add('hidden');
      btn.textContent = 'Watch';
      window._currentVideo = { type: null, element: null, button: null };
    }
  } else {
    // Desktop: popup
    closeCurrentVideo();
    const popup = document.getElementById('video-iframe-popup');
    const container = document.getElementById('video-iframe-container');
    container.innerHTML = `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${youtubeId}" frameborder="0" allowfullscreen></iframe>`;
    popup.classList.remove('hidden');
    window._currentVideo = { type: 'desktop', element: container, button: null };
  }
};

window.closeVideoIframePopup = function() {
  const popup = document.getElementById('video-iframe-popup');
  const container = document.getElementById('video-iframe-container');
  container.innerHTML = '';
  popup.classList.add('hidden');
  window._currentVideo = { type: null, element: null, button: null };
};

// Utility: detect mobile
function isMobile() {
  return window.innerWidth <= 768;
}

// Fetch and render videos
window.renderInterviewTopicsTab = function() {
  setTimeout(() => {
    fetch('json/videos/power_bi_interview_playlist.json')
      .then(r => {
        console.log('Fetch response status:', r.status);
        if (!r.ok) {
          throw new Error(`HTTP ${r.status}`);
        }
        return r.json();
      })
      .then(data => {
        console.log('Data loaded successfully:', data.length, 'videos');
        renderInterviewVideos(data);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        const el = document.getElementById('videos-content');
        if (el) {
          el.innerHTML = '<div class="text-red-500">Failed to load videos. Error: ' + err.message + '</div>';
        }
      });
  }, 0);
  return '<div class="w-full flex justify-center py-4"><span class="text-xl font-bold">Interview Topics Playlist</span></div>' +
    '<div id="videos-content"></div>';
};

function waitForNoteViewer() {
  return new Promise((resolve) => {
    if (window.noteViewer && window.createInlineNoteViewer) {
      resolve();
      return;
    }
    
    // Check every 100ms until the component is loaded
    const checkInterval = setInterval(() => {
      if (window.noteViewer && window.createInlineNoteViewer) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);
    
    // Timeout after 5 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      console.error('Note viewer component failed to load');
      resolve(); // Resolve anyway to prevent hanging
    }, 5000);
  });
}

async function renderInterviewMobileCards(videos) {
  console.log('=== ENTERING renderInterviewMobileCards ===');
  const container = document.getElementById('videos-content');
  
  // Wait for note viewer component to be ready
  await waitForNoteViewer();
  
  container.innerHTML = videos.map((v, i) => {
    const youtubeId = getYoutubeId(v.URL);
    
    return `
    <div class="bg-white rounded-lg shadow p-4 mb-4 flex flex-col transition-transform duration-300 ease-out opacity-0 translate-y-4 hover:scale-[1.025] hover:shadow-lg video-fadein" style="animation-delay:${i*60}ms">
      <div class="flex items-center mb-1">
        <span class="font-bold text-gray-700 mr-2">${i+1}.</span>
        <span class="font-semibold">${v.Title}</span>
      </div>
      <div class="text-xs text-gray-400 mb-2">${v.Duration ? `Duration: ${v.Duration}` : ''}</div>
      <div class="text-gray-500 text-sm mb-2 flex flex-col gap-2">
        <span>${v.Note ? v.Note[0] : ''}</span>
        <div class="flex flex-wrap gap-2">
          <button class="bg-gray-200 text-gray-700 rounded px-2 py-1 text-xs hover:bg-gray-300" onclick="window.showNotePopupB64('${btoa(unescape(encodeURIComponent(JSON.stringify(v.Note || []))))}', '${v.Title.replace(/'/g, "\\'")}')">Read Note</button>
          <button class="bg-green-200 text-green-700 rounded px-2 py-1 text-xs hover:bg-green-300" onclick="window.showPicPopup('${v.Title.replace(/'/g, "\\'")}', '${v.Title.replace(/'/g, "\\'")}')">View Pic</button>
        </div>
      </div>
      <button class="bg-blue-500 text-white rounded px-3 py-1 w-full" onclick="window.showVideoIframe('${youtubeId}', this)">Watch</button>
      <div class="video-iframe mt-2 hidden"></div>
      ${!youtubeId ? '<div class="text-red-500 text-xs mt-2">Invalid or missing YouTube ID</div>' : ''}
    </div>
    `;
  }).join('') + addHorizontalLine() + (window.createInlineNoteViewer ? window.createInlineNoteViewer('interview-mobile') : '<div class="text-red-500">Note viewer component not loaded</div>');
  
  setTimeout(async () => {
    document.querySelectorAll('.video-fadein').forEach((el, idx) => {
      el.style.opacity = 1;
      el.style.transform = 'none';
    });
    
    // Initialize the inline note viewer if available
    if (window.initInlineNoteViewer) {
      try {
        await window.initInlineNoteViewer('interview-mobile', 'json/videos/note_viewer.json', 'Interview Study Notes');
      } catch (error) {
        console.error('Error initializing inline note viewer:', error);
      }
    }
  }, 50);
}

function getYoutubeId(url) {
  if (!url) return '';
  const match = url.match(/[?&]v=([^&#]+)/) || url.match(/youtu\.be\/([^?&#]+)/);
  return match ? match[1] : '';
}

window.showPicPopup = function(videoData, title = '') {
  try {
    const videos = window.currentInterviewVideos || [];
    const video = videos.find(v => v.Title === videoData);
    
    if (video && video.Pictures && video.Pictures.length > 0) {
      window.showPictureViewer(video.Pictures, `${title} - Pictures`, 0);
    } else {
      alert('No pictures available for this video.');
    }
  } catch (error) {
    console.error('Error showing picture popup:', error);
    alert('Error loading pictures.');
  }
};

function addHorizontalLine() {
  return '<hr class="my-4 border-gray-300 border-t-2">';
}

async function renderInterviewDesktopTable(videos) {
  console.log('=== ENTERING renderInterviewDesktopTable ===');
  try {
    const container = document.getElementById('videos-content');
    
    if (!container) {
      console.error('videos-content container not found!');
      return;
    }
    
    // Wait for note viewer component to be ready
    await waitForNoteViewer();
    
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
                  <td class="px-4 py-2">${i+1}</td>
                  <td class="px-4 py-2 font-semibold">${v.Title}</td>
                  <td class="px-4 py-2 text-xs text-gray-400">${v.Duration ? v.Duration : ''}</td>
                  <td class="px-4 py-2 text-sm text-gray-500 flex flex-col gap-2">
                    <span>${v.Note ? v.Note[0] : ''}</span>
                    <div class="flex flex-wrap gap-2">
                      <button class="bg-gray-200 text-gray-700 rounded px-2 py-1 text-xs hover:bg-gray-300" onclick="window.showNotePopupB64('${btoa(unescape(encodeURIComponent(JSON.stringify(v.Note || []))))}', '${v.Title.replace(/'/g, "\\'")}')">Read Note</button>
                      <button class="bg-green-200 text-green-700 rounded px-2 py-1 text-xs hover:bg-green-300" onclick="window.showPicPopup('${v.Title.replace(/'/g, "\\'")}', '${v.Title.replace(/'/g, "\\'")}')">View Pic</button>
                    </div>
                  </td>
                  <td class="px-4 py-2">
                    <button class="bg-blue-500 text-white rounded px-3 py-1" onclick="window.showVideoIframe('${youtubeId}')">Watch</button>
                    ${!youtubeId ? '<div class="text-red-500 text-xs mt-2">Invalid or missing YouTube ID</div>' : ''}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      ${addHorizontalLine()}
      ${window.createInlineNoteViewer ? window.createInlineNoteViewer('interview-desktop') : '<div class="text-red-500">Note viewer component not loaded</div>'}
      <div id="video-iframe-popup" class="video-iframe-popup hidden" style="display: none;">
        <div class="video-popup-inner">
          <button onclick="window.closeVideoIframePopup()" class="video-popup-close">&times;</button>
          <div id="video-iframe-container"></div>
        </div>
      </div>
    `;
    
    // Explicitly hide the video popup after creation
    setTimeout(() => {
      const videoPopup = document.getElementById('video-iframe-popup');
      if (videoPopup) {
        videoPopup.style.display = 'none';
      }
    }, 10);
    
    setTimeout(async () => {
      document.querySelectorAll('.video-fadein').forEach((el, idx) => {
        el.style.opacity = 1;
        el.style.transform = 'none';
      });
      
      // Initialize the inline note viewer if available
      if (window.initInlineNoteViewer) {
        try {
          await window.initInlineNoteViewer('interview-desktop', 'json/videos/note_viewer.json', 'Interview Study Notes');
        } catch (error) {
          console.error('Error initializing inline note viewer:', error);
        }
      }
    }, 50);
    
  } catch (error) {
    console.error('Error in renderInterviewDesktopTable:', error);
  }
}

// Also update the main render function to be async
function renderInterviewVideos(videos) {
  window.currentInterviewVideos = videos;
  console.log('renderInterviewVideos called with:', videos.length, 'videos');
  
  if (isMobile()) {
    renderInterviewMobileCards(videos);
  } else {
    renderInterviewDesktopTable(videos);
  }
}

