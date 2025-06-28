import addLog from './log.js';
export const speechState = {
  orbs: {
    body: { current: 0, max: 10 },
    insight: { current: 0, max: 10 },
    will: { current: 0, max: 10 }
  },
  resources: {
    thought: { current: 0, max: 30 },
    structure: { current: 0, max: 10, unlocked: false }
  },
  gains: {
    body: 0,
    insight: 1,
    will: 0
  },
  upgrades: {
    cohere: { level: 0, baseCost: 2 },
    vocalMaturity: { level: 0, baseCost: 2, unlocked: false },
    capacityBoost: { level: 0, baseCost: { insight: 10, thought: 5 }, unlocked: false },
    expandMind: {
      level: 0,
      unlocked: true,
      costFunc: lvl => ({ structure: 2 * Math.pow(lvl + 1, 2) })
    }
  },
  capacity: 1,
  slots: [null],
  cooldowns: {},
  xp: 0,
  level: 1,
  formUnlocked: false,
  failCount: 0,
  masteryBonus: 0
};

const words = {
  verbs: ['Murmur'],
  targets: []
};

export const wordState = {
  verbs: { Murmur: { level: 1, xp: 0 } },
  targets: {}
};

const wordData = {
  verbs: {
    Murmur: { capacity: 1, cost: { insight: 5 }, power: 1, cd: 0 }
  },
  targets: {
    Form: { capacity: 2 }
  }
};

const phraseEffects = {
  Murmur: {
    cost: { insight: 5 },
    create: { thought: 1 },
    cd: 0,
    xp: 1,
    capacity: 1,
    complexity: { verb: 1, target: 0 }
  },
  'Murmur Form': {
    cost: { insight: 5 },
    create: { thought: -1, structure: 3 },
    cd: 3000,
    xp: 1,
    capacity: 3,
    complexity: { verb: 1, target: 1 }
  }
};

function getWordCategory(word) {
  if (wordData.verbs[word]) return 'verbs';
  if (wordData.targets[word]) return 'targets';
  return null;
}

function getWordPotency(word) {
  const cat = getWordCategory(word);
  if (!cat || !wordState[cat][word]) return 1;
  return Math.pow(1.1, wordState[cat][word].level - 1);
}

function getWordXpReq(word) {
  const cat = getWordCategory(word);
  if (!cat || !wordState[cat][word]) return 5;
  const lvl = wordState[cat][word].level;
  return Math.floor(5 * Math.pow(2, lvl - 1));
}

function addWordXp(word, amt) {
  const cat = getWordCategory(word);
  if (!cat || !wordState[cat][word]) return;
  const ws = wordState[cat][word];
  ws.xp += amt;
  while (ws.xp >= getWordXpReq(word)) {
    ws.xp -= getWordXpReq(word);
    ws.level += 1;
  }
}

let container;
function attachWordListeners() {
  if (!container) return;
  container.querySelectorAll('.word-tile').forEach(t => {
    t.removeEventListener('dragstart', onDrag);
    t.addEventListener('dragstart', onDrag);
  });
}

export function initSpeech() {
  container = document.getElementById('speechPanel');
  if (!container) return;
  container.innerHTML = `
    <div class="speech-orbs speech-tab-orbs">
      <div id="orbInsight" class="speech-orb"><div class="orb-fill"></div></div>
      <div id="orbBody" class="speech-orb"><div class="orb-fill"></div></div>
      <div id="orbWill" class="speech-orb"><div class="orb-fill"></div></div>
    </div>
    <div class="speech-xp-container">
      <i data-lucide="mic" class="speech-icon"></i>
      <div class="speech-xp-bar"><div class="speech-xp-fill"></div></div>
      <div id="speechLevel" class="speech-level"></div>
    </div>

    <div class="word-list" id="verbList"></div>
    <div class="word-list" id="targetList" style="display:none"></div>
    <div id="capacityDisplay" class="capacity-display"></div>
    <div class="phrase-slots" id="phraseSlots"></div>
    <div class="cast-wrapper">
      <button id="castPhraseBtn" class="cast-button"><span>Cast</span><div class="cooldown-overlay" style="--cooldown:0; display:none"></div></button>
      <div id="castCooldownCircle" class="cast-cooldown" style="display:none"><div class="cooldown-overlay" style="--cooldown:0"></div></div>
    </div>
  <div id="phraseInfo" class="phrase-info"></div>
  `;
  if (window.lucide) lucide.createIcons();
  renderLists();
  renderOrbs();
  createSlots();
  attachWordListeners();
  const castBtn = container.querySelector('#castPhraseBtn');
  castBtn.addEventListener('click', castPhrase);
  castBtn.addEventListener('mouseenter', e => {
    const wordsArr = speechState.slots.filter(Boolean);
    if (wordsArr.length < 1) return;
    const phrase = wordsArr.join(' ');
    const def = phraseEffects[phrase];
    if (!def) return;
    const complexity = (def.complexity?.verb || 0) + (def.complexity?.target || 0);
    const mastery = speechState.level + speechState.masteryBonus;
    const difficulty = complexity;
    const chance = 0.95 / (1 + Math.exp(difficulty - mastery - 0.2)) * 100;
    window.showTooltip(`${chance.toFixed(1)}% chance`, e.pageX + 10, e.pageY + 10);
  });
  castBtn.addEventListener('mouseleave', window.hideTooltip);
  renderSlots();
  updateCastCooldown();
  renderResources();
  renderGains();
  renderUpgrades();
}

