// Debug function
function debugLog(message) {
  console.log('[BTS Cursor Popup]', message);
  const debugEl = document.getElementById('debug');
  if (debugEl) {
    debugEl.textContent = message;
    debugEl.style.display = 'block';
    setTimeout(() => {
      debugEl.style.display = 'none';
    }, 3000);
  }
}

// Cursor options - using PNG files for Chrome compatibility
const cursorOptions = {
  'auto': {
    name: 'Auto (Smart Switch)',
    png: chrome.runtime.getURL('assets/BTS_Logo_White.png') // Default preview
  },
  'bts-logo-white': {
    name: 'BTS Logo (White)',
    png: chrome.runtime.getURL('assets/BTS_Logo_White.png')
  },
  'bts-logo-black': {
    name: 'BTS Logo (Black)',
    png: chrome.runtime.getURL('assets/BTS_Logo_Black.png')
  }
};

// DOM elements
let toggleSwitch, cursorSelect, saveBtn, btnText, loading, status;

// State
let isEnabled = true;
let selectedCursor = 'bts-logo';

// Initialize
function init() {
  debugLog('Initializing...');
  
  // Get DOM elements
  toggleSwitch = document.getElementById('toggleSwitch');
  cursorSelect = document.getElementById('cursorSelect');
  saveBtn = document.getElementById('saveBtn');
  btnText = document.getElementById('btnText');
  loading = document.getElementById('loading');
  status = document.getElementById('status');
  
  // Check if elements exist
  if (!toggleSwitch) {
    debugLog('ERROR: toggleSwitch not found!');
    return;
  }
  if (!cursorSelect) {
    debugLog('ERROR: cursorSelect not found!');
    return;
  }
  
  debugLog('DOM elements loaded successfully');
  
  loadSettings();
  setupEventListeners();
}

// Load settings from storage
function loadSettings() {
  debugLog('Loading settings...');
  chrome.storage.sync.get(['selectedCursor', 'cursorEnabled'], (result) => {
    if (chrome.runtime.lastError) {
      console.error('Failed to load settings:', chrome.runtime.lastError);
      return;
    }
    
    // Handle legacy cursor types
    let cursor = result.selectedCursor || 'auto';
    if (cursor === 'bts-logo') {
      cursor = 'bts-logo-white'; // Migrate to white version
      // Update storage with new value
      chrome.storage.sync.set({ selectedCursor: cursor });
    }
    selectedCursor = cursor;
    isEnabled = result.cursorEnabled !== false;
    
    debugLog(`Loaded settings: cursor=${selectedCursor}, enabled=${isEnabled}`);
    updateUI();
  });
}

// Setup event listeners
function setupEventListeners() {
  debugLog('Setting up event listeners...');
  
  // Toggle switch
  toggleSwitch.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    debugLog('Toggle clicked');
    isEnabled = !isEnabled;
    updateToggleUI();
    applySettings();
  });
  
  // Cursor selection
  cursorSelect.addEventListener('change', (e) => {
    debugLog('Cursor selection changed');
    selectedCursor = e.target.value;
    applySettings();
  });
  
  // Save button
  saveBtn.addEventListener('click', () => {
    debugLog('Save button clicked');
    applySettings();
  });
}

// Update UI based on current state
function updateUI() {
  updateToggleUI();
  
  // Update select value
  if (cursorSelect) {
    cursorSelect.value = selectedCursor;
  }
}

// Update toggle switch UI
function updateToggleUI() {
  if (toggleSwitch) {
    if (isEnabled) {
      toggleSwitch.classList.add('active');
    } else {
      toggleSwitch.classList.remove('active');
    }
  }
}



// Save settings and apply cursor
function applySettings() {
  debugLog('Applying settings...');
  setLoading(true);
  
  // Save to storage
  chrome.storage.sync.set({
    selectedCursor: selectedCursor,
    cursorEnabled: isEnabled
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Failed to save settings:', chrome.runtime.lastError);
      showError('Failed to save settings');
      setLoading(false);
      return;
    }
    
    debugLog('Settings saved successfully');
    
    // Send message to background script to update all tabs immediately
    chrome.runtime.sendMessage({
      action: 'updateCursorImmediately',
      cursor: selectedCursor,
      enabled: isEnabled
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Failed to send message:', chrome.runtime.lastError);
        showError('Failed to apply cursor');
      } else {
        debugLog('Cursor update message sent successfully');
      }
      setLoading(false);
    });
  });
}

// Set loading state
function setLoading(loadingState) {
  if (btnText && loading) {
    if (loadingState) {
      btnText.style.display = 'none';
      loading.style.display = 'flex';
      saveBtn.disabled = true;
    } else {
      btnText.style.display = 'block';
      loading.style.display = 'none';
      saveBtn.disabled = false;
    }
  }
}

// Show success message
function showSuccess(message) {
  showStatus(message, 'success');
}

// Show error message
function showError(message) {
  showStatus(message, 'error');
}

// Show status message
function showStatus(message, type = 'info') {
  if (status) {
    status.textContent = message;
    status.className = `status-msg status-${type}`;
    status.style.display = 'block';
    setTimeout(() => {
      status.style.display = 'none';
    }, 3000);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init); 