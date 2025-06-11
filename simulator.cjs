// simulator.cjs
class GameSimulator {
  constructor(strategy = "balanced") {
    this.stage = 1;
    this.cash = 0;
    this.globalDamageLevel = 0;
    this.strategy = strategy;
    // track upgrade unlocks
    this.upgrades = {
      cardSlots: { unlocked: false, unlockStage: 5 }
    };

    // analytics placeholders for future expansion
    this.tracking = {
      jokerActivations: 0,
      manaSpent: 0,
      abilityUsage: {},
      cooldownUsage: {},
      traitInteractions: {}
    };
  }

  checkUpgradeUnlocks() {
    Object.values(this.upgrades).forEach(up => {
      if (!up.unlocked && this.stage >= up.unlockStage) {
        up.unlocked = true;
      }
    });
  }

  run(ticks = 100) {
    for (let i = 0; i < ticks; i++) {
      this.stage++;
      this.cash += this.stage * 10;

      if (this.strategy === "aggressive" && this.cash >= this.upgradeCost()) {
        this.cash -= this.upgradeCost();
        this.globalDamageLevel++;
      }

      this.checkUpgradeUnlocks();
    }

    return {
      finalStage: this.stage,
      totalCash: this.cash,
      damageLevel: this.globalDamageLevel,
      unlockedUpgrades: Object.fromEntries(
        Object.entries(this.upgrades).map(([k, v]) => [k, v.unlocked])
      ),
      tracking: this.tracking
    };
  }

  upgradeCost() {
    return 200 * (this.globalDamageLevel + 1) ** 2;
  }
}

module.exports = { GameSimulator };

