let running = false;
let closing = false;

function sendMessage (message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, message);
  });
}

chrome.commands.onCommand.addListener((command) => {
  if (command !== 'easy-focus' || closing) return;

  if (running) {
    closing = true;
    sendMessage({ type: 'close' });
  } else {
    running = true;
    chrome.tabs.executeScript({ file: 'content.js' });
    chrome.commands.getAll((commands) => {
      sendMessage({ type: 'commands', commands });
    });
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.close) {
    running = false;
    closing = false;
  }
});
