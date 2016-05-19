import { container } from './components';
import * as dom from './dom';
import { getFocusableNodes, getFocusablesAtOffset, inFocusableRange } from './focusables';
import { actions, noncollidingIdentifiers } from './identifiers';
import { withModifier } from './util';

let close;

function onMessage (message) {
  if (message.type === 'close' && close) close();
  if (message.type === 'commands') onReceiveCommands(message.commands);
}

function onReceiveCommands (commands) {
  close = run(noncollidingIdentifiers(commands));
}

function run (identifiers) {
  const focusableNodes = getFocusableNodes(identifiers);
  if (!focusableNodes.length) {
    close();
    return;
  }

  let page = 0;
  let focusables;
  let containerEl;

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
  chrome.runtime.sendMessage({ running: true });

  const ESC = 27;
  let focusableSelected = null;
  let closing = false;
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
    if (e.which === ESC) return close();

    const focusable = focusables[e.which];
    if (focusable && focusableSelected === focusable) {
      dom.focusNode(focusable.node);
      close();
    }

    const action = actions[e.which];
    if (action) {
      paginate(action);
    }
  }

  function close () {
    if (closing) return;

    closing = true;
    if (containerEl && containerEl.parentNode === document.body) {
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
