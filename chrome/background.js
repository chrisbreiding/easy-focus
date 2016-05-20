const tabs = {};

chrome.commands.onCommand.addListener((command) => {
  if (command !== 'easy-focus') return;

  getTab((tabId) => {
    if (tabs[tabId]) {
      start(tabId);
    } else {
      tabs[tabId] = true;
      load(tabId);
    }
  })
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.close) {
    removeTab(message.tabId);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  removeTab(tabId);
});

function sendMessage (message) {
  getTab((tabId) => chrome.tabs.sendMessage(tabId, message));
}

function getTab (callback) {
  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    callback(tabs[0].id);
  });
}

function removeTab (tabId) {
  delete tabs[tabId];
}

function load (tabId) {
  chrome.tabs.executeScript({ file: 'content.js' }, () => {
    chrome.commands.getAll((commands) => {
      sendMessage({ type: 'commands', commands });
      start(tabId);
    });
  });
}

function start (tabId) {
  sendMessage({ type: 'start', tabId });
}
