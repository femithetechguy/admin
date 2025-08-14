class NoteViewer {
  constructor() {
    this.notes = [];
    this.categories = [];
    this.selectedCategory = 'all';
    this.popup = null;
    this.inlineContainer = null;
    this.mode = 'popup'; // 'popup' or 'inline'
    this.debugMode = true; // Enable debug logging
    this.init();
  }

  // Debug logging helper
  debug(message, ...args) {
    if (this.debugMode) {
      console.log(`[NoteViewer] ${message}`, ...args);
    }
  }

  init() {
    this.debug('Initializing NoteViewer...');
    this.createPopupHTML();
    this.bindEvents();
    this.debug('NoteViewer initialized successfully');
  }

  createPopupHTML() {
    // Remove existing popup if it exists
    const existingPopup = document.getElementById('note-viewer-popup');
    if (existingPopup) {
      existingPopup.remove();
    }

    const popupHTML = `
      <div id="note-viewer-popup" class="note-viewer-popup" style="display: none;">
        <div class="note-viewer-overlay" onclick="window.noteViewer.close()"></div>
        <div class="note-viewer-container">
          <div class="note-viewer-header">
            <h3 class="note-viewer-title">Notes</h3>
            <button class="note-viewer-close" onclick="window.noteViewer.close()" title="Close">&times;</button>
          </div>
          <div class="note-viewer-content">
            <div class="note-viewer-sidebar">
              <div class="note-viewer-filters">
                <label class="note-viewer-filter-label">Filter by Category:</label>
                <select class="note-viewer-category-select" onchange="window.noteViewer.filterByCategory(this.value)">
                  <option value="all">All Categories</option>
                </select>
              </div>
              <div class="note-viewer-topics">
                <!-- Topics will be populated here -->
              </div>
            </div>
            <div class="note-viewer-main">
              <div class="note-viewer-welcome">
                <h2>Welcome to Notes</h2>
                <p>Select a topic from the sidebar to view its content.</p>
              </div>
              <div class="note-viewer-loading" style="display: none;">
                <div class="loading-spinner"></div>
                <p>Loading note content...</p>
              </div>
              <div class="note-viewer-markdown-content">
                <!-- Markdown content will be rendered here -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', popupHTML);
    this.popup = document.getElementById('note-viewer-popup');
  }

  bindEvents() {
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (this.popup && this.popup.style.display !== 'none') {
        if (e.key === 'Escape') {
          this.close();
        }
      }
    });
  }

  // Add copy functionality
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

  // Generate shareable link with topic-relevant URL and dynamic domain
  async generateShareLink(containerId, noteData) {
    this.debug('generateShareLink called', { containerId, noteData });
    
    try {
      // Create a topic-based slug for the URL
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

      // Store in localStorage with both share ID and topic slug as keys
      const shareKey = `share_${shareId}`;
      const slugKey = `slug_${topicSlug}`;
      
      this.debug('Storing in localStorage with keys:', { shareKey, slugKey });
      
      localStorage.setItem(shareKey, JSON.stringify(shareData));
      localStorage.setItem(slugKey, shareId); // Map slug to share ID

      // Generate the topic-relevant public URL with dynamic domain detection
      const currentDomain = this.getCurrentDomain();
      const shareUrl = `${currentDomain}?topic=${topicSlug}&share=${shareId}`;

      this.debug('Generated share URL:', shareUrl);

      // Copy to clipboard and show success
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

  // Get current domain dynamically
  getCurrentDomain() {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    const pathname = window.location.pathname;
    
    let baseUrl = `${protocol}//${hostname}`;
    
    // Add port if it's not standard (80 for http, 443 for https)
    if (port && 
        !((protocol === 'http:' && port === '80') || 
          (protocol === 'https:' && port === '443'))) {
      baseUrl += `:${port}`;
    }
    
    baseUrl += pathname;
    
    this.debug('Current domain detected:', {
      protocol,
      hostname,
      port,
      pathname,
      baseUrl
    });
    
    return baseUrl;
  }

  // Generate unique share ID
  generateShareId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    const shareId = `note_${timestamp}${random}`;
    
    this.debug('Generated share ID:', shareId);
    return shareId;
  }

  // Create a URL-friendly slug from topic title
  createTopicSlug(title) {
    this.debug('Creating topic slug from title:', title);
    
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 50); // Limit length
    
    this.debug('Created slug:', slug);
    return slug;
  }

  // Update checkForSharedContent to handle topic-based URLs
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
      // Try to find share ID from topic slug
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
      
      // Check if expired
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
      // Show shared content in a popup
      this.showSharedContentPopup(shareData);

    } catch (error) {
      this.debug('Error loading shared content:', error);
      console.error('Error loading shared content:', error);
      this.showNotification('', 'Error loading shared content', 'error');
    }
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

    // Auto-remove after 8 seconds
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

    // Auto-remove after 10 seconds
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

  // Update the loadAndDisplayInlineNote method to fix mobile button layout

  async loadAndDisplayInlineNote(containerId, markdownPath, topic, serialNo, category) {
    this.debug('=== loadAndDisplayInlineNote called ===');
    this.debug('containerId:', containerId);
    this.debug('markdownPath:', markdownPath);
    this.debug('topic:', topic);
    this.debug('serialNo:', serialNo);
    this.debug('category:', category);

    try {
      // Show loading state
      const contentDisplay = document.getElementById(`note-content-display-${containerId}`);
      const titleElement = document.getElementById(`current-note-title-${containerId}`);
      const bodyElement = document.getElementById(`note-content-body-${containerId}`);

      this.debug('DOM elements found:', {
        contentDisplay: !!contentDisplay,
        titleElement: !!titleElement,
        bodyElement: !!bodyElement
      });

      if (!contentDisplay || !titleElement || !bodyElement) {
        this.debug('Required elements not found for containerId:', containerId);
        console.error('Required elements not found for containerId:', containerId);
        return;
      }

      titleElement.innerHTML = `
        <div class="flex flex-col gap-4">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                #${serialNo}
              </span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                ${category}
              </span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900">${topic}</h3>
          </div>
          <div class="flex gap-2">
            <button 
              onclick="window.noteViewer.copyNoteContent('${containerId}', '${topic.replace(/'/g, "\\'")}', document.getElementById('note-content-body-${containerId}').innerHTML)"
              class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              title="Copy content to clipboard"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              <span>Copy</span>
            </button>
            <button 
              onclick="window.noteViewer.generateShareLink('${containerId}', { title: '${topic.replace(/'/g, "\\'")}', content: document.getElementById('note-content-body-${containerId}').innerHTML, serialNo: '${serialNo}', category: '${category}' })"
              class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              title="Generate shareable link"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
              </svg>
              <span>Share</span>
            </button>
          </div>
        </div>
      `;

      bodyElement.innerHTML = `
        <div class="flex items-center justify-center py-8">
          <div class="loading-spinner"></div>
          <span class="ml-3 text-gray-600">Loading content...</span>
        </div>
      `;

      contentDisplay.style.display = 'block';
      contentDisplay.scrollIntoView({ behavior: 'smooth' });

      this.debug('Loading state displayed, fetching markdown...');

      // Fetch markdown content
      const response = await fetch(markdownPath);
      this.debug('Markdown fetch response:', { status: response.status, ok: response.ok });
      
      if (!response.ok) {
        throw new Error(`Failed to load note: ${response.status}`);
      }

      const markdownContent = await response.text();
      this.debug('Markdown content loaded, length:', markdownContent.length);
      this.debug('Markdown preview:', markdownContent.substring(0, 200) + '...');

      // Convert to HTML
      const htmlContent = this.markdownToHTML(markdownContent);
      this.debug('HTML content generated, length:', htmlContent.length);
      
      // Display content
      bodyElement.innerHTML = htmlContent;
      this.debug('Content displayed in bodyElement');

    } catch (error) {
      this.debug('Error loading note:', error);
      console.error('Error loading note:', error);
      const bodyElement = document.getElementById(`note-content-body-${containerId}`);
      if (bodyElement) {
        bodyElement.innerHTML = `
          <div class="text-center py-8 text-red-500">
            <svg class="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p class="text-lg font-medium">Failed to load "${topic}"</p>
            <p class="text-sm">Error: ${error.message}</p>
            <p class="text-xs text-gray-400 mt-2">Path: ${markdownPath}</p>
          </div>
        `;
      }
    }
  }

  // Fix the shared content popup visibility and scrolling
  showSharedContentPopup(shareData) {
    this.debug('Showing shared content popup', shareData);
    
    const popup = document.createElement('div');
    popup.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 overflow-auto';
    popup.style.padding = '1rem';
    popup.style.paddingTop = '2rem'; // Add more top padding to ensure header is visible
    
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
                onclick="window.print()"
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

    // Scroll to top to ensure header is visible
    setTimeout(() => {
      popup.scrollTop = 0;
    }, 100);

    // Improved click outside to close
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        this.debug('Closing popup via click outside');
        popup.remove();
        document.body.style.overflow = '';
        window.history.replaceState({}, '', window.location.pathname);
      }
    });

    // Keyboard support
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

    // Focus management for accessibility
    const closeButton = popup.querySelector('button');
    closeButton.focus();
  }

  // Create inline note viewer section
  createInlineSection(containerId) {
    this.debug('Creating inline section for container:', containerId);
    return `
      <div class="note-viewer-section mt-6" id="note-viewer-inline-${containerId}">
        <div class="note-viewer-header-section">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Study Notes</h2>
          <p class="text-gray-600 mb-4">Browse and search through study materials by category</p>
        </div>
        
        <div class="note-viewer-controls mb-6">
          <div class="flex flex-col sm:flex-row gap-4">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">Search Notes</label>
              <input 
                type="text" 
                id="note-search-input-${containerId}" 
                placeholder="Search topics..." 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                oninput="window.noteViewer.searchNotes('${containerId}', this.value)"
              />
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
              <select 
                id="note-category-filter-${containerId}" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                onchange="window.noteViewer.filterByCategory('${containerId}', this.value)"
              >
                <option value="all">All Categories</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="note-topics-buttons mb-6" id="note-topics-buttons-${containerId}">
          <!-- Dynamic topic buttons will be populated here -->
        </div>
        
        <div class="note-content-display" id="note-content-display-${containerId}" style="display: none;">
          <div class="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
            <div class="note-content-header mb-4">
              <div id="current-note-title-${containerId}"></div>
              <button 
                onclick="window.noteViewer.closeNoteContent('${containerId}')" 
                class="mt-3 inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back to topics
              </button>
            </div>
            <div class="note-content-body prose prose-sm sm:prose max-w-none" id="note-content-body-${containerId}">
              <!-- Markdown content will be rendered here -->
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Initialize inline mode
  async initInline(containerId, notesJsonPath, title = 'Study Notes') {
    this.debug('=== initInline called ===');
    this.debug('containerId:', containerId);
    this.debug('notesJsonPath:', notesJsonPath);
    this.debug('title:', title);

    this.mode = 'inline';
    this.currentContainerId = containerId;

    try {
      // Load notes data
      this.debug('Fetching notes data...');
      const response = await fetch(notesJsonPath);
      this.debug('Fetch response:', { status: response.status, ok: response.ok });
      
      if (!response.ok) {
        throw new Error(`Failed to load notes: ${response.status}`);
      }

      const data = await response.json();
      this.debug('Notes data received:', data);
      
      this.notes = data.notes || [];
      this.filteredNotes = [...this.notes];

      this.debug('Notes loaded:', this.notes.length, 'total notes');

      // Extract and populate categories
      this.extractCategories();
      this.populateInlineCategories(containerId);

      // Render topic buttons
      this.renderInlineTopicButtons(containerId);

    } catch (error) {
      this.debug('Error initializing inline notes:', error);
      console.error('Error initializing inline notes:', error);
      this.showInlineError(containerId, `Failed to load notes: ${error.message}`);
    }
  }

  // Search notes for inline mode
  searchNotes(containerId, searchTerm) {
    this.debug('Searching notes:', searchTerm);
    
    const filtered = this.notes.filter(note => 
      note.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.category && note.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const categoryFilter = document.getElementById(`note-category-filter-${containerId}`);
    const selectedCategory = categoryFilter ? categoryFilter.value : 'all';

    if (selectedCategory !== 'all') {
      this.filteredNotes = filtered.filter(note => note.category === selectedCategory);
    } else {
      this.filteredNotes = filtered;
    }

    this.renderInlineTopicButtons(containerId);
  }

  // Filter by category for inline mode
  filterByCategory(containerId, category) {
    this.debug('Filtering by category:', category);
    
    const searchInput = document.getElementById(`note-search-input-${containerId}`);
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    let filtered = this.notes;

    if (category !== 'all') {
      filtered = this.notes.filter(note => note.category === category);
    }

    if (searchTerm) {
      filtered = filtered.filter(note => 
        note.topic.toLowerCase().includes(searchTerm) ||
        (note.category && note.category.toLowerCase().includes(searchTerm))
      );
    }

    this.filteredNotes = filtered;
    this.renderInlineTopicButtons(containerId);
  }

  // Populate categories for inline mode
  populateInlineCategories(containerId) {
    const categorySelect = document.getElementById(`note-category-filter-${containerId}`);
    if (!categorySelect) return;

    categorySelect.innerHTML = '<option value="all">All Categories</option>';
    this.categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
  }

  // Render topic buttons for inline mode
  renderInlineTopicButtons(containerId) {
    this.debug('=== renderInlineTopicButtons called ===');
    this.debug('containerId:', containerId);
    this.debug('filteredNotes length:', this.filteredNotes.length);

    const buttonsContainer = document.getElementById(`note-topics-buttons-${containerId}`);
    if (!buttonsContainer) {
      this.debug(`Buttons container not found: note-topics-buttons-${containerId}`);
      return;
    }

    if (this.filteredNotes.length === 0) {
      buttonsContainer.innerHTML = `
        <div class="text-center py-8">
          <div class="text-gray-500">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="text-lg font-medium">No notes found</p>
            <p class="text-sm">Try adjusting your search or filter criteria</p>
          </div>
        </div>
      `;
      return;
    }

    const buttonsHTML = this.filteredNotes.map(note => this.createInlineTopicButton(note, containerId)).join('');
    buttonsContainer.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${buttonsHTML}
      </div>
    `;

    this.debug('Topic buttons rendered');
  }

  // Create topic button for inline mode
  createInlineTopicButton(note, containerId) {
    const serialNo = note.serialNo || 'N/A';
    const category = note.category || 'Uncategorized';

    return `
      <button 
        class="topic-button text-left p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        onclick="window.noteViewer.loadAndDisplayInlineNote('${containerId}', '${note.markdownPath}', '${note.topic.replace(/'/g, "\\'")}', '${serialNo}', '${category}')"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            #${serialNo}
          </span>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            ${category}
          </span>
        </div>
        <h3 class="font-semibold text-gray-900 mb-1">${note.topic}</h3>
        <p class="text-sm text-gray-600">Click to read content</p>
      </button>
    `;
  }

  // Load and display note content for inline mode
  async loadAndDisplayInlineNote(containerId, markdownPath, topic, serialNo, category) {
    this.debug('=== loadAndDisplayInlineNote called ===');
    this.debug('containerId:', containerId);
    this.debug('markdownPath:', markdownPath);
    this.debug('topic:', topic);
    this.debug('serialNo:', serialNo);
    this.debug('category:', category);

    try {
      // Show loading state
      const contentDisplay = document.getElementById(`note-content-display-${containerId}`);
      const titleElement = document.getElementById(`current-note-title-${containerId}`);
      const bodyElement = document.getElementById(`note-content-body-${containerId}`);

      this.debug('DOM elements found:', {
        contentDisplay: !!contentDisplay,
        titleElement: !!titleElement,
        bodyElement: !!bodyElement
      });

      if (!contentDisplay || !titleElement || !bodyElement) {
        this.debug('Required elements not found for containerId:', containerId);
        console.error('Required elements not found for containerId:', containerId);
        return;
      }

      titleElement.innerHTML = `
        <div class="flex flex-col gap-4">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                #${serialNo}
              </span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                ${category}
              </span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900">${topic}</h3>
          </div>
          <div class="flex gap-2">
            <button 
              onclick="window.noteViewer.copyNoteContent('${containerId}', '${topic.replace(/'/g, "\\'")}', document.getElementById('note-content-body-${containerId}').innerHTML)"
              class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              title="Copy content to clipboard"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              <span>Copy</span>
            </button>
            <button 
              onclick="window.noteViewer.generateShareLink('${containerId}', { title: '${topic.replace(/'/g, "\\'")}', content: document.getElementById('note-content-body-${containerId}').innerHTML, serialNo: '${serialNo}', category: '${category}' })"
              class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              title="Generate shareable link"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
              </svg>
              <span>Share</span>
            </button>
          </div>
        </div>
      `;

      bodyElement.innerHTML = `
        <div class="flex items-center justify-center py-8">
          <div class="loading-spinner"></div>
          <span class="ml-3 text-gray-600">Loading content...</span>
        </div>
      `;

      contentDisplay.style.display = 'block';
      contentDisplay.scrollIntoView({ behavior: 'smooth' });

      this.debug('Loading state displayed, fetching markdown...');

      // Fetch markdown content
      const response = await fetch(markdownPath);
      this.debug('Markdown fetch response:', { status: response.status, ok: response.ok });
      
      if (!response.ok) {
        throw new Error(`Failed to load note: ${response.status}`);
      }

      const markdownContent = await response.text();
      this.debug('Markdown content loaded, length:', markdownContent.length);
      this.debug('Markdown preview:', markdownContent.substring(0, 200) + '...');

      // Convert to HTML
      const htmlContent = this.markdownToHTML(markdownContent);
      this.debug('HTML content generated, length:', htmlContent.length);
      
      // Display content
      bodyElement.innerHTML = htmlContent;
      this.debug('Content displayed in bodyElement');

    } catch (error) {
      this.debug('Error loading note:', error);
      console.error('Error loading note:', error);
      const bodyElement = document.getElementById(`note-content-body-${containerId}`);
      if (bodyElement) {
        bodyElement.innerHTML = `
          <div class="text-center py-8 text-red-500">
            <svg class="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p class="text-lg font-medium">Failed to load "${topic}"</p>
            <p class="text-sm">Error: ${error.message}</p>
            <p class="text-xs text-gray-400 mt-2">Path: ${markdownPath}</p>
          </div>
        `;
      }
    }
  }

  // Fix the shared content popup visibility and scrolling
  showSharedContentPopup(shareData) {
    this.debug('Showing shared content popup', shareData);
    
    const popup = document.createElement('div');
    popup.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 overflow-auto';
    popup.style.padding = '1rem';
    popup.style.paddingTop = '2rem'; // Add more top padding to ensure header is visible
    
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
                onclick="window.print()"
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

    // Scroll to top to ensure header is visible
    setTimeout(() => {
      popup.scrollTop = 0;
    }, 100);

    // Improved click outside to close
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        this.debug('Closing popup via click outside');
        popup.remove();
        document.body.style.overflow = '';
        window.history.replaceState({}, '', window.location.pathname);
      }
    });

    // Keyboard support
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

    // Focus management for accessibility
    const closeButton = popup.querySelector('button');
    closeButton.focus();
  }

  // Create inline note viewer section
  createInlineSection(containerId) {
    this.debug('Creating inline section for container:', containerId);
    return `
      <div class="note-viewer-section mt-6" id="note-viewer-inline-${containerId}">
        <div class="note-viewer-header-section">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Study Notes</h2>
          <p class="text-gray-600 mb-4">Browse and search through study materials by category</p>
        </div>
        
        <div class="note-viewer-controls mb-6">
          <div class="flex flex-col sm:flex-row gap-4">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">Search Notes</label>
              <input 
                type="text" 
                id="note-search-input-${containerId}" 
                placeholder="Search topics..." 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                oninput="window.noteViewer.searchNotes('${containerId}', this.value)"
              />
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
              <select 
                id="note-category-filter-${containerId}" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                onchange="window.noteViewer.filterByCategory('${containerId}', this.value)"
              >
                <option value="all">All Categories</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="note-topics-buttons mb-6" id="note-topics-buttons-${containerId}">
          <!-- Dynamic topic buttons will be populated here -->
        </div>
        
        <div class="note-content-display" id="note-content-display-${containerId}" style="display: none;">
          <div class="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
            <div class="note-content-header mb-4">
              <div id="current-note-title-${containerId}"></div>
              <button 
                onclick="window.noteViewer.closeNoteContent('${containerId}')" 
                class="mt-3 inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back to topics
              </button>
            </div>
            <div class="note-content-body prose prose-sm sm:prose max-w-none" id="note-content-body-${containerId}">
              <!-- Markdown content will be rendered here -->
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Initialize inline mode
  async initInline(containerId, notesJsonPath, title = 'Study Notes') {
    this.debug('=== initInline called ===');
    this.debug('containerId:', containerId);
    this.debug('notesJsonPath:', notesJsonPath);
    this.debug('title:', title);

    this.mode = 'inline';
    this.currentContainerId = containerId;

    try {
      // Load notes data
      this.debug('Fetching notes data...');
      const response = await fetch(notesJsonPath);
      this.debug('Fetch response:', { status: response.status, ok: response.ok });
      
      if (!response.ok) {
        throw new Error(`Failed to load notes: ${response.status}`);
      }

      const data = await response.json();
      this.debug('Notes data received:', data);
      
      this.notes = data.notes || [];
      this.filteredNotes = [...this.notes];

      this.debug('Notes loaded:', this.notes.length, 'total notes');

      // Extract and populate categories
      this.extractCategories();
      this.populateInlineCategories(containerId);

      // Render topic buttons
      this.renderInlineTopicButtons(containerId);

    } catch (error) {
      this.debug('Error initializing inline notes:', error);
      console.error('Error initializing inline notes:', error);
      this.showInlineError(containerId, `Failed to load notes: ${error.message}`);
    }
  }

  // Search notes for inline mode
  searchNotes(containerId, searchTerm) {
    this.debug('Searching notes:', searchTerm);
    
    const filtered = this.notes.filter(note => 
      note.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.category && note.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const categoryFilter = document.getElementById(`note-category-filter-${containerId}`);
    const selectedCategory = categoryFilter ? categoryFilter.value : 'all';

    if (selectedCategory !== 'all') {
      this.filteredNotes = filtered.filter(note => note.category === selectedCategory);
    } else {
      this.filteredNotes = filtered;
    }

    this.renderInlineTopicButtons(containerId);
  }

  // Filter by category for inline mode
  filterByCategory(containerId, category) {
    this.debug('Filtering by category:', category);
    
    const searchInput = document.getElementById(`note-search-input-${containerId}`);
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    let filtered = this.notes;

    if (category !== 'all') {
      filtered = this.notes.filter(note => note.category === category);
    }

    if (searchTerm) {
      filtered = filtered.filter(note => 
        note.topic.toLowerCase().includes(searchTerm) ||
        (note.category && note.category.toLowerCase().includes(searchTerm))
      );
    }

    this.filteredNotes = filtered;
    this.renderInlineTopicButtons(containerId);
  }

  // Populate categories for inline mode
  populateInlineCategories(containerId) {
    const categorySelect = document.getElementById(`note-category-filter-${containerId}`);
    if (!categorySelect) return;

    categorySelect.innerHTML = '<option value="all">All Categories</option>';
    this.categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
  }

  // Render topic buttons for inline mode
  renderInlineTopicButtons(containerId) {
    this.debug('=== renderInlineTopicButtons called ===');
    this.debug('containerId:', containerId);
    this.debug('filteredNotes length:', this.filteredNotes.length);

    const buttonsContainer = document.getElementById(`note-topics-buttons-${containerId}`);
    if (!buttonsContainer) {
      this.debug(`Buttons container not found: note-topics-buttons-${containerId}`);
      return;
    }

    if (this.filteredNotes.length === 0) {
      buttonsContainer.innerHTML = `
        <div class="text-center py-8">
          <div class="text-gray-500">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="text-lg font-medium">No notes found</p>
            <p class="text-sm">Try adjusting your search or filter criteria</p>
          </div>
        </div>
      `;
      return;
    }

    const buttonsHTML = this.filteredNotes.map(note => this.createInlineTopicButton(note, containerId)).join('');
    buttonsContainer.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${buttonsHTML}
      </div>
    `;

    this.debug('Topic buttons rendered');
  }

  // Create topic button for inline mode
  createInlineTopicButton(note, containerId) {
    const serialNo = note.serialNo || 'N/A';
    const category = note.category || 'Uncategorized';

    return `
      <button 
        class="topic-button text-left p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        onclick="window.noteViewer.loadAndDisplayInlineNote('${containerId}', '${note.markdownPath}', '${note.topic.replace(/'/g, "\\'")}', '${serialNo}', '${category}')"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            #${serialNo}
          </span>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            ${category}
          </span>
        </div>
        <h3 class="font-semibold text-gray-900 mb-1">${note.topic}</h3>
        <p class="text-sm text-gray-600">Click to read content</p>
      </button>
    `;
  }

  // Load and display note content for inline mode
  async loadAndDisplayInlineNote(containerId, markdownPath, topic, serialNo, category) {
    this.debug('=== loadAndDisplayInlineNote called ===');
    this.debug('containerId:', containerId);
    this.debug('markdownPath:', markdownPath);
    this.debug('topic:', topic);
    this.debug('serialNo:', serialNo);
    this.debug('category:', category);

    try {
      // Show loading state
      const contentDisplay = document.getElementById(`note-content-display-${containerId}`);
      const titleElement = document.getElementById(`current-note-title-${containerId}`);
      const bodyElement = document.getElementById(`note-content-body-${containerId}`);

      this.debug('DOM elements found:', {
        contentDisplay: !!contentDisplay,
        titleElement: !!titleElement,
        bodyElement: !!bodyElement
      });

      if (!contentDisplay || !titleElement || !bodyElement) {
        this.debug('Required elements not found for containerId:', containerId);
        console.error('Required elements not found for containerId:', containerId);
        return;
      }

      titleElement.innerHTML = `
        <div class="flex flex-col gap-4">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                #${serialNo}
              </span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                ${category}
              </span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900">${topic}</h3>
          </div>
          <div class="flex gap-2">
            <button 
              onclick="window.noteViewer.copyNoteContent('${containerId}', '${topic.replace(/'/g, "\\'")}', document.getElementById('note-content-body-${containerId}').innerHTML)"
              class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              title="Copy content to clipboard"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              <span>Copy</span>
            </button>
            <button 
              onclick="window.noteViewer.generateShareLink('${containerId}', { title: '${topic.replace(/'/g, "\\'")}', content: document.getElementById('note-content-body-${containerId}').innerHTML, serialNo: '${serialNo}', category: '${category}' })"
              class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              title="Generate shareable link"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
              </svg>
              <span>Share</span>
            </button>
          </div>
        </div>
      `;

      bodyElement.innerHTML = `
        <div class="flex items-center justify-center py-8">
          <div class="loading-spinner"></div>
          <span class="ml-3 text-gray-600">Loading content...</span>
        </div>
      `;

      contentDisplay.style.display = 'block';
      contentDisplay.scrollIntoView({ behavior: 'smooth' });

      this.debug('Loading state displayed, fetching markdown...');

      // Fetch markdown content
      const response = await fetch(markdownPath);
      this.debug('Markdown fetch response:', { status: response.status, ok: response.ok });
      
      if (!response.ok) {
        throw new Error(`Failed to load note: ${response.status}`);
      }

      const markdownContent = await response.text();
      this.debug('Markdown content loaded, length:', markdownContent.length);
      this.debug('Markdown preview:', markdownContent.substring(0, 200) + '...');

      // Convert to HTML
      const htmlContent = this.markdownToHTML(markdownContent);
      this.debug('HTML content generated, length:', htmlContent.length);
      
      // Display content
      bodyElement.innerHTML = htmlContent;
      this.debug('Content displayed in bodyElement');

    } catch (error) {
      this.debug('Error loading note:', error);
      console.error('Error loading note:', error);
      const bodyElement = document.getElementById(`note-content-body-${containerId}`);
      if (bodyElement) {
        bodyElement.innerHTML = `
          <div class="text-center py-8 text-red-500">
            <svg class="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p class="text-lg font-medium">Failed to load "${topic}"</p>
            <p class="text-sm">Error: ${error.message}</p>
            <p class="text-xs text-gray-400 mt-2">Path: ${markdownPath}</p>
          </div>
        `;
      }
    }
  }

  // Popup mode methods (existing)
  async show(notesJsonPath, title = '') {
    try {
      this.mode = 'popup';
      
      // Update title
      this.popup.querySelector('.note-viewer-title').textContent = title;
      
      // Fetch notes data
      const response = await fetch(notesJsonPath);
      if (!response.ok) {
        throw new Error(`Failed to load notes: ${response.status}`);
      }
      
      const data = await response.json();
      this.notes = data.notes || data;
      
      // Extract unique categories
      this.extractCategories();
      
      // Populate categories dropdown
      this.populateCategories();
      
      // Render topics
      this.renderTopics();
      
      // Show popup
      this.popup.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      
    } catch (error) {
      console.error('Error loading notes:', error);
      this.showError('Failed to load notes. Please try again.');
    }
  }

  extractCategories() {
    const categorySet = new Set();
    this.notes.forEach(note => {
      if (note.category) {
        categorySet.add(note.category);
      }
    });
    this.categories = Array.from(categorySet).sort();
  }

  populateCategories() {
    const select = this.popup.querySelector('.note-viewer-category-select');
    select.innerHTML = '<option value="all">All Categories</option>';
    
    this.categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      select.appendChild(option);
    });
  }

  filterByCategory(category) {
    this.selectedCategory = category;
    this.renderTopics();
    this.showWelcome();
  }

  renderTopics() {
    const topicsContainer = this.popup.querySelector('.note-viewer-topics');
    
    const filteredNotes = this.selectedCategory === 'all' 
      ? this.notes 
      : this.notes.filter(note => note.category === this.selectedCategory);
    
    if (filteredNotes.length === 0) {
      topicsContainer.innerHTML = '<div class="note-viewer-no-topics">No topics found</div>';
      return;
    }

    topicsContainer.innerHTML = filteredNotes.map((note, index) => 
      this.createTopicButton(note, index)
    ).join('');
  }

  createTopicButton(note, index) {
    return `
      <button 
        class="note-viewer-topic-btn" 
        onclick="window.noteViewer.loadNote('${note.markdownPath}', '${note.topic.replace(/'/g, "\\'")}', ${index})"
        title="${note.category || 'No category'}"
      >
        <div class="topic-serial">${note.serialNo || index + 1}</div>
        <div class="topic-info">
          <div class="topic-title">${note.topic}</div>
          <div class="topic-category">${note.category || 'Uncategorized'}</div>
        </div>
      </button>
    `;
  }

  async loadNote(markdownPath, topic, index) {
    try {
      this.showLoading();
      this.highlightSelectedTopic(index);
      
      const response = await fetch(markdownPath);
      if (!response.ok) {
        throw new Error(`Failed to load note: ${response.status}`);
      }
      
      const markdownContent = await response.text();
      const htmlContent = this.markdownToHTML(markdownContent);
      
      this.showContent(topic, htmlContent);
      
    } catch (error) {
      console.error('Error loading note:', error);
      this.showError(`Failed to load "${topic}". Please try again.`);
    } finally {
      this.hideLoading();
    }
  }

  markdownToHTML(markdown) {
    console.log('Converting markdown to HTML...');
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2 mt-4">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3 mt-6">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 mt-8 border-b-2 border-gray-200 pb-2">$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>');
    
    // Code blocks
    html = html.replace(/```([\s\S]*?)```/gim, '<pre class="bg-gray-100 p-4 rounded-md overflow-x-auto my-4 border"><code>$1</code></pre>');
    
    // Inline code
    html = html.replace(/`([^`]*)`/gim, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>');
    
    // Links
    html = html.replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2" target="_blank" class="text-blue-600 hover:text-blue-800 underline">$1</a>');
    
    // Lists - handle bullet points
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-4 mb-1">$1</li>');
    html = html.replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4 mb-1">$2</li>');
    
    // Wrap consecutive <li> elements in <ul>
    html = html.replace(/(<li>.*?<\/li>(\s*<li>.*?<\/li>)*)/gims, '<ul class="list-disc ml-6 mb-4">$1</ul>');
    
    // Paragraphs - convert double line breaks to paragraphs
    html = html.replace(/\n\n+/g, '</p><p class="mb-4">');
    html = '<p class="mb-4">' + html + '</p>';
    
    // Clean up empty paragraphs
    html = html.replace(/<p class="mb-4"><\/p>/g, '');
    
    // Single line breaks
    html = html.replace(/\n/gim, '<br>');
    
    console.log('Markdown conversion completed');
    return html;
  }

  highlightSelectedTopic(index) {
    this.popup.querySelectorAll('.note-viewer-topic-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    const buttons = this.popup.querySelectorAll('.note-viewer-topic-btn');
    if (buttons[index]) {
      buttons[index].classList.add('active');
    }
  }

  showContent(topic, htmlContent) {
    const mainContent = this.popup.querySelector('.note-viewer-main');
    mainContent.innerHTML = `
      <div class="note-viewer-content-header">
        <h2>${topic}</h2>
      </div>
      <div class="note-viewer-markdown-content">
        ${htmlContent}
      </div>
    `;
  }

  showWelcome() {
    const mainContent = this.popup.querySelector('.note-viewer-main');
    mainContent.innerHTML = `
      <div class="note-viewer-welcome">
        <h2>Welcome to Notes</h2>
        <p>Select a topic from the sidebar to view its content.</p>
        ${this.selectedCategory !== 'all' ? 
          `<p class="filter-info">Showing topics for: <strong>${this.selectedCategory}</strong></p>` : 
          ''
        }
      </div>
    `;
    
    this.popup.querySelectorAll('.note-viewer-topic-btn').forEach(btn => {
      btn.classList.remove('active');
    });
  }

  showLoading() {
    const loading = this.popup.querySelector('.note-viewer-loading');
    const content = this.popup.querySelector('.note-viewer-markdown-content');
    const welcome = this.popup.querySelector('.note-viewer-welcome');
    
    if (loading) loading.style.display = 'flex';
    if (content) content.style.display = 'none';
    if (welcome) welcome.style.display = 'none';
  }

  hideLoading() {
    const loading = this.popup.querySelector('.note-viewer-loading');
    if (loading) loading.style.display = 'none';
  }

  showError(message) {
    const mainContent = this.popup.querySelector('.note-viewer-main');
    mainContent.innerHTML = `
      <div class="note-viewer-error">
        <h3>Error</h3>
        <p>${message}</p>
        <button onclick="window.noteViewer.showWelcome()" class="retry-btn">Go Back</button>
      </div>
    `;
  }

  close() {
    if (this.mode === 'popup') {
      this.popup.style.display = 'none';
      document.body.style.overflow = '';
      this.showWelcome();
    }
  }

  // Initialize shared content check when page loads
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
      // Try to find share ID from topic slug
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
      
      // Check if expired
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
      // Show shared content in a popup
      this.showSharedContentPopup(shareData);

    } catch (error) {
      this.debug('Error loading shared content:', error);
      console.error('Error loading shared content:', error);
      this.showNotification('', 'Error loading shared content', 'error');
    }
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

    // Auto-remove after 8 seconds
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

    // Auto-remove after 10 seconds
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

  // Fix the scrollable popup issue
  showSharedContentPopup(shareData) {
    this.debug('Showing shared content popup', shareData);
    
    const popup = document.createElement('div');
    popup.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 overflow-auto';
    popup.style.padding = '1rem';
    popup.style.paddingTop = '2rem'; // Add more top padding to ensure header is visible
    
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
                onclick="window.print()"
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

    // Scroll to top to ensure header is visible
    setTimeout(() => {
      popup.scrollTop = 0;
    }, 100);

    // Improved click outside to close
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        this.debug('Closing popup via click outside');
        popup.remove();
        document.body.style.overflow = '';
        window.history.replaceState({}, '', window.location.pathname);
      }
    });

    // Keyboard support
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

    // Focus management for accessibility
    const closeButton = popup.querySelector('button');
    closeButton.focus();
  }
}

// Initialize global instance
window.noteViewer = new NoteViewer();

// Global functions
window.showNoteViewer = function(notesJsonPath, title = 'Notes') {
  window.noteViewer.show(notesJsonPath, title);
};

window.createInlineNoteViewer = function(containerId) {
  return window.noteViewer.createInlineSection(containerId);
};

window.initInlineNoteViewer = function(containerId, notesJsonPath, title = 'Study Notes') {
  return window.noteViewer.initInline(containerId, notesJsonPath, title);
};

// Initialize shared content check when page loads
document.addEventListener('DOMContentLoaded', () => {
  if (window.noteViewer) {
    window.noteViewer.checkForSharedContent();
  }
});