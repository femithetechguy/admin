// Share and copy functionality
class NoteViewerSharing extends NoteViewerCore {
  // Copy note content to clipboard
  copyNoteContent(containerId, noteTitle, noteContent) {
    this.debug('copyNoteContent called', { containerId, noteTitle, contentLength: noteContent.length });
    
    const textContent = this.extractTextFromHTML(noteContent);
    const copyText = `${noteTitle}\n\n${textContent}`;
    
    this.debug('Extracted text content length:', textContent.length);
    this.debug('Final copy text preview:', copyText.substring(0, 200) + '...');
    
    if (navigator.clipboard) {
      this.debug('Using modern clipboard API');
      navigator.clipboard.writeText(copyText).then(() => {
        this.debug('Copy successful via clipboard API');
        this.showCopySuccess(containerId);
      }).catch(err => {
        this.debug('Clipboard API failed:', err);
        console.error('Failed to copy:', err);
        this.fallbackCopy(copyText, containerId);
      });
    } else {
      this.debug('Clipboard API not available, using fallback');
      this.fallbackCopy(copyText, containerId);
    }
  }

  // Fallback copy method for older browsers
  fallbackCopy(text, containerId) {
    this.debug('Using fallback copy method');
    
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      this.debug('execCommand copy result:', successful);
      
      if (successful) {
        this.showCopySuccess(containerId);
      } else {
        this.showCopyError(containerId);
      }
    } catch (err) {
      this.debug('execCommand copy failed:', err);
      console.error('Fallback copy failed:', err);
      this.showCopyError(containerId);
    }
    
