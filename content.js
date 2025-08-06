// Content script for injecting custom cursor
let currentCursorStyle = null;
let isAutoMode = false;
let lastBackgroundColor = null;

// Cursor configurations - using PNG files for Chrome compatibility
const cursorConfigs = {
  'bts-logo-white': {
    // BTS Logo White PNG
    png: chrome.runtime.getURL('assets/BTS_Logo_White.png'),
    hotspot: '16 16'
  },
  'bts-logo-black': {
    // BTS Logo Black PNG
    png: chrome.runtime.getURL('assets/BTS_Logo_Black.png'),
    hotspot: '16 16'
  },
  'auto': {
    // Auto mode - will be determined dynamically
    png: null,
    hotspot: '16 16'
  }
};

// Debug function
function debugLog(message) {
  console.log('[BTS Cursor]', message);
}

// Function to detect background color at cursor position
function detectBackgroundColor(x, y) {
  const element = document.elementFromPoint(x, y);
  if (!element) return '#ffffff'; // Default to white
  
  const computedStyle = window.getComputedStyle(element);
  let backgroundColor = computedStyle.backgroundColor;
  
  // If background is transparent, check parent elements
  if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
    let parent = element.parentElement;
    while (parent && parent !== document.body) {
      const parentStyle = window.getComputedStyle(parent);
      backgroundColor = parentStyle.backgroundColor;
      if (backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
        break;
      }
      parent = parent.parentElement;
    }
  }
  
  // Default to white if still transparent
  if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
    backgroundColor = '#ffffff';
  }
  
  return backgroundColor;
}

// Function to determine if background is light or dark
function isLightBackground(color) {
  // Convert color to RGB values
  let r, g, b;
  
  if (color.startsWith('#')) {
    // Hex color
    const hex = color.slice(1);
    r = parseInt(hex.substr(0, 2), 16);
    g = parseInt(hex.substr(2, 2), 16);
    b = parseInt(hex.substr(4, 2), 16);
  } else if (color.startsWith('rgb')) {
    // RGB color
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      r = parseInt(match[1]);
      g = parseInt(match[2]);
      b = parseInt(match[3]);
    } else {
      return true; // Default to light
    }
  } else {
    return true; // Default to light for unknown formats
  }
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5; // Light if luminance > 0.5
}

// Function to get appropriate cursor based on background
function getAutoCursor() {
  // Get cursor position (center of viewport for now)
  const x = window.innerWidth / 2;
  const y = window.innerHeight / 2;
  
  const backgroundColor = detectBackgroundColor(x, y);
  const isLight = isLightBackground(backgroundColor);
  
  debugLog(`Background color: ${backgroundColor}, isLight: ${isLight}`);
  
  return isLight ? 'bts-logo-black' : 'bts-logo-white';
}

// Function to force cursor on all elements
function forceCursorOnElements(cursorUrl) {
  const allElements = document.querySelectorAll('*');
  allElements.forEach(element => {
    if (element.style) {
      element.style.setProperty('cursor', cursorUrl, 'important');
    }
  });
  debugLog(`Forced cursor on ${allElements.length} elements`);
}

