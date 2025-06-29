import addLog from './log.js';
import { coreState, refreshCore } from './core.js';

const FORM_UNLOCK_THOUGHT_REQ = 15;
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
    insight: 0.2,
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
  memorySlots: 2,
  activePhrases: ['Murmur'],
  cooldowns: {},
  constructUnlocked: false,
  savedPhrases: [],
  xp: 0,
  level: 1,
  formUnlocked: false,
  failCount: 0,
  masteryBonus: 0,
  modifierUnlocks: { Inwardly: false, Sharply: false, Persistently: false },
  selfCastCount: 0,
  lastPhrase: '',
  repeatCount: 0,
  highCostPhrases: new Set()
};

const words = {
  verbs: ['Murmur'],
  targets: ['Self'],
  modifiers: []
};

const resourceIcons = {
  insight: '🟦',
  thought: '🧠',
  structure: '🧱',
  body: '❤️',
  will: '💜'
};

function capFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function orbColor(key) {
  switch (key) {
    case 'insight':
      return '#88f';
    case 'body':
      return '#f66';
    case 'will':
      return '#a060ff';
    case 'thought':
      return '#4466aa';
    case 'structure':
      return '#a97b5d';
    default:
      return '#555';
  }
}

function formatCost(cost) {
  if (typeof cost === 'number') {
    return `${cost} ${resourceIcons.insight}`;
  }
  const parts = [];
  for (const [k, v] of Object.entries(cost)) {
    const icon = resourceIcons[k] || '';
    parts.push(`${v} ${icon}`);
  }
  return parts.join(' ');
}

export const wordState = {
  verbs: { Murmur: { level: 1, xp: 0 } },
  targets: { Self: { level: 1, xp: 0 } },
  modifiers: {}
};

const wordData = {
  verbs: {
    Murmur: { capacity: 1, cost: { insight: 5 }, power: 1, cd: 0 },
    Chant: { capacity: 2, cost: { insight: 3 }, power: 1, cd: 0 }
  },
  targets: {
    Self: { capacity: 1 },
    Form: { capacity: 2 },
    Mind: { capacity: 1 }
  },
  modifiers: {
    Inwardly: { capacity: 0, costDelta: -1, potency: 1.1, cdDelta: 0, complexity: 0.5 },
    Sharply: { capacity: 1, costDelta: 2, potency: 2, cdDelta: 2000, complexity: 1.5 },
    Persistently: { capacity: 1, costDelta: 1, potency: 1, cdDelta: 1000, complexity: 1.0, repeat: true }
  }
};

