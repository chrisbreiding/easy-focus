import { highlightBorderWidth } from '../constants';
import { getNodeRect } from '../dom';
import labels from './labels'

export default function highlights (focusables) {
  const highlights = Object.keys(focusables)
    .map((key) => focusables[key])
    .reverse()
  const highlightsFragment = highlights.reduce(reduceHighlightsFragment, document.createDocumentFragment());

  const containerEl = document.createElement('div');
  containerEl.className = 'highlights';
  containerEl.appendChild(highlightsFragment);
  containerEl.appendChild(labels(highlights));
  return containerEl;
}

function reduceHighlightsFragment (fragment, focusable) {
  fragment.appendChild(highlight(focusable.node));
  return fragment;
}

function highlight (node) {
  const el = document.createElement('div');
  el.className = 'highlight';
  const rect = getNodeRect(node);

  Object.assign(el.style, {
    top: `${rect.top - highlightBorderWidth}px`,
    left: `${rect.left - highlightBorderWidth}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  });
  return el;
}