// Function to inject cursor styles
async function injectCursorStyle(cursorType, enabled = true) {
  debugLog(`Injecting cursor: ${cursorType}, enabled: ${enabled}`);
  
  // Remove existing cursor style
  if (currentCursorStyle) {
    currentCursorStyle.remove();
    currentCursorStyle = null;
    debugLog('Removed existing cursor style');
  }

  if (!enabled) {
    debugLog('Cursor disabled, not injecting');
    return;
  }

  // Handle auto mode
  if (cursorType === 'auto') {
    isAutoMode = true;
    cursorType = getAutoCursor();
    debugLog(`Auto mode: selected ${cursorType}`);
  } else {
    isAutoMode = false;
  }

  // Handle legacy cursor types
  if (cursorType === 'bts-logo') {
    cursorType = 'bts-logo-white'; // Migrate to white version
    debugLog('Migrated legacy bts-logo to bts-logo-white');
  }

  const config = cursorConfigs[cursorType];
  if (!config) {
    console.warn('Unknown cursor type:', cursorType);
    return;
  }

  debugLog(`Using cursor config: ${cursorType}`);

  // Use PNG file URL
  const cursorUrl = `url("${config.png}") ${config.hotspot}, auto`;

  // Create and inject CSS with higher specificity
  const style = document.createElement('style');
  style.id = 'bts-cursor-customizer';
  style.textContent = `
    html * {
      cursor: ${cursorUrl} !important;
    }
    
    body * {
      cursor: ${cursorUrl} !important;
    }
    
    /* Ensure cursor works on interactive elements */
    a, button, input, textarea, select, [role="button"], [tabindex] {
      cursor: ${cursorUrl} !important;
    }
    
    /* Text selection cursor */
    input[type="text"], input[type="password"], input[type="email"], 
    input[type="search"], input[type="url"], input[type="tel"], 
    textarea, [contenteditable="true"] {
      cursor: ${cursorUrl} !important;
    }
    
    /* Override any website's cursor styles */
    *:hover {
      cursor: ${cursorUrl} !important;
    }
    
    /* Force cursor on all elements */
    div, span, p, h1, h2, h3, h4, h5, h6, img, svg, canvas {
      cursor: ${cursorUrl} !important;
    }
    
    /* Specific rules for images and videos */
    img, video, picture, figure, figcaption {
      cursor: ${cursorUrl} !important;
    }
    
    /* Override common image/video cursor styles */
    img:hover, video:hover, picture:hover, figure:hover {
      cursor: ${cursorUrl} !important;
    }
    
    /* Force cursor on all media elements */
    img[src], video[src], img[data-src], video[data-src] {
      cursor: ${cursorUrl} !important;
    }
    
    /* Override any pointer cursor styles */
    *[style*="cursor: pointer"], *[style*="cursor:pointer"] {
      cursor: ${cursorUrl} !important;
    }
    
    /* Override any default cursor styles */
    *[style*="cursor: default"], *[style*="cursor:default"] {
      cursor: ${cursorUrl} !important;
    }
    
    /* Override any zoom cursor styles */
    *[style*="cursor: zoom-in"], *[style*="cursor:zoom-in"],
    *[style*="cursor: zoom-out"], *[style*="cursor:zoom-out"] {
      cursor: ${cursorUrl} !important;
    }
    
    /* Override any grab cursor styles */
    *[style*="cursor: grab"], *[style*="cursor:grab"],
    *[style*="cursor: grabbing"], *[style*="cursor:grabbing"] {
      cursor: ${cursorUrl} !important;
    }
  `;

  // Ensure we have a head element
  if (!document.head) {
    debugLog('No document.head found, waiting...');
    setTimeout(() => injectCursorStyle(cursorType, enabled), 100);
    return;
  }

  document.head.appendChild(style);
  currentCursorStyle = style;
  debugLog('Cursor style injected successfully');
  
  // Force cursor on all existing elements
  forceCursorOnElements(cursorUrl);
  
  // Verify the style was added
  setTimeout(() => {
    const addedStyle = document.getElementById('bts-cursor-customizer');
    if (addedStyle) {
      debugLog('Style verification: SUCCESS');
      // Test if cursor is actually applied by checking computed styles
      const testElement = document.createElement('div');
      testElement.style.position = 'absolute';
      testElement.style.left = '-9999px';
      document.body.appendChild(testElement);
      
      const computedStyle = window.getComputedStyle(testElement);
      const cursorValue = computedStyle.cursor;
      debugLog(`Computed cursor value: ${cursorValue}`);
      
      document.body.removeChild(testElement);
    } else {
      debugLog('Style verification: FAILED');
    }
  }, 100);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  debugLog(`Received message: ${request.action}`);
  
  if (request.action === 'updateCursor') {
    debugLog(`Updating cursor to: ${request.cursor}, enabled: ${request.enabled}`);
    injectCursorStyle(request.cursor, request.enabled);
    sendResponse({ success: true });
  }
  
  return true; // Keep message channel open for async response
});

// Initialize cursor on page load
function initializeCursor() {
  debugLog('Initializing cursor on page load');
  chrome.storage.sync.get(['selectedCursor', 'cursorEnabled'], (result) => {
    if (chrome.runtime.lastError) {
      console.error('Failed to load cursor settings:', chrome.runtime.lastError);
      return;
    }
    
    const cursor = result.selectedCursor || 'auto';
    const enabled = result.cursorEnabled !== false;
    
    debugLog(`Initial settings: cursor=${cursor}, enabled=${enabled}`);
    injectCursorStyle(cursor, enabled);
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCursor);
} else {
  initializeCursor();
}

// Handle dynamic content changes
const observer = new MutationObserver(() => {
  // Re-apply cursor if needed
  if (currentCursorStyle && !document.getElementById('bts-cursor-customizer')) {
    debugLog('Style element removed, re-applying cursor');
            chrome.storage.sync.get(['selectedCursor', 'cursorEnabled'], (result) => {
          if (result.cursorEnabled !== false) {
            injectCursorStyle(result.selectedCursor || 'auto');
          }
        });
  }
});

// Start observing
observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

  // Log that content script is loaded
  debugLog('BTS Cursor content script loaded successfully');

// Mouse move tracking for auto mode
let mouseMoveTimeout;
document.addEventListener('mousemove', (e) => {
  if (!isAutoMode) return;
  
  // Throttle the mouse move events
  clearTimeout(mouseMoveTimeout);
  mouseMoveTimeout = setTimeout(() => {
    const backgroundColor = detectBackgroundColor(e.clientX, e.clientY);
    const isLight = isLightBackground(backgroundColor);
    const newCursor = isLight ? 'bts-logo-black' : 'bts-logo-white';
    
    // Only update if background color changed significantly
    if (lastBackgroundColor !== backgroundColor) {
      lastBackgroundColor = backgroundColor;
      debugLog(`Background changed to ${backgroundColor}, switching to ${newCursor}`);
      
      // Re-apply cursor with new selection
      chrome.storage.sync.get(['selectedCursor', 'cursorEnabled'], (result) => {
        if (result.cursorEnabled !== false && result.selectedCursor === 'auto') {
          injectCursorStyle('auto', true);
        }
      });
    }
  }, 100); // Throttle to 100ms
});

// Periodic check to ensure cursor style is still applied
setInterval(() => {
  if (currentCursorStyle && !document.getElementById('bts-cursor-customizer')) {
    debugLog('Style element removed, re-applying cursor');
    chrome.storage.sync.get(['selectedCursor', 'cursorEnabled'], (result) => {
      if (result.cursorEnabled !== false) {
        injectCursorStyle(result.selectedCursor || 'bts-logo-white');
      }
    });
  }
}, 2000); // Check every 2 seconds 