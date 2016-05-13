var running = false;
var closing = false;

function sendMessage (message) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, message);
  });
}

chrome.commands.onCommand.addListener(function (command) {
  if (command !== 'easy-focus' || closing) return;

  if (running) {
    closing = true;
    sendMessage({ type: 'close' });
  } else {
    running = true;
    chrome.tabs.executeScript({ file: 'content.js' });
    chrome.commands.getAll(function (commands) {
      sendMessage({ type: 'commands', commands: commands });
    });
  }
});

chrome.runtime.onMessage.addListener(function (message) {
  if (message.close) {
    running = false;
    closing = false;
  }
});
