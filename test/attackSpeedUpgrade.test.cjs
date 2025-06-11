const { expect } = require('chai');

describe('⚙️ autoAttackSpeed Upgrade', () => {
  function setup() {
    const stats = { attackSpeed: 5000 };
    const upgrades = {
      autoAttackSpeed: {
        level: 0,
        baseValue: 5000,
        costFormula: level => Math.floor(300 * level ** 2),
        effect: player => {
          const lvl = upgrades.autoAttackSpeed.level;
          const base = upgrades.autoAttackSpeed.baseValue;
          const fast = 500 * Math.min(lvl, 4);
          const slow = 250 * Math.max(lvl - 4, 0);
          player.attackSpeed = Math.max(2000, base - fast - slow);
        }
      }
    };
    const purchase = () => {
      upgrades.autoAttackSpeed.level += 1;
      upgrades.autoAttackSpeed.effect(stats);
    };
    return { stats, upgrades, purchase };
  }

  it('reduces attack interval with each purchase', () => {
    const { stats, purchase } = setup();
    const expected = [
      4500,
      4000,
      3500,
      3000,
      2750,
      2500,
      2250,
      2000,
      2000
    ];
    expected.forEach(val => {
      purchase();
      expect(stats.attackSpeed).to.equal(val);
    });
  });
});
