const allLetters = 'abcdefghijklmnopqrstuvwxyz';
const actionsMap = {
  k: 'up',
  j: 'down',
};

export const whichStart = 65;
export const whichEnd = whichStart + allLetters.length - 1;
// match up letters to their key event .which property
const allIdentifiers = allLetters.split('').map((letter, index) => ({
  letter,
  which: whichStart + index,
}));
const reserved = Object.keys(actionsMap).join('');

export const letters = allLetters.replace(new RegExp(`[${reserved}]`, 'g'), '');

export const actions = allIdentifiers.filter((identifier) => {
  return reserved.indexOf(identifier.letter) > -1;
}).reduce((actions, identifier) => {
  return Object.assign(actions, {
    [identifier.which]: actionsMap[identifier.letter],
  });
}, {});

export const identifiers = allIdentifiers.filter((identifier) => {
  return reserved.indexOf(identifier.letter) === -1;
});

export function noncollidingIdentifiers (commands) {
  // don't use any letters as labels that are in a command
  // or they'll cause issues when they trigger keyup
  const colliding = commands
    .map((command) => command.shortcut.toLowerCase())
    .map((shortcut) => shortcut.split('+'))
    .reduce((keys, chars) => keys.concat(chars), [])
    .filter((key) => key.length === 1 && letters.indexOf(key) > -1);

  return identifiers.filter(function (identifier) {
    return colliding.indexOf(identifier.letter) === -1;
  });
}
