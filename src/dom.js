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

export function intersectsScreen (nodeRect, viewport, scroll) {
  return intersect(nodeRect, {
    left: scroll.left,
    top: scroll.top,
    width: viewport.width,
    height: viewport.height,
  });
}

export function isFullyOnScreen (nodeRect, viewport, scroll) {
  return (
    nodeRect.left > scroll.left &&
    nodeRect.left + nodeRect.width < viewport.width + scroll.left &&
    nodeRect.top > scroll.top &&
    nodeRect.top + nodeRect.height < viewport.height + scroll.top
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

export function removeNode (node) {
  if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
}

export function intersect (rectA, rectB) {
  return !(rectB.left > rectA.left + rectA.width ||
           rectB.left + rectB.width < rectA.left ||
           rectB.top > rectA.top + rectA.height ||
           rectB.top + rectB.height < rectA.top);
}
