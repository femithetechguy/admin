

window.showNotePopupB64 = function(b64) {
  let noteArr;
  try {
    noteArr = JSON.parse(decodeURIComponent(escape(atob(b64))));
  } catch (e) {
    noteArr = [];
  }
  const noteHtml = Array.isArray(noteArr) ? noteArr.map(p => `<p class='mb-2'>${p}</p>`).join('') : '';
  let popup = document.getElementById('note-popup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'note-popup';
    popup.className = 'fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50';
    popup.innerHTML = `
      <style>
        @media (min-width: 640px) {
          #note-popup-inner { margin: 0 !important; width: 80vw !important; height: 80vh !important; }
        }
      </style>
      <div id="note-popup-inner" class="bg-white rounded-lg shadow-lg relative animate-fadein flex flex-col items-stretch justify-stretch" style="width:80vw !important; height:80vh !important; margin:8px !important;">
        <button onclick=\"window.closeNotePopup()\" class=\"absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl\">&times;</button>
        <div class=\"text-2xl font-bold mb-6\" style=\"margin-top:2.5rem;\">Note</div>
        <div class=\"note-content text-gray-700 text-lg flex-1 overflow-y-auto\" style=\"min-height:0;\">${noteHtml || "<span class='text-gray-400'>No note available.</span>"}</div>
      </div>
    `;
    document.body.appendChild(popup);
  } else {
    const noteDiv = popup.querySelector('.note-content');
    if (noteDiv) noteDiv.innerHTML = noteHtml || '<span class=\'text-gray-400\'>No note available.</span>';
    popup.classList.remove('hidden');
  }
  popup.classList.remove('hidden');
};

window.closeNotePopup = function() {
  const popup = document.getElementById('note-popup');
  if (popup) popup.remove();
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

window.closeVideoIframePopup = function() {
  const popup = document.getElementById('video-iframe-popup');
  const container = document.getElementById('video-iframe-container');
  container.innerHTML = '';
  popup.classList.add('hidden');
};


// Utility: detect mobile
function isMobile() {
  return window.innerWidth <= 768;
}

// Fetch and render videos
window.renderInterviewTopicsTab = function() {
  setTimeout(() => {
    fetch('json/videos/power_bi_interview_playlist.json')
      .then(r => r.json())
      .then(data => renderVideos(data))
      .catch(() => {
        const el = document.getElementById('videos-content');
        if (el) {
          el.innerHTML = '<div class="text-red-500">Failed to load videos.</div>';
        }
      });
  }, 0);
  return '<div class="w-full flex justify-center py-4"><span class="text-xl font-bold">Interview Topics Playlist</span></div>' +
    '<div id="videos-content"></div>';
};

function renderVideos(videos) {
  if (isMobile()) {
    renderMobileCards(videos);
  } else {
    renderDesktopTable(videos);
  }
}

function getYoutubeId(url) {
  if (!url) return '';
  const match = url.match(/[?&]v=([^&#]+)/) || url.match(/youtu\.be\/([^?&#]+)/);
  return match ? match[1] : '';
}

function renderMobileCards(videos) {
  const container = document.getElementById('videos-content');
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
        <button class="bg-gray-200 text-gray-700 rounded px-2 py-1 text-xs w-max hover:bg-gray-300" onclick="window.showNotePopupB64('${btoa(unescape(encodeURIComponent(JSON.stringify(v.Note || []))))}')">Read Note</button>
      </div>
      <button class="bg-blue-500 text-white rounded px-3 py-1 w-full" onclick="window.showVideoIframe('${youtubeId}', this)">Watch</button>
      <div class="video-iframe mt-2 hidden"></div>
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

function renderDesktopTable(videos) {
  const container = document.getElementById('videos-content');
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
                  <button class="bg-gray-200 text-gray-700 rounded px-2 py-1 text-xs w-max hover:bg-gray-300" onclick="window.showNotePopupB64('${btoa(unescape(encodeURIComponent(JSON.stringify(v.Note || []))))}')">Read Note</button>
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
    <div id="video-iframe-popup" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 hidden">
      <div class="bg-white rounded-lg shadow-lg p-4 relative w-full max-w-xl">
        <button onclick="window.closeVideoIframePopup()" class="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl">&times;</button>
        <div id="video-iframe-container"></div>
      </div>
    </div>
  `;
  setTimeout(() => {
    document.querySelectorAll('.video-fadein').forEach((el, idx) => {
      el.style.opacity = 1;
      el.style.transform = 'none';
    });
  }, 50);
}

window.showNotePopupB64 = function(b64) {
  let noteArr;
  try {
    noteArr = JSON.parse(decodeURIComponent(escape(atob(b64))));
  } catch (e) {
    noteArr = [];
  }
  const noteHtml = Array.isArray(noteArr) ? noteArr.map(p => `<p class='mb-2'>${p}</p>`).join('') : '';
  let popup = document.getElementById('note-popup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'note-popup';
    popup.className = 'fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50';
    popup.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg p-6 relative w-full max-w-lg animate-fadein">
        <button onclick="window.closeNotePopup()" class="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl">&times;</button>
        <div class="text-lg font-bold mb-4">Note</div>
        <div class="note-content text-gray-700 text-base max-h-96 overflow-y-auto">${noteHtml || '<span class=\'text-gray-400\'>No note available.</span>'}</div>
      </div>
    `;
    document.body.appendChild(popup);
  } else {
    const noteDiv = popup.querySelector('.note-content');
    if (noteDiv) noteDiv.innerHTML = noteHtml || '<span class=\'text-gray-400\'>No note available.</span>';
    popup.classList.remove('hidden');
  }
  popup.classList.remove('hidden');
};

window.closeNotePopup = function() {
  const popup = document.getElementById('note-popup');
  if (popup) popup.remove();
};

