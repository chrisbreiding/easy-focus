import { getNodeRect, getViewportDimensions, getWindowHeight } from '../dom';

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
  el.className = 'background';
  el.innerHTML = (
    `<svg width="${width}" height="${height}">
      <defs>
        <mask id="mask" x="0" y="0">
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          ${masks}
        </mask>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill="rgba(0, 0, 0, 0.6)" mask="url(#mask)" />
    </svg>`
  );
  return el;
}

export default background
