(function () {
  var slice = [].slice;
  var whichStart = 65;
  var identifiers = 'abcdefghijklmnopqrstuvwxyz'.split('').map(function (letter, index) {
    return {
      letter: letter,
      code: whichStart + index,
    };
  });

  var ESC = 27;
  var highlightBorderWidth = 3;
  var highlightColor = 'yellow';

  var containerEl = container();
  document.body.appendChild(containerEl);

  var focusableNodes = slice.call(document.querySelectorAll('input, textarea, button'))
    .filter(function (node) {
      return !node.disabled && !!node.clientWidth && !!node.clientHeight;
    })
    .sort(function (a, b) {
      var aRect = nodeRect(a);
      var bRect = nodeRect(b);
      if (aRect.top < bRect.top || aRect.left < bRect.left) {
        return -1;
      } else if (aRect.top === bRect.top && aRect.left === bRect.left) {
        return 0;
      } else {
        return 1;
      }
    });
  var focusables = focusableNodes.reduce(function (focusables, node, index) {
    var identifier = identifiers[index];
    if (!identifier) return focusables;

    focusables[identifier.code] = {
      identifier: identifier,
      node: node,
    };
    return focusables;
  }, {});

  if (!Object.keys(focusables).length) return;

  containerEl.appendChild(background(focusables));
  Object.keys(focusables)
    .map(function (key) { return focusables[key]; })
    .forEach(function (focusable) {
      var highlightEl = highlight(focusable.node);
      highlightEl.appendChild(label(focusable.identifier));
      containerEl.appendChild(highlightEl);
    });

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  function container () {
    var el = document.createElement('div');
    Object.assign(el.style, {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      zIndex: 99999,
    });
    return el;
  }

  function highlight (node) {
    var el = document.createElement('div');
    var rect = nodeRect(node);
    Object.assign(el.style, {
      boxSizing: 'content-box',
      position: 'absolute',
      top: rect.top - highlightBorderWidth + 'px',
      left: rect.left - highlightBorderWidth + 'px',
      width: rect.width + 'px',
      height: rect.height + 'px',
      border: 'solid ' + highlightBorderWidth + 'px ' + highlightColor,
    });
    return el;
  }

  function label (identifier) {
    var el = document.createElement('div');
    Object.assign(el.style, {
      backgroundColor: highlightColor,
      color: '#333',
      display: 'inline-block',
      padding: '5px 8px',
      position: 'relative',
      top: '100%',
      left: '-' + highlightBorderWidth + 'px',
    });
    el.innerText = identifier.letter;
    return el;
  }

  function background (focusables) {
    var masks = Object.keys(focusables).map(function (key) {
      var focusable = focusables[key];
      var rect = nodeRect(focusable.node);

      return '<rect x="' + rect.left + '" y="' + rect.top + '" width="' + rect.width + '" height="' + rect.height + '" fill="black" />';
    }).join('');

    var width = window.innerWidth;
    var height = window.innerHeight;
    var el = document.createElement('div');
    /* eslint-disable indent */
    el.innerHTML = [
      '<svg width="' + width + '" height="' + height + '">',
        '<defs>',
          '<mask id="mask" x="0" y="0">',
            '<rect x="0" y="0" width="100%" height="100%" fill="white" />',
            masks,
          '</mask>',
        '</defs>',
        '<rect x="0" y="0" width="100%" height="100%" fill="rgba(0, 0, 0, 0.6)" mask="url(#mask)" />',
      '</svg>',
    ].join('');
    /* eslint-enable indent */

    return el;
  }

  function nodeRect (node) {
    var rect = node.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };
  }

  function onKeyDown (e) {
    if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return;
    if (focusables[e.which]) e.preventDefault();
  }

  function onKeyUp (e) {
    if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.which === ESC) return close();

    var focusable = focusables[e.which];
    if (focusable) {
      focusable.node.focus();
      close();
    }
  }

  function close () {
    document.body.removeChild(containerEl);
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    chrome.runtime.sendMessage({ close: true });
  }
}());

/**
  TODO
  - banner at top with instructions
  - handle when page is scrolled
  - handle too many focusables
*/
