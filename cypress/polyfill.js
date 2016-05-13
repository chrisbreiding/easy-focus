(function () {
  var listeners = [];

  window.chrome = {
    runtime: {
      sendMessage: function () {},
      onMessage: {
        addListener: function (fn) { listeners.push(fn); },
        removeListener: function () {},
      },
    },

    __sendMessageToContent: function (message) {
      listeners.forEach(function (listener) { listener(message); });
    },
  };
}());
