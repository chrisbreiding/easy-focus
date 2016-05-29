(function () {
  chai.use(function (__, utils) {
    utils.addMethod(chai.Assertion.prototype, 'cssProps', function (props) {
      const obj = utils.flag(this, 'object');
      for (let prop in props) {
        new chai.Assertion(obj).to.have.css(prop, props[prop]);
      }
    });
  });

  function loadScript (doc, src) {
    return new Promise((resolve) => {
      const script = doc.createElement('script');
      script.src = src;
      doc.body.appendChild(script);
      let loaded = false;
      script.onreadystatechange = script.onload = () => {
        if (!loaded && (!script.readyState || /loaded|complete/.test(script.readyState))) {
          loaded = true;
          resolve();
        }
      };
    });
  }

  function setupAndRun () {
    return cy
      .visit('http://localhost:8080/cypress/test.html')
      .window().then((win) => {
        return loadScript(win.document, 'polyfill.js').then(() => {
          return loadScript(win.document, '../chrome/content.js')
        }).then(() => {
          win.chrome.__sendMessageToContent({
            type: 'commands',
            commands: [{ shortcut: '' }, { shortcut: 'Alt+Shift+F' }],
          });
          win.chrome.__sendMessageToContent({ type: 'start' });
        });
      });
  }

  function withPrefix (base) {
    return `.__easy-focus__${base}`;
  }

  function getHighlight (letter) {
    return cy.contains(withPrefix('label'), letter).parent();
  }

  function highlightShouldHaveCss (letter, cssProps) {
    getHighlight(letter).should(($highlight) => {
      expect($highlight).to.have.cssProps(cssProps);
    });
  }

  window.__testHelpers = {
    setupAndRun,
    withPrefix,
    highlightShouldHaveCss,
  };
}());
