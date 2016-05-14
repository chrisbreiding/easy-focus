import { background, container, highlights } from './components';
import * as dom from './dom';
import { getFocusables } from './focusables';
import { noncollidingIdentifiers, withModifier } from './util';

let close;

function onMessage (message) {
  if (message.type === 'close' && close) close();
  if (message.type === 'commands') onReceiveCommands(message.commands);
}

function onReceiveCommands (commands) {
  close = run(noncollidingIdentifiers(commands));
}

function run (identifiers) {
  const focusables = getFocusables(identifiers);
  if (!Object.keys(focusables).length) {
    chrome.runtime.onMessage.removeListener(onMessage);
    return;
  }

  const containerEl = container();

  containerEl.appendChild(background(focusables));
  containerEl.appendChild(highlights(focusables));
  document.body.appendChild(containerEl);

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  const ESC = 27;
  let focusableSelected = null;
  let closing = false;
  function onKeyDown (e) {
    if (closing || withModifier(e) || e.which === ESC) return;
    const focusable = focusables[e.which];
    if (focusable && !focusableSelected) {
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


/**
  TODO
  - handle too many focusables
  - https://github.com/chrisbreiding : I should be before C
  - smart label placement
    * ensure label is on screen
    * try to ensure label doesn't overlap other tooltips
  - add readme
  - banner at top with instructions
    * "Hit letter to focus field"
    * "Hit ESC to exit"
    * placement?
*/
