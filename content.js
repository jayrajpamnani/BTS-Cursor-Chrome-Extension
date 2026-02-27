// Content script for injecting custom cursor
let currentCursorStyle = null;
let isAutoMode = false;
let lastBackgroundColor = null;

// Cursor configurations - using PNG files for Chrome compatibility
const cursorConfigs = {
  'bts-logo-white': {
    png: chrome.runtime.getURL('assets/BTS_Logo_White.png'),
    hotspot: '16 16'
  },
  'bts-logo-black': {
    png: chrome.runtime.getURL('assets/BTS_Logo_Black.png'),
    hotspot: '16 16'
  },
  'auto': {
    png: null,
    hotspot: '16 16'
  }
};

function debugLog(message) {
  // console.log('[BTS Cursor]', message);
}

// Function to detect background color at cursor position
function detectBackgroundColor(x, y) {
  let element = document.elementFromPoint(x, y);
  if (!element) return '#ffffff'; // Default to white
  
  while (element && element !== document.documentElement) {
    const computedStyle = window.getComputedStyle(element);
    const backgroundColor = computedStyle.backgroundColor;
    
    if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
      return backgroundColor;
    }
    
    element = element.parentElement;
  }
  
  // Check body as last resort
  if (document.body) {
    const bodyColor = window.getComputedStyle(document.body).backgroundColor;
    if (bodyColor && bodyColor !== 'rgba(0, 0, 0, 0)' && bodyColor !== 'transparent') {
      return bodyColor;
    }
  }
  
  return '#ffffff';
}

// Function to determine if background is light or dark
function isLightBackground(color) {
  let r, g, b;
  
  if (color.startsWith('rgb')) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      r = parseInt(match[1]);
      g = parseInt(match[2]);
      b = parseInt(match[3]);
    } else {
      return true; // Default to light
    }
  } else if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      r = parseInt(hex[0]+hex[0], 16);
      g = parseInt(hex[1]+hex[1], 16);
      b = parseInt(hex[2]+hex[2], 16);
    } else if (hex.length >= 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else {
      return true;
    }
  } else {
    return true; // Default to light for unknown formats
  }
  
  // Use relative luminance formula
  const sRGB = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  const luminance = 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  
  return luminance > 0.179; // Threshold for light vs dark
}

// Function to get appropriate cursor based on background
function getAutoCursor(x, y) {
  const cx = x !== undefined ? x : window.innerWidth / 2;
  const cy = y !== undefined ? y : window.innerHeight / 2;
  
  const backgroundColor = detectBackgroundColor(cx, cy);
  const isLight = isLightBackground(backgroundColor);
  
  return isLight ? 'bts-logo-black' : 'bts-logo-white';
}

// Function to inject cursor styles
async function injectCursorStyle(cursorType, enabled = true, x = undefined, y = undefined) {
  if (!enabled) {
    if (currentCursorStyle) {
      currentCursorStyle.remove();
      currentCursorStyle = null;
    }
    return;
  }

  let actualCursorType = cursorType;
  if (cursorType === 'auto') {
    isAutoMode = true;
    actualCursorType = getAutoCursor(x, y);
  } else {
    isAutoMode = false;
  }

  if (actualCursorType === 'bts-logo') {
    actualCursorType = 'bts-logo-white';
  }

  const config = cursorConfigs[actualCursorType];
  if (!config) return;

  const cursorUrl = `url("${config.png}") ${config.hotspot}, auto`;

  const cssRules = `
    html *, body *, a, button, input, textarea, select, [role="button"], [tabindex],
    input[type="text"], input[type="password"], input[type="email"], 
    input[type="search"], input[type="url"], input[type="tel"], 
    [contenteditable="true"], *:hover, div, span, p, h1, h2, h3, h4, h5, h6, img, svg, canvas,
    img, video, picture, figure, figcaption, img:hover, video:hover, picture:hover, figure:hover,
    img[src], video[src], img[data-src], video[data-src],
    *[style*="cursor: pointer"], *[style*="cursor:pointer"],
    *[style*="cursor: default"], *[style*="cursor:default"],
    *[style*="cursor: zoom-in"], *[style*="cursor:zoom-in"],
    *[style*="cursor: zoom-out"], *[style*="cursor:zoom-out"],
    *[style*="cursor: grab"], *[style*="cursor:grab"],
    *[style*="cursor: grabbing"], *[style*="cursor:grabbing"] {
      cursor: ${cursorUrl} !important;
    }
  `;

  if (!document.head) {
    setTimeout(() => injectCursorStyle(cursorType, enabled, x, y), 100);
    return;
  }

  let style = document.getElementById('bts-cursor-customizer');
  if (!style) {
    style = document.createElement('style');
    style.id = 'bts-cursor-customizer';
    document.head.appendChild(style);
  }
  
  if (style.textContent !== cssRules) {
    style.textContent = cssRules;
  }
  
  currentCursorStyle = style;
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateCursor') {
    injectCursorStyle(request.cursor, request.enabled);
    sendResponse({ success: true });
  }
  return true;
});

function initializeCursor() {
  chrome.storage.sync.get(['selectedCursor', 'cursorEnabled'], (result) => {
    const cursor = result.selectedCursor || 'auto';
    const enabled = result.cursorEnabled !== false;
    injectCursorStyle(cursor, enabled);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCursor);
} else {
  initializeCursor();
}

const observer = new MutationObserver(() => {
  if (currentCursorStyle && !document.getElementById('bts-cursor-customizer')) {
    chrome.storage.sync.get(['selectedCursor', 'cursorEnabled'], (result) => {
      if (result.cursorEnabled !== false) {
        injectCursorStyle(result.selectedCursor || 'auto');
      }
    });
  }
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

let mouseMoveTimeout;
document.addEventListener('mousemove', (e) => {
  if (!isAutoMode) return;
  
  // Throttle events slightly to improve performance
  clearTimeout(mouseMoveTimeout);
  mouseMoveTimeout = setTimeout(() => {
    const backgroundColor = detectBackgroundColor(e.clientX, e.clientY);
    
    if (lastBackgroundColor !== backgroundColor) {
      lastBackgroundColor = backgroundColor;
      chrome.storage.sync.get(['selectedCursor', 'cursorEnabled'], (result) => {
        if (result.cursorEnabled !== false && result.selectedCursor === 'auto') {
          injectCursorStyle('auto', true, e.clientX, e.clientY);
        }
      });
    }
  }, 100);
});

setInterval(() => {
  if (currentCursorStyle && !document.getElementById('bts-cursor-customizer')) {
    chrome.storage.sync.get(['selectedCursor', 'cursorEnabled'], (result) => {
      if (result.cursorEnabled !== false) {
        injectCursorStyle(result.selectedCursor || 'auto');
      }
    });
  }
}, 2000);