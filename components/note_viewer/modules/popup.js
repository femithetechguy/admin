// Popup mode functionality  
class NoteViewerPopup extends NoteViewerInline {
  // Create popup HTML structure
  createPopupHTML() {
    if (document.getElementById('note-viewer-popup')) return;

    const popupHTML = `
      <div id="note-viewer-popup" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
            <!-- Header -->
            <div class="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 id="note-viewer-title" class="text-2xl font-bold text-gray-800">Study Notes</h2>
              <button onclick="window.noteViewer.hide()" class="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none">
                ×
              </button>
            </div>
            
            <!-- Content -->
            <div class="flex-1 overflow-hidden">
              <div id="note-viewer-content" class="h-full overflow-y-auto p-6">
                <!-- Dynamic content will be loaded here -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', popupHTML);
  }

  // Show popup
  async show(notesJsonPath, title = 'Notes') {
    this.debug('Showing popup with:', { notesJsonPath, title });
    
    this.mode = 'popup';
    
    const popup = document.getElementById('note-viewer-popup');
    const titleElement = document.getElementById('note-viewer-title');
    const contentElement = document.getElementById('note-viewer-content');

    if (!popup || !titleElement || !contentElement) {
      console.error('Popup elements not found');
      return;
    }

    titleElement.textContent = title;
    contentElement.innerHTML = '<div class="flex items-center justify-center py-8"><div class="loading-spinner"></div><span class="ml-3">Loading notes...</span></div>';

    popup.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    try {
      const response = await fetch(notesJsonPath);
      if (!response.ok) {
        throw new Error(`Failed to load notes: ${response.status}`);
      }

      const data = await response.json();
      this.notes = data.notes || [];
      this.filteredNotes = [...this.notes];

      this.extractCategories();
      this.renderPopupContent();

    } catch (error) {
      console.error('Error loading notes:', error);
      contentElement.innerHTML = `
        <div class="text-center py-8 text-red-500">
          <p class="text-lg font-medium">Error loading notes</p>
          <p class="text-sm">${error.message}</p>
        </div>
      `;
    }
  }

  // Hide popup
  hide() {
    const popup = document.getElementById('note-viewer-popup');
    if (popup) {
      popup.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  // Render popup content
  renderPopupContent() {
    const contentElement = document.getElementById('note-viewer-content');
    if (!contentElement) return;

    const html = `
      <div class="mb-6">
        <div class="flex flex-col sm:flex-row gap-4 mb-6">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Search Notes</label>
            <input 
              type="text" 
              id="popup-search-input" 
              placeholder="Search topics..." 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              oninput="window.noteViewer.searchPopupNotes(this.value)"
            />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
            <select 
              id="popup-category-filter" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              onchange="window.noteViewer.filterPopupByCategory(this.value)"
            >
              <option value="all">All Categories</option>
              ${this.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>
      
      <div id="popup-notes-container">
        ${this.renderPopupNotes()}
      </div>
    `;

    contentElement.innerHTML = html;
  }

  // Render popup notes
  renderPopupNotes() {
    if (this.filteredNotes.length === 0) {
      return `
        <div class="text-center py-8 text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-lg font-medium">No notes found</p>
          <p class="text-sm">Try adjusting your search or category filter</p>
        </div>
      `;
    }

    return `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${this.filteredNotes.map(note => `
          <button 
            onclick="window.noteViewer.loadPopupNote('${note.markdownPath}', '${note.topic.replace(/'/g, "\\'")}', '${note.serialNo}', '${note.category}')"
            class="bg-white border border-gray-300 rounded-lg p-4 text-left hover:border-blue-400 hover:shadow-md transition-all duration-200 group"
          >
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  #${note.serialNo}
                </span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  ${note.category}
                </span>
              </div>
              <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="9 5l7 7-7 7"></path>
              </svg>
            </div>
            <h3 class="font-medium text-gray-900 group-hover:text-blue-600 transition-colors mb-1">${note.topic}</h3>
            <p class="text-sm text-gray-600 line-clamp-2">${note.description || 'Click to view detailed notes'}</p>
          </button>
        `).join('')}
      </div>
    `;
  }

  // Search popup notes
  searchPopupNotes(searchTerm) {
    this.debug('Searching popup notes:', searchTerm);
    
    const normalizedSearch = searchTerm.toLowerCase().trim();
    
    if (!normalizedSearch) {
      this.filteredNotes = [...this.notes];
    } else {
      this.filteredNotes = this.notes.filter(note => 
        note.topic.toLowerCase().includes(normalizedSearch) ||
        note.category.toLowerCase().includes(normalizedSearch) ||
        (note.description && note.description.toLowerCase().includes(normalizedSearch))
      );
    }
    
    const container = document.getElementById('popup-notes-container');
    if (container) {
      container.innerHTML = this.renderPopupNotes();
    }
  }

  // Filter popup by category
  filterPopupByCategory(category) {
    this.debug('Filtering popup by category:', category);
    
    this.selectedCategory = category;
    
    if (category === 'all') {
      this.filteredNotes = [...this.notes];
    } else {
      this.filteredNotes = this.notes.filter(note => note.category === category);
    }
    
    const searchInput = document.getElementById('popup-search-input');
    if (searchInput && searchInput.value.trim()) {
      this.searchPopupNotes(searchInput.value);
    } else {
      const container = document.getElementById('popup-notes-container');
      if (container) {
        container.innerHTML = this.renderPopupNotes();
      }
    }
  }

  // Load popup note
  async loadPopupNote(markdownPath, topic, serialNo, category) {
    this.debug('Loading popup note:', { markdownPath, topic, serialNo, category });
    
    const contentElement = document.getElementById('note-viewer-content');
    if (!contentElement) return;

    contentElement.innerHTML = `
      <div class="mb-4">
        <button onclick="window.noteViewer.renderPopupContent()" class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to notes
        </button>
        
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
              onclick="window.noteViewer.copyNoteContent('popup', '${topic.replace(/'/g, "\\'")}', document.getElementById('popup-note-content').innerHTML)"
              class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              Copy
            </button>
            <button 
              onclick="window.noteViewer.generateShareLink('popup', { title: '${topic.replace(/'/g, "\\'")}', content: document.getElementById('popup-note-content').innerHTML, serialNo: '${serialNo}', category: '${category}' })"
              class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
              </svg>
              Share
            </button>
            <button 
              onclick="window.noteViewer.printNoteContent('popup', '${topic.replace(/'/g, "\\'")}', document.getElementById('popup-note-content').innerHTML, '${serialNo}', '${category}')"
              class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
              </svg>
              Print
            </button>
          </div>
        </div>
      </div>
      
      <div id="popup-note-content" class="prose prose-sm sm:prose max-w-none">
        <div class="flex items-center justify-center py-8">
          <div class="loading-spinner"></div>
          <span class="ml-3 text-gray-600">Loading content...</span>
        </div>
      </div>
    `;

    try {
      const response = await fetch(markdownPath);
      if (!response.ok) {
        throw new Error(`Failed to load note: ${response.status}`);
      }

      const markdownContent = await response.text();
      const htmlContent = this.markdownToHTML(markdownContent);
      
      const noteContentElement = document.getElementById('popup-note-content');
      if (noteContentElement) {
        noteContentElement.innerHTML = htmlContent;
      }

    } catch (error) {
      console.error('Error loading note:', error);
      const noteContentElement = document.getElementById('popup-note-content');
      if (noteContentElement) {
        noteContentElement.innerHTML = `
          <div class="text-center py-8 text-red-500">
            <svg class="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p class="text-lg font-medium">Failed to load "${topic}"</p>
            <p class="text-sm">Error: ${error.message}</p>
          </div>
        `;
      }
    }
  }

  // Bind popup events
  bindEvents() {
    // Close popup on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hide();
      }
    });

    // Close popup on background click
    const popup = document.getElementById('note-viewer-popup');
    if