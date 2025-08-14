// Complete sharing module with copy, share, and toast functionality

(function() {
  'use strict';

  // Move closeSharedPopup function to the top to make it globally available immediately
  window.closeSharedPopup = function() {
    console.log('[Sharing] closeSharedPopup called');
    
    // Find popup more specifically
    const popup = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50.z-50');
    if (popup) {
      console.log('[Sharing] Found popup, removing...');
      document.body.style.overflow = '';
      popup.remove();
      
      // Clear URL params
      try {
        const url = new URL(window.location);
        url.searchParams.delete('topic');
        url.searchParams.delete('ref');
        window.history.replaceState({}, '', url);
        console.log('[Sharing] URL params cleared');
      } catch (error) {
        console.error('[Sharing] Error clearing URL params:', error);
      }
    } else {
      console.warn('[Sharing] No popup found to close');
    }
  };

  // Toast notification system
  window.showToast = function(message, type = 'info', duration = 3000) {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.note-viewer-toast');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `note-viewer-toast fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white transition-all duration-300 transform translate-x-0 opacity-100 ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 
      type === 'warning' ? 'bg-yellow-500' :
      'bg-blue-500'
    }`;
    
    toast.innerHTML = `
      <div class="flex items-center">
        <span class="mr-2">
          ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
        </span>
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-white hover:text-gray-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remove after duration
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        setTimeout(() => {
          if (toast.parentNode) {
            toast.remove();
          }
        }, 300);
      }
    }, duration);
  };

  // Copy note content function
  window.copyNoteContent = function(containerId, noteIndex) {
    console.log('[Sharing] copyNoteContent called:', { containerId, noteIndex });
    
    if (!window.noteViewer || !window.noteViewer.notes || !window.noteViewer.notes[noteIndex]) {
      showToast('❌ Note not found', 'error');
      return;
    }

    const note = window.noteViewer.notes[noteIndex];
    
    // Get content from the displayed note or note data
    let textToCopy = `${note.title || note.topic || 'Untitled'}\n\n`;
    
    if (note.category) {
      textToCopy += `Category: ${note.category}\n\n`;
    }
    
    // Get content from the current display
    const contentElement = document.getElementById(`note-content-body-${containerId}`);
    if (contentElement) {
      // Extract text content, removing HTML tags
      const textContent = contentElement.textContent || contentElement.innerText || '';
      textToCopy += textContent;
    } else if (note.content) {
      textToCopy += note.content;
    } else if (note.summary) {
      textToCopy += note.summary;
    } else {
      textToCopy += 'No content available';
    }

    // Try to copy to clipboard with better error handling
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('✅ Content copied to clipboard!', 'success');
      }).catch(err => {
        console.log('Clipboard copy failed:', err);
        if (err.name === 'NotAllowedError') {
          showToast('📋 Clipboard access blocked - trying alternative method', 'warning');
        }
        fallbackCopyBetter(textToCopy);
      });
    } else {
      fallbackCopyBetter(textToCopy);
    }
  };

  // Better fallback copy method
  function fallbackCopyBetter(text) {
    try {
      // Create a text area and try the old method
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        showToast('✅ Content copied to clipboard!', 'success');
      } else {
        throw new Error('execCommand copy failed');
      }
    } catch (err) {
      console.log('All copy methods failed:', err);
      // Show a modal with the content to copy manually
      showCopyModal(text);
    }
  }

  // Show copy modal for manual copying
  function showCopyModal(text) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">Copy Content</h3>
          <button 
            onclick="this.closest('.fixed').remove()"
            class="text-gray-500 hover:text-gray-700"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <p class="text-sm text-gray-600 mb-4">Please select and copy the content below:</p>
        
        <textarea 
          readonly 
          class="w-full h-64 p-3 border border-gray-300 rounded-md text-sm bg-gray-50 resize-none"
          style="font-size: 16px;"
          onclick="this.select()"
        >${text}</textarea>
        
        <div class="mt-4 text-xs text-gray-500">
          💡 <strong>Tip:</strong> Tap the text area above to select all content, then copy manually.
        </div>
        
        <div class="flex justify-end mt-4">
          <button 
            onclick="this.closest('.fixed').remove()"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-focus and select the textarea
    setTimeout(() => {
      const textarea = modal.querySelector('textarea');
      if (textarea) {
        textarea.focus();
        textarea.select();
      }
    }, 100);
  }

  // Create topic-based shareable URL - SIMPLIFIED TO ALWAYS AUTO-COPY
  window.shareNote = function(containerId, noteIndex) {
    console.log('[Sharing] shareNote called:', { containerId, noteIndex });
    
    if (!window.noteViewer || !window.noteViewer.notes || !window.noteViewer.notes[noteIndex]) {
      showToast('❌ Note not found', 'error');
      return;
    }

    const note = window.noteViewer.notes[noteIndex];
    
    // Create topic-based URL
    const topicSlug = (note.topic || note.title || 'untitled')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?topic=${encodeURIComponent(topicSlug)}&ref=${note.serialNo || noteIndex}`;
    const shareText = `Check out this study note: ${note.topic || note.title}`;
    
    // Check if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile && navigator.share) {
      // Use native sharing on mobile
      navigator.share({
        title: note.topic || note.title,
        text: shareText,
        url: shareUrl
      }).then(() => {
        showToast('✅ Note shared successfully!', 'success');
      }).catch(err => {
        console.log('Native share failed, copying to clipboard:', err);
        copyShareUrlDirectly(shareUrl, shareText);
      });
    } else {
      // Always copy URL to clipboard on desktop
      copyShareUrlDirectly(shareUrl, shareText);
    }
  };

  // Direct copy without any modal popup
  function copyShareUrlDirectly(url, text) {
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(() => {
        showToast('✅ Share link copied to clipboard!', 'success');
        showToast(`📋 ${text}`, 'info', 4000);
      }).catch(err => {
        console.log('Clipboard API failed:', err);
        fallbackCopyShare(url, text);
      });
    } else {
      // Fallback for older browsers
      fallbackCopyShare(url, text);
    }
  }

  // Simple fallback copy without modal
  function fallbackCopyShare(url, text) {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        showToast('✅ Share link copied to clipboard!', 'success');
        showToast(`📋 ${text}`, 'info', 4000);
      } else {
        throw new Error('execCommand copy failed');
      }
    } catch (err) {
      console.log('All copy methods failed:', err);
      showToast('❌ Failed to copy share link', 'error');
      showToast('💡 Try using the copy button instead', 'info', 3000);
    }
  }

  // REMOVE THESE FUNCTIONS COMPLETELY:
  // - tryClipboardShare
  // - showSimpleShareModal  
  // - copyFromInput (window.copyFromInput)

  // OPTIMIZED popup loading - preload content and show immediately
  async function showSharedNotePopup(note) {
    console.log('[Sharing] Showing shared note popup:', note);
    
    // Preload content BEFORE creating popup
    let content = '';
    let contentLoaded = false;
    
    try {
      if (note.markdownPath) {
        console.log('[Sharing] Preloading markdown from:', note.markdownPath);
        const response = await fetch(note.markdownPath);
        
        if (!response.ok) {
          throw new Error(`Failed to load markdown: ${response.status} ${response.statusText}`);
        }
        
        const markdownContent = await response.text();
        content = convertMarkdownToHtml(markdownContent);
        contentLoaded = true;
        console.log('[Sharing] Content preloaded successfully');
      } else {
        content = note.content || note.summary || 'No content available';
        content = content.replace(/\n/g, '<br>');
        contentLoaded = true;
      }
    } catch (error) {
      console.error('[Sharing] Error preloading content:', error);
      content = `
        <div class="text-center py-8 text-red-500">
          <p class="text-lg font-medium">Error Loading Content</p>
          <p class="text-sm">${error.message}</p>
          ${note.markdownPath ? `<p class="text-xs text-gray-400 mt-2">Path: ${note.markdownPath}</p>` : ''}
          <button onclick="location.reload()" class="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Reload Page
          </button>
        </div>
      `;
      contentLoaded = true;
    }
    
    // Create popup modal with content already loaded
    const popup = document.createElement('div');
    popup.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    popup.innerHTML = `
      <div class="bg-white rounded-lg max-w-4xl w-full h-full max-h-[90vh] flex flex-col overflow-hidden">
        <div class="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
          <h2 class="text-xl font-bold text-gray-900 pr-4">${note.topic || note.title}</h2>
          <div class="flex gap-2 flex-shrink-0">
            <button 
              onclick="printSharedNote()" 
              class="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap"
              title="Print this note"
            >
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
              </svg>
              Print
            </button>
            <button 
              onclick="closeSharedPopup()" 
              class="text-gray-500 hover:text-gray-700 p-1"
              title="Close popup"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <div 
          class="flex-1 overflow-y-auto p-6 min-h-0" 
          id="shared-note-content"
          style="-webkit-overflow-scrolling: touch;"
        >
          ${contentLoaded ? `<div class="prose prose-sm max-w-none">${content}</div>` : `
          <div class="text-center py-8 text-blue-600">
            <div class="loading-spinner mx-auto mb-4" style="border: 2px solid #f3f4f6; border-top: 2px solid #3b82f6; border-radius: 50%; width: 20px; height: 20px; animation: spin 1s linear infinite;"></div>
            <p>Loading content...</p>
          </div>
          `}
        </div>
      </div>
    `;
    
    document.body.appendChild(popup);
    
    // Prevent body scroll when popup is open
    document.body.style.overflow = 'hidden';
    
    // Add click outside to close
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        closeSharedPopup();
      }
    });
    
    // Add escape key to close
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        closeSharedPopup();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Store content for printing
    if (contentLoaded) {
      window.sharedNoteData = { note, content };
    }
  }

  // Update checkForSharedNote to be faster
  function checkForSharedNote() {
    const urlParams = new URLSearchParams(window.location.search);
    const topicParam = urlParams.get('topic');
    const refParam = urlParams.get('ref');
    
    if (topicParam) {
      console.log('[Sharing] Shared note detected:', { topic: topicParam, ref: refParam });
      
      // Faster note finding with immediate popup
      const findAndShowNote = () => {
        if (window.noteViewer && window.noteViewer.notes && window.noteViewer.notes.length > 0) {
          const note = window.noteViewer.notes.find(n => {
            const noteSlug = (n.topic || n.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            return noteSlug === topicParam || n.serialNo == refParam;
          });
          
          if (note) {
            console.log('[Sharing] Found note, showing popup immediately:', note);
            showSharedNotePopup(note);
          } else {
            console.warn('[Sharing] Shared note not found in loaded notes');
            setTimeout(() => {
              showToast('❌ Shared note not found', 'error');
            }, 1000);
          }
        } else {
          // Check again more frequently
          console.log('[Sharing] Waiting for noteViewer to load...');
          setTimeout(findAndShowNote, 200); // Reduced from 500ms to 200ms
        }
      };
      
      // Start checking immediately
      findAndShowNote();
    }
  }

  // Simple markdown to HTML converter (self-contained)
  function convertMarkdownToHtml(markdown) {
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\_\_(.*?)\_\_/gim, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    html = html.replace(/\_(.*?)\_/gim, '<em>$1</em>');
    
    // Code blocks
    html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
    
    // Inline code
    html = html.replace(/`(.*?)`/gim, '<code>$1</code>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Lists
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^\+ (.*$)/gim, '<li>$1</li>');
    
    // Wrap consecutive list items in ul tags
    html = html.replace(/(<li>.*<\/li>)/gims, function(match) {
      return '<ul>' + match + '</ul>';
    });
    
    // Line breaks
    html = html.replace(/\n\n/gim, '</p><p>');
    html = html.replace(/\n/gim, '<br>');
    
    // Wrap in paragraphs
    html = '<p>' + html + '</p>';
    
    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/gim, '');
    html = html.replace(/<p><br><\/p>/gim, '');
    
    return html;
  }

  // Print shared note function
  window.printSharedNote = function() {
    if (!window.sharedNoteData) {
      showToast('❌ No note data available for printing', 'error');
      return;
    }
    
    const { note, content } = window.sharedNoteData;
    
    // Create print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${note.topic || note.title}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
          }
          h1, h2, h3 { color: #2c3e50; margin-top: 1.5em; }
          h1 { border-bottom: 2px solid #eee; padding-bottom: 0.5em; }
          code { 
            background: #f5f5f5; 
            padding: 2px 4px; 
            border-radius: 3px; 
            font-family: 'Courier New', monospace;
          }
          pre { 
            background: #f5f5f5; 
            padding: 1em; 
            border-radius: 6px; 
            overflow-x: auto; 
          }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <h1>${note.topic || note.title}</h1>
        ${note.category ? `<p><strong>Category:</strong> ${note.category}</p>` : ''}
        <hr>
        <div class="content">${content}</div>
        <hr>
        <p style="text-align: center; color: #666; font-size: 0.9em; margin-top: 2em;">
          Printed on ${new Date().toLocaleDateString()} from Study Notes
        </p>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
    
    showToast('✅ Print dialog opened!', 'success');
  };

  // Check for shared notes when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkForSharedNote);
  } else {
    setTimeout(checkForSharedNote, 100);
  }
  
  // Also check when note viewer loads
  window.addEventListener('noteViewerReady', checkForSharedNote);

  console.log('[Sharing Module] Loaded with copy, share, and popup functionality');

})();