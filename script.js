
import generateDeck from "./card.js"

let drawnCards = []
let cash = 0

/*let pLifeMax = 10
let pLifeCurrent = pLifeMax
let pDamage = 0
let pRegen = 0
let cashMulti = 0
let damageMultiplier = 0*/



let stageData = {
  world: 1,
  stage: 1,
  dealerLifeMax: 10,
  dealerLifeCurrent: 10,
  stageDamageMultiplier: 1.05,
  kills: 0,
  cardXp: 1,
  playerXp: 1,
  dDamage: 1,
  attackspeed: 10000, //10 sec at start
}

let pDeck = generateDeck()
let deck = [...pDeck]

const btn = document.getElementById("clickalipse")
const attackBtn = document.getElementById("attackBtn")
const nextStageBtn = document.getElementById("nextStageBtn")
const pointsDisplay = document.getElementById("pointsDisplay")
const cashDisplay = document.getElementById("cashDisplay")
/*const drawCostDisplay = document.getElementById("drawCashCost")*/
const handContainer = document.getElementsByClassName("handContainer")[0]
const dealerContainer = document.getElementsByClassName("dealerContainer")[0]
const dealerLifeDisplay = document.getElementsByClassName("dealerLifeDisplay")[0]
const pContainer = document.getElementsByClassName("pContainer")[0]
const pLifeDisplay = document.getElementsByClassName("pLifeDisplay")[0]
const killsDisplay = document.getElementById("kills")
const deckTabContainer = document.getElementsByClassName("deckTabContainer")[0];
const dCardContainer = document.getElementsByClassName("dCardContainer")[0]


//=========tabs==========

const mainTabButton = document.getElementsByClassName("mainTabButton")[0];
const deckTabButton = document.getElementsByClassName("deckTabButton")[0];
const mainTab = document.querySelector(".mainTab");
const deckTab = document.querySelector(".deckTab");
const tooltip = document.getElementById("tooltip");

function hideTab() {
  mainTab.style.display = "none";
  deckTab.style.display = "none";
}

function showTab(tab) {
  hideTab();
  tab.style.display = "grid";
}

mainTabButton.addEventListener("click", () => {
  showTab(mainTab)
})

deckTabButton.addEventListener("click", () => {
  showTab(deckTab);
})

showTab(mainTab);
//=========card tab==========

function renderTabCard(card) {
  // 1) Wrapper
  const wrapper = document.createElement("div");
  wrapper.classList.add("card-wrapper");

  // 2) Card pane (value / suite / HP)
  const cardPane = document.createElement("div");
  cardPane.classList.add("card");
  cardPane.innerHTML = `
    <div class="card-value">${card.value}</div>
    <div class="card-suit">${card.symbol}</div>
    <div class="card-hp">HP: ${card.currentHp}/${card.maxHp}</div>
  `;

  // 3) XP bar
  const xpBar     = document.createElement("div");
  const xpBarFill = document.createElement("div");
  const xpLabel   = document.createElement("div");
  xpBar.classList.add("xpBar");
  xpBarFill.classList.add("xpBarFill");
  xpLabel.classList.add("xpBarLabel");
  xpLabel.textContent =
    `LV: ${card.currentLevel} XP: ${card.XpCurrent}/${Math.floor(card.XpReq)}`;
  xpBar.append(xpBarFill, xpLabel);

  // 4) Store references on the card object for deck tab
  card.deckXpBarFill = xpBarFill;
  card.deckXpLabel = xpLabel;
  card.deckHpDisplay = cardPane.querySelector(".card-hp");

  // 5) Nest and append
  wrapper.append(cardPane, xpBar);
  deckTabContainer.appendChild(wrapper);

  wrapper.addEventListener("mouseover", e => {
      tooltip.innerHTML = `
        <strong>${card.value}${card.symbol}</strong><br>
        Level: ${card.currentLevel}<br>
        XP: ${card.XpCurrent}/${card.XpReq}<br>
        Damage: ${card.damage}<br>
      `;
      tooltip.style.display = "block";
    });
  
    // move with the mouse
    wrapper.addEventListener("mousemove", e => {
      // offset so the tip doesn’t sit *under* the cursor
      tooltip.style.left = e.pageX + 10 + "px";
      tooltip.style.top  = e.pageY + 10 + "px";
    });
  
    // hide when you leave
    wrapper.addEventListener("mouseout", () => {
      tooltip.style.display = "none";
    }); 
}

for (let i = 0; i < deck.length; i++) {
  renderTabCard(deck[i]);
}

