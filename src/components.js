import { highlightColor, highlightBorderWidth } from './constants';
import * as dom from './dom';

export function container (focusables) {
  const el = document.createElement('div');
  el.className = dom.className('container');
  Object.assign(el.style, {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 999999,
  });
  el.appendChild(background(focusables));
  el.appendChild(highlights(focusables));
  return el;
}

function background (focusables) {
  const masks = Object.keys(focusables).map(function (key) {
    const focusable = focusables[key];
    const rect = dom.getNodeRect(focusable.node);

    return `<rect
      x="${rect.left}"
      y="${rect.top}"
      width="${rect.width}"
      height="${rect.height}"
      fill="black"
    />`;
  }).join('');

  const width = dom.getViewportDimensions().width;
  const height = dom.getWindowHeight();
  const el = document.createElement('div');
  el.className = dom.className('background');
  el.innerHTML = (
    `<svg width="${width}" height="${height}">,
      <defs>,
        <mask id="mask" x="0" y="0">,
          <rect x="0" y="0" width="100%" height="100%" fill="white" />,
          ${masks},
        </mask>,
      </defs>,
      <rect x="0" y="0" width="100%" height="100%" fill="rgba(0, 0, 0, 0.6)" mask="url(#mask)" />,
    </svg>`
  );
  return el;
}

function highlights (focusables) {
  const highlightsFragment = Object.keys(focusables)
    .map((key) => focusables[key])
    .reverse()
    .reduce(reduceHighlightsFragment, document.createDocumentFragment());

  const containerEl = document.createElement('div');
  containerEl.className = dom.className('highlights');
  containerEl.appendChild(highlightsFragment);
  return containerEl;
}

export function reduceHighlightsFragment (fragment, focusable) {
  const highlightEl = highlight(focusable.node);
  highlightEl.appendChild(label(focusable.identifier));
  fragment.appendChild(highlightEl);
  return fragment;
}

function highlight (node) {
  const el = document.createElement('div');
  el.className = dom.className('highlight');
  const rect = dom.getNodeRect(node);

  Object.assign(el.style, {
    boxSizing: 'content-box',
    boxShadow: '0 0 5px rgba(0, 0, 0, 0.8)',
    position: 'absolute',
    top: `${rect.top - highlightBorderWidth}px`,
    left: `${rect.left - highlightBorderWidth}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    border: `solid ${highlightBorderWidth}px ${highlightColor}`,
  });
  return el;
}

const labelSize = 24;
function label (identifier) {
  const el = document.createElement('div');
  el.className = dom.className('label');
  Object.assign(el.style, {
    backgroundColor: highlightColor,
    borderRadius: '0 0 3px 3px',
    boxSizing: 'content-box',
    boxShadow: '0 0 5px rgba(0, 0, 0, 0.8)',
    color: '#333',
    fontFamily: 'monospace',
    marginTop: `${(labelSize / 2) + highlightBorderWidth}px`,
    position: 'relative',
    left: `${-(labelSize / 2 - highlightBorderWidth)}px`,
    top: '100%',
    width: `${labelSize}px`,
    height: `${labelSize}px`,
    lineHeight: `${labelSize}px`,
    textAlign: 'center',
    textTransform: 'uppercase',
  });
  el.innerText = identifier.letter;
  el.appendChild(labelArrow());
  return el;
}

function labelArrow () {
  const el = document.createElement('div');
  el.className = dom.className('arrow');
  Object.assign(el.style, {
    borderLeft: `solid ${labelSize / 2}px transparent`,
    borderRight: `solid ${labelSize / 2}px transparent`,
    borderBottom: `solid ${labelSize / 2}px ${highlightColor}`,
    position: 'absolute',
    bottom: '100%',
    left: 0,
    width: 0,
    height: 0,
  });
  return el;
}
