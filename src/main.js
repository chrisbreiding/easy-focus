import { container } from './components';
import * as dom from './dom';
import { getFocusableNodes, getFocusablesAtOffset, inFocusableRange } from './focusables';
import { actions, noncollidingIdentifiers } from './identifiers';
import { withModifier, withPrefix } from './util';

let identifiers;

function onMessage (message) {
  if (message.type === 'commands') onReceiveCommands(message.commands);
  if (message.type === 'start') run(message.tabId);
}

function onReceiveCommands (commands) {
  identifiers = noncollidingIdentifiers(commands);
}

function run (tabId) {
  let closing = false;

  let containerEl = document.getElementById(withPrefix('container'));
  const focusableNodes = getFocusableNodes(identifiers);
  if (containerEl || !focusableNodes.length) {
    teardown();
    return;
  }

  let page = 0;
  let focusables;

  function render () {
    const offset = page * identifiers.length;
    focusables = getFocusablesAtOffset(focusableNodes, identifiers, offset);
    containerEl = container(focusables);
    document.body.appendChild(containerEl);
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
    document.body.removeChild(containerEl);
    render();
  }

  render(page);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
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
    if (containerEl && containerEl.parentNode === document.body) {
      document.body.removeChild(containerEl);
    }
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
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
  - smart label placement
    * ensure label is on screen
    * try to ensure label doesn't overlap other tooltips
  - add readme
  - banner at top with instructions
    * "Hit letter to focus field"
    * "Hit ESC to exit"
    * pagination indicators
    * placement?
  - package and deploy
  1.1
  - filter mode
    * after a shortcut trigger
    * can start typing and filter down focusables based on text
*/