function updateDeckDisplay() {
  deck.forEach(card => {
    // Skip if card doesn't have deck tab elements
    if (!card.deckXpBarFill || !card.deckXpLabel) return;
    
    // 1) XP bar for deck tab
    const pct = (card.XpCurrent / card.XpReq) * 100;
    card.deckXpBarFill.style.width = `${Math.min(pct, 100)}%`;

    // 2) XP/Level/Damage label for deck tab
    card.deckXpLabel.textContent =
      `LV: ${card.currentLevel} ` +
      `XP: ${card.XpCurrent}/${Math.floor(card.XpReq)}`;

    // 3) Update HP in deck tab
    if (card.deckHpDisplay) {
      card.deckHpDisplay.textContent =
        `HP: ${card.currentHp}/${card.maxHp}`;
    }

    // 4) If this card is currently on the field, update its HP too
    if (card.hpDisplay) {
      card.hpDisplay.textContent =
        `HP: ${card.currentHp}/${card.maxHp}`;
    }
  });
}

//========render functions==========
document.addEventListener("DOMContentLoaded", () => {
  // now the DOM is in, and lucide.js has run, so window.lucide is defined
  renderDealerCard();  // or whatever your init is
});


function renderStage () {
  const stageDisplay = document.getElementById("stage");
  stageDisplay.textContent = `Stage ${stageData.stage}`
}

function renderPlifeDisplay () {
  const stats = playerStats();
  pLifeDisplay.textContent = `Life: ${stats.pLifeCurrent}/${stats.pLifeMax}`;
  const pBarFill = document.getElementById("pBarFill");
  pBarFill.style.width = `${stats.pLifeCurrent/stats.pLifeMax*100}%`;
}

function renderPlayerStats (stats) {
  const damageDisplay= document.getElementById("damageDisplay");
  const lifeMultiDisplay = document.getElementById("lifeMultiDisplay");
  const cashMultiDisplay = document.getElementById("cashMultiDisplay");
  const regenDisplay = document.getElementById("regenDisplay");
  
  damageDisplay.textContent = `Damage: ${Math.floor(stats.pDamage)}`;
  lifeMultiDisplay.textContent = `Life Max: ${Math.floor(stats.pLifeMax)}`;
  cashMultiDisplay.textContent = `Cash Multi: ${Math.floor(stats.cashMulti)}`;
  regenDisplay.textContent = `Regen: ${stats.pRegen}`;
  pointsDisplay.textContent = `Points: ${stats.points}`;
  
}

function renderDealerCard() {
  let dDamageMin = 0.5 * stageData.stage + 1;
  let dDamageMax = Math.max(stageData.stage, dDamageMin)
  let dCardAdder = document.createElement("span");
  let cardEffect = null;
  dCardAdder.classList.add("dCard");

  dCardAdder.innerHTML = `
  <i data-lucide="skull" class="dCard__icon"></i>
  <span class="dCard__text">
    Damage: ${dDamageMin} - ${dDamageMax}
  </span>`

dCardContainer.appendChild(dCardAdder);
/*dCardAdder.textContent = `Damage: ${dDamage} D ${stageData.stage}`*/
lucide.createIcons();
}

function renderCardHp() {
  drawnCards[0].textContent =
    `HP: ${card.currentHp}/${card.maxHp}`;
}

function animateCardHit(card) {
  const w = card.wrapperElement;
  w.classList.add("hit-animate");
  w.addEventListener("animationend", () => w.classList.remove("hit-animate"), { once: true });
}

//=========stage functions===========

function nextStage() {
  stageData.stage  += 1;
  stageData.kills = 0;
  killsDisplay.textContent = `Kills: ${stageData.kills}`
  nextStageChecker();
  renderStage();
  respawnDealerStage();
}

/*function drawCashCost() {
  let totalDrawnCards = 52 - deck.length;
  let drawnCardsFactor = drawnCards.length;
  let cashCost = Math.floor(1+(stageData.stage * Math.pow(drawnCardsFactor, 0.5) * totalDrawnCards));
  console.log(cashCost, totalDrawnCards,  drawnCardsFactor, stageData.stage)
  return cashCost
}*/

/*function drawCostChecker () {
  
  if (cash <= drawCashCost()) {
    btn.disabled = true
    btn.style.background = cash < drawCashCost() ? "grey" : "green";
  } else {
    cash -= drawCashCost();
    cashDisplay.textContent = `Cash: $${cash}`;
    btn.disabled = false
  }
*/

function nextStageChecker () {
    nextStageBtn.disabled = stageData.kills < 1;
    nextStageBtn.style.background = stageData.kills < 1 ? "grey" : "green"
}


function spawnDealer() {
  const dealerContainerLife = document.createElement("div");
  const dealerBarFill = document.createElement("div")

  dealerContainerLife.classList.add("dealerLifeContainer");
  dealerBarFill.id ="dealerBarFill";

  dealerContainerLife.appendChild(dealerBarFill);
  dealerLifeDisplay.insertAdjacentElement("afterend", dealerContainerLife);
  dealerLifeDisplay.textContent = `Life: ${stageData.dealerLifeMax}`
}

