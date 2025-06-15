export const cardUpgradeDefinitions = {
  healOnRedraw: {
    id: 'healOnRedraw',
    name: 'Heal on Redraw +1',
    rarity: 'common',
    effect: ({ stats }) => {
      stats.healOnRedraw = (stats.healOnRedraw || 0) + 1;
    }
  },
  hpPerKill: {
    id: 'hpPerKill',
    name: 'HP per Kill +1',
    rarity: 'common',
    effect: ({ stats, pDeck }) => {
      stats.hpPerKill += 1;
      pDeck.forEach(c => (c.hpPerKill = stats.hpPerKill));
    }
  },
  attackSpeedReduction: {
    id: 'attackSpeedReduction',
    name: 'Attack Speed Reduction',
    rarity: 'uncommon',
    effect: ({ stats }) => {
      stats.attackSpeed = Math.max(1000, stats.attackSpeed - 100);
    }
  },
  redrawCooldownReduction: {
    id: 'redrawCooldownReduction',
    name: 'Redraw Cooldown Reduction',
    rarity: 'rare',
    effect: ({ stats }) => {
      stats.redrawCooldownReduction += 0.1;
    }
  },
  extraCardSlot: {
    id: 'extraCardSlot',
    name: 'Extra Card Slot',
    rarity: 'super-rare',
    effect: ({ stats }) => {
      stats.cardSlots += 1;
    }
  },
  // Prestige unlocked upgrades
  maxMana: {
    id: 'maxMana',
    name: 'Max Mana +10',
    rarity: 'uncommon',
    prestige: true,
    effect: ({ stats }) => {
      stats.maxMana += 10;
    }
  },
  manaRegen: {
    id: 'manaRegen',
    name: 'Mana Regeneration +0.1',
    rarity: 'uncommon',
    prestige: true,
    effect: ({ stats }) => {
      stats.manaRegen += 0.1;
    }
  },
  abilityPower: {
    id: 'abilityPower',
    name: 'Ability Power +5%',
    rarity: 'rare',
    prestige: true,
    effect: ({ stats }) => {
      stats.abilityPower = (stats.abilityPower || 1) + 0.05;
    }
  },
  spadeDamageMultiplier: {
    id: 'spadeDamageMultiplier',
    name: 'Spade Damage Multiplier +5%',
    rarity: 'rare',
    prestige: true,
    effect: ({ stats }) => {
      stats.spadeDamageMultiplier = (stats.spadeDamageMultiplier || 1) + 0.05;
    }
  },
  heartHpMultiplier: {
    id: 'heartHpMultiplier',
    name: 'Heart HP Multiplier +5%',
    rarity: 'rare',
    prestige: true,
    effect: ({ stats }) => {
      stats.heartHpMultiplier = (stats.heartHpMultiplier || 1) + 0.05;
    }
  },
  clubsPlaceholder: {
    id: 'clubsPlaceholder',
    name: 'Clubs Placeholder',
    rarity: 'uncommon',
    prestige: true,
    effect: () => {}
  },
  diamondCashMultiplier: {
    id: 'diamondCashMultiplier',
    name: 'Diamond Cash Multiplier +5%',
    rarity: 'rare',
    prestige: true,
    effect: ({ stats }) => {
      stats.diamondCashMultiplier = (stats.diamondCashMultiplier || 1) + 0.05;
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
  'redrawCooldownReduction',
  'extraCardSlot'
];

export const upgradeLevels = {};

let activeCardUpgrades = [];

export function unlockCardUpgrade(id) {
  if (!unlockedCardUpgrades.includes(id)) {
    unlockedCardUpgrades.push(id);
  }
}

function weightedRandomId() {
  const weighted = [];
  unlockedCardUpgrades.forEach(id => {
    const def = cardUpgradeDefinitions[id];
    const weight = rarityWeights[def.rarity] || 1;
    for (let i = 0; i < weight; i++) weighted.push(id);
  });
  if (!weighted.length) return null;
  return weighted[Math.floor(Math.random() * weighted.length)];
}

export function rollNewCardUpgrades(count = 2) {
  const chosen = new Set();
  while (chosen.size < count && unlockedCardUpgrades.length > 0) {
    const id = weightedRandomId();
    if (id) chosen.add(id);
  }
  activeCardUpgrades = Array.from(chosen);
  return activeCardUpgrades;
}

export function createUpgradeCard(id) {
  return { upgradeId: id };
}

export function getCardUpgradeCost(id, stats) {
  const def = cardUpgradeDefinitions[id];
  if (!def) return 0;
  const rarityMult = rarityCostMultiplier[def.rarity] || 1;
  const handPoints = stats.points || 30;
  const payout = Math.floor(handPoints * (1 + Math.sqrt(9)) * (stats.cashMulti || 1));
  return Math.floor(payout * 100 * rarityMult);
}

export function addActiveUpgradeCardsToDeck(deck) {
  activeCardUpgrades.forEach(id => {
    deck.push(createUpgradeCard(id));
  });
}

export function applyCardUpgrade(id, context) {
  if (!upgradeLevels[id]) upgradeLevels[id] = 0;
  upgradeLevels[id] += 1;
  const def = cardUpgradeDefinitions[id];
  def.effect(context);
}

export function renderCardUpgrades(container, options = {}) {
  if (!container) return;
  const { stats = {}, cash = 0, onPurchase = null } = options;
  container.innerHTML = '';
  const ids = new Set([...activeCardUpgrades, ...Object.keys(upgradeLevels)]);
  ids.forEach(id => {
    const def = cardUpgradeDefinitions[id];
    const level = upgradeLevels[id] || 0;
    const cost = getCardUpgradeCost(id, stats);
    const wrapper = document.createElement('div');
    wrapper.classList.add('card-wrapper');
    const card = document.createElement('div');
    card.classList.add('card', 'upgrade-card');
    card.innerHTML = `
      <div class="card-suit"><i data-lucide="sword"></i></div>
      <div class="card-desc">${def.name} (Lv. ${level})</div>
    `;
    wrapper.appendChild(card);
    const btn = document.createElement('button');
    btn.textContent = `Buy $${cost}`;
    btn.disabled = cash < cost || !onPurchase;
    btn.addEventListener('click', () => onPurchase && onPurchase(id, cost));
    wrapper.appendChild(btn);
    container.appendChild(wrapper);
  });
}

export function getActiveCardUpgrades() {
  return activeCardUpgrades;
}
