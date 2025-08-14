// Core functionality and utilities
class NoteViewerCore {
  constructor() {
    this.notes = [];
    this.categories = [];
    this.selectedCategory = 'all';
    this.filteredNotes = [];
    this.mode = 'popup'; // 'popup' or 'inline'
    this.debugMode = true;
    this.currentContainerId = null;
  }

  // Debug logging helper
  debug(message, ...args) {
    if (this.debugMode) {
      console.log(`[NoteViewer] ${message}`, ...args);
    }
  }

  // Extract unique categories from notes
  extractCategories() {
    const categorySet = new Set();
    this.notes.forEach(note => {
      if (note.category) {
        categorySet.add(note.category);
      }
    });
    this.categories = Array.from(categorySet).sort();
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

  // Generate unique share ID
  generateShareId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    const shareId = `note_${timestamp}${random}`;
    
    this.debug('Generated share ID:', shareId);
    return shareId;
  }

  // Show error in inline mode
  showInlineError(containerId, message) {
    const container = document.getElementById(`note-viewer-inline-${containerId}`);
    if (container) {
      container.innerHTML = `
        <div class="text-center py-8 text-red-500">
          <svg class="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p class="text-lg font-medium">Error</p>
          <p class="text-sm">${message}</p>
        </div>
      `;
    }
  }

  // Close note content in inline mode
  closeNoteContent(containerId) {
    const contentDisplay = document.getElementById(`note-content-display-${containerId}`);
    if (contentDisplay) {
      contentDisplay.style.display = 'none';
    }
  }
}

// Export for use in main file
window.NoteViewerCore = NoteViewerCore;