function respawnDealer() {
  dealerDeathAnimation()
  stageData.dealerLifeCurrent = stageData.dealerLifeMax;
  dealerLifeDisplay.textContent = `Life: ${stageData.dealerLifeCurrent}/${stageData.dealerLifeMax}`
  dealerLifeBar(); 
}

function respawnDealerStage() {
  stageData.dealerLifeMax = Math.floor(stageData.dealerLifeMax * (Math.pow(stageData.stage, 0.5)));
  stageData.dealerLifeCurrent = stageData.dealerLifeMax;
  dealerLifeDisplay.textContent = `Life: ${stageData.dealerLifeCurrent}/${stageData.dealerLifeMax}`
  dealerLifeBar()
}

function dealerLifeBar() {
  const dealerBarFill = document.getElementById("dealerBarFill")
  dealerBarFill.style.width = `${stageData.dealerLifeCurrent/stageData.dealerLifeMax*100}%`
}

function pdealerDamage() {
  const stats = playerStats();
  
  
  stageData.dDamage = Math.floor((Math.random() * 0.5 + 0.5) * stageData.stage) + 1;
  if (stats.pLifeCurrent <= 0) {
    respawnPlayer();
    stageData.stage = 1;
  }
  stats.pLifeCurrent = stats.pLifeCurrent - stageData.dDamage;
  return stageData.dDamage;
}

function cdealerDamage() {
  stageData.dDamage = Math.floor(
    (Math.random() * 0.5 + 0.5) * stageData.stage
  ) + 1;

  // if there’s no card, nothing to do
  if (drawnCards.length === 0) return;

  // target the front‐line card
  const card = drawnCards[0];

  // subtract **one** hit’s worth
  card.currentHp = Math.max(0, card.currentHp - stageData.dDamage);

  // update its specific HP display
  card.hpDisplay.textContent =
    `HP: ${card.currentHp}/${card.maxHp}`;
  updateDeckDisplay()
  animateCardHit(card)
  // if it’s dead, remove it
  if (card.currentHp === 0) {
    // 1) from your data
    drawnCards.shift();
    // 2) from the DOM
    card.wrapperElement.remove();
  }
}

function dealerDeathAnimation() {
  const dCard = document.querySelector(".dCard:last-child");

  if (!dCard) return;
  dCard.classList.add("dealer-dead");
  dCard.addEventListener("transitionend", e => {
    dCardContainer.innerHTML = "";
    renderDealerCard()
  }, { once: true });
}

//========deck functions===========

function cardXp() {
  drawnCards.forEach(card => {
    if (!card) return;
    card.XpCurrent += stageData.stage;
    while (card.XpCurrent >= card.XpReq) {
      card.XpCurrent -= card.XpReq;
      card.currentLevel++;
      card.XpReq += card.currentLevel * 1.7 * (card.value ** 2);
      card.damage = card.baseDamage * card.currentLevel;
      card.maxHp = card.value * card.currentLevel;
      card.currentHp = card.maxHp
    }
  });

  // refresh both UIs
  updateHandDisplay();    // paints hand bars & HP
  updateDeckDisplay();    // paints deck tab bars
}

/**
 * Draws the top card from `Deck` into `intoHand`.
 * Renders it with `renderFn` and then calls `updateFn`.
 * Returns the drawn card, or null if the deck was empty.
 */
function drawCard() {
  const stats = playerStats();
  // 1) Nothing to draw?
  if (deck.length === 0) return null;

  // 2) Take the *same* object out of deck…
  const card = deck.shift();

  // 3) …put it into your hand…
  drawnCards.push(card);

  // 4) render just that one card in the hand…
  renderCard(card);

  // 5) refresh any other UI that shows the deck
  updateDeckDisplay();
  console.log(card)
  renderPlayerStats(stats);
  // 6) return the drawn card
  return card;
}

function updateHandDisplay () {
  drawnCards.forEach(card => {
    if (!card || !card.hpDisplay) return; // Skip if card or elements are missing
    card.hpDisplay.textContent =`HP: ${card.currentHp}/${card.maxHp}`;
    card.xpLabel.textContent = `LV: ${card.currentLevel} XP: ${card.XpCurrent}/${Math.floor(card.XpReq)}`;
    card.xpBarFill.style.width = `${card.XpCurrent/card.XpReq*100}%`;
  });
}

