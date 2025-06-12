const { expect } = require('chai');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

// Extract the functions from script.js without executing the entire file
const script = fs.readFileSync(path.resolve(__dirname, '../script.js'), 'utf8');
const hpCode = script.match(/function calculateEnemyHp\([\s\S]*?\n\}/)[0];
const dmgCode = script.match(/function calculateEnemyBasicDamage\([\s\S]*?\n\}/)[0];
const context = {};
vm.createContext(context);
vm.runInContext(`${hpCode}\n${dmgCode}`, context);
const { calculateEnemyHp, calculateEnemyBasicDamage } = context;

describe('🧮 Enemy Scaling Functions', () => {
  describe('calculateEnemyHp', () => {
    const cases = [
      { stage: 1, world: 1, hp: 11 },
      { stage: 1, world: 2, hp: 111 },
      { stage: 5, world: 1, hp: 33 },
      { stage: 5, world: 2, hp: 257 },
      { stage: 10, world: 1, hp: 63 },
      { stage: 10, world: 2, hp: 379 },
      { stage: 15, world: 1, hp: 96 },
      { stage: 15, world: 2, hp: 484 }
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
