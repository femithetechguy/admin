// Direct, simple note viewer implementation

console.log('[NoteViewer] Loading note viewer script...');

// Clear any existing instance
if (window.noteViewer) {
  console.log('[NoteViewer] Replacing existing instance');
}

// Create note viewer object directly
window.noteViewer = {
  notes: [],
  categories: [],
  selectedCategory: 'all',
  filteredNotes: [],
  mode: 'popup',
  debugMode: true,
  currentContainerId: null,
  modulesLoaded: false,
  initPromise: null,
  markdownCache: {}, // Cache loaded markdown content

  debug: function(message, ...args) {
    if (this.debugMode) {
      console.log(`[NoteViewer] ${message}`, ...args);
    }
  },

  createInlineSection: function(containerId) {
    this.debug('Creating basic inline section for container:', containerId);
    
    if (!containerId) {
      console.error('[NoteViewer] createInlineSection called without containerId');
      return '<div class="text-red-500">Error: No container ID provided</div>';
    }

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
                style="font-size: 16px !important; max-width: 100%; box-sizing: border-box; min-height: 44px;"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
                inputmode="search"
              />
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
              <select 
                id="note-category-filter-${containerId}" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                style="font-size: 16px !important; max-width: 100%; box-sizing: border-box; min-height: 44px;"
              >
                <option value="all">All Categories</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="note-topics-buttons mb-6" id="note-topics-buttons-${containerId}">
          <div class="text-center py-8 text-gray-500">
            <div class="loading-spinner mx-auto mb-4" style="border: 2px solid #f3f4f6; border-top: 2px solid #3b82f6; border-radius: 50%; width: 20px; height: 20px; animation: spin 1s linear infinite;"></div>
            <p>Loading notes...</p>
          </div>
        </div>
        
        <div class="note-content-display" id="note-content-display-${containerId}" style="display: none;">
          <div class="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
            <div class="note-content-header mb-4">
              <div id="current-note-title-${containerId}"></div>
              <button 
                onclick="document.getElementById('note-content-display-${containerId}').style.display = 'none'; document.getElementById('note-topics-buttons-${containerId}').style.display = 'block';" 
                class="mt-3 inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back to topics
              </button>
            </div>
            <div class="note-content-body prose prose-sm sm:prose max-w-none" id="note-content-body-${containerId}">
              <!-- Content will be loaded here -->
            </div>
          </div>
        </div>
      </div>
    `;
  },

  initInline: async function(containerId, notesJsonPath, title = 'Study Notes') {
    this.debug('initInline called with:', { containerId, notesJsonPath, title });
    
    if (!containerId) {
      console.error('[NoteViewer] initInline called without containerId');
      return;
    }

    try {
      // Load modules first
      await this.loadModules();
      
      if (notesJsonPath) {
        await this.loadBasicNotes(containerId, notesJsonPath);
      } else {
        this.showBasicInlineMessage(containerId);
      }
    } catch (error) {
      console.error('[NoteViewer] Error in initInline:', error);
      this.showBasicInlineMessage(containerId);
    }
  },

  loadBasicNotes: async function(containerId, notesJsonPath) {
    this.debug('Loading basic notes from:', notesJsonPath);
    
    const container = document.getElementById(`note-topics-buttons-${containerId}`);
    
    try {
      // Show loading
      if (container) {
        container.innerHTML = `
          <div class="text-center py-8 text-blue-600">
            <div class="loading-spinner mx-auto mb-4" style="border: 2px solid #f3f4f6; border-top: 2px solid #3b82f6; border-radius: 50%; width: 20px; height: 20px; animation: spin 1s linear infinite;"></div>
            <p>Loading notes from ${notesJsonPath}...</p>
          </div>
        `;
      }

      const response = await fetch(notesJsonPath);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.debug('Notes data loaded:', data);
      
      // Store notes for searching/filtering
      this.notes = data.notes || data || [];
      this.currentContainerId = containerId;
      
      if (!Array.isArray(this.notes)) {
        throw new Error('Data is not an array of notes');
      }
      
      // Update category filter
      this.updateCategoryFilter(containerId);
      
      // Display notes
      if (container && this.notes.length > 0) {
        container.innerHTML = this.renderBasicNotesList(this.notes, containerId);
        this.setupBasicSearch(containerId);
      } else if (container) {
        container.innerHTML = `
          <div class="text-center py-8 text-gray-500">
            <p>No notes found in the data file</p>
            <p class="text-xs text-gray-400 mt-2">Loaded ${this.notes.length} items from ${notesJsonPath}</p>
          </div>
        `;
      }
      
      // Trigger event for modules that might be waiting
      const event = new CustomEvent('noteViewerReady', { 
        detail: { containerId, notes: this.notes } 
      });
      window.dispatchEvent(event);
      
      return data;
    } catch (error) {
      console.error('[NoteViewer] Error loading basic notes:', error);
      if (container) {
        container.innerHTML = `
          <div class="text-center py-8 text-red-500">
            <p class="text-lg font-medium">Error Loading Notes</p>
            <p class="text-sm">${error.message}</p>
            <p class="text-xs text-gray-400 mt-2">Path: ${notesJsonPath}</p>
            <button onclick="window.noteViewer.loadBasicNotes('${containerId}', '${notesJsonPath}')" 
                    class="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Retry
            </button>
          </div>
        `;
      }
      throw error;
    }
  },

  // Load markdown content from file
  loadMarkdownContent: async function(markdownPath) {
    this.debug('Loading markdown from:', markdownPath);
    
    // Check cache first
    if (this.markdownCache[markdownPath]) {
      this.debug('Using cached markdown for:', markdownPath);
      return this.markdownCache[markdownPath];
    }

    try {
      const response = await fetch(markdownPath);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const content = await response.text();
      
      // Cache the content
      this.markdownCache[markdownPath] = content;
      
      return content;
    } catch (error) {
      console.error('[NoteViewer] Error loading markdown:', error);
      return `# Error Loading Content\n\nFailed to load markdown file: ${markdownPath}\n\nError: ${error.message}`;
    }
  },

  // Simple markdown to HTML converter
  markdownToHtml: function(markdown) {
    if (!markdown) return '';
    
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      
      // Bold and Italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-3 rounded border overflow-x-auto text-sm"><code>$1</code></pre>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>')
      
      // Lists
      .replace(/^\* (.*$)/gim, '<li class="ml-4">• $1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>')
      
      // Line breaks
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/\n/g, '<br>');
    
    // Wrap in paragraphs
    html = '<p class="mb-3">' + html + '</p>';
    
    // Fix empty paragraphs
    html = html.replace(/<p class="mb-3"><\/p>/g, '');
    
    return html;
  },

  updateCategoryFilter: function(containerId) {
    const filterSelect = document.getElementById(`note-category-filter-${containerId}`);
    if (!filterSelect || !this.notes) return;

    // Get unique categories
    const categories = [...new Set(this.notes.map(note => note.category).filter(Boolean))];
    
    // Update select options
    filterSelect.innerHTML = `
      <option value="all">All Categories (${this.notes.length})</option>
      ${categories.map(cat => {
        const count = this.notes.filter(note => note.category === cat).length;
        return `<option value="${cat}">${cat} (${count})</option>`;
      }).join('')}
    `;
  },

  setupBasicSearch: function(containerId) {
    const searchInput = document.getElementById(`note-search-input-${containerId}`);
    const categoryFilter = document.getElementById(`note-category-filter-${containerId}`);
    
    if (searchInput) {
      searchInput.oninput = () => this.performBasicSearch(containerId);
    }
    
    if (categoryFilter) {
      categoryFilter.onchange = () => this.performBasicSearch(containerId);
    }
  },

  performBasicSearch: function(containerId) {
    const searchInput = document.getElementById(`note-search-input-${containerId}`);
    const categoryFilter = document.getElementById(`note-category-filter-${containerId}`);
    const container = document.getElementById(`note-topics-buttons-${containerId}`);
    
    if (!searchInput || !categoryFilter || !container || !this.notes) return;

    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;

    // Filter notes
    let filteredNotes = this.notes.filter(note => {
      const matchesSearch = !searchTerm || 
        (note.title && note.title.toLowerCase().includes(searchTerm)) ||
        (note.topic && note.topic.toLowerCase().includes(searchTerm)) ||
        (note.content && note.content.toLowerCase().includes(searchTerm)) ||
        (note.summary && note.summary.toLowerCase().includes(searchTerm));
      
      const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Update display
    if (filteredNotes.length > 0) {
      container.innerHTML = this.renderBasicNotesList(filteredNotes, containerId);
    } else {
      container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <p>No notes match your search criteria</p>
          <p class="text-sm text-gray-400">Searching in ${this.notes.length} total notes</p>
          <button onclick="document.getElementById('note-search-input-${containerId}').value = ''; document.getElementById('note-category-filter-${containerId}').value = 'all'; window.noteViewer.performBasicSearch('${containerId}');" 
                  class="mt-2 text-blue-600 hover:text-blue-800">Clear filters</button>
        </div>
      `;
    }
  },

  renderBasicNotesList: function(notes, containerId) {
    if (!notes || notes.length === 0) {
      return `
        <div class="text-center py-8 text-gray-500">
          <p>No notes available</p>
        </div>
      `;
    }

    return `
      <div class="mb-4 text-sm text-gray-600">
        Showing ${notes.length} note${notes.length === 1 ? '' : 's'}
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${notes.map((note, index) => `
          <button 
            onclick="window.noteViewer.showBasicNote('${containerId}', ${index})"
            class="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white"
          >
            <div class="flex justify-between items-start mb-2">
              <div class="font-medium text-gray-900">${note.title || note.topic || 'Untitled'}</div>
              ${note.serialNo ? `<span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">#${note.serialNo}</span>` : ''}
            </div>
            ${note.category ? `<div class="text-xs text-blue-600 mb-2">${note.category}</div>` : ''}
            ${note.markdownPath ? `<div class="text-xs text-gray-400">📄 ${note.markdownPath}</div>` : ''}
          </button>
        `).join('')}
      </div>
    `;
  },

  showBasicNote: async function(containerId, noteIndex) {
    if (!this.notes || !this.notes[noteIndex]) {
      console.error('[NoteViewer] Note not found:', noteIndex);
      return;
    }

    const note = this.notes[noteIndex];
    this.debug('Showing basic note:', note);
    
    const contentDisplay = document.getElementById(`note-content-display-${containerId}`);
    const titleElement = document.getElementById(`current-note-title-${containerId}`);
    const bodyElement = document.getElementById(`note-content-body-${containerId}`);
    const topicsContainer = document.getElementById(`note-topics-buttons-${containerId}`);
    
    if (contentDisplay && titleElement && bodyElement) {
      // Ensure modules are loaded
      if (!this.modulesLoaded) {
        await this.loadModules();
      }

      // Show title with action buttons - REMOVED PRINT BUTTON
      titleElement.innerHTML = `
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">${note.title || note.topic || 'Untitled'}</h1>
            ${note.category ? `<div class="text-sm text-blue-600 mt-1">${note.category}</div>` : ''}
          </div>
          <div class="action-buttons-container">
            <div class="flex gap-2">
              <button 
                onclick="window.noteViewer.handleCopyNote('${containerId}', ${noteIndex})"
                class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                title="Copy content to clipboard"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z"></path>
                </svg>
                <span>Copy</span>
              </button>
              <button 
                onclick="window.noteViewer.handleShareNote('${containerId}', ${noteIndex})"
                class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                title="Share this note"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                </svg>
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      `;
      
      bodyElement.innerHTML = `
        <div class="text-center py-8 text-blue-600">
          <div class="loading-spinner mx-auto mb-4" style="border: 2px solid #f3f4f6; border-top: 2px solid #3b82f6; border-radius: 50%; width: 20px; height: 20px; animation: spin 1s linear infinite;"></div>
          <p>Loading content...</p>
        </div>
      `;
      
      // Hide topics, show content
      if (topicsContainer) topicsContainer.style.display = 'none';
      contentDisplay.style.display = 'block';
      
      // Scroll to content
      contentDisplay.scrollIntoView({ behavior: 'smooth' });

      try {
        // Load markdown content if path is provided
        let content = '';
        if (note.markdownPath) {
          const markdownContent = await this.loadMarkdownContent(note.markdownPath);
          content = this.markdownToHtml(markdownContent);
        } else {
          content = note.content || note.summary || 'No content available';
          content = this.markdownToHtml(content);
        }
        
        bodyElement.innerHTML = `<div class="prose prose-sm max-w-none">${content}</div>`;
      } catch (error) {
        console.error('[NoteViewer] Error loading note content:', error);
        bodyElement.innerHTML = `
          <div class="text-center py-8 text-red-500">
            <p class="text-lg font-medium">Error Loading Content</p>
            <p class="text-sm">${error.message}</p>
            ${note.markdownPath ? `<p class="text-xs text-gray-400 mt-2">Path: ${note.markdownPath}</p>` : ''}
            <button onclick="window.noteViewer.showBasicNote('${containerId}', ${noteIndex})" 
                    class="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Retry
            </button>
          </div>
        `;
      }
    }
  },

  showBasicInlineMessage: function(containerId) {
    const container = document.getElementById(`note-topics-buttons-${containerId}`);
    if (container) {
      container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <p>No notes available. Please check back later.</p>
        </div>
      `;
    }
  },

  // Module loading functionality
  loadModules: async function() {
    if (this.modulesLoaded) {
      this.debug('Modules already loaded');
      return;
    }

    const modules = [
      'components/note_viewer/modules/core.js',
      'components/note_viewer/modules/markdown.js',
      'components/note_viewer/modules/sharing.js', 
      'components/note_viewer/modules/printing.js',
      'components/note_viewer/modules/inline.js',
      'components/note_viewer/modules/popup.js'
    ];

    this.debug('Loading note viewer modules...');

    for (const modulePath of modules) {
      try {
        await this.loadModule(modulePath);
        this.debug(`✅ Loaded: ${modulePath}`);
      } catch (error) {
        console.warn(`⚠️ Failed to load module: ${modulePath}`, error);
      }
    }

    this.modulesLoaded = true;
    this.debug('All modules loaded successfully');
    
    // Check what functions are now available
    this.debug('Available functions after module load:');
    this.debug('copyNoteContent:', typeof window.copyNoteContent);
    this.debug('shareNote:', typeof window.shareNote);
    this.debug('printNote:', typeof window.printNote);
    this.debug('printSharedContent:', typeof window.printSharedContent);
  },

  loadModule: function(src) {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  },

  // Debug utilities
  checkModules: function() {
    console.log('=== Module Status Check ===');
    console.log('modulesLoaded:', this.modulesLoaded);
    console.log('copyNoteContent:', typeof window.copyNoteContent);
    console.log('shareNote:', typeof window.shareNote);
    console.log('printNote:', typeof window.printNote);
    console.log('printSharedContent:', typeof window.printSharedContent);
    console.log('========================');
  },

  // Simplified handler methods that delegate to existing modules
  handleCopyNote: function(containerId, noteIndex) {
    this.debug('handleCopyNote called - delegating to modules');
    
    if (!this.modulesLoaded) {
      this.loadModules().then(() => {
        this.handleCopyNote(containerId, noteIndex);
      });
      return;
    }
    
    if (typeof window.copyNoteContent === 'function') {
      return window.copyNoteContent(containerId, noteIndex);
    } else if (typeof this.copyNoteWithToast === 'function') {
      return this.copyNoteWithToast(containerId, noteIndex);
    } else {
      console.warn('No copy module loaded');
      this.showToast('❌ Copy module not available', 'error');
    }
  },

  handleShareNote: function(containerId, noteIndex) {
    this.debug('handleShareNote called - delegating to modules');
    
    if (!this.modulesLoaded) {
      this.loadModules().then(() => {
        this.handleShareNote(containerId, noteIndex);
      });
      return;
    }
    
    if (typeof window.shareNote === 'function') {
      return window.shareNote(containerId, noteIndex);
    } else if (typeof this.shareNoteWithToast === 'function') {
      return this.shareNoteWithToast(containerId, noteIndex);
    } else {
      console.warn('No share module loaded');
      this.showToast('❌ Share module not available', 'error');
    }
  },

  // Minimal toast for fallback only
  showToast: function(message, type = 'info', duration = 3000) {
    console.log(`[Toast ${type}]: ${message}`);
    // Simple console fallback - modules should handle real toasts
  },

  // Remove all the large methods and keep only essential ones
}; // End of noteViewer object

// Global functions
window.showNoteViewer = async function(notesJsonPath, title = 'Notes') {
  try {
    await window.noteViewer.show(notesJsonPath, title);
  } catch (error) {
    console.error('[Global] Error showing note viewer:', error);
  }
};

window.createInlineNoteViewer = function(containerId) {
  try {
    return window.noteViewer.createInlineSection(containerId);
  } catch (error) {
    console.error('[Global] Error creating inline note viewer:', error);
    return `<div class="text-center py-8 text-red-500"><p>Error: ${error.message}</p></div>`;
  }
};

window.initInlineNoteViewer = async function(containerId, notesJsonPath, title = 'Study Notes') {
  try {
    await window.noteViewer.initInline(containerId, notesJsonPath, title);
  } catch (error) {
    console.error('[Global] Error initializing inline note viewer:', error);
  }
};

// Debug utilities
window.noteViewerDebug = {
  checkMethods: () => {
    console.log('noteViewer object:', window.noteViewer);
    console.log('Available methods:', Object.keys(window.noteViewer).filter(key => typeof window.noteViewer[key] === 'function'));
    console.log('Method types:', {
      createInlineSection: typeof window.noteViewer.createInlineSection,
      initInline: typeof window.noteViewer.initInline,
      loadBasicNotes: typeof window.noteViewer.loadBasicNotes
    });
  },
  testBasicNotes: (containerId = 'test', notesPath = 'json/videos/note_viewer.json') => {
    return window.noteViewer.loadBasicNotes(containerId, notesPath);
  },
  testMarkdown: (markdownPath = 'markdown/powerbi_architecture.md') => {
    return window.noteViewer.loadMarkdownContent(markdownPath);
  },
  loadModules: async () => {
    return window.noteViewer.loadModules();
  },
  checkModules: () => {
    return window.noteViewer.checkModules();
  }
};

console.log('[NoteViewer] Direct object implementation loaded successfully');
console.log('[NoteViewer] Available methods:', Object.keys(window.noteViewer).filter(key => typeof window.noteViewer[key] === 'function'));
