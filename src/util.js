function getStyles ({ highlightBorderWidth, labelSize }) {
  return fetch(chrome.extension.getURL('styles.css')).then(function (result) {
    return result.text();
  }).then(function (content) {
    return `
      <style>
        :host {
          --half-label-size: ${labelSize / 2}px;\n
          --highlight-border-width: ${highlightBorderWidth}px;\n
          --label-size: ${labelSize}px;\n
        }
        ${content}
      </style>
    `;
  }).catch((error) => {
    console.error('failed to load styles:', error); // eslint-disable-line no-console
  });
}

function partial (func, ...partialArgs) {
  return (...restArgs) => func(...partialArgs.concat(restArgs));
}

function withModifier (e) {
  return e.shiftKey || e.altKey || e.ctrlKey || e.metaKey;
}

function withPrefix (base) {
  return `__easy-focus__${base}`;
}

export {
  getStyles,
  partial,
  withModifier,
  withPrefix,
}
