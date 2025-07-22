// videos.js
// Renders the video menu from json/videos/playlist-videos.json
// Card view for mobile, table for desktop, serial number, and responsive YouTube iframe popup

(function() {
  // Utility: detect mobile
  function isMobile() {
    return window.innerWidth <= 768;
  }

  // Fetch and render videos
  window.renderVideosTab = function() {
    // Return the HTML for the tab, and then load the videos after DOM insert
    setTimeout(() => {
      fetch('json/videos/playlist-videos.json')
        .then(r => r.json())
        .then(data => renderVideos(data))
        .catch(() => {
          const el = document.getElementById('videos-content');
          if (el) {
            el.innerHTML = '<div class="text-red-500">Failed to load videos.</div>';
          }
        });
    }, 0);
    return '<div class="w-full flex justify-center py-4"><span class="text-xl font-bold">Video Playlist</span></div>' +
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
    // Handles URLs like https://www.youtube.com/watch?v=xxxx or https://youtu.be/xxxx
    if (!url) return '';
    const match = url.match(/[?&]v=([^&#]+)/) || url.match(/youtu\.be\/([^?&#]+)/);
    return match ? match[1] : '';
  }

  function renderMobileCards(videos) {
    const container = document.getElementById('videos-content');
    container.innerHTML = videos.map((v, i) => {
      const youtubeId = getYoutubeId(v.URL);
      console.log('[VIDEOS] Mobile card:', v.Title, v.URL, 'YouTube ID:', youtubeId);
      return `
      <div class="bg-white rounded-lg shadow p-4 mb-4 flex flex-col">
        <div class="flex items-center mb-2">
          <span class="font-bold text-gray-700 mr-2">${i+1}.</span>
          <span class="font-semibold">${v.Title}</span>
        </div>
        <div class="text-gray-500 text-sm mb-2">${v.Note ? v.Note[0] : ''}</div>
        <button class="bg-blue-500 text-white rounded px-3 py-1 w-full" onclick="window.showVideoIframe('${youtubeId}', this)">Watch</button>
        <div class="video-iframe mt-2 hidden"></div>
        ${!youtubeId ? '<div class="text-red-500 text-xs mt-2">Invalid or missing YouTube ID</div>' : ''}
      </div>
      `;
    }).join('');
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
              <th class="px-4 py-2 text-left">Description</th>
              <th class="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            ${videos.map((v, i) => {
              const youtubeId = getYoutubeId(v.URL);
              console.log('[VIDEOS] Desktop row:', v.Title, v.URL, 'YouTube ID:', youtubeId);
              return `
                <tr class="border-b">
                  <td class="px-4 py-2">${i+1}</td>
                  <td class="px-4 py-2 font-semibold">${v.Title}</td>
                  <td class="px-4 py-2 text-sm text-gray-500">${v.Note ? v.Note[0] : ''}</td>
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
  }

  // Show iframe (mobile: in card, desktop: popup)
  window.showVideoIframe = function(youtubeId, btn) {
    if (isMobile()) {
      // Show in card
      const card = btn.closest('.bg-white');
      const iframeDiv = card.querySelector('.video-iframe');
      if (iframeDiv.classList.contains('hidden')) {
        iframeDiv.innerHTML = `<iframe width="100%" height="200" src="https://www.youtube.com/embed/${youtubeId}" frameborder="0" allowfullscreen></iframe>`;
        iframeDiv.classList.remove('hidden');
        btn.textContent = 'Hide';
      } else {
        iframeDiv.innerHTML = '';
        iframeDiv.classList.add('hidden');
        btn.textContent = 'Watch';
      }
    } else {
      // Show in popup
      const popup = document.getElementById('video-iframe-popup');
      const container = document.getElementById('video-iframe-container');
      container.innerHTML = `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${youtubeId}" frameborder="0" allowfullscreen></iframe>`;
      popup.classList.remove('hidden');
    }
  };

  window.closeVideoIframePopup = function() {
    const popup = document.getElementById('video-iframe-popup');
    const container = document.getElementById('video-iframe-container');
    container.innerHTML = '';
    popup.classList.add('hidden');
  };

  // Responsive: re-render on resize
  window.addEventListener('resize', function() {
    if (document.getElementById('videos-content')) {
      window.renderVideosTab();
    }
  });
})();