function onDrag(e) {
  e.dataTransfer.setData('text/type', e.target.dataset.type);
  e.dataTransfer.setData('text/word', e.target.dataset.word);
}

function onDrop(e) {
  const type = e.dataTransfer.getData('text/type');
  const word = e.dataTransfer.getData('text/word');
  const idx = Number(e.currentTarget.dataset.index);
  if (idx === 0 && type !== 'verb') return;
  speechState.slots[idx] = word;
  renderSlots();
}

function onSlotClick(e) {
  const idx = Number(e.currentTarget.dataset.index);
  if (!speechState.slots[idx]) return;
  speechState.slots[idx] = null;
  renderSlots();
}

function renderLists() {
  if (!container) return;
  const makeTile = (word, type) => {
    const d = document.createElement('div');
    d.className = 'word-tile';
    d.classList.add(type);
    d.textContent = word;
    d.draggable = true;
    d.dataset.type = type;
    d.dataset.word = word;
    const ws = wordState[type + 's']?.[word];
    if (ws) {
      const potency = getWordPotency(word).toFixed(2);
      const xpReq = getWordXpReq(word);
      d.title = `Lv.${ws.level} ${ws.xp}/${xpReq} Potency ${potency}x`;
    }
    return d;
  };
  const verbList = container.querySelector('#verbList');
  if (verbList) {
    verbList.innerHTML = '';
    words.verbs.forEach(w => verbList.appendChild(makeTile(w, 'verb')));
  }
  const targetList = container.querySelector('#targetList');
  if (targetList) {
    targetList.innerHTML = '';
    words.targets.forEach(w => targetList.appendChild(makeTile(w, 'target')));
    targetList.style.display = words.targets.length ? 'flex' : 'none';
  }
  attachWordListeners();
}

function createSlots() {
  if (!container) return;
  const slotContainer = container.querySelector('#phraseSlots');
  slotContainer.innerHTML = '';
  speechState.slots.forEach((_, idx) => {
    const slot = document.createElement('div');
    slot.className = 'phrase-slot';
    slot.dataset.index = idx;
    slot.addEventListener('dragover', e => e.preventDefault());
    slot.addEventListener('drop', onDrop);
    slot.addEventListener('click', onSlotClick);
    slotContainer.appendChild(slot);
  });
}

function renderOrbs() {
  if (container) {
    const update = (id, orb) => {
      const fill = container.querySelector(`#${id} .orb-fill`);
      if (!fill) return;
      const pct = Math.max(0, Math.min(1, orb.current / orb.max)) * 100;
      fill.style.height = `${pct}%`;
      const el = container.querySelector(`#${id}`);
      if (el) el.title = `${Math.floor(orb.current)}/${orb.max}`;
    };
    update('orbBody', speechState.orbs.body);
    update('orbInsight', speechState.orbs.insight);
    update('orbWill', speechState.orbs.will);
  }
  window.dispatchEvent(new CustomEvent('orbs-changed'));
}

