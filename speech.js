export const speechState = {
  orbs: {
    body: { current: 0, max: 10 },
    insight: { current: 0, max: 10 },
    will: { current: 0, max: 10 }
  },
  resources: {
    thought: { current: 0, max: 30 }
  },
  gains: {
    body: 0,
    insight: 1,
    will: 0
  },
  upgrades: {
    cohere: { level: 0, baseCost: 2 }
  },
  capacity: 1,
  slots: [null],
  cooldowns: {},
  echo: []
};

const words = {
  verbs: ['Murmur']
};

const phraseEffects = {
  Murmur: { cost: { insight: 2 }, create: { thought: 1 }, cd: 1000 }
};

let container;

export function initSpeech() {
  container = document.getElementById('speechPanel');
  if (!container) return;
  container.innerHTML = `
    <div class="speech-orbs">
      <div class="speech-orb" id="orbBody"></div>
      <div class="speech-orb" id="orbInsight"></div>
      <div class="speech-orb" id="orbWill"></div>
    </div>
    <div class="word-list" id="verbList"></div>
    <div class="phrase-slots">
      <div class="phrase-slot" data-index="0"></div>
      <button id="castPhraseBtn">Cast</button>
    </div>
    <div class="echo-log" id="echoLog"></div>
  `;
  renderLists();
  renderOrbs();
  container.querySelectorAll('.phrase-slot').forEach(slot => {
    slot.addEventListener('dragover', e => e.preventDefault());
    slot.addEventListener('drop', onDrop);
  });
  container.querySelectorAll('.word-tile').forEach(t => {
    t.addEventListener('dragstart', onDrag);
  });
  const castBtn = container.querySelector('#castPhraseBtn');
  castBtn.addEventListener('click', castPhrase);
  renderSlots();
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
  if (type !== 'verb') return;
  speechState.slots[idx] = word;
  renderSlots();
}

function renderLists() {
  const makeTile = (word, type) => {
    const d = document.createElement('div');
    d.className = 'word-tile';
    d.textContent = word;
    d.draggable = true;
    d.dataset.type = type;
    d.dataset.word = word;
    return d;
  };
  const verbList = container.querySelector('#verbList');
  words.verbs.forEach(w => verbList.appendChild(makeTile(w, 'verb')));
}

function renderOrbs() {
  container.querySelector('#orbBody').textContent = `Body: ${speechState.orbs.body.current}/${speechState.orbs.body.max}`;
  container.querySelector('#orbInsight').textContent = `Insight: ${speechState.orbs.insight.current}/${speechState.orbs.insight.max}`;
  container.querySelector('#orbWill').textContent = `Will: ${speechState.orbs.will.current}/${speechState.orbs.will.max}`;
}

function renderSlots() {
  container.querySelectorAll('.phrase-slot').forEach(slot => {
    const idx = Number(slot.dataset.index);
    slot.textContent = speechState.slots[idx] || '';
  });
}

function castPhrase() {
  const wordsArr = speechState.slots.filter(Boolean);
  if (wordsArr.length < 1) return;
  const phrase = wordsArr.join(' ');
  const def = phraseEffects[phrase];
  if (!def) return;
  if (speechState.cooldowns[phrase] && Date.now() < speechState.cooldowns[phrase]) return;
  for (const [orb, cost] of Object.entries(def.cost)) {
    if (speechState.orbs[orb].current < cost) return;
  }
  for (const [orb, cost] of Object.entries(def.cost)) {
    speechState.orbs[orb].current -= cost;
  }
  if (def.create) {
    for (const [res, amt] of Object.entries(def.create)) {
      const r = speechState.resources[res];
      if (r) r.current = Math.min(r.max, r.current + amt);
    }
  }
  speechState.cooldowns[phrase] = Date.now() + def.cd;
  speechState.echo.unshift(`Used ${phrase}`);
  if (speechState.echo.length > 5) speechState.echo.pop();
  renderOrbs();
  renderResources();
  renderEcho();
}

function renderEcho() {
  const log = container.querySelector('#echoLog');
  log.innerHTML = speechState.echo.map(e => `<div>${e}</div>`).join('');
}

function renderResources() {
  const panel = document.getElementById('secondaryResources');
  if (!panel) return;
  panel.innerHTML = '';
  Object.entries(speechState.resources).forEach(([key, res]) => {
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
  return Math.floor(up.baseCost * Math.pow(2, up.level));
}

function purchaseUpgrade(name) {
  const up = speechState.upgrades[name];
  const cost = getUpgradeCost(name);
  if (speechState.orbs.insight.current < cost) return;
  speechState.orbs.insight.current -= cost;
  up.level += 1;
  speechState.gains.insight += 0.5;
  renderUpgrades();
  renderGains();
  renderOrbs();
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
}

export function tickSpeech(delta) {
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
}
