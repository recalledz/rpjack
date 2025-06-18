export const lifeResources = {
  focus: 0,
  cleanliness: 0,
  knowledge: 0,
  mentalHealth: 0,
  preparedness: 0,
  cash: 0
};

const RESOURCE_CAP = 100;
const CASH_CAP = 9999;

const skills = {
  focus: { xp: 0 },
  cleanliness: { xp: 0 },
  knowledge: { xp: 0 },
  mentalHealth: { xp: 0 },
  preparedness: { xp: 0 }
};

const actions = [
  {
    id: 'meditate',
    label: 'Meditate',
    skill: 'focus',
    resource: 'focus',
    xpGain: 1,
    resGain: 1,
    unlockSkill: null,
    unlockXp: 0
  },
  {
    id: 'cleanRoom',
    label: 'Clean Room',
    skill: 'cleanliness',
    resource: 'cleanliness',
    xpGain: 1,
    resGain: 1,
    unlockSkill: 'focus',
    unlockXp: 5
  },
  {
    id: 'readBook',
    label: 'Read Book',
    skill: 'knowledge',
    resource: 'knowledge',
    xpGain: 1,
    resGain: 1,
    unlockSkill: 'cleanliness',
    unlockXp: 5
  },
  {
    id: 'writeJournal',
    label: 'Write Journal',
    skill: 'mentalHealth',
    resource: 'mentalHealth',
    xpGain: 1,
    resGain: 1,
    unlockSkill: 'knowledge',
    unlockXp: 5
  },
  {
    id: 'jobSearch',
    label: 'Job Search',
    skill: 'preparedness',
    resource: 'preparedness',
    xpGain: 1,
    resGain: 1,
    unlockSkill: 'mentalHealth',
    unlockXp: 5
  }
];

let getGameCash = () => 0;
let spendGameCash = () => 0;
let actionsContainer;
let resourcesContainer;

function addResource(key, amt) {
  const cap = key === 'cash' ? CASH_CAP : RESOURCE_CAP;
  lifeResources[key] = Math.min(cap, lifeResources[key] + amt);
}

function performAction(action) {
  addResource(action.resource, action.resGain);
  skills[action.skill].xp += action.xpGain;
  renderResources();
  renderActions();
}

function isActionUnlocked(action) {
  if (!action.unlockSkill) return true;
  return skills[action.unlockSkill].xp >= action.unlockXp;
}

function renderActions() {
  if (!actionsContainer) return;
  actionsContainer.innerHTML = '';
  actions.forEach(act => {
    if (!isActionUnlocked(act)) return;
    const btn = document.createElement('button');
    btn.textContent = act.label;
    btn.addEventListener('click', () => performAction(act));
    actionsContainer.appendChild(btn);
  });
  const transfer = document.createElement('button');
  transfer.textContent = 'Transfer Cash';
  transfer.addEventListener('click', transferCashFromGame);
  actionsContainer.appendChild(transfer);
}

function renderResources() {
  if (!resourcesContainer) return;
  resourcesContainer.innerHTML = '';
  ['focus','cleanliness','knowledge','mentalHealth','preparedness','cash']
    .forEach(k => {
      const row = document.createElement('div');
      row.classList.add('resource-entry');
      row.textContent = `${k.charAt(0).toUpperCase()+k.slice(1)}: ${lifeResources[k]}`;
      resourcesContainer.appendChild(row);
    });
}

export function transferCashFromGame() {
  const available = Math.min(getGameCash(), CASH_CAP - lifeResources.cash);
  if (available <= 0) return;
  spendGameCash(available);
  addResource('cash', available);
  renderResources();
}

export function initPlayerLife(opts = {}) {
  getGameCash = opts.getGameCash || getGameCash;
  spendGameCash = opts.spendGameCash || spendGameCash;
  actionsContainer = document.querySelector('.player-actions');
  resourcesContainer = document.querySelector('.player-resources');
  renderActions();
  renderResources();
}

export function refreshPlayerLife() {
  renderActions();
  renderResources();
}
