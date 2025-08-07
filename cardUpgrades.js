export const cardUpgradeDefinitions = {
  healOnRedraw: {
    id: 'healOnRedraw',
    name: 'Heal on Redraw +1',
    rarity: 'common',
    icon: 'heart',
    flavor: 'Breathers mend old wounds.',
    effect: ({ stats }) => {
      stats.healOnRedraw = (stats.healOnRedraw || 0) + 1;
    }
  },
  hpPerKill: {
    id: 'hpPerKill',
    name: 'HP per Kill +1',
    rarity: 'common',
    icon: 'heart',
    flavor: 'Every victory makes us tougher.',
    effect: ({ stats, pDeck }) => {
      stats.hpPerKill += 1;
      pDeck.forEach(c => (c.hpPerKill = stats.hpPerKill));
    }
  },
  attackSpeedReduction: {
    id: 'attackSpeedReduction',
    name: 'Attack Speed Reduction',
    rarity: 'uncommon',
    icon: 'timer',
    flavor: 'Find rhythm between blows.',
    effect: ({ stats }) => {
      stats.attackSpeed = Math.max(1000, stats.attackSpeed - 100);
    }
  },
  extraCardSlot: {
    id: 'extraCardSlot',
    name: 'Extra Card Slot',
    rarity: 'super-rare',
    icon: 'plus-square',
    flavor: 'More room for allies.',
    effect: ({ stats }) => {
      stats.cardSlots += 1;
    }
  },
  hpMultiplier: {
    id: 'hpMultiplier',
    name: 'HP Multiplier x1.1',
    rarity: 'common',
    icon: 'shield',
    flavor: 'Sturdier foundations, tougher survivors.',
    effect: ({ stats, updateAllCardHp }) => {
      stats.hpMultiplier = (stats.hpMultiplier || 1) * 1.1;
      if (typeof updateAllCardHp === 'function') updateAllCardHp();
    }
  },
  damageMultiplier: {
    id: 'damageMultiplier',
    name: 'Damage Multiplier x1.1',
    rarity: 'common',
    icon: 'sword',
    flavor: 'A sharper cut for sharper foes.',
    effect: ({ stats }) => {
      stats.extraDamageMultiplier = (stats.extraDamageMultiplier || 1) * 1.1;
    }
  },
  cashOutNoRedraw: {
    id: 'cashOutNoRedraw',
    name: 'Cash Out w/out Redraw',
    rarity: 'rare',
    icon: 'dollar-sign',
    flavor: 'Take the winnings and run.',
    effect: ({ stats }) => {
      stats.cashOutWithoutRedraw = true;
    }
  },
  spadeDamage15: {
    id: 'spadeDamage15',
    name: 'Spade Damage x1.5',
    rarity: 'uncommon',
    icon: 'swords',
    flavor: 'Spades pierce even deeper.',
    effect: ({ stats }) => {
      stats.spadeDamageMultiplier = (stats.spadeDamageMultiplier || 1) * 1.5;
    }
  },
  // Prestige unlocked upgrades
  maxMana: {
    id: 'maxMana',
    name: 'Max Mana +10',
    rarity: 'uncommon',
    prestige: true,
    icon: 'droplet',
    flavor: 'Feel the flow surge within.',
    effect: ({ stats }) => {
      stats.maxMana += 10;
    }
  },
  manaRegen: {
    id: 'manaRegen',
    name: 'Mana Regeneration +0.1',
    rarity: 'uncommon',
    prestige: true,
    icon: 'refresh-ccw',
    flavor: 'Energy returns in steady waves.',
    effect: ({ stats }) => {
      stats.manaRegen += 0.1;
    }
  },
  abilityPower: {
    id: 'abilityPower',
    name: 'Ability Power +5%',
    rarity: 'rare',
    prestige: true,
    icon: 'zap',
    flavor: 'Techniques hit with added force.',
    effect: ({ stats }) => {
      stats.abilityPower = (stats.abilityPower || 1) + 0.05;
    }
  },
  spadeDamageMultiplier: {
    id: 'spadeDamageMultiplier',
    name: 'Spade Damage Multiplier +5%',
    rarity: 'rare',
    prestige: true,
    icon: 'swords',
    flavor: 'Spades strike with renewed power.',
    effect: ({ stats }) => {
      stats.spadeDamageMultiplier = (stats.spadeDamageMultiplier || 1) + 0.05;
    }
  },
  clubsPlaceholder: {
    id: 'clubsPlaceholder',
    name: 'Clubs Placeholder',
    rarity: 'uncommon',
    prestige: true,
    icon: 'club',
    flavor: 'Untapped potential.',
    effect: () => {}
  }
};

