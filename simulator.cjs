// simulator.cjs
class GameSimulator {
  constructor(strategy = "balanced") {
    this.stage = 1;
    this.cash = 0;
    this.globalDamageLevel = 0;
    this.strategy = strategy;
  }

  run(ticks = 100) {
    for (let i = 0; i < ticks; i++) {
      this.stage++;
      this.cash += this.stage * 10;

      if (this.strategy === "aggressive" && this.cash >= this.upgradeCost()) {
        this.cash -= this.upgradeCost();
        this.globalDamageLevel++;
      }
    }

    return {
      finalStage: this.stage,
      totalCash: this.cash,
      damageLevel: this.globalDamageLevel
    };
  }

  upgradeCost() {
    return 200 * (this.globalDamageLevel + 1) ** 2;
  }
}

module.exports = { GameSimulator };