const phraseEffects = {
  Murmur: {
    cost: { insight: 5 },
    // Murmur simply grants Speech XP and has no direct effect
    create: null,
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

function buildPhraseDef(wordsArr) {
  if (!wordsArr.length) return null;
  const result = {
    cost: {},
    create: {},
    cd: 0,
    xp: 1,
    capacity: 0,
    complexity: { verb: 0, target: 0, modifier: 0 },
    repeat: false,
    potency: 1
  };
  wordsArr.forEach(w => {
    const cat = getWordCategory(w);
    if (!cat) return;
    const data = wordData[cat][w];
    if (!data) return;
    result.capacity += data.capacity || 0;
    if (data.cost) {
      for (const [k, v] of Object.entries(data.cost)) {
        result.cost[k] = (result.cost[k] || 0) + v;
      }
    }
    if (data.costDelta) {
      result.cost.insight = (result.cost.insight || 0) + data.costDelta;
    }
    if (data.create) {
      for (const [k, v] of Object.entries(data.create)) {
        result.create[k] = (result.create[k] || 0) + v;
      }
    }
    result.cd += data.cd || 0;
    if (data.cdDelta) result.cd += data.cdDelta;
    if (data.potency) result.potency *= data.potency;
    result.complexity[cat.slice(0, -1)] += data.complexity || 0;
    if (data.repeat) result.repeat = true;
  });
  const hasVerb = wordsArr.some(w => getWordCategory(w) === 'verbs');
  if (hasVerb && wordsArr.includes('Mind')) {
    result.create.thought = (result.create.thought || 0) + 1;
  }
  if (result.cost.insight !== undefined) {
    result.cost.insight = Math.max(1, result.cost.insight);
  }
  return result;
}

function getWordCategory(word) {
  if (wordData.verbs[word]) return 'verbs';
  if (wordData.targets[word]) return 'targets';
  if (wordData.modifiers[word]) return 'modifiers';
  return null;
}

function wordColor(word) {
  const cat = getWordCategory(word);
  if (cat === 'modifiers') return '#777';
  if (word === 'Mind') return orbColor('thought');
  if (word === 'Form') return orbColor('structure');
  if (word === 'Self') return orbColor('body');
  if (cat === 'verbs') return orbColor('insight');
  return '#555';
}

function phraseGradient(phrase) {
  const colors = phrase.split(' ').map(wordColor);
  if (colors.length === 1) return colors[0];
  const step = 100 / (colors.length - 1);
  const stops = colors.map((c, i) => `${c} ${i * step}%`).join(', ');
  return `linear-gradient(to right, ${stops})`;
}

function createPhraseCard(phrase) {
  const card = document.createElement('div');
  card.className = 'phrase-card';
  card.style.background = phraseGradient(phrase);
  phrase.split(' ').forEach(w => {
    const line = document.createElement('div');
    line.className = 'phrase-word';
    line.textContent = w;
    line.style.color = '#000';
    card.appendChild(line);
  });
  return card;
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
let pointerDrag = null;
function attachWordListeners() {
  if (!container) return;
  container.querySelectorAll('.word-tile').forEach(t => {
    t.removeEventListener('dragstart', onDrag);
    t.addEventListener('dragstart', onDrag);
    t.removeEventListener('pointerdown', onTilePointerDown);
    t.addEventListener('pointerdown', onTilePointerDown);
  });
}

export function initSpeech() {
  container = document.getElementById('speechPanel');
  if (!container) return;
  container.innerHTML = `
    <h3 class="section-title">Core Orbs</h3>
    <div class="speech-orbs speech-tab-orbs">
      <div id="orbInsightContainer" class="orb-container">
        <div id="orbInsight" class="speech-orb"><div class="orb-fill"></div></div>
        <div id="orbInsightValue" class="orb-value"></div>
      </div>
      <div id="orbBodyContainer" class="orb-container" style="display:none">
        <div id="orbBody" class="speech-orb"><div class="orb-fill"></div></div>
        <div id="orbBodyValue" class="orb-value"></div>
      </div>
      <div id="orbWillContainer" class="orb-container" style="display:none">
        <div id="orbWill" class="speech-orb"><div class="orb-fill"></div></div>
        <div id="orbWillValue" class="orb-value"></div>
      </div>
    </div>
    <h3 class="section-title">Speech Progression</h3>
    <div class="speech-xp-container">
      <i data-lucide="mic" class="speech-icon"></i>
      <div class="speech-progress">
        <div id="speechLevel" class="speech-level"></div>
        <div class="speech-xp-bar"><div class="speech-xp-fill"></div></div>
      </div>
    </div>
    <div class="murmur-controls">
      <button id="murmurBtn" class="cast-button">Murmur</button>
    </div>
    <div id="constructToggle" class="construct-toggle" style="display:none">❮</div>
    <div id="phraseHotbar" class="phrase-hotbar"></div>
    <div id="constructPanel" class="construct-panel">
      <div class="construct-header">
        <button id="closeConstructBtn" class="cast-button">❌</button>
      </div>
      <div class="construct-tab constructor-view">
        <div class="construct-top">
          <div class="word-list" id="verbList"></div>
          <div class="word-list" id="targetList" style="display:none"></div>
          <div class="word-list" id="modifierList" style="display:none"></div>
          <div class="phrase-slots" id="phraseSlots"></div>
          <div id="capacityDisplay" class="capacity-display"></div>
          <div class="cast-container">
            <div class="cast-wrapper">
              <button id="castPhraseBtn" class="cast-button"><span>Cast</span><div class="cooldown-overlay" style="--cooldown:0; display:none"></div></button>
              <div id="castCooldownCircle" class="cast-cooldown" style="display:none"><div class="cooldown-overlay" style="--cooldown:0"></div></div>
            </div>
            <div id="phraseInfo" class="phrase-info"></div>
          </div>
        </div>
        <div class="construct-bottom">
          <div id="savedPhraseCards" class="saved-phrases"></div>
          <div id="memorySlotsDisplay" class="memory-slots"></div>
          <div id="phraseDetails" class="phrase-info"></div>
        </div>
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons();
  renderLists();
  renderOrbs();
  createSlots();
  attachWordListeners();
  const castBtn = container.querySelector('#castPhraseBtn');
  castBtn.addEventListener('click', () => castPhrase());
  castBtn.addEventListener('mouseenter', e => {
    const wordsArr = speechState.slots.filter(Boolean);
    if (wordsArr.length < 1) return;
    const def = buildPhraseDef(wordsArr);
    if (!def) return;
    const complexity = (def.complexity.verb || 0) + (def.complexity.target || 0) + (def.complexity.modifier || 0);
    const mastery = speechState.level + speechState.masteryBonus;
    const difficulty = complexity;
    const chance = 0.95 / (1 + Math.exp(difficulty - mastery - 0.2)) * 100;
    window.showTooltip(`${chance.toFixed(1)}% chance`, e.pageX + 10, e.pageY + 10);
  });
  castBtn.addEventListener('mouseleave', window.hideTooltip);
  const murmurBtn = container.querySelector('#murmurBtn');
  if (murmurBtn) murmurBtn.addEventListener('click', castMurmur);
  const constructToggle = container.querySelector('#constructToggle');
  if (constructToggle) {
    constructToggle.addEventListener('click', () => toggleConstructPanel());
    constructToggle.addEventListener('pointerdown', e => {
      const start = e.clientX;
      function up(ev) {
        const diff = start - ev.clientX;
        if (diff > 30) toggleConstructPanel(true);
        if (diff < -30) toggleConstructPanel(false);
        window.removeEventListener('pointerup', up);
      }
      window.addEventListener('pointerup', up);
    });
  }
  const closeBtn = container.querySelector('#closeConstructBtn');
  if (closeBtn) closeBtn.addEventListener('click', toggleConstructPanel);
  const panel = container.querySelector('#constructPanel');
  if (panel) {
    panel.addEventListener('pointerdown', e => {
      if (!panel.classList.contains('open')) return;
      if (e.target.closest('.word-tile')) return;
      const startX = e.clientX;
      function up(ev) {
        const diff = ev.clientX - startX;
        if (diff > 50) toggleConstructPanel(false);
        window.removeEventListener('pointerup', up);
      }
      window.addEventListener('pointerup', up);
    });
  }

  const constructorView = container.querySelector('.constructor-view');
  if (constructorView) {
    constructorView.style.display = 'flex';
  }
  renderSlots();
  updateCastCooldown();
  renderResources();
  renderGains();
  renderUpgrades();
  renderHotbar();
  renderSavedPhraseCards();
  checkUnlocks();
}

function onDrag(e) {
  e.dataTransfer.setData('text/type', e.target.dataset.type);
  e.dataTransfer.setData('text/word', e.target.dataset.word);
}

function onDrop(e) {
  const type = e.dataTransfer.getData('text/type');
  const word = e.dataTransfer.getData('text/word');
  const idx = Number(e.currentTarget.dataset.index);
  if ((idx === 0 && type !== 'verb') || (idx === 1 && type !== 'target') || (idx > 1 && type !== 'modifier')) return;
  speechState.slots[idx] = word;
  renderSlots();
}

function onTilePointerDown(e) {
  e.preventDefault();
  pointerDrag = { word: e.currentTarget.dataset.word, type: e.currentTarget.dataset.type };
  window.addEventListener('pointerup', onTilePointerUp, { once: true });
}

function onTilePointerUp(e) {
  if (!pointerDrag) return;
  const el = document.elementFromPoint(e.clientX, e.clientY);
  const slot = el && el.closest('.phrase-slot');
  if (slot) {
    const idx = Number(slot.dataset.index);
    if (!((idx === 0 && pointerDrag.type !== 'verb') || (idx === 1 && pointerDrag.type !== 'target') || (idx > 1 && pointerDrag.type !== 'modifier'))) {
      speechState.slots[idx] = pointerDrag.word;
      renderSlots();
    }
  }
  pointerDrag = null;
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
    const color = wordColor(word);
    d.style.background = color;
    d.style.borderColor = color;
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
  const modList = container.querySelector('#modifierList');
  if (modList) {
    modList.innerHTML = '';
    words.modifiers.forEach(w => modList.appendChild(makeTile(w, 'modifier')));
    modList.style.display = words.modifiers.length ? 'flex' : 'none';
  }
  attachWordListeners();
}

function ensureSlotCount() {
  const wordsPlaced = speechState.slots.filter(Boolean).length;
  const minSlots = wordsPlaced + 1;
  while (speechState.slots.length < minSlots) {
    speechState.slots.push(null);
  }
  while (speechState.slots.length > minSlots && speechState.slots[speechState.slots.length - 1] === null) {
    speechState.slots.pop();
  }
  if (!speechState.slots.includes(null)) {
    speechState.slots.push(null);
  }
}

function createSlots() {
  if (!container) return;
  ensureSlotCount();
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
      if (el) {
        el.title = `${Math.floor(orb.current)}/${orb.max} (${speechState.gains[id.replace('orb','').toLowerCase()].toFixed(1)}/sec)`;
        el.classList.toggle('full', orb.current >= orb.max);
      }
      const label = container.querySelector(`#${id}Value`);
      if (label) label.textContent = `${Math.floor(orb.current)}/${orb.max}`;
    };
    update('orbBody', speechState.orbs.body);
    update('orbInsight', speechState.orbs.insight);
    update('orbWill', speechState.orbs.will);
    const bodyEl = container.querySelector('#orbBodyContainer');
    if (bodyEl) bodyEl.style.display = speechState.orbs.body.current >= 1 ? 'flex' : 'none';
    const willEl = container.querySelector('#orbWillContainer');
    if (willEl) willEl.style.display = speechState.orbs.will.current >= 1 ? 'flex' : 'none';
  }
  window.dispatchEvent(new CustomEvent('orbs-changed'));
}

function renderSlots() {
  if (!container) return;
  ensureSlotCount();
  createSlots();
  container.querySelectorAll('.phrase-slot').forEach(slot => {
    const idx = Number(slot.dataset.index);
    slot.classList.toggle('verb-slot', idx === 0);
    slot.classList.toggle('target-slot', idx === 1);
    slot.classList.toggle('modifier-slot', idx > 1);
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
  const castBtn = container.querySelector('#castPhraseBtn');
  if (!info) return;
  const wordsArr = speechState.slots.filter(Boolean);
  if (wordsArr.length < 1) {
    info.textContent = '';
    if (castBtn) castBtn.disabled = true;
    return;
  }
  const def = buildPhraseDef(wordsArr);
  if (!def) {
    info.textContent = '';
    if (castBtn) castBtn.disabled = true;
    return;
  }
  const complexity = (def.complexity.verb || 0) + (def.complexity.target || 0) + (def.complexity.modifier || 0);
  const mastery = speechState.level + speechState.masteryBonus;
  const difficulty = complexity;
  const chance = 0.95 / (1 + Math.exp(difficulty - mastery - 0.2)) * 100;
  const chanceHtml = `<span class="info-tag">Chance: ${chance.toFixed(1)}%</span>`;
  const phrase = wordsArr.join(' ');
  if (speechState.savedPhrases.includes(phrase)) {
    const potMult = (wordsArr.reduce((a, w) => a + getWordPotency(w), 0) / wordsArr.length) * def.potency;
    const costHtml = Object.entries(def.cost)
      .map(
        ([k, v]) =>
          `<span class="info-tag" style="background:${orbColor(k)}">Cost:${Math.ceil(v * potMult)} ${resourceIcons[k] || capFirst(k)}</span>`
      )
      .join(' ');
    const effectHtml = def.create
      ? Object.entries(def.create)
          .map(
            ([k, v]) =>
              `<span class="info-tag" style="background:${orbColor(k)}">Effect: +${(
                v * potMult
              ).toFixed(1)} ${resourceIcons[k] || capFirst(k)}</span>`
          )
          .join(' ')
      : `<span class="info-tag">Effect: None</span>`;
    const cdHtml = `<span class="info-tag">CD: ${def.cd ? def.cd / 1000 + 's' : '0s'}</span>`;
    info.innerHTML = `${costHtml} ${effectHtml} ${cdHtml} ${chanceHtml}`;
  } else {
    info.innerHTML = `<span class="info-tag">??</span> ${chanceHtml}`;
  }
  const cap = def.capacity || 0;
  const capDisplay = container.querySelector('#capacityDisplay');
  if (capDisplay) {
    capDisplay.textContent = `Capacity: ${cap}/${speechState.capacity}`;
    if (cap > speechState.capacity) capDisplay.classList.add('exceeded');
    else capDisplay.classList.remove('exceeded');
  }
  if (castBtn) castBtn.disabled = cap > speechState.capacity;
}

function castPhrase(phraseArg) {
  const wordsArr = phraseArg ? phraseArg.split(' ') : speechState.slots.filter(Boolean);
  if (wordsArr.length < 1) return;
  const phrase = wordsArr.join(' ');
  let def = buildPhraseDef(wordsArr);
  if (!def) return;
  const special = phraseEffects[phrase];
  if (special) def = { ...def, ...special };
  const hasVerb = wordsArr.some(w => getWordCategory(w) === 'verbs');
  const hasTarget = wordsArr.some(w => getWordCategory(w) === 'targets');
  if (!(hasVerb && hasTarget) && (phrase !== 'Murmur' || words.targets.includes('Mind'))) return;
  if (wordsArr.includes('Chant') && wordsArr.includes('Persistently')) return;
  for (const orb of Object.values(speechState.orbs)) {
    if (orb.current < 0) return;
  }
  for (const res of Object.values(speechState.resources)) {
    if (res.current < 0) return;
  }
  if (speechState.cooldowns[phrase] && Date.now() < speechState.cooldowns[phrase]) return;
  if ((def.capacity || 0) > speechState.capacity) return;
  const potMult = (wordsArr.reduce((a, w) => a + getWordPotency(w), 0) / wordsArr.length) * def.potency;
  for (const [orb, cost] of Object.entries(def.cost)) {
    if (speechState.orbs[orb].current < cost * potMult) return;
  }
  const complexity = (def.complexity.verb || 0) + (def.complexity.target || 0) + (def.complexity.modifier || 0);
  const mastery = speechState.level + speechState.masteryBonus;
  const difficulty = complexity;
  const chance = 0.95 / (1 + Math.exp(difficulty - mastery - 0.2));
  const success = Math.random() <= chance;
  for (const [orb, cost] of Object.entries(def.cost)) {
    speechState.orbs[orb].current -= cost * potMult;
    const el = container.querySelector(`#orb${capFirst(orb)}`);
    if (el) {
      el.classList.add('pulse');
      setTimeout(() => el.classList.remove('pulse'), 300);
    }
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
    if (wordsArr.includes('Self')) {
      speechState.selfCastCount += 1;
      if (!speechState.modifierUnlocks.Inwardly && speechState.selfCastCount >= 3) {
        speechState.modifierUnlocks.Inwardly = true;
        words.modifiers.push('Inwardly');
        wordState.modifiers['Inwardly'] = { level: 1, xp: 0 };
        addLog('Modifier unlocked: Inwardly', 'info');
        glowConstructToggle();
        renderLists();
      }
    }
    const totalCost = Object.values(def.cost).reduce((a, v) => a + v, 0);
    if (totalCost >= 6) speechState.highCostPhrases.add(phrase);
    if (!speechState.modifierUnlocks.Sharply && speechState.highCostPhrases.size >= 3) {
      speechState.modifierUnlocks.Sharply = true;
      words.modifiers.push('Sharply');
      wordState.modifiers['Sharply'] = { level: 1, xp: 0 };
      addLog('Modifier unlocked: Sharply', 'info');
      glowConstructToggle();
      renderLists();
    }
    if (speechState.lastPhrase === phrase) {
      speechState.repeatCount += 1;
    } else {
      speechState.repeatCount = 1;
    }
    speechState.lastPhrase = phrase;
    if (!speechState.modifierUnlocks.Persistently && speechState.repeatCount >= 3) {
      speechState.modifierUnlocks.Persistently = true;
      words.modifiers.push('Persistently');
      wordState.modifiers['Persistently'] = { level: 1, xp: 0 };
      addLog('Modifier unlocked: Persistently', 'info');
      glowConstructToggle();
      renderLists();
    }
    savePhrase(phrase);
    if (wordsArr.includes('Chant')) {
      setTimeout(() => castPhrase(phrase), 1000);
    } else if (wordsArr.includes('Persistently')) {
      setTimeout(() => castPhrase(phrase), 5000);
    }
    const castBtn = container.querySelector('#castPhraseBtn');
    if (castBtn) castBtn.disabled = true;
    showPhraseDetails(phrase);
    renderPhraseInfo();
    // Clear slots after casting for easier new phrase construction
    speechState.slots = [null];
    renderSlots();
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
  if (!success) renderPhraseInfo();
  updateCastCooldown();
  checkUnlocks();
}

function castMurmur() {
  const phrase = words.targets.includes('Mind') ? 'Murmur Mind' : 'Murmur';
  castPhrase(phrase);
  updateCastCooldown();
}

function toggleConstructPanel(forceOpen) {
  const panel = container.querySelector('#constructPanel');
  const toggle = container.querySelector('#constructToggle');
  if (!panel) return;
  const isOpen = panel.classList.contains('open');
  const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !isOpen;
  if (shouldOpen) {
    panel.classList.remove('close-right');
    panel.classList.add('open');
    container.classList.add('construct-mode');
    if (toggle) toggle.textContent = '❯';
  } else {
    panel.classList.remove('open');
    panel.classList.add('close-right');
    container.classList.remove('construct-mode');
    if (toggle) toggle.textContent = '❮';
    panel.addEventListener('transitionend', () => panel.classList.remove('close-right'), { once: true });
  }
}

function glowConstructToggle() {
  const toggle = container.querySelector('#constructToggle');
  if (!toggle) return;
  toggle.classList.add('glow-notify');
  setTimeout(() => toggle.classList.remove('glow-notify'), 3000);
}

function savePhrase(phraseArg) {
  const wordsArr = phraseArg ? phraseArg.split(' ') : speechState.slots.filter(Boolean);
  if (wordsArr.length < 2 && wordsArr.join(' ') !== 'Murmur') return;
  const phrase = wordsArr.join(' ');
  if (speechState.savedPhrases.includes(phrase)) return;
  const def = buildPhraseDef(wordsArr);
  if (!def) return;
  if ((def.capacity || 0) > speechState.capacity) return;
  speechState.savedPhrases.push(phrase);
  if (speechState.activePhrases.length < speechState.memorySlots) {
    speechState.activePhrases.push(phrase);
  }
  renderHotbar();
  renderSavedPhraseCards();
  showPhraseDetails(phrase);
  if (phrase.startsWith('Murmur')) {
    const murmurBtn = container.querySelector('#murmurBtn');
    if (murmurBtn) murmurBtn.remove();
  }
}

function renderHotbar() {
  const bar = container.querySelector('#phraseHotbar');
  if (!bar) return;
  bar.innerHTML = '';
  speechState.activePhrases.forEach(p => {
    const card = createPhraseCard(p);
    card.classList.add('hotbar-phrase');
    card.addEventListener('click', () => castPhrase(p));
    bar.appendChild(card);
  });
}

function renderSavedPhraseCards() {
  const cont = container.querySelector('#savedPhraseCards');
  if (!cont) return;
  const slotCont = container.querySelector('#memorySlotsDisplay');
  if (slotCont) {
    slotCont.innerHTML = '';
    for (let i = 0; i < speechState.memorySlots; i++) {
      const ms = document.createElement('div');
      ms.className = 'memory-slot';
      if (i < speechState.activePhrases.length) ms.classList.add('filled');
      slotCont.appendChild(ms);
    }
  }
  cont.innerHTML = '';
  speechState.savedPhrases.forEach(p => {
    const card = createPhraseCard(p);
    if (speechState.activePhrases.includes(p)) card.classList.add('active');
    card.addEventListener('click', () => {
      togglePhraseActive(p);
      showPhraseDetails(p);
    });
    cont.appendChild(card);
  });
}

function togglePhraseActive(phrase) {
  const idx = speechState.activePhrases.indexOf(phrase);
  if (idx >= 0) {
    speechState.activePhrases.splice(idx, 1);
  } else if (speechState.activePhrases.length < speechState.memorySlots) {
    speechState.activePhrases.push(phrase);
  }
  renderHotbar();
  renderSavedPhraseCards();
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
  const def = buildPhraseDef(wordsArr);
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
    if (!words.verbs.includes('Murmur') && !words.targets.includes('Mind')) {
      words.verbs.push('Murmur');
      glowConstructToggle();
      renderLists();
    } else {
      renderLists();
    }
    renderSlots();
    checkUnlocks();
  }
  renderXpBar();
  window.dispatchEvent(new CustomEvent('speech-xp-changed'));
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
  if (!speechState.constructUnlocked && speechState.level >= 2) {
    speechState.constructUnlocked = true;
    const toggle = container.querySelector('#constructToggle');
    if (toggle) toggle.style.display = 'block';
    toggleConstructPanel(true);
    addLog('You feel your words press outward. You may now construct meaning.', 'info');
  }
  if (speechState.level >= 2 && !words.targets.includes('Mind')) {
    words.targets.push('Mind');
    wordState.targets['Mind'] = { level: 1, xp: 0 };
    addLog('Your awareness turns inward. Target "Mind" unlocked.', 'info');
    const murmurBtn = container.querySelector('#murmurBtn');
    if (murmurBtn) murmurBtn.remove();
    if (!speechState.activePhrases.includes('Murmur Mind')) speechState.activePhrases.push('Murmur Mind');
    if (!speechState.savedPhrases.includes('Murmur Mind')) speechState.savedPhrases.push('Murmur Mind');
    speechState.capacity += 1;
    renderSlots();
    renderHotbar();
    renderSavedPhraseCards();
    glowConstructToggle();
    renderLists();
  }
  if (speechState.level >= 3) {
    speechState.capacity = Math.max(speechState.capacity, 2);
  }
  if (speechState.level >= 8 && !words.verbs.includes('Chant')) {
    words.verbs.push('Chant');
    wordState.verbs['Chant'] = { level: 1, xp: 0 };
    addLog('Verb unlocked: Chant', 'info');
    glowConstructToggle();
    renderLists();
  }
  const thought = speechState.resources.thought.current;
  if (!speechState.formUnlocked && Math.floor(thought + 1e-6) >= FORM_UNLOCK_THOUGHT_REQ) {
    speechState.formUnlocked = true;
    if (!words.targets.includes('Form')) {
      words.targets.push('Form');
      wordState.targets['Form'] = { level: 1, xp: 0 };
    }
    speechState.resources.structure.unlocked = true;
    addLog('A concept stabilizes… Form is now available.', 'info');
    glowConstructToggle();
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
    const box = document.createElement('div');
    box.className = 'resource-box';

    const header = document.createElement('div');
    header.className = 'resource-text';

    const icon = document.createElement('i');
    icon.dataset.lucide = key === 'thought' ? 'brain' : key === 'structure' ? 'brick-wall' : 'cube';
    const name = document.createElement('span');
    name.className = 'resource-name';
    name.textContent = capFirst(key);
    const value = document.createElement('span');
    value.className = `resource-value ${key}`;
    value.textContent = `${Math.floor(res.current)}/${res.max}`;

    header.appendChild(icon);
    header.appendChild(name);
    header.appendChild(value);

    const bar = document.createElement('div');
    bar.className = 'resource-bar';
    const fill = document.createElement('div');
    fill.className = `resource-fill ${key}`;
    fill.style.width = `${(res.current / res.max) * 100}%`;
    bar.appendChild(fill);

    box.appendChild(header);
    box.appendChild(bar);
    panel.appendChild(box);
  });
  if (window.lucide) lucide.createIcons();
  window.dispatchEvent(new CustomEvent('resources-changed'));
}

function renderGains() {
  const panel = document.getElementById('speechGains');
  if (!panel) return;
  panel.innerHTML = '';
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
    renderSlots();
  } else if (name === 'expandMind') {
    speechState.orbs.insight.max += 10;
  }
  renderUpgrades();
  renderGains();
  renderOrbs();
  renderResources();
  renderPhraseInfo();
}

export function renderUpgrades() {
  const panel = document.getElementById('speechUpgrades');
  if (!panel) return;
  panel.innerHTML = '';
  const panels = [panel];
  if (!panels.length) return;
  panels.forEach(p => (p.innerHTML = ''));
  const addSection = title => {
    const h = document.createElement('h4');
    h.className = 'section-title';
    h.textContent = title;
    panels.forEach(p => p.appendChild(h.cloneNode(true)));
  };

  addSection('Core Upgrades');
  const coreGroups = panels.map(p => {
    const div = document.createElement('div');
    div.className = 'upgrade-group';
    p.appendChild(div);
    return div;
  });
  const coreUp = [
    ['cohere', `Cohere Lv.${speechState.upgrades.cohere.level}`],
    ['expandMind', `Expand Mind Lv.${speechState.upgrades.expandMind.level}`]
  ];
  coreUp.forEach(([name, label]) => {
    coreGroups.forEach(g => {
      const btn = document.createElement('button');
      const cost = getUpgradeCost(name);
      btn.innerHTML = `${label} (${formatCost(cost)})`;
      btn.addEventListener('click', () => purchaseUpgrade(name));
      g.appendChild(btn);
    });
  });

  addSection('Vocal Growth');
  const vocalGroups = panels.map(p => {
    const div = document.createElement('div');
    div.className = 'upgrade-group';
    p.appendChild(div);
    return div;
  });
  const vocalUp = [];
  if (speechState.upgrades.vocalMaturity.unlocked)
    vocalUp.push(['vocalMaturity', `Vocal Maturity Lv.${speechState.upgrades.vocalMaturity.level}`]);
  if (speechState.upgrades.capacityBoost.unlocked)
    vocalUp.push(['capacityBoost', 'Capacity +2']);
  vocalUp.forEach(([name, label]) => {
    vocalGroups.forEach(g => {
      const btn = document.createElement('button');
      const cost = getUpgradeCost(name);
      btn.innerHTML = `${label} (${formatCost(cost)})`;
      btn.addEventListener('click', () => purchaseUpgrade(name));
      g.appendChild(btn);
    });
  });
  window.dispatchEvent(new CustomEvent('upgrades-changed'));
}

export function tickSpeech(delta) {
  if (!container) return;
  const dt = delta / 1000;
  ['insight', 'body', 'will'].forEach(k => {
    const orb = speechState.orbs[k];
    const rate = speechState.gains[k];
    if (rate > 0) {
      if (coreState.meditating) {
        coreState.meditationProgress += rate * dt;
      } else if (orb.current < orb.max) {
        orb.current = Math.min(orb.max, orb.current + rate * dt);
      }
    }
  });
  renderOrbs();
  renderResources();
  refreshCore();
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

function showPhraseDetails(phrase) {
  if (!container) return;
  const info = container.querySelector('#phraseDetails');
  if (!info) return;
  const wordsArr = phrase.split(' ');
  const def = buildPhraseDef(wordsArr);
  if (!def) {
    info.textContent = '';
    return;
  }
  const potMult =
    (wordsArr.reduce((a, w) => a + getWordPotency(w), 0) / wordsArr.length) *
    def.potency;
  const costHtml = Object.entries(def.cost)
    .map(
      ([k, v]) =>
        `<span class="info-tag" style="background:${orbColor(k)}">Cost: ${Math.ceil(
          v * potMult
        )} ${resourceIcons[k] || capFirst(k)}</span>`
    )
    .join(' ');
  const effectHtml = def.create
    ? Object.entries(def.create)
        .map(
          ([k, v]) =>
            `<span class="info-tag" style="background:${orbColor(k)}">Effect: +${(
              v * potMult
            ).toFixed(1)} ${resourceIcons[k] || capFirst(k)}</span>`
        )
        .join(' ')
    : `<span class="info-tag">Effect: None</span>`;
  const cdHtml = `<span class="info-tag">CD: ${def.cd ? def.cd / 1000 + 's' : '0s'}</span>`;
  const complexity =
    (def.complexity.verb || 0) +
    (def.complexity.target || 0) +
    (def.complexity.modifier || 0);
  const mastery = speechState.level + speechState.masteryBonus;
  const difficulty = complexity;
  const chance = (0.95 / (1 + Math.exp(difficulty - mastery - 0.2))) * 100;
  const chanceHtml = `<span class="info-tag">Chance: ${chance.toFixed(1)}%</span>`;
  info.innerHTML = `${costHtml} ${effectHtml} ${cdHtml} ${chanceHtml}`;
}
