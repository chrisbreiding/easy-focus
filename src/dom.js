const significanceFactor = 15;

export function isHigherThanLeft (aRect, bRect) {
  return (Math.abs(bRect.left - aRect.left) < significanceFactor) && isHigher(aRect, bRect);
}

export function isFartherLeftThanHigh (aRect, bRect) {
  return (Math.abs(bRect.top - aRect.top) < significanceFactor) && aRect.left < bRect.left;
}

export function isHigher (aRect, bRect) {
  return aRect.top < bRect.top;
}

export function hasDimensions (nodeRect) {
  return !!nodeRect.width && !!nodeRect.height;
}

export function isVisible (node) {
  return window.getComputedStyle(node).visibility !== 'hidden';
}

export function onScreen (nodeRect, viewport, scroll) {
  return (
    nodeRect.left + nodeRect.width > scroll.left &&
    nodeRect.left < viewport.width + scroll.left &&
    nodeRect.top + nodeRect.height > scroll.top &&
    nodeRect.top < viewport.height + scroll.top
  );
}

export function getViewportDimensions () {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export function getScrollOffset () {
  return {
    left: window.scrollX,
    top: window.scrollY,
  };
}

export function getWindowHeight () {
  const body = document.body;
  const html = document.documentElement;

  return Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight,
    html.offsetHeight
  );
}

export function getNodeRect (node) {
  const rect = node.getBoundingClientRect();
  const scroll = getScrollOffset();
  return {
    top: rect.top + scroll.top,
    left: rect.left + scroll.left,
    width: rect.width,
    height: rect.height,
  };
}

export function focusNode (node) {
  node.focus();
  try {
    node.setSelectionRange(node.value.length, node.value.length);
  } catch (e) {
    /* not a text input, this is fine */
  }
}
