(function () {
  var slice = [].slice;

  var ESC = 27;
  var highlightBorderWidth = 3;
  var highlightColor = '#F2F24B';

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
    // higher is preferred over farther left, unless the element is farther left
    // and close in how high (within the significance factor) or vice versa
    if (
      isHigherThanLeft(aRect, bRect) ||
      isFartherLeftThanHigh(aRect, bRect) ||
      isHigher(aRect, bRect)
    ) {
      return -1;
    }
    return 1;
  }

  var significanceFactor = 15;
  function isHigherThanLeft (aRect, bRect) {
    return (Math.abs(bRect.left - aRect.left) < significanceFactor) && isHigher(aRect, bRect);
  }
  function isFartherLeftThanHigh (aRect, bRect) {
    return (Math.abs(bRect.top - aRect.top) < significanceFactor) && aRect.left < bRect.left;
  }
  function isHigher (aRect, bRect) {
    return aRect.top < bRect.top;
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

  function highlights (focusables) {
    var highlightsFragment = Object.keys(focusables)
      .map(function (key) { return focusables[key]; })
      .reverse()
      .reduce(reduceHighlightsFragment, document.createDocumentFragment());

    var containerEl = document.createElement('div');
    containerEl.className = className('highlights');
    containerEl.appendChild(highlightsFragment);
    return containerEl;
  }

  function reduceHighlightsFragment (fragment, focusable) {
    var highlightEl = highlight(focusable.node);
    highlightEl.appendChild(label(focusable.identifier));
    fragment.appendChild(highlightEl);
    return fragment;
  }

  function className (base) {
    return '__easy-focus__' + base;
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
    el.className = className('container');
    Object.assign(el.style, {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      zIndex: 999999,
    });
    return el;
  }

  function highlight (node) {
    var el = document.createElement('div');
    el.className = className('highlight');
    var rect = getNodeRect(node);
    Object.assign(el.style, {
      boxSizing: 'content-box',
      boxShadow: '0 0 5px rgba(0, 0, 0, 0.8)',
      position: 'absolute',
      top: rect.top - highlightBorderWidth + 'px',
      left: rect.left - highlightBorderWidth + 'px',
      width: rect.width + 'px',
      height: rect.height + 'px',
      border: 'solid ' + highlightBorderWidth + 'px ' + highlightColor,
    });
    return el;
  }

  var labelSize = 24;
  function label (identifier) {
    var el = document.createElement('div');
    el.className = className('label');
    Object.assign(el.style, {
      backgroundColor: highlightColor,
      borderRadius: '0 0 3px 3px',
      boxSizing: 'content-box',
      boxShadow: '0 0 5px rgba(0, 0, 0, 0.8)',
      color: '#333',
      fontFamily: 'monospace',
      marginTop: (labelSize / 2) + highlightBorderWidth + 'px',
      position: 'relative',
      left: -(labelSize / 2 - highlightBorderWidth) + 'px',
      top: '100%',
      width: labelSize + 'px',
      height: labelSize + 'px',
      lineHeight: labelSize + 'px',
      textAlign: 'center',
      textTransform: 'uppercase',
    });
    el.innerText = identifier.letter;
    el.appendChild(labelArrow());
    return el;
  }

  function labelArrow () {
    var el = document.createElement('div');
    el.className = className('arrow');
    Object.assign(el.style, {
      borderLeft: 'solid ' + (labelSize / 2) + 'px transparent',
      borderRight: 'solid ' + (labelSize / 2) + 'px transparent',
      borderBottom: 'solid ' + (labelSize / 2) + 'px ' + highlightColor,
      position: 'absolute',
      bottom: '100%',
      left: 0,
      width: 0,
      height: 0,
    });
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
    el.className = className('background');
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

  function onMessage (message) {
    if (message.type === 'close' && close) close();
    if (message.type === 'commands') onReceiveCommands(message.commands);
  }

  function withModifier (e) {
    return e.shiftKey || e.altKey || e.ctrlKey || e.metaKey;
  }

  function focusNode (node) {
    node.focus();
    try {
      node.setSelectionRange(node.value.length, node.value.length);
    } catch (e) {
      /* not a text input, this is fine */
    }
  }

  var close;
  function onReceiveCommands (commands) {
    var letters = 'abcdefghijklmnopqrstuvwxyz';
    var whichStart = 65;
    var identifiers = letters.split('').map(function (letter, index) {
      return {
        letter: letter,
        code: whichStart + index,
      };
    });

    // don't use any letters as labels that are in a command
    // or they'll cause issues when they trigger keyup
    var collidingCommandLetters = commands
      .map(function (command) { return command.shortcut.toLowerCase(); })
      .map(function (shortcut) { return shortcut.split('+'); })
      .reduce(function (keys, chars) { return keys.concat(chars); }, [])
      .filter(function (key) { return key.length === 1 && letters.indexOf(key) > -1; });

    var noncollidingIdentifiers = identifiers.filter(function (identifier) {
      return collidingCommandLetters.indexOf(identifier.letter) === -1;
    });

    close = run(noncollidingIdentifiers);
  }

  function run (identifiers) {
    var viewport = getViewportDimensions();
    var scroll = getScrollOffset();

    var focusables = getFocusables()
      .filter(partial(filterFocusables, viewport, scroll))
      .sort(sortFocusables)
      .reduce(partial(reduceFocusables, identifiers), {});

    if (!Object.keys(focusables).length) return;

    var containerEl = container();

    containerEl.appendChild(background(focusables));
    containerEl.appendChild(highlights(focusables));
    document.body.appendChild(containerEl);

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    var focusableSelected = null;
    var closing = false;
    function onKeyDown (e) {
      if (closing || withModifier(e) || e.which === ESC) return;
      var focusable = focusables[e.which];
      if (focusable && !focusableSelected) {
        focusableSelected = focusable;
        e.preventDefault();
      }
    }

    function onKeyUp (e) {
      if (closing || withModifier(e)) return;
      if (e.which === ESC) return close();

      var focusable = focusables[e.which];
      if (focusable && focusableSelected === focusable) {
        focusNode(focusable.node);
        close();
      }
    }

    function close () {
      if (closing) return;
      closing = true;
      if (containerEl.parentNode === document.body) {
        document.body.removeChild(containerEl);
      }
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      chrome.runtime.onMessage.removeListener(onMessage);
      chrome.runtime.sendMessage({ close: true });
    }

    return close;
  }

  chrome.runtime.onMessage.addListener(onMessage);
}());

/**
  TODO
  - handle too many focusables
  - https://github.com/chrisbreiding : I should be before C
  - smart label placement
    * ensure label is on screen
    * try to ensure label doesn't overlap other tooltips
  - banner at top with instructions
    * "Hit letter to focus field"
    * "Hit ESC to exit"
    * placement?
*/
