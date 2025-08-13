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
    popup.style.display = 'flex'; // Set display explicitly
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
    popup.style.display = 'flex'; // Ensure it's visible
  }
};

window.closeNotePopup = function() {
  const popup = document.getElementById('note-popup');
  if (popup) popup.style.display = 'none';
};


// Track the currently open video (for both mobile and desktop)
window._currentVideo = {
  type: null, // 'mobile' or 'desktop'
  element: null, // iframeDiv for mobile, container for desktop
  button: null // button element for mobile
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
    // If opening a new video, close any previous
    if (isOpening) {
      closeCurrentVideo();
      iframeDiv.innerHTML = `<iframe width="100%" height="200" src="https://www.youtube.com/embed/${youtubeId}" frameborder="0" allowfullscreen></iframe>`;
      iframeDiv.classList.remove('hidden');
      btn.textContent = 'Hide';
      window._currentVideo = { type: 'mobile', element: iframeDiv, button: btn };
    } else {
      // Closing current video
      iframeDiv.innerHTML = '';
      iframeDiv.classList.add('hidden');
      btn.textContent = 'Watch';
      window._currentVideo = { type: null, element: null, button: null };
    }
  } else {
    // Desktop: popup
    // If a video is already open, close it
    closeCurrentVideo();
    const popup = document.getElementById('video-iframe-popup');
    const container = document.getElementById('video-iframe-container');
    container.innerHTML = `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${youtubeId}" frameborder="0" allowfullscreen></iframe>`;
    popup.classList.remove('hidden');
    window._currentVideo = { type: 'desktop', element: container, button: null };
  }
};

// Also close the tracker when popup is closed
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
        console.log('Fetch response status:', r.status); // DEBUG
        if (!r.ok) {
          throw new Error(`HTTP ${r.status}`);
        }
        return r.json();
      })
      .then(data => {
        console.log('Data loaded successfully:', data.length, 'videos'); // DEBUG
        console.log('Data structure:', data); // DEBUG - Let's see the actual data
        console.log('About to call renderInterviewVideos'); // DEBUG
        try {
          renderInterviewVideos(data);
          console.log('renderInterviewVideos completed successfully'); // DEBUG
        } catch (error) {
          console.error('Error in renderInterviewVideos:', error); // DEBUG
        }
      })
      .catch(err => {
        console.error('Fetch error:', err); // DEBUG
        const el = document.getElementById('videos-content');
        if (el) {
          el.innerHTML = '<div class="text-red-500">Failed to load videos. Error: ' + err.message + '</div>';
        }
      });
  }, 0);
  return '<div class="w-full flex justify-center py-4"><span class="text-xl font-bold">Interview Topics Playlist</span></div>' +
    '<div id="videos-content"></div>';
};

function renderInterviewVideos(videos) {
  window.currentInterviewVideos = videos; // Store for later access
  console.log('renderInterviewVideos called with:', videos.length, 'videos'); // DEBUG
  console.log('isMobile():', isMobile()); // DEBUG
  console.log('typeof videos:', typeof videos, 'Array.isArray:', Array.isArray(videos)); // DEBUG
  console.log('typeof renderInterviewDesktopTable:', typeof renderInterviewDesktopTable); // DEBUG
  console.log('typeof renderInterviewMobileCards:', typeof renderInterviewMobileCards); // DEBUG
  if (isMobile()) {
    console.log('Calling renderInterviewMobileCards'); // DEBUG
    renderInterviewMobileCards(videos);
  } else {
    console.log('Calling renderInterviewDesktopTable'); // DEBUG
    console.log('About to execute renderInterviewDesktopTable function'); // DEBUG
    try {
      renderInterviewDesktopTable(videos);
      console.log('renderInterviewDesktopTable call finished'); // DEBUG
    } catch (error) {
      console.error('Error in renderInterviewDesktopTable:', error); // DEBUG
    }
  }
  console.log('renderInterviewVideos function completed'); // DEBUG
}

function getYoutubeId(url) {
  if (!url) return '';
  const match = url.match(/[?&]v=([^&#]+)/) || url.match(/youtu\.be\/([^?&#]+)/);
  return match ? match[1] : '';
}

window.showPicPopup = function(videoData, title = '') {
  try {
    // Find the video data from the current videos array
    const videos = window.currentInterviewVideos || [];
    const video = videos.find(v => v.Title === videoData);
    
    if (video && video.Pictures && video.Pictures.length > 0) {
      window.showPictureViewer(video.Pictures, `${title} - Pictures`, 0);
    } else {
      // Fallback - show a message if no pictures are available
      alert('No pictures available for this video.');
    }
  } catch (error) {
    console.error('Error showing picture popup:', error);
    alert('Error loading pictures.');
  }
};

function renderInterviewMobileCards(videos) {
  console.log('=== ENTERING renderInterviewMobileCards ==='); // DEBUG
  const container = document.getElementById('videos-content');
  console.log('Rendering mobile cards for videos:', videos.length); // DEBUG
  console.log('First video data:', videos[0]); // DEBUG
  
  container.innerHTML = videos.map((v, i) => {
    const youtubeId = getYoutubeId(v.URL);
    console.log(`Video ${i} - Title: ${v.Title}, Note: ${v.Note ? v.Note[0] : 'No note'}`); // DEBUG
    
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
  }).join('');
  
  console.log('Generated HTML length:', container.innerHTML.length); // DEBUG
  console.log('HTML contains View Pic:', container.innerHTML.includes('View Pic')); // DEBUG
  
  setTimeout(() => {
    document.querySelectorAll('.video-fadein').forEach((el, idx) => {
      el.style.opacity = 1;
      el.style.transform = 'none';
    });
  }, 50);
}

function renderInterviewDesktopTable(videos) {
  console.log('=== ENTERING renderInterviewDesktopTable ==='); // DEBUG - Very first line
  try {
    console.log('Rendering interview desktop table for videos:', videos.length); // DEBUG
    const container = document.getElementById('videos-content');
    console.log('Container element found:', !!container); // DEBUG
    
    if (!container) {
      console.error('videos-content container not found!');
      return;
    }
    
    console.log('About to set container.innerHTML'); // DEBUG
    
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
      <div id="video-iframe-popup" class="video-iframe-popup hidden" style="display: none;">
        <div class="video-popup-inner">
          <button onclick="window.closeVideoIframePopup()" class="video-popup-close">&times;</button>
          <div id="video-iframe-container"></div>
        </div>
      </div>
    `;
    
    console.log('HTML assignment completed'); // DEBUG
    console.log('Desktop HTML contains View Pic:', container.innerHTML.includes('View Pic')); // DEBUG
    
    // Explicitly hide the video popup after creation
    setTimeout(() => {
      const videoPopup = document.getElementById('video-iframe-popup');
      if (videoPopup) {
        videoPopup.style.display = 'none';
        console.log('Video popup explicitly hidden'); // DEBUG
      }
    }, 10);
    
    setTimeout(() => {
      document.querySelectorAll('.video-fadein').forEach((el, idx) => {
        el.style.opacity = 1;
        el.style.transform = 'none';
      });
    }, 50);
    
    console.log('renderInterviewDesktopTable function completed successfully'); // DEBUG
  } catch (error) {
    console.error('Error in renderInterviewDesktopTable:', error); // DEBUG
    console.error('Error stack:', error.stack); // DEBUG
  }
  console.log('=== EXITING renderInterviewDesktopTable ==='); // DEBUG - Very last line
}
// Note popup functions already defined globally

