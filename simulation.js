// simulator.js
import generateDeck from "./card.js";
import { Enemy } from "./enemy.js"; // assume this works without DOM
import { Boss } from "./boss.js";
import { upgrades as allUpgrades } from "./script.js"; // if needed, or copy upgrade logic

export class GameSimulator {
  constructor(strategy = "balanced") {
    this.stats = {
      pDamage: 5,
      hpPerKill: 1,
      baseCardHpBoost: 0,
      cardSlots: 3,
      attackSpeed: 5000,
      stage: 1,
      cash: 500,
      xp: 0,
    };
    this.deck = generateDeck();
    this.strategy = strategy;
    this.upgrades = structuredClone(allUpgrades); // safe copy
    this.logs = [];
  }

  tick() {
    this.stats.stage += 1;
    this.stats.cash += 100 + 10 * this.stats.stage;
    this.stats.xp += 5;
    this.applyStrategy();
  }

  applyStrategy() {
    const tryBuy = key => {
      const up = this.upgrades[key];
      if (!up || !up.unlocked) return;
      const cost = up.costFormula(up.level + 1);
      if (this.stats.cash >= cost) {
        this.stats.cash -= cost;
        up.level += 1;
        up.effect(this.stats);
        this.logs.push(`Bought ${up.name} to level ${up.level}`);
      }
    };

    if (this.strategy === "aggressive") {
      tryBuy("globalDamage");
    } else if (this.strategy === "defensive") {
      tryBuy("baseCardHp");
    } else {
      tryBuy("cardHpPerKill");
    }
  }

  run(maxTicks = 100) {
    for (let i = 0; i < maxTicks; i++) {
      this.tick();
    }

    this.logs.push(`Final stage: ${this.stats.stage}`);
    this.logs.push(`XP: ${this.stats.xp}`);
    this.logs.push(`Cash left: ${this.stats.cash}`);
    return this.logs;
  }
}
