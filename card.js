let XpReq = 1
let XpCurrent = 0
let startingLevel = 0
let currentLevel = 1


const suitSymbols = {
  Hearts: '♥',
  Spades: '♠',
  Diamonds: '♦',
  Clubs: '♣'
};

const suitColors = {
  Hearts: 'red',
  Diamonds: 'red',
  Spades: 'black',
  Clubs: 'black'
};

function generateDeck() {

  const deck = [];

  for (let suit of suits) {
    for (let value = 1; value <= 13; value++) {
      const card = {
        suit: suit,
        value: value,
        name: names[value] ||
          value.toString(),
        XpReq: XpReq,
        XpCurrent: XpCurrent,
        startingLevel: startingLevel,
        currentLevel: currentLevel,
        symbol: suitSymbols[suit],
        color: suitColors[suit],
        id: `${value}_of_${suit}`,
        maxHp: value,
        currentHp: value,
        baseDamage: value,
        damage: value
      };
      deck.push(card);
    }
    shuffleArray(deck);
  }

  return deck;
}
const suits = ['Hearts', 'Spades', 'Diamonds', 'Clubs'];
const names = {
  1: 'Ace',
  11: 'Jack',
  12: 'Queen',
  13: 'King'
};

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
}


export default generateDeck