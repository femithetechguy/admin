
/**
 * Shows a responsive popup with content loaded from a link (URL or HTML string).
 * Usage: showPopup({ title, url, html })
 * - If url is provided, fetches and displays its content (HTML/text).
 * - If html is provided, displays it directly.
 * - Only one popup is shown at a time.
 */
window.showPopup = function({ title = '', url = '', html = '' } = {}) {
  // Remove any existing popup
  const existing = document.getElementById('custom-popup-root');
  if (existing) existing.remove();

  // Create popup root
  const popupRoot = document.createElement('div');
  popupRoot.id = 'custom-popup-root';
  popupRoot.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm';
  popupRoot.innerHTML = `
    <div class="relative w-full max-w-lg mx-2 sm:mx-0 bg-white rounded-lg shadow-lg animate-fadeIn">
      <button id="popup-close-btn" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none transition" aria-label="Close popup">&times;</button>
      <div class="p-4 border-b flex items-center gap-2">
        <span class="font-semibold text-lg text-gray-800">${title || ''}</span>
      </div>
      <div id="popup-content" class="p-4 min-h-[120px] max-h-[60vh] overflow-y-auto text-gray-700 text-sm">
        <div class="w-full flex justify-center py-8"><span class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></span></div>
      </div>
    </div>
  `;
  document.body.appendChild(popupRoot);

  // Close logic
  const closeBtn = document.getElementById('popup-close-btn');
  if (closeBtn) closeBtn.onclick = () => popupRoot.remove();
  popupRoot.onclick = (e) => {
    if (e.target === popupRoot) popupRoot.remove();
  };

  // Load content
  const contentDiv = document.getElementById('popup-content');
  if (html) {
    contentDiv.innerHTML = html;
  } else if (url) {
    fetch(url)
      .then(res => res.text())
      .then(text => {
        // Try to extract <body> if present
        const match = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        contentDiv.innerHTML = match ? match[1] : text;
      })
      .catch(() => {
        contentDiv.innerHTML = '<div class="text-red-500 text-center py-8">Failed to load content.</div>';
      });
  } else {
    contentDiv.innerHTML = '<div class="text-gray-400 text-center py-8">No content.</div>';
  }
}