export const upgrades = {
  // Unlocked from start
  globalDamage: {
    name: 'Global Damage Multiplier',
    level: 0,
    baseValue: 1.0,
    unlocked: true,
    costFormula: level => 100 * level ** 1.2,
    effect: ({ stats }) => {
      stats.upgradeDamageMultiplier =
        upgrades.globalDamage.baseValue + 0.15 * upgrades.globalDamage.level;
    }
  },
  cardHpPerKill: {
    name: 'Card HP per Kill',
    level: 0,
    baseValue: 1,
    unlocked: true,
    costFormula: level => 150 * level ** 2,
    effect: ({ stats, pDeck }) => {
      stats.hpPerKill =
        upgrades.cardHpPerKill.baseValue + upgrades.cardHpPerKill.level;
      if (pDeck) pDeck.forEach(card => (card.hpPerKill = stats.hpPerKill));
    }
  },
  baseCardHp: {
    name: 'Base Card HP Boost',
    level: 0,
    baseValue: 0,
    unlocked: true,
    costFormula: level => 100 * level ** 1.2,
    effect: ({ stats, pDeck }) => {
      const prev = stats.baseCardHpBoost || 0;
      const newBoost = 3 * upgrades.baseCardHp.level;
      const diff = newBoost - prev;
      stats.baseCardHpBoost = newBoost;
      if (pDeck) {
        pDeck.forEach(card => {
          card.baseHpBoost = (card.baseHpBoost || 0) + diff;
          card.maxHp = Math.round(card.maxHp + diff);
          card.currentHp = Math.round(card.currentHp + diff);
        });
      }
    }
  },

  // Locked at start
  autoAttackSpeed: {
    name: 'Auto-Attack Speed',
    level: 0,
    baseValue: 10000,
    unlocked: false,
    unlockCondition: ({ stageData }) => stageData.stage >= 10,
    costFormula: level => Math.floor(300 * level ** 2),
    effect: ({ stats }) => {
      const lvl = upgrades.autoAttackSpeed.level;
      const base = upgrades.autoAttackSpeed.baseValue;
      const fastReduction = 500 * Math.min(lvl, 4);
      const diminishing = 250 * Math.max(lvl - 4, 0);
      stats.attackSpeed = Math.max(2000, base - fastReduction - diminishing);
    }
  },
  /* maxMana and manaRegen upgrades were previously implemented as card
     upgrades. Removing duplicates to avoid conflicting behavior. */
  abilityCooldownReduction: {
    name: 'Ability Cooldown Reduction',
    level: 0,
    baseValue: 0,
    unlocked: false,
    unlockCondition: ({ stageData }) => stageData.stage >= 10,
    costFormula: level => 200 * level ** 2,
    effect: ({ stats }) => {
      stats.abilityCooldownReduction = upgrades.abilityCooldownReduction.level * 0.05;
    }
  },
  jokerCooldownReduction: {
    name: 'Joker Cooldown Reduction',
    level: 0,
    baseValue: 0,
    unlocked: false,
    unlockCondition: ({ stageData }) => stageData.stage >= 12,
    costFormula: level => 200 * level ** 2,
    effect: ({ stats }) => {
      stats.jokerCooldownReduction = upgrades.jokerCooldownReduction.level * 0.05;
    }
  }
};

const rarityCostMultiplier = {
  common: 1,
  uncommon: 1.5,
  rare: 2,
  'super-rare': 3
};

const rarityWeights = {
  common: 60,
  uncommon: 25,
  rare: 10,
  'super-rare': 5
};

export const unlockedCardUpgrades = [
  'healOnRedraw',
  'hpPerKill',
  'attackSpeedReduction',
  'extraCardSlot',
  'damageMultiplier',
  'hpMultiplier',
  'spadeDamage15',
  'cashOutNoRedraw'
];

export const upgradeLevels = {};

let activeCardUpgrades = [];

