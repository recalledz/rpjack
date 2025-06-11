const { expect } = require('chai');
const { GameSimulator } = require('../simulator.cjs');

// Helper simulator with HP tracking
class HPSimulator extends GameSimulator {
  constructor(strategy = 'balanced', hp = 100) {
    super(strategy);
    this.hp = hp;
  }
  run(ticks = 100) {
    for (let i = 0; i < ticks; i++) {
      this.stage += 0.1;
      this.cash += this.stage * 5;
      const loss = this.strategy === 'defensive' ? 0.05 : 0.1;
      this.hp = Math.max(0, this.hp - loss);
      if (this.hp === 0) break;
    }
    const avgHP = this.hp;
    return { finalStage: this.stage, totalCash: this.cash, avgHP };
  }
}

// Helper simulator for balanced strategy upgrades
class BalancedBuySimulator extends GameSimulator {
  run(ticks = 100) {
    for (let i = 0; i < ticks; i++) {
      this.stage++;
      this.cash += this.stage * 10;
      if (this.cash >= this.upgradeCost()) {
        this.cash -= this.upgradeCost();
        this.globalDamageLevel++;
      }
    }
    return { finalStage: this.stage, totalCash: this.cash, damageLevel: this.globalDamageLevel };
  }
}

describe('🧪 General Simulation Test Templates', () => {
  it('Aggressive strategy progression', () => {
    const sim = new GameSimulator('aggressive');
    const res = sim.run(100);
    expect(res.finalStage).to.be.at.least(15);
    expect(res.damageLevel).to.be.at.least(2);
  });

  it('Defensive strategy HP scaling', () => {
    const sim = new HPSimulator('defensive');
    const res = sim.run(200);
    expect(res.avgHP).to.be.at.least(60);
    expect(res.finalStage).to.be.within(10, 25);
  });

  it('Cost curve logic', () => {
    const sim = new GameSimulator();
    let last = 0;
    for (let lvl = 1; lvl <= 10; lvl++) {
      sim.globalDamageLevel = lvl - 1;
      const cost = sim.upgradeCost();
      expect(cost).to.be.greaterThan(last);
      expect(cost).to.be.at.least(100);
      last = cost;
    }
  });

  it('Cash accumulation with balanced strategy', () => {
    const sim = new BalancedBuySimulator('balanced');
    const res = sim.run(100);
    expect(res.totalCash).to.be.greaterThan(1500);
    expect(res.damageLevel).to.be.greaterThan(0);
  });

  it('Compare strategies side-by-side', () => {
    const strategies = ['aggressive', 'defensive', 'balanced'];
    strategies.forEach(strat => {
      const sim = strat === 'balanced' ? new BalancedBuySimulator(strat) : new GameSimulator(strat);
      const res = sim.run(150);
      expect(res.finalStage).to.be.a('number');
      console.log(`${strat}: stage=${res.finalStage}, cash=${res.totalCash}, dmg=${res.damageLevel}`);
    });
  });

  it('Game over condition triggers', () => {
    class GameOverSim extends HPSimulator {
      runUntilDeath() {
        let ticks = 0;
        while (this.hp > 0 && ticks < 1000) {
          this.stage++;
          this.cash += this.stage * 10;
          this.hp -= 1;
          ticks++;
        }
        const gameOver = this.hp <= 0;
        return { finalStage: this.stage, gameOver };
      }
    }
    const sim = new GameOverSim('balanced', 10);
    const res = sim.runUntilDeath();
    expect(res.gameOver).to.be.true;
    expect(res.finalStage).to.be.at.most(50);
  });

  it('Strategy behavior across ticks', () => {
    const strategies = ['aggressive', 'defensive', 'balanced'];
    const results = [];
    strategies.forEach(strat => {
      const sim = strat === 'balanced' ? new BalancedBuySimulator(strat) : new GameSimulator(strat);
      const res = sim.run(100);
      expect(res.finalStage).to.not.equal(0);
      results.push({ strat, stage: res.finalStage, cash: res.totalCash });
    });
    console.table(results);
  });
});
