export function partial (func, ...partialArgs) {
  return (...restArgs) => func(...partialArgs.concat(restArgs));
}

export function withModifier (e) {
  return e.shiftKey || e.altKey || e.ctrlKey || e.metaKey;
}
