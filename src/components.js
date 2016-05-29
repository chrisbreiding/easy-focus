import { highlightColor, highlightBorderWidth } from './constants';
import {
  getNodeRect,
  getScrollOffset,
  getViewportDimensions,
  getWindowHeight,
  intersect,
  isFullyOnScreen,
} from './dom';
import { withPrefix } from './util';

export function container (focusables) {
  const el = document.createElement('div');
  el.id = withPrefix('container');
  el.className = withPrefix('container');
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
    const rect = getNodeRect(focusable.node);

    return `<rect
      x="${rect.left}"
      y="${rect.top}"
      width="${rect.width}"
      height="${rect.height}"
      fill="black"
    />`;
  }).join('');

  const width = getViewportDimensions().width;
  const height = getWindowHeight();
  const el = document.createElement('div');
  el.className = withPrefix('background');
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
  const highlights = Object.keys(focusables)
    .map((key) => focusables[key])
    .reverse()
  const highlightsFragment = highlights.reduce(reduceHighlightsFragment, document.createDocumentFragment());
  const labels = highlights.reduce(reduceLabelsFragment, {
    previousLabelRects: [],
    fragment: document.createDocumentFragment(),
  });

  const containerEl = document.createElement('div');
  containerEl.className = withPrefix('highlights');
  containerEl.appendChild(highlightsFragment);
  containerEl.appendChild(labels.fragment);
  return containerEl;
}

export function reduceHighlightsFragment (fragment, focusable) {
  fragment.appendChild(highlight(focusable.node));
  return fragment;
}

function highlight (node) {
  const el = document.createElement('div');
  el.className = withPrefix('highlight');
  const rect = getNodeRect(node);

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

export function reduceLabelsFragment ({ previousLabelRects, fragment }, focusable) {
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
  el.className = withPrefix('label');
  const { rect, side } = labelRect(node, previousLabelRects);

  Object.assign(el.style, {
    position: 'absolute',
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  });
  el.appendChild(labelText(identifier.letter, side));
  el.appendChild(labelArrow(side));
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
    bottom: (labelRect) => ({
      top: highlightRect.top + highlightRect.height + highlightBorderWidth,
      left: labelRect.left + variance,
      width: labelSize,
      height: labelSize * 1.5,
    }),
    right: (labelRect) => ({
      top: labelRect.top - variance,
      left: highlightRect.left + highlightRect.width + highlightBorderWidth,
      width: labelSize * 1.5,
      height: labelSize,
    }),
    top: (labelRect) => ({
      top: highlightRect.top - labelSize * 1.5 - highlightBorderWidth,
      left: labelRect.left - variance,
      width: labelSize,
      height: labelSize * 1.5,
    }),
    left: (labelRect) => ({
      top: labelRect.top + variance,
      left: highlightRect.left - labelSize * 1.5 - highlightBorderWidth,
      width: labelSize * 1.5,
      height: labelSize,
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

const textStyles = {
  bottom: {
    borderRadius: '0 0 3px 3px',
    bottom: 0,
  },
  right: {
    borderRadius: '0 3px 3px 0',
    right: 0,
  },
  top: {
    borderRadius: '3px 3px 0 0',
    top: 0,
  },
  left: {
    borderRadius: '3px 0 0 3px',
    left: 0,
  },
};

function labelText (text, side) {
  const el = document.createElement('div');
  el.innerText = text;
  Object.assign(el.style, textStyles[sides[side]], {
    backgroundColor: highlightColor,
    boxShadow: '0 0 5px rgba(0, 0, 0, 0.8)',
    boxSizing: 'content-box',
    color: '#333',
    fontFamily: 'monospace',
    width: `${labelSize}px`,
    height: `${labelSize}px`,
    position: 'absolute',
    lineHeight: `${labelSize}px`,
    textAlign: 'center',
    textTransform: 'uppercase',
  });
  return el;
}

const arrowStyles = {
  bottom: {
    borderLeft: `solid ${labelSize / 2}px transparent`,
    borderRight: `solid ${labelSize / 2}px transparent`,
    borderBottom: `solid ${labelSize / 2}px ${highlightColor}`,
    top: 0,
    left: 0,
  },
  right: {
    borderTop: `solid ${labelSize / 2}px transparent`,
    borderBottom: `solid ${labelSize / 2}px transparent`,
    borderRight: `solid ${labelSize / 2}px ${highlightColor}`,
    top: 0,
    left: 0,
  },
  top: {
    borderLeft: `solid ${labelSize / 2}px transparent`,
    borderRight: `solid ${labelSize / 2}px transparent`,
    borderTop: `solid ${labelSize / 2}px ${highlightColor}`,
    bottom: 0,
    left: 0,
  },
  left: {
    borderTop: `solid ${labelSize / 2}px transparent`,
    borderBottom: `solid ${labelSize / 2}px transparent`,
    borderLeft: `solid ${labelSize / 2}px ${highlightColor}`,
    top: 0,
    right: 0,
  },
};

function labelArrow (side) {
  const el = document.createElement('div');
  el.className = withPrefix('arrow');
  Object.assign(el.style, arrowStyles[sides[side]], {
    position: 'absolute',
    width: 0,
    height: 0,
  });
  return el;
}