export function resetCardUpgrades() {
  Object.keys(upgradeLevels).forEach(k => delete upgradeLevels[k]);
  activeCardUpgrades.length = 0;
}

export function removeActiveUpgrade(id) {
  activeCardUpgrades = activeCardUpgrades.filter(a => a !== id);
}

export function unlockCardUpgrade(id) {
  if (!unlockedCardUpgrades.includes(id)) {
    unlockedCardUpgrades.push(id);
  }
}

function rarityClass(rarity) {
  switch (rarity) {
    case 'common':
      return 'basic';
    case 'uncommon':
      return 'rare';
    case 'rare':
      return 'epic';
    case 'super-rare':
      return 'legendary';
    default:
      return 'basic';
  }
}

function weightedRandomId(pool = unlockedCardUpgrades) {
  const weighted = [];
  pool.forEach(id => {
    const def = cardUpgradeDefinitions[id];
    if (!def) return;
    const weight = rarityWeights[def.rarity] || 1;
    for (let i = 0; i < weight; i++) weighted.push(id);
  });
  if (!weighted.length) return null;
  return weighted[Math.floor(Math.random() * weighted.length)];
}

export function rollNewCardUpgrades(count = 2, allowedIds = []) {
  const pool = allowedIds.length
    ? unlockedCardUpgrades.filter(id => allowedIds.includes(id))
    : unlockedCardUpgrades;
  const chosen = new Set();
  while (chosen.size < count && pool.length > 0) {
    const id = weightedRandomId(pool);
    if (id) chosen.add(id);
  }
  activeCardUpgrades = Array.from(chosen);
  return activeCardUpgrades;
}

export function createUpgradeCard(id) {
  return { upgradeId: id };
}

export function getCardUpgradeCost(id, stats = {}, stageData = {}) {
  const def = cardUpgradeDefinitions[id];
  if (!def) return 0;
  const rarityMult = rarityCostMultiplier[def.rarity] || 1;
  const stage = stageData.stage || 1;
  const world = stageData.world || 1;
  const base = 100 * stage * world;
  return Math.floor(base * rarityMult);
}

export function addActiveUpgradeCardsToDeck(deck) {
  activeCardUpgrades.forEach(id => {
    deck.push(createUpgradeCard(id));
  });
}

export function applyCardUpgrade(id, context) {
  const def = cardUpgradeDefinitions[id];
  if (!def) return;
  if (!def.noLevel) {
    if (!upgradeLevels[id]) upgradeLevels[id] = 0;
    upgradeLevels[id] += 1;
  }
  def.effect(context);
}

export function renderCardUpgrades(container, options = {}) {
  if (!container) return;
  const { stats = {}, stageData = {}, cash = 0, onPurchase = null } = options;
  container.innerHTML = '';
  const ids = new Set([...activeCardUpgrades, ...Object.keys(upgradeLevels)]);
  const idArr = Array.from(ids);
  const affordable = idArr.some(id => getCardUpgradeCost(id, stats, stageData) <= cash);
  const freeIndex = affordable ? -1 : 0;
  idArr.forEach((id, idx) => {
    const def = cardUpgradeDefinitions[id];
    const level = upgradeLevels[id] || 0;
    const baseCost = getCardUpgradeCost(id, stats, stageData);
    const cost = idx === freeIndex ? 0 : baseCost;
    const wrapper = document.createElement('div');
    wrapper.classList.add('card-wrapper');
    wrapper.dataset.id = id;
    const card = document.createElement('div');
    card.classList.add('card', 'upgrade-card', `rarity-${rarityClass(def.rarity)}`);
    card.innerHTML = `
      <div class="card-suit"><i data-lucide="sword"></i></div>
      <div class="card-desc">${def.name} (Lv. ${level})</div>
    `;
    wrapper.appendChild(card);
    const btn = document.createElement('button');
    btn.textContent = cost === 0 ? 'Free' : `Buy $${cost}`;
    btn.disabled = cash < cost || !onPurchase;
    btn.addEventListener('click', () => {
      if (!onPurchase) return;
      wrapper.classList.add('purchasing');
      setTimeout(() => onPurchase(id, cost), 300);
    });
    wrapper.appendChild(btn);
    container.appendChild(wrapper);
  });
}

export function getActiveCardUpgrades() {
  return activeCardUpgrades;
}
