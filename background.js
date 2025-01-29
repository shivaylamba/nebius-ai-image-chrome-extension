chrome.runtime.onInstalled.addListener(() => {
  // Create parent menu item
  chrome.contextMenus.create({
    id: "aiTools",
    title: "AI Tools",
    contexts: ["selection"]
  });

  // Create child menu items
  chrome.contextMenus.create({
    id: "generateImage",
    parentId: "aiTools",
    title: "Generate image from text",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "reviewText",
    parentId: "aiTools",
    title: "Review text with AI",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "generateImage") {
    chrome.storage.local.set({
      generatedText: info.selectionText,
      currentTool: 'image',
      autoStart: true
    }, () => {
      chrome.sidePanel.open({ tabId: tab.id });
    });
  } else if (info.menuItemId === "reviewText") {
    chrome.storage.local.set({
      reviewText: info.selectionText,
      currentTool: 'review',
      autoStart: true
    }, () => {
      chrome.sidePanel.open({ tabId: tab.id });
    });
  }
});

// Handle keyboard shortcut for side panel
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-side-panel") {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.sidePanel.open({ tabId: tabs[0].id });
    });
  }
});

// Handle connection from content script
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "nebiusOverlay") {
    port.onDisconnect.addListener(() => {
      console.log('Content script disconnected');
    });
  }
});

// Make message handling more robust
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateImage') {
    chrome.storage.local.set({
      generatedText: request.text,
      currentTool: 'image',
      autoStart: true
    }, () => {
      chrome.sidePanel.open({ tabId: sender.tab.id });
      sendResponse({ success: true });
    });
    return true; // Will respond asynchronously
  } else if (request.action === 'reviewText') {
    chrome.storage.local.set({
      reviewText: request.text,
      currentTool: 'review',
      autoStart: true
    }, () => {
      chrome.sidePanel.open({ tabId: sender.tab.id });
      sendResponse({ success: true });
    });
    return true; // Will respond asynchronously
  }
}); 