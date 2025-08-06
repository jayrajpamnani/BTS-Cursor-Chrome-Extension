// Background service worker for BTS Cursor Customizer
chrome.runtime.onInstalled.addListener(() => {
  console.log('[BTS Cursor] Extension installed, setting default cursor');
  // Set default cursor to BTS logo on installation
  chrome.storage.sync.set({
    selectedCursor: 'bts-logo',
    cursorEnabled: true
  });
});

// Listen for tab updates to inject cursor
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
    console.log(`[BTS Cursor] Tab updated: ${tab.url}`);
    chrome.storage.sync.get(['selectedCursor', 'cursorEnabled'], (result) => {
      if (result.cursorEnabled) {
        console.log(`[BTS Cursor] Sending cursor update to tab ${tabId}: ${result.selectedCursor}`);
        chrome.tabs.sendMessage(tabId, {
          action: 'updateCursor',
          cursor: result.selectedCursor
        }).catch((error) => {
          console.log(`[BTS Cursor] Tab ${tabId} not ready yet:`, error.message);
        });
      }
    });
  }
});

// Listen for storage changes to update all tabs
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && (changes.selectedCursor || changes.cursorEnabled)) {
    console.log('[BTS Cursor] Storage changed, updating all tabs');
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.url && !tab.url.startsWith('chrome://')) {
          const cursor = changes.selectedCursor?.newValue || 'bts-logo';
          const enabled = changes.cursorEnabled?.newValue !== false;
          console.log(`[BTS Cursor] Updating tab ${tab.id}: cursor=${cursor}, enabled=${enabled}`);
          chrome.tabs.sendMessage(tab.id, {
            action: 'updateCursor',
            cursor: cursor,
            enabled: enabled
          }).catch((error) => {
            console.log(`[BTS Cursor] Tab ${tab.id} not ready:`, error.message);
          });
        }
      });
    });
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(`[BTS Cursor] Received message: ${request.action}`);
  
  if (request.action === 'getCurrentCursor') {
    chrome.storage.sync.get(['selectedCursor', 'cursorEnabled'], (result) => {
      sendResponse({
        cursor: result.selectedCursor || 'bts-logo',
        enabled: result.cursorEnabled !== false
      });
    });
    return true; // Keep message channel open for async response
  }
  
  // Handle immediate cursor updates
  if (request.action === 'updateCursorImmediately') {
    console.log(`[BTS Cursor] Immediate update: cursor=${request.cursor}, enabled=${request.enabled}`);
    
    // Update all tabs immediately with the new cursor settings
    chrome.tabs.query({}, (tabs) => {
      console.log(`[BTS Cursor] Found ${tabs.length} tabs to update`);
      tabs.forEach(tab => {
        if (tab.url && !tab.url.startsWith('chrome://')) {
          console.log(`[BTS Cursor] Sending to tab ${tab.id}: ${tab.url}`);
          chrome.tabs.sendMessage(tab.id, {
            action: 'updateCursor',
            cursor: request.cursor,
            enabled: request.enabled
          }).then((response) => {
            console.log(`[BTS Cursor] Tab ${tab.id} response:`, response);
          }).catch((error) => {
            console.log(`[BTS Cursor] Tab ${tab.id} error:`, error.message);
          });
        }
      });
    });
    
    // Send success response
    sendResponse({ success: true });
    return true;
  }
}); 