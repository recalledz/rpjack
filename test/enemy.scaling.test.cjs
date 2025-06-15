const { expect } = require('chai');
let calculateEnemyHp;
let calculateEnemyBasicDamage;
before(async () => {
  const mod = await import('../enemySpawning.js');
  calculateEnemyHp = mod.calculateEnemyHp;
  calculateEnemyBasicDamage = mod.calculateEnemyBasicDamage;
});

describe('🧮 Enemy Scaling Functions', () => {
  describe('calculateEnemyHp', () => {
    const cases = [
      { stage: 1, world: 1, hp: 11 },
      { stage: 1, world: 2, hp: 153 },
      { stage: 5, world: 1, hp: 88 },
      { stage: 5, world: 2, hp: 294 },
      { stage: 10, world: 1, hp: 251 },
      { stage: 10, world: 2, hp: 539 },
      { stage: 15, world: 1, hp: 491 },
      { stage: 15, world: 2, hp: 862 }
    ];

    cases.forEach(({ stage, world, hp }) => {
      it(`stage ${stage} world ${world} => ${hp} HP`, () => {
        expect(calculateEnemyHp(stage, world)).to.equal(hp);
      });
    });
  });

  describe('calculateEnemyBasicDamage', () => {
    const cases = [
      { stage: 1, world: 1, min: 1, max: 1 },
      { stage: 1, world: 2, min: 3, max: 4 },
      { stage: 5, world: 1, min: 3, max: 5 },
      { stage: 5, world: 2, min: 11, max: 20 },
      { stage: 10, world: 1, min: 11, max: 20 },
      { stage: 10, world: 2, min: 41, max: 80 },
      { stage: 15, world: 1, min: 12, max: 22 },
      { stage: 15, world: 2, min: 45, max: 88 }
    ];

    cases.forEach(({ stage, world, min, max }) => {
      it(`stage ${stage} world ${world} => damage ${min}-${max}`, () => {
        const result = calculateEnemyBasicDamage(stage, world);
        expect(result).to.deep.equal({ minDamage: min, maxDamage: max });
      });
    });
  });
});
