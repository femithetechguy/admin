// Function to render the Extras tab content
window.renderExtrasTab = function() {
  // Generate unique IDs for this tab's content
  const containerId = 'extras-resources-container';
  const navigationId = 'extras-navigation';
  
  // Set up the initial structure with containers that we can update later
  const html = `
    <div class="w-full p-4">
      <h2 class="text-xl font-bold mb-4">Additional Resources</h2>
      
      <!-- Navigation buttons will be rendered here -->
      <div id="${navigationId}" class="mb-6 overflow-x-auto pb-2">
        <div class="flex justify-center items-center">
          <div class="animate-pulse w-32 h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
      
      <!-- Resources will be rendered here -->
      <div id="${containerId}">
        <div class="flex justify-center items-center p-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    </div>
  `;
  
  // Schedule the data loading after the DOM is updated
  setTimeout(() => {
    fetch('json/extras.json')
      .then(response => response.json())
      .then(data => {
        // Get both resources array and any global metadata
        const resources = data.resources || [];
        const metadata = data.metadata || {};
        
        // Generate navigation buttons
        const navigationHtml = `
          <div class="flex flex-wrap gap-2 justify-center sm:justify-start">
            <button class="resource-nav-btn active" data-resource-id="all">
              <i class="bi bi-grid mr-1"></i>All
            </button>
            ${resources.map(resource => `
              <button class="resource-nav-btn" data-resource-id="${resource.id}">
                ${getResourceIcon(resource.type)} ${resource.description.length > 15 
                  ? resource.description.substring(0, 15) + '...' 
                  : resource.description}
              </button>
            `).join('')}
          </div>
        `;
        
        // Generate resource cards
        const contentHtml = `
          ${metadata.description ? `<p class="mb-4 text-gray-700">${metadata.description}</p>` : ''}
          ${metadata.lastUpdated ? `<p class="text-sm text-gray-500 mb-4">Last updated: ${metadata.lastUpdated}</p>` : ''}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${resources.map(resource => `
              <div id="resource-card-${resource.id}" class="resource-card">
                ${renderResourceCard(resource)}
              </div>
            `).join('')}
          </div>
        `;
        
        // Update navigation and content after they're loaded
        const navContainer = document.getElementById(navigationId);
        const contentContainer = document.getElementById(containerId);
        
        if (navContainer) {
          navContainer.innerHTML = navigationHtml;
          
          // Add click handlers to the navigation buttons
          setTimeout(() => {
            document.querySelectorAll('.resource-nav-btn').forEach(btn => {
              btn.addEventListener('click', function() {
                const resourceId = this.getAttribute('data-resource-id');
                
                // Remove active class from all buttons and add to clicked button
                document.querySelectorAll('.resource-nav-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Show/hide resource cards based on selection
                document.querySelectorAll('.resource-card').forEach(card => {
                  if (resourceId === 'all' || card.id === `resource-card-${resourceId}`) {
                    card.style.display = 'block';
                  } else {
                    card.style.display = 'none';
                  }
                });
              });
            });
          }, 0);
        }
        
        if (contentContainer) {
          contentContainer.innerHTML = contentHtml;
        }
      })
      .catch(error => {
        console.error('Error loading extras.json:', error);
        const container = document.getElementById(containerId);
        if (container) {
          container.innerHTML = '<div class="p-4 text-red-500">Error loading resources. Please try again later.</div>';
        }
      });
  }, 0);
  
  // Return the complete structure immediately
  return html;
};

// Helper function to get appropriate icon based on resource type
function getResourceIcon(type) {
  switch(type.toLowerCase()) {
    case 'pdf':
      return '<i class="bi bi-file-pdf mr-1"></i>';
    case 'image':
      return '<i class="bi bi-image mr-1"></i>';
    default:
      return '<i class="bi bi-file-earmark mr-1"></i>';
  }
}

// Add styles for resource navigation buttons
document.addEventListener('DOMContentLoaded', function() {
  const style = document.createElement('style');
  style.textContent = `
    .resource-nav-btn {
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      background-color: #f3f4f6;
      font-size: 0.875rem;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      white-space: nowrap;
    }
    
    .resource-nav-btn:hover {
      background-color: #e5e7eb;
    }
    
    .resource-nav-btn.active {
      background-color: #dbeafe;
      color: #1e40af;
      font-weight: 600;
    }
    
    #extras-navigation {
      scrollbar-width: thin;
      scrollbar-color: #cbd5e0 #f7fafc;
    }
    
    #extras-navigation::-webkit-scrollbar {
      height: 8px;
    }
    
    #extras-navigation::-webkit-scrollbar-track {
      background: #f7fafc;
      border-radius: 4px;
    }
    
    #extras-navigation::-webkit-scrollbar-thumb {
      background-color: #cbd5e0;
      border-radius: 4px;
    }
  `;
  document.head.appendChild(style);
});

// Helper function to render a single resource card
function renderResourceCard(resource) {
  // Determine file path and render appropriate content based on resource type
  // Use the path from metadata if provided, otherwise construct it
  const filePath = resource.path || `/extras/${resource.filename}`;
  let contentHtml = '';
  
  // Extract metadata from the resource
  const metadata = resource.metadata || {};

  switch(resource.type.toLowerCase()) {
    case 'pdf':
      contentHtml = `
        <div class="mb-3">
          <embed src="${filePath}" type="application/pdf" width="100%" height="200px" class="border rounded shadow-sm" />
        </div>
        <div class="flex justify-between">
          <a href="${filePath}" target="_blank" class="text-blue-500 hover:text-blue-700 flex items-center">
            <i class="bi bi-file-pdf mr-1"></i> Open PDF
          </a>
          <a href="${filePath}" download class="text-green-600 hover:text-green-800 flex items-center">
            <i class="bi bi-download mr-1"></i> Download
          </a>
        </div>
      `;
      break;
      
    case 'image':
      contentHtml = `
        <div class="mb-3 overflow-hidden">
          <img src="${filePath}" alt="${resource.description}" class="w-full h-48 object-contain border rounded shadow-sm" />
        </div>
        <div class="flex justify-between">
          <a href="${filePath}" target="_blank" class="text-blue-500 hover:text-blue-700 flex items-center">
            <i class="bi bi-image mr-1"></i> Full Size
          </a>
          <a href="${filePath}" download class="text-green-600 hover:text-green-800 flex items-center">
            <i class="bi bi-download mr-1"></i> Download
          </a>
        </div>
      `;
      break;
      
    default:
      contentHtml = `
        <div class="mb-3 bg-gray-100 p-4 rounded flex items-center justify-center h-48">
          <i class="bi bi-file-earmark text-4xl text-gray-400"></i>
        </div>
        <div class="flex justify-between">
          <a href="${filePath}" target="_blank" class="text-blue-500 hover:text-blue-700">Open File</a>
          <a href="${filePath}" download class="text-green-600 hover:text-green-800">
            <i class="bi bi-download mr-1"></i> Download
          </a>
        </div>
      `;
  }

  // Build metadata display section
  let metadataHtml = '';
  
  if (resource.author) {
    metadataHtml += `<p class="text-sm text-gray-600 mb-1">Author: ${resource.author}</p>`;
  }
  
  if (resource.dateAdded) {
    metadataHtml += `<p class="text-sm text-gray-600 mb-1">Added: ${resource.dateAdded}</p>`;
  }
  
  if (resource.tags && resource.tags.length > 0) {
    const tagsHtml = resource.tags.map(tag => 
      `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">${tag}</span>`
    ).join('');
    metadataHtml += `<div class="mt-2">${tagsHtml}</div>`;
  }

  return `
    <div class="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <h3 class="text-lg font-semibold mb-2">${resource.description}</h3>
      ${resource.version ? `<p class="text-xs text-gray-500 mb-2">Version: ${resource.version}</p>` : ''}
      ${contentHtml}
      ${metadataHtml}
    </div>
  `;
}
