class PictureViewer {
  constructor() {
    this.currentIndex = 0;
    this.pictures = [];
    this.title = '';
    this.popup = null;
    this.init();
  }

  init() {
    this.createPopupHTML();
    this.bindEvents();
  }

  createPopupHTML() {
    // Remove existing popup if it exists
    const existingPopup = document.getElementById('picture-viewer-popup');
    if (existingPopup) {
      existingPopup.remove();
    }

    // Create popup HTML
    const popupHTML = `
      <div id="picture-viewer-popup" class="picture-viewer-popup" style="display: none;">
        <div class="picture-viewer-overlay" onclick="window.pictureViewer.close()"></div>
        <div class="picture-viewer-container">
          <div class="picture-viewer-header">
            <h3 class="picture-viewer-title"></h3>
            <button class="picture-viewer-close" onclick="window.pictureViewer.close()" title="Close">&times;</button>
          </div>
          <div class="picture-viewer-content">
            <!-- Additional X button on top-right corner -->
            <button class="picture-viewer-close-corner" onclick="window.pictureViewer.close()" title="Close">&times;</button>
            <button class="picture-viewer-nav picture-viewer-prev" onclick="window.pictureViewer.previous()" title="Previous">‹</button>
            <div class="picture-viewer-image-container">
              <img class="picture-viewer-image" src="" alt="Picture" />
              <div class="picture-viewer-loading">Loading...</div>
              <div class="picture-viewer-error" style="display: none;">Image not found</div>
            </div>
            <button class="picture-viewer-nav picture-viewer-next" onclick="window.pictureViewer.next()" title="Next">›</button>
          </div>
          <div class="picture-viewer-footer">
            <div class="picture-viewer-counter">
              <span class="picture-viewer-current">1</span> / <span class="picture-viewer-total">1</span>
            </div>
            <div class="picture-viewer-thumbnails"></div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', popupHTML);
    this.popup = document.getElementById('picture-viewer-popup');
  }

  bindEvents() {
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (this.popup && this.popup.style.display !== 'none') {
        switch (e.key) {
          case 'Escape':
            this.close();
            break;
          case 'ArrowLeft':
            this.previous();
            break;
          case 'ArrowRight':
            this.next();
            break;
        }
      }
    });

    // Image load events
    const img = this.popup.querySelector('.picture-viewer-image');
    const loading = this.popup.querySelector('.picture-viewer-loading');
    const error = this.popup.querySelector('.picture-viewer-error');

    img.addEventListener('load', () => {
      loading.style.display = 'none';
      error.style.display = 'none';
      img.style.display = 'block';
    });

    img.addEventListener('error', () => {
      loading.style.display = 'none';
      img.style.display = 'none';
      error.style.display = 'block';
    });
  }

  show(pictures, title = '', startIndex = 0) {
    if (!pictures || !Array.isArray(pictures) || pictures.length === 0) {
      console.error('PictureViewer: No pictures provided');
      return;
    }

    this.pictures = pictures;
    this.title = title;
    this.currentIndex = Math.max(0, Math.min(startIndex, pictures.length - 1));

    // Update title
    this.popup.querySelector('.picture-viewer-title').textContent = title;

    // Update counter
    this.popup.querySelector('.picture-viewer-total').textContent = pictures.length;

    // Create thumbnails
    this.createThumbnails();

    // Show current image
    this.updateDisplay();

    // Show popup
    this.popup.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  createThumbnails() {
    const thumbnailContainer = this.popup.querySelector('.picture-viewer-thumbnails');
    thumbnailContainer.innerHTML = '';

    if (this.pictures.length <= 1) {
      thumbnailContainer.style.display = 'none';
      return;
    }

    thumbnailContainer.style.display = 'flex';
    
    this.pictures.forEach((pic, index) => {
      const thumb = document.createElement('div');
      thumb.className = 'picture-viewer-thumbnail';
      thumb.innerHTML = `<img src="${pic}" alt="Thumbnail ${index + 1}" />`;
      thumb.addEventListener('click', () => this.goToIndex(index));
      thumbnailContainer.appendChild(thumb);
    });
  }

  updateDisplay() {
    const img = this.popup.querySelector('.picture-viewer-image');
    const loading = this.popup.querySelector('.picture-viewer-loading');
    const error = this.popup.querySelector('.picture-viewer-error');
    const current = this.popup.querySelector('.picture-viewer-current');
    const prevBtn = this.popup.querySelector('.picture-viewer-prev');
    const nextBtn = this.popup.querySelector('.picture-viewer-next');

    // Show loading
    loading.style.display = 'block';
    img.style.display = 'none';
    error.style.display = 'none';

    // Update image
    img.src = this.pictures[this.currentIndex];

    // Update counter
    current.textContent = this.currentIndex + 1;

    // Update navigation buttons
    prevBtn.style.opacity = this.currentIndex > 0 ? '1' : '0.5';
    nextBtn.style.opacity = this.currentIndex < this.pictures.length - 1 ? '1' : '0.5';
    
    // Disable/enable buttons
    prevBtn.disabled = this.currentIndex === 0;
    nextBtn.disabled = this.currentIndex === this.pictures.length - 1;

    // Update thumbnails
    const thumbnails = this.popup.querySelectorAll('.picture-viewer-thumbnail');
    thumbnails.forEach((thumb, index) => {
      thumb.classList.toggle('active', index === this.currentIndex);
    });
  }

  next() {
    if (this.currentIndex < this.pictures.length - 1) {
      this.currentIndex++;
      this.updateDisplay();
    }
  }

  previous() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateDisplay();
    }
  }

  goToIndex(index) {
    if (index >= 0 && index < this.pictures.length) {
      this.currentIndex = index;
      this.updateDisplay();
    }
  }

  close() {
    this.popup.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
  }
}

// Initialize global instance
window.pictureViewer = new PictureViewer();

// Global function to show pictures (for easy access from onclick handlers)
window.showPictureViewer = function(pictures, title = '', startIndex = 0) {
  window.pictureViewer.show(pictures, title, startIndex);
};