function renderSlots() {
  if (!container) return;
  createSlots();
  container.querySelectorAll('.phrase-slot').forEach(slot => {
    const idx = Number(slot.dataset.index);
    slot.classList.toggle('verb-slot', idx === 0);
    slot.classList.toggle('target-slot', idx > 0);
    const word = speechState.slots[idx];
    slot.innerHTML = '';
    if (word) {
      const span = document.createElement('span');
      span.className = 'slot-word';
      span.textContent = word;
      const x = document.createElement('span');
      x.className = 'slot-clear';
      x.textContent = 'x';
      x.addEventListener('click', ev => {
        ev.stopPropagation();
        speechState.slots[idx] = null;
        renderSlots();
      });
      slot.appendChild(span);
      slot.appendChild(x);
    }
    slot.classList.toggle('filled', Boolean(word));
  });
  renderPhraseInfo();
  updateCastCooldown();
}

function renderPhraseInfo() {
  if (!container) return;
  const info = container.querySelector('#phraseInfo');
  if (!info) return;
  const wordsArr = speechState.slots.filter(Boolean);
  if (wordsArr.length < 1) {
    info.textContent = '';
    return;
  }
  const phrase = wordsArr.join(' ');
  const def = phraseEffects[phrase];
  if (!def) {
    info.textContent = '';
    return;
  }
  const potMult = wordsArr.reduce((a, w) => a + getWordPotency(w), 0) / wordsArr.length;
  const cost = Object.entries(def.cost)
    .map(([k, v]) => `${Math.ceil(v * potMult)} ${k}`)
    .join(', ');
  const effect = def.create
    ? Object.entries(def.create)
        .map(([k, v]) => `+${(v * potMult).toFixed(1)} ${k}`)
        .join(', ')
    : 'None';
  const cd = def.cd ? def.cd / 1000 + 's' : '0s';
  const complexity = (def.complexity?.verb || 0) + (def.complexity?.target || 0);
  const mastery = speechState.level + speechState.masteryBonus;
  const difficulty = complexity;
  const chance = 0.95 / (1 + Math.exp(difficulty - mastery - 0.2)) * 100;
  info.textContent =
    `Cost: ${cost} | Effect: ${effect} | CD: ${cd} | Diff: ${complexity} | Chance: ${chance.toFixed(1)}%`;
  const cap = def.capacity || 0;
  const capDisplay = container.querySelector('#capacityDisplay');
  if (capDisplay) capDisplay.textContent = `Capacity: ${cap}/${speechState.capacity}`;
}

function castPhrase() {
  const wordsArr = speechState.slots.filter(Boolean);
  if (wordsArr.length < 1) return;
  const phrase = wordsArr.join(' ');
  const def = phraseEffects[phrase];
  if (!def) return;
  for (const orb of Object.values(speechState.orbs)) {
    if (orb.current < 0) return;
  }
  for (const res of Object.values(speechState.resources)) {
    if (res.current < 0) return;
  }
  if (speechState.cooldowns[phrase] && Date.now() < speechState.cooldowns[phrase]) return;
  if ((def.capacity || 0) > speechState.capacity) return;
  const potMult = wordsArr.reduce((a, w) => a + getWordPotency(w), 0) / wordsArr.length;
  for (const [orb, cost] of Object.entries(def.cost)) {
    if (speechState.orbs[orb].current < cost * potMult) return;
  }
  const complexity = (def.complexity?.verb || 0) + (def.complexity?.target || 0);
  const mastery = speechState.level + speechState.masteryBonus;
  const difficulty = complexity;
  const chance = 0.95 / (1 + Math.exp(difficulty - mastery - 0.2));
  const success = Math.random() <= chance;
  for (const [orb, cost] of Object.entries(def.cost)) {
    speechState.orbs[orb].current -= cost * potMult;
  }
  speechState.cooldowns[phrase] = Date.now() + def.cd;
  if (success) {
    if (def.create) {
      for (const [res, amt] of Object.entries(def.create)) {
        const r = speechState.resources[res];
        if (r) r.current = Math.min(r.max, r.current + amt * potMult);
      }
    }
    wordsArr.forEach(w => addWordXp(w, def.xp || 1));
    if (def.xp) addSpeechXP(def.xp);
    showPhraseCloud(phrase);
  } else {
    speechState.failCount += 1;
    if (!speechState.upgrades.vocalMaturity.unlocked && speechState.failCount >= 5) {
      speechState.upgrades.vocalMaturity.unlocked = true;
      addLog('Vocal Maturity unlocked!', 'info');
      renderUpgrades();
    }
    if (def.xp) addSpeechXP(def.xp / 2);
    showPhraseCloud('...');
  }
  renderOrbs();
  renderResources();
  renderPhraseInfo();
  updateCastCooldown();
  checkUnlocks();
}