    document.body.removeChild(textArea);
  }

  // Extract plain text from HTML content
  extractTextFromHTML(html) {
    this.debug('Extracting text from HTML, input length:', html.length);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Replace headers with proper line breaks
    tempDiv.querySelectorAll('h1, h2, h3').forEach((header, index) => {
      this.debug(`Processing header ${index + 1}:`, header.textContent);
      header.innerHTML = '\n\n' + header.textContent + '\n';
    });
    
    // Replace list items with bullet points
    tempDiv.querySelectorAll('li').forEach((li, index) => {
      this.debug(`Processing list item ${index + 1}:`, li.textContent.substring(0, 50) + '...');
      li.innerHTML = '• ' + li.textContent + '\n';
    });
    
    // Replace paragraphs with line breaks
    tempDiv.querySelectorAll('p').forEach((p, index) => {
      this.debug(`Processing paragraph ${index + 1}:`, p.textContent.substring(0, 50) + '...');
      p.innerHTML = p.textContent + '\n\n';
    });
    
    const extractedText = tempDiv.textContent.trim();
    this.debug('Text extraction complete, output length:', extractedText.length);
    
    return extractedText;
  }

  // Generate shareable link
  async generateShareLink(containerId, noteData) {
    this.debug('generateShareLink called', { containerId, noteData });
    
    try {
      const topicSlug = this.createTopicSlug(noteData.title);
      const shareId = this.generateShareId();
      
      this.debug('Generated slug and share ID', { topicSlug, shareId });
      
      const shareData = {
        id: shareId,
        title: noteData.title,
        content: noteData.content,
        serialNo: noteData.serialNo,
        category: noteData.category,
        topicSlug: topicSlug,
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      };

      this.debug('Share data created', shareData);

      const shareKey = `share_${shareId}`;
      const slugKey = `slug_${topicSlug}`;
      
      this.debug('Storing in localStorage with keys:', { shareKey, slugKey });
      
      localStorage.setItem(shareKey, JSON.stringify(shareData));
      localStorage.setItem(slugKey, shareId);

      const currentDomain = this.getCurrentDomain();
      const shareUrl = `${currentDomain}?topic=${topicSlug}&share=${shareId}`;

      this.debug('Generated share URL:', shareUrl);

      if (navigator.clipboard) {
        this.debug('Copying to clipboard using modern API');
        await navigator.clipboard.writeText(shareUrl);
        this.showShareSuccess(containerId, shareUrl);
      } else {
        this.debug('Using fallback for share URL display');
        this.showShareUrl(containerId, shareUrl);
      }

    } catch (error) {
      this.debug('Error in generateShareLink:', error);
      console.error('Error generating share link:', error);
      this.showNotification(containerId, 'Failed to generate share link', 'error');
    }
  }

  // Show copy success message
  showCopySuccess(containerId) {
    this.debug('Showing copy success for container:', containerId);
    this.showNotification(containerId, 'Content copied to clipboard!', 'success');
  }

  // Show copy error message
  showCopyError(containerId) {
    this.debug('Showing copy error for container:', containerId);
    this.showNotification(containerId, 'Failed to copy content', 'error');
  }

  // Show share success with URL
  showShareSuccess(containerId, shareUrl) {
    this.debug('Showing share success', { containerId, shareUrl });
    
    const notification = document.createElement('div');
    notification.className = 'share-success-popup fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
    notification.innerHTML = `
      <div class="flex items-start gap-3">
        <svg class="w-6 h-6 text-white flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <div class="flex-1">
          <p class="font-medium mb-2">Share link created and copied!</p>
          <div class="text-sm bg-green-600 p-2 rounded break-all">
            ${shareUrl}
          </div>
          <p class="text-xs mt-2 opacity-90">Link expires in 7 days</p>
        </div>
        <button onclick="this.closest('.share-success-popup').remove()" class="text-white hover:text-gray-200">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        this.debug('Auto-removing share success notification');
        notification.remove();
      }
    }, 8000);
  }

  // Show share URL (fallback)
  showShareUrl(containerId, shareUrl) {
    this.debug('Showing share URL fallback', { containerId, shareUrl });
    
    const notification = document.createElement('div');
    notification.className = 'share-url-popup fixed top-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
    notification.innerHTML = `
      <div class="flex items-start gap-3">
        <svg class="w-6 h-6 text-white flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
        </svg>
        <div class="flex-1">
          <p class="font-medium mb-2">Share link created!</p>
          <input 
            type="text" 
            value="${shareUrl}" 
            readonly 
            class="w-full text-sm bg-blue-600 p-2 rounded border-none text-white placeholder-blue-200"
            onclick="this.select()"
          />
          <button 
            onclick="navigator.clipboard.writeText('${shareUrl}').then(() => { this.textContent = 'Copied!'; setTimeout(() => this.textContent = 'Copy Link', 2000); })"
            class="mt-2 text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
          >
            Copy Link
          </button>
          <p class="text-xs mt-2 opacity-90">Link expires in 7 days</p>
        </div>
        <button onclick="this.closest('.share-url-popup').remove()" class="text-white hover:text-gray-200">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        this.debug('Auto-removing share URL notification');
        notification.remove();
      }
    }, 10000);
  }

  // Generic notification system
  showNotification(containerId, message, type = 'info') {
    this.debug('Showing notification', { containerId, message, type });
    
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500',
      warning: 'bg-yellow-500'
    };

    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white p-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full`;
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <span>${message}</span>
        <button onclick="this.closest('div').remove()" class="ml-2 text-white hover:text-gray-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 10);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
          if (notification.parentNode) {
            this.debug('Auto-removing notification');
            notification.remove();
          }
        }, 300);
      }
    }, 3000);
  }

  // Check for shared content on page load
  checkForSharedContent() {
    this.debug('Checking for shared content in URL');
    
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get('share');
    const topicSlug = urlParams.get('topic');
    
    this.debug('URL parameters found:', { shareId, topicSlug });
    
    if (shareId) {
      this.debug('Found share ID in URL, loading shared content');
      this.loadSharedContent(shareId);
    } else if (topicSlug) {
      this.debug('Found topic slug in URL, looking up share ID');
      const slugKey = `slug_${topicSlug}`;
      const mappedShareId = localStorage.getItem(slugKey);
      
      this.debug('Slug lookup result:', { slugKey, mappedShareId });
      
      if (mappedShareId) {
        this.debug('Found mapped share ID, loading content');
        this.loadSharedContent(mappedShareId);
      } else {
        this.debug('No mapped share ID found for slug');
        this.showNotification('', 'Shared content not found', 'error');
      }
    } else {
      this.debug('No share parameters found in URL');
    }
  }

  // Load shared content
  loadSharedContent(shareId) {
    this.debug('Loading shared content for ID:', shareId);
    
    try {
      const shareKey = `share_${shareId}`;
      const shareDataStr = localStorage.getItem(shareKey);
      
      this.debug('Share key lookup result:', { shareKey, found: !!shareDataStr });
      
      if (!shareDataStr) {
        this.debug('Share data not found in localStorage');
        this.showNotification('', 'Shared content not found or has expired', 'error');
        return;
      }

      const shareData = JSON.parse(shareDataStr);
      
      this.debug('Parsed share data:', shareData);
      
      const now = new Date();
      const expiresAt = new Date(shareData.expiresAt);
      
      this.debug('Expiration check:', { now, expiresAt, expired: now > expiresAt });
      
      if (now > expiresAt) {
        this.debug('Content has expired, removing from storage');
        localStorage.removeItem(shareKey);
        this.showNotification('', 'Shared content has expired', 'error');
        return;
      }

      this.debug('Content is valid, showing popup');
      this.showSharedContentPopup(shareData);

    } catch (error) {
      this.debug('Error loading shared content:', error);
      console.error('Error loading shared content:', error);
      this.showNotification('', 'Error loading shared content', 'error');
    }
  }

  // Show shared content popup
  showSharedContentPopup(shareData) {
    this.debug('Showing shared content popup', shareData);
    
    const popup = document.createElement('div');
    popup.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 overflow-auto';
    popup.style.padding = '1rem';
    popup.style.paddingTop = '2rem';
    
    popup.innerHTML = `
      <div class="bg-white rounded-lg w-full max-w-4xl mx-auto flex flex-col min-h-[calc(100vh-4rem)]">
        <div class="flex justify-between items-start p-4 border-b bg-blue-50 flex-shrink-0 sticky top-0 z-10">
          <div class="flex-1 pr-4">
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                #${shareData.serialNo}
              </span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                ${shareData.category}
              </span>
              <span class="text-xs text-gray-500">📤 Shared Content</span>
            </div>
            <h2 class="text-lg sm:text-xl font-bold text-gray-900 break-words">${shareData.title}</h2>
          </div>
          <button 
            onclick="this.closest('.fixed').remove(); document.body.style.overflow = ''; window.history.replaceState({}, '', window.location.pathname);" 
            class="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none p-2 hover:bg-gray-100 rounded transition-colors flex-shrink-0 ml-2"
            title="Close"
          >
            ×
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-4 sm:p-6">
          <div class="prose prose-sm sm:prose lg:prose-lg max-w-none">
            ${shareData.content}
          </div>
        </div>
        
        <div class="border-t p-4 bg-gray-50 text-center flex-shrink-0">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <div class="text-center sm:text-left">
              📅 Shared on ${new Date(shareData.timestamp).toLocaleDateString()} • 
              ⏰ Expires ${new Date(shareData.expiresAt).toLocaleDateString()}
            </div>
            <div class="flex gap-2">
              <button 
                onclick="window.noteViewer.copyNoteContent('shared', '${shareData.title.replace(/'/g, "\\'")}', document.querySelector('.prose').innerHTML)"
                class="inline-flex items-center gap-1 px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                📋 Copy
              </button>
              <button 
                onclick="window.noteViewer.printSharedContent(${JSON.stringify(shareData).replace(/"/g, '&quot;')})"
                class="inline-flex items-center gap-1 px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                🖨️ Print
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(popup);
    document.body.style.overflow = 'hidden';

    this.debug('Shared content popup added to DOM');

    setTimeout(() => {
      popup.scrollTop = 0;
    }, 100);

    // Close handlers
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        this.debug('Closing popup via click outside');
        popup.remove();
        document.body.style.overflow = '';
        window.history.replaceState({}, '', window.location.pathname);
      }
    });

    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        this.debug('Closing popup via Escape key');
        popup.remove();
        document.body.style.overflow = '';
        window.history.replaceState({}, '', window.location.pathname);
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    
    document.addEventListener('keydown', handleKeydown);

    const closeButton = popup.querySelector('button');
    closeButton.focus();
  }
}

window.NoteViewerSharing = NoteViewerSharing;