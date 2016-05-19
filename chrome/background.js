const tabs = {};
let currentTabId;

let fsm = {
  to (newState, ...args) {
    const oldState = tabs[currentTabId];
    tabs[currentTabId] = newState;
    const action = this[`${oldState}->${newState}`];
    if (action) {
      action(...args);
    }
  },
  stateIs (state) {
    return tabs[currentTabId] === state;
  },

  'waiting->loading' () {
    chrome.tabs.executeScript({ file: 'content.js' });
    chrome.commands.getAll((commands) => {
      sendMessage({ type: 'commands', commands });
    });
  },
  'running->closing' () {
    sendMessage({ type: 'close' });
  },
};

function sendMessage (message) {
  chrome.tabs.sendMessage(currentTabId, message);
}

chrome.commands.onCommand.addListener((command) => {
  if (command !== 'easy-focus') return;

  if (fsm.stateIs('running')) {
    fsm.to('closing');
  } else {
    fsm.to('loading');
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.close) {
    fsm.to('waiting');
  }
  if (message.running) {
    fsm.to('running');
  }
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  currentTabId = tabId;
  if (!tabs[currentTabId]) {
    fsm.to('waiting');
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabs[tabId];
});
