chrome.commands.onCommand.addListener(function (command) {
  if (command !== 'easy-focus') return;

  chrome.tabs.executeScript({ file: 'content.js' });
});