function renderCard(card) {
  // 1) Wrapper
  const wrapper = document.createElement("div");
  wrapper.classList.add("card-wrapper");

  // 2) Card pane (value / suite / HP)
  const cardPane = document.createElement("div");
  cardPane.classList.add("card");
  cardPane.innerHTML = `
    <div class="card-value">${card.value}</div>
    <div class="card-suit">${card.symbol}</div>
    <div class="card-hp">HP: ${card.currentHp}/${card.maxHp}</div>
  `;

  // 3) XP bar
  const xpBar     = document.createElement("div");
  const xpBarFill = document.createElement("div");
  const xpLabel   = document.createElement("div");
  xpBar.classList.add("xpBar");
  xpBarFill.classList.add("xpBarFill");
  xpLabel.classList.add("xpBarLabel");
  xpLabel.textContent =
    `LV: ${card.currentLevel} XP: ${card.XpCurrent}/${Math.floor(card.XpReq)}`;
  xpBar.append(xpBarFill, xpLabel);

  // 4) Nest and append
  wrapper.append(cardPane, xpBar);
  handContainer.appendChild(wrapper);

  // 5) Save references for later updates
  card.wrapperElement = wrapper;
  card.hpDisplay      = cardPane.querySelector(".card-hp");
  card.xpBar          = xpBar;
  card.xpBarFill      = xpBarFill;
  card.xpLabel        = xpLabel;
}

function heartHeal () {
  if (drawnCards.length === 0) return;

  const target = drawnCards[0];
  if (target.currentHp === target.maxHp) return;

  drawnCards.forEach(card => {
    if (card.suit === "Hearts") {
      target.currentHp = Math.min
        (target.currentHp + card.currentLevel, target.maxHp
        );
    }
  });
  target.hpDisplay.textContent =
  `HP: ${target.currentHp}/${target.maxHp}`;
}
  
//=========player functions===========


function spawnPlayer() {
  const stats = playerStats();
  const pContainerLife = document.createElement("div");
  const pBarFill = document.createElement("div")

  pContainerLife.classList.add("pLifeContainer");
  pBarFill.id ="pBarFill";

  pContainerLife.appendChild(pBarFill);
  pContainer.appendChild(pContainerLife);
  pLifeDisplay.textContent = `Life: ${stats.pLifeMax}`
}

function respawnPlayer() {
  const stats = playerStats();
  stats.pLifeCurrent = stats.pLifeMax;
  pLifeDisplay.textContent = `Life: ${stats.pLifeCurrent}/${stats.pLifeMax}`;
  renderPlifeDisplay();
  drawnCards = [];
  deck = [...pDeck];
  handContainer.innerHTML = "";
  stats.points = 0;
  pointsDisplay.textContent = stats.points;
}

function attack() {
  const stats = playerStats();
  if (stageData.dealerLifeCurrent - stats.pDamage <= 0) {
    stageData.kills += 1;
    killsDisplay.textContent = `Kills: ${stageData.kills}`
    respawnDealer()
    dealerLifeBar()
    cardXp() 
    cashOut()
    nextStageChecker();
    dealerDeathAnimation();
  } else {
    stageData.dealerLifeCurrent = stageData.dealerLifeCurrent - stats.pDamage;
    dealerLifeDisplay.textContent = `Life: ${stageData.dealerLifeCurrent}/${stageData.dealerLifeMax}`
    dealerLifeBar()
  }
}

function cashOut() {
  const stats = playerStats();
  cash = Math.floor(cash + stats.points * (1+ Math.pow(stageData.stage, 0.5))*stats.cashMulti);
  cashDisplay.textContent = `Cash: $${cash}`
  return cash
}

function playerStats () {
  const stats = {
    points: 0,
    pDamage: 0,
    pRegen: 0,
    cashMulti: 1,
    pLifeMax: 10,
    pLifeCurrent: 10,
    damageMultiplier: 1
  }
  for (const card of drawnCards) {
    if (!card) continue;
    if (card.suit === "Spades")   stats.damageMultiplier += 0.1 * card.currentLevel;
    if (card.suit === "Hearts")   stats.pRegen           += card.currentLevel;
    if (card.suit === "Diamonds") stats.cashMulti        += Math.floor(Math.pow(card.currentLevel, 0.5));
    if (card.suit === "Clubs")    stats.pLifeMax         = stats.pLifeMax * 1.1 + card.currentLevel / 100;
    card.damage = card.baseDamage * card.currentLevel;
    stats.pDamage += card.damage
    stats.points += card.value
  };
  stats.pDamage *= stats.damageMultiplier;
  return stats
}



//=========game start===========

spawnDealer();
renderStage ();
spawnPlayer();
nextStageChecker();

btn.addEventListener("click", drawCard)
attackBtn.addEventListener("click", attack)
nextStageBtn.addEventListener("click", nextStage)

/*function retry() {
  points =0
  pointsDisplay.textContent = points;
  suite = [1,2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  drawnCards = []
  handContainer.innerHTML = ""
}*/

//=========game loop===========


/*setInterval(updateUi(), 1000);*/

setInterval(() => {
  renderPlifeDisplay();
  heartHeal ();
}, 1000)

setInterval(() => {
  cdealerDamage();
}, stageData.attackspeed)