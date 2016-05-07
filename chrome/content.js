(function () {
  var slice = [].slice;

  var ESC = 27;
  var highlightBorderWidth = 3;
  var highlightColor = 'yellow';

  run();


  function run () {
    var whichStart = 65;
    var identifiers = 'abcdefghijklmnopqrstuvwxyz'.split('').map(function (letter, index) {
      return {
        letter: letter,
        code: whichStart + index,
      };
    });

    var viewport = getViewportDimensions();
    var scroll = getScrollOffset();

    var focusables = getFocusables()
      .filter(partial(filterFocusables, viewport, scroll))
      .sort(sortFocusables)
      .reduce(partial(reduceFocusables, identifiers), {});

    if (!Object.keys(focusables).length) return;

    var highlightsFragment = Object.keys(focusables)
      .map(function (key) { return focusables[key]; })
      .reduce(reduceHighlightsFragment, document.createDocumentFragment());

    var containerEl = container();

    containerEl.appendChild(background(focusables));
    containerEl.appendChild(highlightsFragment);
    document.body.appendChild(containerEl);

    var onClose = partial(close, containerEl, keydownListener, keyupListener);

    var keydownListener = partial(onKeyDown, focusables);
    var keyupListener = partial(onKeyUp, focusables, onClose);
    document.addEventListener('keydown', keydownListener);
    document.addEventListener('keyup', keyupListener);

    chrome.runtime.onMessage.addListener(function (message) {
      if (message === 'close') onClose();
    });
  }

  function partial (func) {
    var args = slice.call(arguments, 1);
    return function () {
      return func.apply(null, args.concat(slice.call(arguments)));
    };
  }

  function getFocusables () {
    var focusablesSelector = 'input, textarea, button, a[href], select, [tabindex]';
    return slice.call(document.querySelectorAll(focusablesSelector));
  }

  function filterFocusables (viewport, scroll, node) {
    var nodeRect = getNodeRect(node);
    return (
      !node.disabled &&
      hasDimensions(nodeRect) &&
      onScreen(nodeRect, viewport, scroll) &&
      isVisible(node)
    );
  }

  function sortFocusables (a, b) {
    var aRect = getNodeRect(a);
    var bRect = getNodeRect(b);

    if (aRect.top === bRect.top && aRect.left === bRect.left) {
      return 0;
    }
    if (aRect.top < bRect.top || (aRect.top === bRect.top && aRect.left < bRect.left)) {
      return -1;
    }
    return 1;
  }

  function reduceFocusables (identifiers, focusables, node, index) {
    var identifier = identifiers[index];
    if (!identifier) return focusables;

    focusables[identifier.code] = {
      identifier: identifier,
      node: node,
    };
    return focusables;
  }

  function reduceHighlightsFragment (fragment, focusable) {
    var highlightEl = highlight(focusable.node);
    highlightEl.appendChild(label(focusable.identifier));
    fragment.appendChild(highlightEl);
    return fragment;
  }

  function hasDimensions (nodeRect) {
    return !!nodeRect.width && !!nodeRect.height;
  }

  function isVisible (node) {
    return window.getComputedStyle(node).visibility !== 'hidden';
  }

  function onScreen (nodeRect, viewport, scroll) {
    return (
      nodeRect.left + nodeRect.width > scroll.left &&
      nodeRect.left < viewport.width + scroll.left &&
      nodeRect.top + nodeRect.height > scroll.top &&
      nodeRect.top < viewport.height + scroll.top
    );
  }

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
    var rect = getNodeRect(node);
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
      fontFamily: 'sans-serif',
      padding: '5px 8px',
      position: 'relative',
      left: '-' + highlightBorderWidth + 'px',
      top: '-' + highlightBorderWidth + 'px',
    });
    el.innerText = identifier.letter;
    return el;
  }

  function background (focusables) {
    var masks = Object.keys(focusables).map(function (key) {
      var focusable = focusables[key];
      var rect = getNodeRect(focusable.node);

      return '<rect x="' + rect.left + '" y="' + rect.top + '" width="' + rect.width + '" height="' + rect.height + '" fill="black" />';
    }).join('');

    var width = getViewportDimensions().width;
    var height = getWindowHeight();
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

  function getViewportDimensions () {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  function getScrollOffset () {
    return {
      left: window.scrollX,
      top: window.scrollY,
    };
  }

  function getWindowHeight () {
    var body = document.body;
    var html = document.documentElement;

    return Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );
  }

  function getNodeRect (node) {
    var rect = node.getBoundingClientRect();
    var scroll = getScrollOffset();
    return {
      top: rect.top + scroll.top,
      left: rect.left + scroll.left,
      width: rect.width,
      height: rect.height,
    };
  }

  function onKeyDown (focusables, e) {
    if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return;
    if (focusables[e.which]) e.preventDefault();
  }

  function onKeyUp (focusables, onClose, e) {
    if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.which === ESC) return onClose();

    var focusable = focusables[e.which];
    if (focusable) {
      focusable.node.focus();
      onClose();
    }
  }

  function close (containerEl, keydownListener, keyupListener) {
    if (containerEl.parentNode === document.body) {
      document.body.removeChild(containerEl);
    }
    document.removeEventListener('keydown', keydownListener);
    document.removeEventListener('keyup', keyupListener);
    chrome.runtime.sendMessage({ close: true });
  }
}());

/**
  TODO
  - banner at top with instructions
  - handle too many focusables
  - use more of a tooltip style, pointing to focusables
    * ensure tooltip is on screen
*/
