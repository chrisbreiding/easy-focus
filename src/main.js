import createContainer from './components/container';
import * as constants from './constants';
import * as dom from './dom';
import { getFocusableNodes, getFocusablesAtOffset, inFocusableRange } from './focusables';
import { actions, noncollidingIdentifiers } from './identifiers';
import { addListener, getStyles, removeListeners, withModifier, withPrefix } from './util';
let identifiers;

function onMessage (message) {
  if (message.type === 'commands') onReceiveCommands(message.commands);
  if (message.type === 'start') start(message.tabId);
}

function onReceiveCommands (commands) {
  identifiers = noncollidingIdentifiers(commands);
}

function start (tabId) {
  if (document.getElementById(withPrefix('container'))) return; // already running

  getStyles(constants).then((styles) => run(tabId, styles));
}

function run (tabId, styles) {
  let closing = false;

  const focusableNodes = getFocusableNodes(identifiers);
  if (!focusableNodes.length) {
    teardown();
    return;
  }

  let page = 0;
  let focusables;
  let container;

  function render () {
    const offset = page * identifiers.length;
    focusables = getFocusablesAtOffset(focusableNodes, identifiers, offset);
    container = createContainer(styles, focusables);
    document.body.appendChild(container.el);
  }

  function paginate (direction) {
    const numFocusables = Object.keys(focusables).length
    if (direction === 'down' && focusableNodes.length > page * identifiers.length + numFocusables) {
      page++;
    } else if (direction === 'up' && page > 0) {
      page--;
    } else {
      return;
    }
    dom.removeNode(container.el);
    container.el = null;
    render();
  }

  render();

  addListener(document, 'keydown', onKeyDown);
  addListener(document, 'keyup', onKeyUp);
  window.addEventListener('unload', close);

  const ESC = 27;
  let focusableSelected = null;
  function onKeyDown (e) {
    if (closing || withModifier(e) || e.which === ESC) return;
    const focusable = focusables[e.which];
    if (!focusableSelected && inFocusableRange(e.which)) {
      focusableSelected = focusable;
      e.preventDefault();
    }
  }

  function onKeyUp (e) {
    if (closing || withModifier(e)) return;
    if (e.which === ESC) return teardown();

    const focusable = focusables[e.which];
    if (focusable && focusableSelected === focusable) {
      dom.focusNode(focusable.node);
      teardown();
    }

    const action = actions[e.which];
    if (action) {
      paginate(action);
    }
  }

  function teardown () {
    if (closing) return;

    closing = true;
    if (container.el) {
      dom.removeNode(container.el);
      container.el = null;
    }
    removeListeners()
  }

  function close () {
    teardown();
    chrome.runtime.sendMessage({ close: true, tabId });
  }
}

chrome.runtime.onMessage.addListener(onMessage);


/**
  TODO
  1.0
  - instructions
    * (?) in corner of screen
      > opens modal with instructions when clicked or user types '/'
    * "Hit letter to focus field"
    * "Hit ESC to exit"
    * "Page up with 'j'", "Page down with 'k'"
  - vary highlight colors so it's easier to see which label
    belongs to which highlight
  - add readme
  - package and deploy
  1.1
  - stop scrolling? how? is setting overflow: hidden on html, body enough?
  - filter mode
    * after a shortcut trigger
    * can start typing and filter down focusables based on text
  - try to ensure labels don't overlap other highlights

*/
