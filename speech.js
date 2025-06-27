export const speechState = {
  orbs: {
    body: { current: 10, max: 10 },
    insight: { current: 10, max: 10 },
    will: { current: 10, max: 10 }
  },
  xp: 0,
  capacity: 3,
  slots: [null, null, null],
  cooldowns: {},
  echo: []
};

const words = {
  verbs: ['Murmur', 'Speak'],
  targets: ['Form', 'Insight', 'Life'],
  modifiers: ['Accelerated', 'Inwardly']
};

const phraseEffects = {
  'Murmur Insight Inwardly': { cost: { insight: 1 }, xp: 1, cd: 2000 },
  'Speak Form': { cost: { insight: 2 }, xp: 2, cd: 3000 },
  'Murmur Life Accelerated': { cost: { insight: 1, body: 1 }, xp: 1, cd: 1500 }
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
    <div class="word-list" id="targetList"></div>
    <div class="word-list" id="modifierList"></div>
    <div class="phrase-slots">
      <div class="phrase-slot" data-index="0"></div>
      <div class="phrase-slot" data-index="1"></div>
      <div class="phrase-slot" data-index="2"></div>
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
}

function onDrag(e) {
  e.dataTransfer.setData('text/type', e.target.dataset.type);
  e.dataTransfer.setData('text/word', e.target.dataset.word);
}

function onDrop(e) {
  const type = e.dataTransfer.getData('text/type');
  const word = e.dataTransfer.getData('text/word');
  const idx = Number(e.currentTarget.dataset.index);
  const expected = idx === 0 ? 'verb' : idx === 1 ? 'target' : 'modifier';
  if (type !== expected) return;
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
  const targetList = container.querySelector('#targetList');
  words.targets.forEach(w => targetList.appendChild(makeTile(w, 'target')));
  const modList = container.querySelector('#modifierList');
  words.modifiers.forEach(w => modList.appendChild(makeTile(w, 'modifier')));
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
  if (wordsArr.length < 2) return;
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
  speechState.xp += def.xp;
  speechState.cooldowns[phrase] = Date.now() + def.cd;
  speechState.echo.unshift(`Used ${phrase} (-${Object.entries(def.cost).map(([k,v])=>v+" "+k).join(', ')})`);
  if (speechState.echo.length > 5) speechState.echo.pop();
  renderOrbs();
  renderEcho();
}

function renderEcho() {
  const log = container.querySelector('#echoLog');
  log.innerHTML = speechState.echo.map(e => `<div>${e}</div>`).join('');
}
