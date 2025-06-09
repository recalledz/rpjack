import { expect } from 'chai';
import generateDeck, { shuffleArray } from '../card.js';

describe('generateDeck', () => {
  it('returns 52 cards', () => {
    const deck = generateDeck();
    expect(deck).to.have.lengthOf(52);
  });

  it('cards have unique ids', () => {
    const deck = generateDeck();
    const ids = new Set(deck.map(c => c.id));
    expect(ids.size).to.equal(52);
  });
});

describe('shuffleArray', () => {
  it('shuffles array in place', () => {
    const arr = [1, 2, 3, 4, 5];
    shuffleArray(arr);
    expect(arr).to.have.lengthOf(5);
    expect(new Set(arr).size).to.equal(5);
  });
});
