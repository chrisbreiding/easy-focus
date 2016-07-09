import { highlightBorderWidth } from '../constants';
import {
  getNodeRect,
  getScrollOffset,
  getViewportDimensions,
  intersect,
  isFullyOnScreen,
} from '../dom';

export default function labels (highlights) {
  return highlights.reduce(reduceLabelsFragment, {
    previousLabelRects: [],
    fragment: document.createDocumentFragment(),
  }).fragment;
}

function reduceLabelsFragment ({ previousLabelRects, fragment }, focusable) {
  const theLabel = label(focusable, previousLabelRects);
  fragment.appendChild(theLabel.el);
  return {
    fragment,
    previousLabelRects: previousLabelRects.concat(theLabel.rect),
  };
}

const labelSize = 24;
function label ({ node, identifier }, previousLabelRects) {
  const el = document.createElement('div');
  const { rect, side } = labelRect(node, previousLabelRects);
  el.className = `label ${sides[side]}`;

  Object.assign(el.style, {
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  });
  el.appendChild(labelText(identifier.letter, side));
  return { el, rect };
}

const sides = 'bottom right top left end'.split(' ');

// attempts to find a good location for the label by walking around the
// edge of the highlight node, from bottom left counterclockwise.
// tests for collisions with all previous labels and settles for the last
// on-screen position found if a collision with another label cannout
// be avoided
function labelRect (highlightNode, previousLabelRects) {
  const viewport = getViewportDimensions();
  const scroll = getScrollOffset();
  const highlightRect = getNodeRect(highlightNode);

  let current = {
    side: 0,
    rect: start(highlightRect)[sides[0]],
  };
  let lastOnScreen = current;

  while (!isFullyOnScreen(current.rect, viewport, scroll) || intersectsPreviousLabels(current.rect, previousLabelRects)) {
    current = next(current, highlightRect);
    if (!current) {
      // could not find a good position after going around once,
      // fallback to whatever fits on screen
      return lastOnScreen;
    }
    if (isFullyOnScreen(current.rect, viewport, scroll)) {
      lastOnScreen = current;
    }
  }
  return lastOnScreen;
}

function start (highlightRect) {
  return {
    bottom: {
      top: highlightRect.top + highlightRect.height + highlightBorderWidth,
      left: highlightRect.left - (labelSize / 2),
      width: labelSize,
      height: labelSize * 1.5,
    },
    right: {
      top: highlightRect.top + highlightRect.height - (labelSize / 2),
      left: highlightRect.left + highlightRect.width + highlightBorderWidth,
      width: labelSize * 1.5,
      height: labelSize,
    },
    top: {
      top: highlightRect.top - labelSize * 1.5 - highlightBorderWidth,
      left: highlightRect.left + highlightRect.width - (labelSize / 2),
      width: labelSize,
      height: labelSize * 1.5,
    },
    left: {
      top: highlightRect.top - (labelSize / 2),
      left: highlightRect.left - labelSize * 1.5 - highlightBorderWidth,
      width: labelSize * 1.5,
      height: labelSize,
    },
  };
}

function intersectsPreviousLabels (labelRect, previousLabelRects) {
  return previousLabelRects.reduce((doesIntersect, previousLabelRect) => {
    return doesIntersect || intersect(labelRect, previousLabelRect) ? true : false;
  }, false);
}

function next ({ side, rect }, highlightRect) {
  rect = nextRect(highlightRect)[sides[side]](rect);
  if (overLimit(highlightRect)[sides[side]](rect)) {
    side = side + 1;
    if (sides[side] === 'end') return false;
    rect = nextRect(highlightRect)[sides[side]](start(highlightRect)[sides[side]]);
  }
  return { side, rect };
}

const variance = 5;
function nextRect (highlightRect) {
  return {
    bottom: (labelRect) => Object.assign(labelRect, {
      top: highlightRect.top + highlightRect.height + highlightBorderWidth,
      left: labelRect.left + variance,
    }),
    right: (labelRect) => Object.assign(labelRect, {
      top: labelRect.top - variance,
      left: highlightRect.left + highlightRect.width + highlightBorderWidth,
    }),
    top: (labelRect) => Object.assign(labelRect, {
      top: highlightRect.top - labelSize * 1.5 - highlightBorderWidth,
      left: labelRect.left - variance,
    }),
    left: (labelRect) => Object.assign(labelRect, {
      top: labelRect.top + variance,
      left: highlightRect.left - labelSize * 1.5 - highlightBorderWidth,
    }),
    end: (labelRect) => labelRect,
  };
}

function overLimit (highlightRect) {
  return {
    bottom: (labelRect) => labelRect.left > highlightRect.left + highlightRect.width,
    right: (labelRect) => labelRect.top < highlightRect.top,
    top: (labelRect) => labelRect.left < highlightRect.left,
    left: (labelRect) => labelRect.top > highlightRect.top + highlightRect.height,
  };
}

function labelText (text) {
  const el = document.createElement('div');
  el.className = 'text';
  el.textContent = text;
  return el;
}
