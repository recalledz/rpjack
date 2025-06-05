export const suitSymbols = {
  Hearts: '♥',
  Spades: '♠',
  Diamonds: '♦',
  Clubs: '♣'
};

export const suitColors = {
  Hearts: 'red',
  Diamonds: 'red',
  Spades: 'black',
  Clubs: 'black'
};

export const suits = ['Hearts', 'Spades', 'Diamonds', 'Clubs'];

const names = {
  1: 'Ace',
  11: 'Jack',
  12: 'Queen',
  13: 'King'
};

export class Card {
  constructor(suit, value, backType = 'basic-red') {
    this.suit = suit;
    this.value = value;
    this.name = names[value] || String(value);
    this.symbol = suitSymbols[suit];
    this.color = suitColors[suit];
    this.id = `${value}_of_${suit}`;

    this.backType = backType;

    this.currentLevel = 1;
    this.XpCurrent = 0;
    this.XpReq = 1;

    this.baseDamage = value;
    this.damage = this.baseDamage;
    this.maxHp = value;
    this.currentHp = this.maxHp;

    // Amount of HP this card recovers each time an enemy is killed
    this.hpPerKill = 1;

    this.job = null;
    this.traits = [];
  }

  gainXp(amount) {
    this.XpCurrent += amount;
    let leveled = false;
    while (this.XpCurrent >= this.XpReq) {
      this.XpCurrent -= this.XpReq;
      this.levelUp();
      leveled = true;
    }
    return leveled;
  }

  levelUp() {
    this.currentLevel++;
    this.XpReq += this.currentLevel * 1.7 * (this.value ** 2);
    this.damage = this.baseDamage * this.currentLevel;
    this.maxHp = this.value * this.currentLevel;
    this.currentHp = this.maxHp;
  }

  healFromKill() {
    this.currentHp = Math.min(this.maxHp, this.currentHp + this.hpPerKill);
  }

  upgradeHpPerKill(amount = 1) {
    this.hpPerKill += amount;
  }

  takeDamage(amount) {
    this.currentHp = Math.max(0, this.currentHp - amount);
  }

  isDefeated() {
    return this.currentHp <= 0;
  }
}

export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export function generateDeck() {
  const deck = [];
  for (const suit of suits) {
    for (let value = 1; value <= 13; value++) {
      deck.push(new Card(suit, value));
    }
  }
  shuffleArray(deck);
  return deck;
}

export default generateDeck;
