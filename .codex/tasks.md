
## ✅ Completed Tasks
- Initial card draw system implemented
- Boss and enemy ability registry with cooldown logic
- Dealer death animation and rerender cycle
- Ability icons styled with cooldown pie shadow effect
- Lucide icons integrated
- Dealer HP system and healing logic for abilities
- Game loop updated for real-time cooldown tracking
- GitHub repository connected and Replit integration enabled
- Finalize card visual polish for dealers
- Create Card class to unify structure
  - Store HP, attack, level, XP, job, suit, traits
  - Define methods for leveling, XP gain, and combat damage
  - Include references to job affinity and trait bonuses
-Add appropriate icons to each dealer/boss card
-Increase size/intensity of icons depending on stage

---

## 🚧 Upcoming Goals
- Fix dev tools: spawn boss does not update stage stats properly

## fixes

-synchronize dealer bar life and card death animation, they are happening in different frames at times
## UI

- buttons in middle take too much space, make them more compact, consider cicle buttons with only icons instead
- 
### 🃏 Card System Overhaul
-implement card xp system that scales with stages
- Implement affinities: each card has a job alignment
  - Types: Strength, Dexterity, Mind, Chaos, Holy
  - Influence stat scaling, ability unlocks, and synergy bonuses

### 🔁 Game Progression
- Implement start screen:
  - Triggered when all cards die, all cards on hand are defeated, or player prestiges
  - Player selects deck loadout and Joker cards
  - deck lodout selection is locked until defeating world boss 2. before this, a screen just appears saying you are defeated. player may select to start by pressing a button, or after a timer, it automatically progresses.
  -all deck hp cards is reset to maximium. player is bought to stage 1 of current world. upgardes are reset. card levels are reset. 
- Redraw mechanic:
  - Player may redraw hand for escalating cost
  - Cost resets on start screen or clearing world

### 🧙 Joker System
- Player abilities triggered by clicking Joker card
- Limited slots for Joker cards
- Unique art per Joker
- Unlocked after defeating world boss (first one heals)
- Use mana, goes on cooldown after use
- Implement Joker file/object registry

### 🔼 Upgrade System
- Card-based upgrades: HP, damage, regen
- Deck-wide or passive boosts

### 🔮 Mana System
- Mana bar unlocked after first boss
- Regenerates over time or from actions
- Required for Joker card use

### ✨ Prestige & Reincarnation
- Prestige unlocks global upgrades & new systems
- Reincarnation resets card jobs, retains traits and core bonuses
- Jobs grant XP towards skill trees (Strength, Dexterity, Mind, Chaos, Holy)

### 🌾 Resource Roles & Jobs
- Assign cards to non-combat jobs: mining, farming, conjuring
- Resource jobs prevent card use in combat
- Cards level in jobs to gain traits and unlock skill trees

---

## 🔄 Migration Status
- Codebase successfully committed to GitHub
- Replit connected and live-editable
- Preparing for Codex-based task and documentation management

## Notes
- Ability registry is in `dealerabilities.js`.
- Cards render in `renderDealerCard()`.
- Lucide icons are used for visual consistency.
- All UI logic is JS-based; no framework.

