import * as dom from './dom';
import { whichStart, whichEnd } from './identifiers';
import { partial } from './util';

export function inFocusableRange (which) {
  return which >= whichStart && which <= whichEnd;
}

export function getFocusablesAtOffset (nodes, identifiers, offset) {
  return nodes
    .slice(offset)
    .reduce(partial(reduceFocusables, identifiers), {});
}

export function getFocusableNodes () {
  const viewport = dom.getViewportDimensions();
  const scroll = dom.getScrollOffset();

  const focusablesSelector = 'input, textarea, button, a[href], select, [tabindex]';
  return [...document.querySelectorAll(focusablesSelector)]
    .filter(partial(filterFocusableNodes, viewport, scroll))
    .sort(sortFocusableNodes);
}

function filterFocusableNodes (viewport, scroll, node) {
  const nodeRect = dom.getNodeRect(node);
  return (
    !node.disabled &&
    dom.hasDimensions(nodeRect) &&
    dom.onScreen(nodeRect, viewport, scroll) &&
    dom.isVisible(node)
  );
}

function sortFocusableNodes (a, b) {
  const aRect = dom.getNodeRect(a);
  const bRect = dom.getNodeRect(b);

  if (aRect.top === bRect.top && aRect.left === bRect.left) {
    return 0;
  }
  // higher is preferred over farther left, unless the element is farther left
  // and close in how high (within the significance factor) or vice versa
  if (dom.isHigherThanLeft(aRect, bRect) || dom.isFartherLeftThanHigh(aRect, bRect)) {
    return -1;
  } else if (dom.isHigherThanLeft(bRect, aRect) || dom.isFartherLeftThanHigh(bRect, aRect)) {
    return 1;
  } else if (dom.isHigher(aRect, bRect)) {
    return -1;
  }
  return 1;
}

function reduceFocusables (identifiers, focusables, node, index) {
  const identifier = identifiers[index];
  if (!identifier) return focusables;
  focusables[identifier.which] = { identifier, node };
  return focusables;
}
