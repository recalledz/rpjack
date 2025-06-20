import { LifeGame, Activity } from './lifeCore.js';
import { addCoreXP } from './core.js';

let game;
let actionsContainer;
let resourcesContainer;
let activityDisplay;
let staminaFill;
let tickTimer;

function initActivities() {
  game.addActivity(new Activity('ponder', {
    label: 'Ponder',
    skill: 'mentalAcuity',
    resource: 'thought',
    rate: 1,
    tags: ['mental'],
    stamina: 1
  }));
  game.addActivity(new Activity('walk', {
    label: 'Walk',
    skill: 'physicalCondition',
    resource: 'discovery',
    rate: 1,
    xpRate: 0.01,
    tags: ['physical', 'body'],
    stamina: -3
  }));
  game.addActivity(new Activity('read', {
    label: 'Read',
    skill: 'literacy',
    resource: 'knowledge',
    rate: 0.2,
    xpRate: 0.1,
    tags: ['mental'],
    stamina: -1,
    unlock: g => g.skills.mentalAcuity.level >= 1
  }));
}

function renderActions() {
  if (!actionsContainer) return;
  actionsContainer.innerHTML = '';
  Object.values(game.activities).forEach(act => {
    if (!act.unlock(game)) return;
    const btn = document.createElement('button');
    btn.textContent = act.label;
    if (game.current === act.id) btn.classList.add('active');
    btn.addEventListener('click', () => {
      if (game.current === act.id) game.stop(); else game.start(act.id);
      renderActions();
      renderActivity();
    });
    actionsContainer.appendChild(btn);
  });
}

function renderResources() {
  if (!resourcesContainer) return;
  resourcesContainer.innerHTML = '';
  Object.entries(game.resources).forEach(([k, r]) => {
    if (k === 'stamina') return;
    const row = document.createElement('div');
    row.classList.add('resource-entry');
    row.textContent = `${k}: ${r.amount.toFixed(1)}`;
    resourcesContainer.appendChild(row);
  });
  staminaFill.style.width = `${(game.resources.stamina.amount / game.staminaMax) * 100}%`;
}

function renderSkillsList(container) {
  if (!container) return;
  container.innerHTML = '';
  Object.values(game.skills).forEach(s => {
    const row = document.createElement('div');
    row.classList.add('skill-entry');
    row.textContent = `${s.displayName}: Lv ${s.level} (${s.xp.toFixed(1)}/${s.threshold})`;
    container.appendChild(row);
  });
}

function renderActivity() {
  if (!activityDisplay) return;
  const act = game.activities[game.current];
  activityDisplay.textContent = act ? `${act.label}...` : '';
}

function tick() {
  game.tick(1, addCoreXP);
  renderResources();
  renderSkillsList(document.querySelector('.skills-list'));
  renderActivity();
  saveState();
}

function saveState() {
  const data = {
    skills: Object.fromEntries(Object.entries(game.skills).map(([k,s]) => [k,{level:s.level,xp:s.xp,threshold:s.threshold}])) ,
    resources: Object.fromEntries(Object.entries(game.resources).map(([k,r])=>[k,{amount:r.amount,total:r.total}])) ,
    current: game.current
  };
  localStorage.setItem('lifeGame', JSON.stringify(data));
}

function loadState() {
  const raw = localStorage.getItem('lifeGame');
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    Object.entries(data.skills||{}).forEach(([k,v])=>{
      if (game.skills[k]) {
        game.skills[k].level = v.level;
        game.skills[k].xp = v.xp;
        game.skills[k].threshold = v.threshold;
      }
    });
    Object.entries(data.resources||{}).forEach(([k,v])=>{
      if (game.resources[k]) {
        game.resources[k].amount = v.amount;
        game.resources[k].total = v.total;
      }
    });
    if (data.current) game.start(data.current);
  } catch(e) {}
}

export function initPlayerLife() {
  game = new LifeGame();
  actionsContainer = document.querySelector('.core-actions');
  resourcesContainer = document.querySelector('.core-resources');
  activityDisplay = document.getElementById('coreActivityText');
  staminaFill = document.getElementById('staminaFill');
  initActivities();
  loadState();
  renderActions();
  renderResources();
  renderSkillsList(document.querySelector('.skills-list'));
  if (!tickTimer) tickTimer = setInterval(tick, 1000);
}

export function refreshPlayerLife() {
  renderActions();
  renderResources();
  renderSkillsList(document.querySelector('.skills-list'));
}

export { renderSkillsList };
