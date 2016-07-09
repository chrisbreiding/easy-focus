import {
  getNodeRect,
  getScrollOffset,
  getViewportDimensions,
  hasDimensions,
  intersectsScreen,
  isFartherLeftThanHigh,
  isHigher,
  isHigherThanLeft,
  isVisible,
} from './dom';
import { whichStart, whichEnd } from './identifiers';
import { partial } from './util';

function inFocusableRange (which) {
  return which >= whichStart && which <= whichEnd;
}

function getFocusablesAtOffset (nodes, identifiers, offset) {
  return nodes
    .slice(offset)
    .reduce(partial(reduceFocusables, identifiers), {});
}

function getFocusableNodes () {
  const viewport = getViewportDimensions();
  const scroll = getScrollOffset();

  const focusablesSelector = 'input, textarea, button, a[href], select, [tabindex]';
  return [...document.querySelectorAll(focusablesSelector)]
    .filter(partial(filterFocusableNodes, viewport, scroll))
    .sort(sortFocusableNodes);
}

function filterFocusableNodes (viewport, scroll, node) {
  const nodeRect = getNodeRect(node);
  return (
    !node.disabled &&
    hasDimensions(nodeRect) &&
    intersectsScreen(nodeRect, viewport, scroll) &&
    isVisible(node)
  );
}

function sortFocusableNodes (a, b) {
  const aRect = getNodeRect(a);
  const bRect = getNodeRect(b);

  if (aRect.top === bRect.top && aRect.left === bRect.left) {
    return 0;
  }
  // higher is preferred over farther left, unless the element is farther left
  // and close in how high (within the significance factor) or vice versa
  if (isHigherThanLeft(aRect, bRect) || isFartherLeftThanHigh(aRect, bRect)) {
    return -1;
  } else if (isHigherThanLeft(bRect, aRect) || isFartherLeftThanHigh(bRect, aRect)) {
    return 1;
  } else if (isHigher(aRect, bRect)) {
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

export {
  inFocusableRange,
  getFocusablesAtOffset,
  getFocusableNodes,
}
