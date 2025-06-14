import generateDeck from './card.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { saveCSV } = require('./utils/logger.cjs');

export function simulateDeckSurvival({
  globalDamageLevel = 0,
  baseCardHpLevel = 0,
  maxTicks = 1000,
  enemyDamage = 7,
  playerDamage = 2,
  enemyHp = 30,
  spawnDelay = 2
} = {}) {
  const deck = generateDeck();
  deck.forEach(card => {
    card.baseHpBoost = (card.baseHpBoost || 0) + baseCardHpLevel;
    card.maxHp = Math.round(card.maxHp + baseCardHpLevel);
    card.currentHp = card.maxHp;
  });

  let ticks = 0;
  let delay = 0;
  let eHp = enemyHp;
  const dmgMulti = 1 + 0.1 * globalDamageLevel;

  while (ticks < maxTicks && deck.some(c => c.currentHp > 0)) {
    ticks++;
    if (delay > 0) {
      delay--;
      continue;
    }

    // Player attacks first
    eHp -= playerDamage * dmgMulti;
    if (eHp <= 0) {
      delay = spawnDelay;
      eHp = enemyHp;
      // heal surviving cards by 1 on kill
      deck.forEach(c => {
        if (c.currentHp > 0) {
          c.currentHp = Math.round(Math.min(c.maxHp, c.currentHp + 1));
        }
      });
      continue;
    }

    // Enemy damages the first alive card
    const target = deck.find(c => c.currentHp > 0);
    if (target) target.takeDamage(enemyDamage);
  }

  return ticks;
}

export function runSurvivalMatrix({
  globalDamageLevels = [0, 2, 4, 6, 8],
  baseCardHpLevels = [0, 3],
  ...params
} = {}) {
  const results = [];
  globalDamageLevels.forEach(g => {
    baseCardHpLevels.forEach(h => {
      const ticks = simulateDeckSurvival({
        globalDamageLevel: g,
        baseCardHpLevel: h,
        ...params
      });
      results.push({ globalDamageLevel: g, baseCardHpLevel: h, ticks });
    });
  });
  saveCSV(results, 'survival-summary.csv');
  return results;
}
