var running = false;
var closing = false;

chrome.commands.onCommand.addListener(function (command) {
  if (command !== 'easy-focus' || closing) return;

  if (running) {
    closing = true;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, 'close');
    });
  } else {
    running = true;
    chrome.tabs.executeScript({ file: 'content.js' });
  }
});

chrome.runtime.onMessage.addListener(function (message) {
  if (message.close) {
    running = false;
    closing = false;
  }
});
