export function partial (func, ...partialArgs) {
  return (...restArgs) => func(...partialArgs.concat(restArgs));
}

export function withModifier (e) {
  return e.shiftKey || e.altKey || e.ctrlKey || e.metaKey;
}

const letters = 'abcdefghijklmnopqrstuvwxyz';
const whichStart = 65;
const identifiers = letters.split('').map((letter, index) => ({
  letter,
  code: whichStart + index,
}));

export function noncollidingIdentifiers (commands) {
  // don't use any letters as labels that are in a command
  // or they'll cause issues when they trigger keyup
  const collidingCommandLetters = commands
    .map((command) => command.shortcut.toLowerCase())
    .map((shortcut) => shortcut.split('+'))
    .reduce((keys, chars) => keys.concat(chars), [])
    .filter((key) => key.length === 1 && letters.indexOf(key) > -1);

  return identifiers.filter(function (identifier) {
    return collidingCommandLetters.indexOf(identifier.letter) === -1;
  });
}
