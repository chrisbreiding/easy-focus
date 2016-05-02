var running = false;
chrome.commands.onCommand.addListener(function (command) {
  if (command !== 'easy-focus') return;

  if (!running) {
    running = true;
    chrome.tabs.executeScript({ file: 'content.js' });
  }

  chrome.runtime.onMessage.addListener(function (msg) {
    if (msg.close) running = false;
  });
});