function updateCastCooldown() {
  const castBtn = container.querySelector('#castPhraseBtn');
  const circle = container.querySelector('#castCooldownCircle');
  if (!castBtn || !circle) return;
  const overlay = castBtn.querySelector('.cooldown-overlay');
  const wordsArr = speechState.slots.filter(Boolean);
  if (wordsArr.length < 1) {
    if (overlay) overlay.style.display = 'none';
    circle.style.display = 'none';
    castBtn.classList.remove('onCooldown');
    return;
  }
  const phrase = wordsArr.join(' ');
  const def = phraseEffects[phrase];
  if (!def) return;
  const cdEnd = speechState.cooldowns[phrase];
  if (cdEnd && Date.now() < cdEnd) {
    const ratio = (cdEnd - Date.now()) / def.cd;
    if (overlay) {
      overlay.style.setProperty('--cooldown', ratio);
      overlay.style.display = 'block';
    }
    const circleOverlay = circle.querySelector('.cooldown-overlay');
    if (circleOverlay) {
      circleOverlay.style.setProperty('--cooldown', ratio);
    }
    circle.style.display = 'block';
    castBtn.classList.add('onCooldown');
  } else {
    if (overlay) overlay.style.display = 'none';
    circle.style.display = 'none';
    castBtn.classList.remove('onCooldown');
  }
}

function addSpeechXP(amt) {
  speechState.xp += amt;
  const oldLevel = speechState.level;
  speechState.level = Math.floor(speechState.xp / 10) + 1;
  if (speechState.level !== oldLevel) {
    if (!words.verbs.includes('Murmur')) {
      words.verbs.push('Murmur');
    }
    if (speechState.level >= 10 && speechState.slots.length < 3) {
      speechState.slots.push(null);
    }
    renderLists();
    renderSlots();
  }
  renderXpBar();
}

function renderXpBar() {
  if (!container) return;
  const bar = container.querySelector('.speech-xp-bar');
  const fill = bar ? bar.querySelector('.speech-xp-fill') : null;
  if (!bar || !fill) return;
  const levelBase = (speechState.level - 1) * 10;
  const pct = Math.min(1, (speechState.xp - levelBase) / 10);
  fill.style.width = `${pct * 100}%`;
  bar.title = `Speech XP ${speechState.xp}/${levelBase + 10}`;
  const levelEl = container.querySelector('#speechLevel');
  if (levelEl) levelEl.textContent = `Speech Lv.${speechState.level}`;
}

function checkUnlocks() {
  if (!speechState.formUnlocked && speechState.resources.thought.current >= 15) {
    speechState.formUnlocked = true;
    if (!words.targets.includes('Form')) {
      words.targets.push('Form');
      wordState.targets['Form'] = { level: 1, xp: 0 };
    }
    speechState.resources.structure.unlocked = true;
    if (speechState.slots.length < 2) speechState.slots.push(null);
    addLog('A concept stabilizes… Form is now available.', 'info');
    renderLists();
    renderResources();
    renderSlots();
    speechState.upgrades.capacityBoost.unlocked = true;
    renderUpgrades();
  }
  if (!speechState.upgrades.vocalMaturity.unlocked && speechState.failCount >= 5) {
    speechState.upgrades.vocalMaturity.unlocked = true;
    addLog('Vocal Maturity unlocked!', 'info');
    renderUpgrades();
  }
}

function renderResources() {
  const panel = document.getElementById('secondaryResources');
  if (!panel) return;
  panel.innerHTML = '';
  Object.entries(speechState.resources).forEach(([key, res]) => {
    if (res.unlocked === false) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'resource';
    const text = document.createElement('div');
    text.className = 'resource-text';
    text.textContent = `${key}: ${Math.floor(res.current)}/${res.max}`;
    const bar = document.createElement('div');
    bar.className = 'resource-bar';
    const fill = document.createElement('div');
    fill.className = 'resource-fill';
    fill.style.width = `${(res.current / res.max) * 100}%`;
    bar.appendChild(fill);
    wrapper.appendChild(text);
    wrapper.appendChild(bar);
    panel.appendChild(wrapper);
  });
}

function renderGains() {
  const panel = document.getElementById('speechGains');
  if (!panel) return;
  panel.innerHTML = `Insight/sec: ${speechState.gains.insight.toFixed(1)}<br>` +
    `Body/sec: ${speechState.gains.body.toFixed(1)}<br>` +
    `Will/sec: ${speechState.gains.will.toFixed(1)}`;
}

