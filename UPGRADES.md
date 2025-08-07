# Upgrade System

The game features multiple upgrade paths to strengthen your deck.

## Global Upgrades
Global upgrades are unlocked as you progress and apply to every run. Each upgrade
has a level-based cost formula and can be increased repeatedly. Examples include
additional card slots, global damage multipliers, faster auto-attacks, and bonus
health per level.

## Card Upgrades
After clearing a stage, an overlay presents a random selection of upgrade cards.
Purchasing an upgrade immediately applies its effect and increases its level.

- **Base cost:** `100 * stage * world`
- **Rarity multipliers:** common ×1, uncommon ×1.5, rare ×2, super-rare ×3
- **Weighted rolls:** common upgrades appear more frequently than rare ones.
- One option becomes free if none are affordable.
- Prestige-only upgrades offer mana-focused bonuses and unlock after resetting.

Common examples are Heal on Redraw, HP per Kill, Extra Card Slot, and damage or HP multipliers.

Upgrade definitions and cost calculations live in `cardUpgrades.js`.
