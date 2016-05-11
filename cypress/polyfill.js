window.chrome = {
  extension: {
    getURL: function (file) {
      return '../chrome/' + file;
    },
  },
  runtime: {
    sendMessage: function () {},
    onMessage: {
      addListener: function () {},
    },
  },
};