function getUpgradeCost(name) {
  const up = speechState.upgrades[name];
  if (typeof up.costFunc === 'function') {
    return up.costFunc(up.level);
  }
  if (typeof up.baseCost === 'number') {
    return Math.floor(up.baseCost * Math.pow(2, up.level));
  }
  const costs = {};
  for (const [k, v] of Object.entries(up.baseCost)) {
    costs[k] = Math.floor(v * Math.pow(2, up.level));
  }
  return costs;
}

function purchaseUpgrade(name) {
  const up = speechState.upgrades[name];
  const cost = getUpgradeCost(name);
  if (typeof cost === 'number') {
    if (speechState.orbs.insight.current < cost) return;
    speechState.orbs.insight.current -= cost;
  } else {
    for (const [k, v] of Object.entries(cost)) {
      if (speechState.orbs[k] && speechState.orbs[k].current < v) return;
      if (speechState.resources[k] && speechState.resources[k].current < v) return;
    }
    for (const [k, v] of Object.entries(cost)) {
      if (speechState.orbs[k]) speechState.orbs[k].current -= v;
      if (speechState.resources[k]) speechState.resources[k].current -= v;
    }
  }
  up.level += 1;
  if (name === 'cohere') {
    speechState.gains.insight += 0.5;
  } else if (name === 'vocalMaturity') {
    speechState.masteryBonus += 0.5;
  } else if (name === 'capacityBoost') {
    speechState.capacity += 2;
  } else if (name === 'expandMind') {
    speechState.orbs.insight.max += 10;
  }
  renderUpgrades();
  renderGains();
  renderOrbs();
  renderResources();
  renderPhraseInfo();
}

function renderUpgrades() {
  const panel = document.getElementById('speechUpgrades');
  if (!panel) return;
  panel.innerHTML = '';
  const up = speechState.upgrades.cohere;
  const btn = document.createElement('button');
  const cost = getUpgradeCost('cohere');
  btn.textContent = `Cohere Lv.${up.level} (cost ${cost})`;
  btn.addEventListener('click', () => purchaseUpgrade('cohere'));
  panel.appendChild(btn);

  const vm = speechState.upgrades.vocalMaturity;
  if (vm.unlocked) {
    const vmBtn = document.createElement('button');
    const vmCost = getUpgradeCost('vocalMaturity');
    vmBtn.textContent = `Vocal Maturity Lv.${vm.level} (cost ${vmCost})`;
    vmBtn.addEventListener('click', () => purchaseUpgrade('vocalMaturity'));
    panel.appendChild(vmBtn);
  }

  const cb = speechState.upgrades.capacityBoost;
  if (cb.unlocked) {
    const cbBtn = document.createElement('button');
    const cbCost = getUpgradeCost('capacityBoost');
    const costText = [];
    if (typeof cbCost === 'object') {
      if (cbCost.insight) costText.push(`${cbCost.insight} insight`);
      if (cbCost.thought) costText.push(`${cbCost.thought} thought`);
    }
    cbBtn.textContent = `Capacity +2 (cost ${costText.join(', ')})`;
    cbBtn.addEventListener('click', () => purchaseUpgrade('capacityBoost'));
    panel.appendChild(cbBtn);
  }

  const em = speechState.upgrades.expandMind;
  if (em.unlocked) {
    const emBtn = document.createElement('button');
    const emCost = getUpgradeCost('expandMind');
    const costText = [];
    if (typeof emCost === 'object') {
      if (emCost.structure) costText.push(`${emCost.structure} structure`);
    }
    emBtn.textContent = `Expand Mind Lv.${em.level} (cost ${costText.join(', ')})`;
    emBtn.addEventListener('click', () => purchaseUpgrade('expandMind'));
    panel.appendChild(emBtn);
  }
}

export function tickSpeech(delta) {
  if (!container) return;
  const dt = delta / 1000;
  ['insight', 'body', 'will'].forEach(k => {
    const orb = speechState.orbs[k];
    const rate = speechState.gains[k];
    if (rate > 0 && orb.current < orb.max) {
      orb.current = Math.min(orb.max, orb.current + rate * dt);
    }
  });
  renderOrbs();
  renderResources();
  renderXpBar();
  renderPhraseInfo();
  updateCastCooldown();
  checkUnlocks();
}

function showPhraseCloud(text) {
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'phrase-cloud';
  el.textContent = text;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}
