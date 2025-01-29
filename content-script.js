class NebiusOverlay {
  constructor() {
    this.initialize();
    this.port = null;
    this.connectToExtension();
  }

  connectToExtension() {
    try {
      this.port = chrome.runtime.connect({ name: "nebiusOverlay" });
      this.port.onDisconnect.addListener(() => {
        console.log('Port disconnected, cleaning up...');
        this.cleanup();
      });
    } catch (error) {
      console.error('Failed to connect to extension:', error);
    }
  }

  initialize() {
    try {
      console.log('NebiusOverlay initialized');
      this.overlay = this.createOverlay();
      document.body.appendChild(this.overlay);
      this.bindEvents();
    } catch (error) {
      console.error('Initialization error:', error);
    }
  }

  createOverlay() {
    console.log('Creating overlay');
    const overlay = document.createElement('div');
    overlay.className = 'nebius-overlay';
    overlay.style.position = 'fixed';
    
    // Generate Image button
    const generateButton = document.createElement('button');
    generateButton.className = 'nebius-overlay-button';
    generateButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      Generate Image
    `;
    generateButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleGenerate('image');
    });
    
    // Review Text button
    const reviewButton = document.createElement('button');
    reviewButton.className = 'nebius-overlay-button';
    reviewButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Review with AI
    `;
    reviewButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleGenerate('review');
    });
    
    overlay.appendChild(generateButton);
    overlay.appendChild(reviewButton);
    return overlay;
  }

  bindEvents() {
    this.boundHandleMouseUp = () => this.handleSelectionChange();
    this.boundHandleSelectionChange = () => this.handleSelectionChange();
    this.boundHandleMouseDown = (e) => {
      if (!this.overlay.contains(e.target)) {
        this.hideOverlay();
      }
    };
    this.boundHandleScroll = () => this.hideOverlay();

    document.addEventListener('mouseup', this.boundHandleMouseUp);
    document.addEventListener('selectionchange', this.boundHandleSelectionChange);
    document.addEventListener('mousedown', this.boundHandleMouseDown);
    document.addEventListener('scroll', this.boundHandleScroll, true);
  }

  cleanup() {
    document.removeEventListener('mouseup', this.boundHandleMouseUp);
    document.removeEventListener('selectionchange', this.boundHandleSelectionChange);
    document.removeEventListener('mousedown', this.boundHandleMouseDown);
    document.removeEventListener('scroll', this.boundHandleScroll, true);
    
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }

  handleSelectionChange() {
    try {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();

      console.log('Selected text:', selectedText);

      if (selectedText) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        const overlayHeight = this.overlay.offsetHeight || 80;
        const top = rect.top - overlayHeight - 10;
        const left = rect.left + (rect.width / 2) - (this.overlay.offsetWidth / 2 || 100);

        const adjustedTop = Math.max(10, top);
        const adjustedLeft = Math.max(10, Math.min(left, window.innerWidth - (this.overlay.offsetWidth || 200) - 10));

        this.overlay.style.top = `${adjustedTop}px`;
        this.overlay.style.left = `${adjustedLeft}px`;
        this.overlay.classList.add('active');
      } else {
        this.hideOverlay();
      }
    } catch (error) {
      console.error('Selection change error:', error);
      this.hideOverlay();
    }
  }

  hideOverlay() {
    if (this.overlay) {
      this.overlay.classList.remove('active');
    }
  }

  handleGenerate(type) {
    try {
      const selectedText = window.getSelection().toString().trim();
      if (!selectedText) return;

      // Use sendMessage with a callback to handle response
      chrome.runtime.sendMessage({
        action: type === 'image' ? 'generateImage' : 'reviewText',
        text: selectedText
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Message sending error:', chrome.runtime.lastError);
          return;
        }
        this.hideOverlay();
      });
    } catch (error) {
      console.error('Generate error:', error);
      this.hideOverlay();
    }
  }
}

// Create and manage overlay instance
let overlayInstance = null;

function createOverlay() {
  if (!overlayInstance) {
    overlayInstance = new NebiusOverlay();
  }
}

function destroyOverlay() {
  if (overlayInstance) {
    overlayInstance.cleanup();
    overlayInstance = null;
  }
}

// Initialize overlay
createOverlay();

// Handle extension updates/reloads
window.addEventListener('unload', () => {
  destroyOverlay();
});

// Periodic connection check
setInterval(() => {
  try {
    // Check if extension is still valid
    chrome.runtime.getURL('');
    if (!overlayInstance) {
      createOverlay();
    }
  } catch (error) {
    console.log('Extension context invalid, cleaning up...');
    destroyOverlay();
  }
}, 1000); 