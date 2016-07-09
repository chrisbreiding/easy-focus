const allLetters = 'abcdefghijklmnopqrstuvwxyz';
const actionsMap = {
  k: 'up',
  j: 'down',
};

const whichStart = 65;
const whichEnd = whichStart + allLetters.length - 1;
// match up letters to their key event .which property
const allIdentifiers = allLetters.split('').map((letter, index) => ({
  letter,
  which: whichStart + index,
}));
const reserved = Object.keys(actionsMap).join('');

const letters = allLetters.replace(new RegExp(`[${reserved}]`, 'g'), '');

const actions = allIdentifiers.filter((identifier) => {
  return reserved.indexOf(identifier.letter) > -1;
}).reduce((actions, identifier) => {
  return Object.assign(actions, {
    [identifier.which]: actionsMap[identifier.letter],
  });
}, {});

const identifiers = allIdentifiers.filter((identifier) => {
  return reserved.indexOf(identifier.letter) === -1;
});

function noncollidingIdentifiers (commands) {
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

export {
  whichStart,
  whichEnd,
  letters,
  actions,
  identifiers,
  noncollidingIdentifiers,
}
