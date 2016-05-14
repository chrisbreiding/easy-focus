(function () {
  let listeners = [];

  window.chrome = {
    runtime: {
      sendMessage: function () {},
      onMessage: {
        addListener: (fn) => listeners.push(fn),
        removeListener: () => {},
      },
    },

    __sendMessageToContent: function (message) {
      listeners.forEach((listener) => listener(message));
    },
  };
}());
