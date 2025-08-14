// Inline mode functionality
class NoteViewerInline extends NoteViewerMarkdown {
  // Initialize inline mode
  async initInline(containerId, notesJsonPath, title = 'Study Notes') {
    this.debug('=== initInline called ===');
    this.debug('containerId:', containerId);
    this.debug('notesJsonPath:', notesJsonPath);
    this.debug('title:', title);

    this.mode = 'inline';
    this.currentContainerId = containerId;

    try {
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

      this.extractCategories();
      this.populateInlineCategories(containerId);
      this.renderInlineTopicButtons(containerId);

    } catch (error) {
      this.debug('Error initializing inline notes:', error);
      console.error('Error initializing inline notes:', error);
      this.showInlineError(containerId, `Failed to load notes: ${error.message}`);
    }
  }

  // Populate categories dropdown for inline mode
  populateInlineCategories(containerId) {
    const categoryFilter = document.getElementById(`note-category-filter-${containerId}`);
    if (!categoryFilter) return;

    // Clear existing options except "All Categories"
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    // Add category options
    this.categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
  }

  // Render topic buttons for inline mode
  renderInlineTopicButtons(containerId) {
    const container = document.getElementById(`note-topics-buttons-${containerId}`);
    if (!container) return;

    if (this.filteredNotes.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-lg font-medium">No notes found</p>
          <p class="text-sm">Try adjusting your search or category filter</p>
        </div>
      `;
      return;
    }

    const buttonsHTML = this.filteredNotes.map(note => `
      <button 
        onclick="window.noteViewer.loadAndDisplayInlineNote('${containerId}', '${note.markdownPath}', '${note.topic.replace(/'/g, "\\'")}', '${note.serialNo}', '${note.category}')"
        class="note-topic-button bg-white border border-gray-300 rounded-lg p-4 text-left hover:border-blue-400 hover:shadow-md transition-all duration-200 group"
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
    `).join('');

    container.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${buttonsHTML}
      </div>
    `;
  }

  // Search notes functionality
  searchNotes(containerId, searchTerm) {
    this.debug('Searching notes:', searchTerm);
    
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
    
    this.debug('Filtered notes count:', this.filteredNotes.length);
    this.renderInlineTopicButtons(containerId);
  }

  // Filter by category functionality
  filterByCategory(containerId, category) {
    this.debug('Filtering by category:', category);
    
    this.selectedCategory = category;
    
    if (category === 'all') {
      this.filteredNotes = [...this.notes];
    } else {
      this.filteredNotes = this.notes.filter(note => note.category === category);
    }
    
    // Also apply current search if any
    const searchInput = document.getElementById(`note-search-input-${containerId}`);
    if (searchInput && searchInput.value.trim()) {
      this.searchNotes(containerId, searchInput.value);
    } else {
      this.renderInlineTopicButtons(containerId);
    }
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
          <div class="action-buttons-container">
            <div class="flex gap-2 flex-wrap sm:flex-nowrap">
              <button 
                onclick="window.noteViewer.copyNoteContent('${containerId}', '${topic.replace(/'/g, "\\'")}', document.getElementById('note-content-body-${containerId}').innerHTML)"
                class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors min-w-0"
                title="Copy content to clipboard"
              >
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                <span class="truncate">Copy</span>
              </button>
              <button 
                onclick="window.noteViewer.generateShareLink('${containerId}', { title: '${topic.replace(/'/g, "\\'")}', content: document.getElementById('note-content-body-${containerId}').innerHTML, serialNo: '${serialNo}', category: '${category}' })"
                class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors min-w-0"
                title="Generate shareable link"
              >
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                </svg>
                <span class="truncate">Share</span>
              </button>
              <button 
                onclick="window.noteViewer.printNoteContent('${containerId}', '${topic.replace(/'/g, "\\'")}', document.getElementById('note-content-body-${containerId}').innerHTML, '${serialNo}', '${category}')"
                class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors min-w-0"
                title="Print this note"
              >
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                </svg>
                <span class="truncate">Print</span>
              </button>
            </div>
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

      const response = await fetch(markdownPath);
      this.debug('Markdown fetch response:', { status: response.status, ok: response.ok });
      
      if (!response.ok) {
        throw new Error(`Failed to load note: ${response.status}`);
      }

      const markdownContent = await response.text();
      this.debug('Markdown content loaded, length:', markdownContent.length);
      this.debug('Markdown preview:', markdownContent.substring(0, 200) + '...');

      const htmlContent = this.markdownToHTML(markdownContent);
      this.debug('HTML content generated, length:', htmlContent.length);
      
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
}

window.NoteViewerInline = NoteViewerInline;