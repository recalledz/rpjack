export const XP_EFFICIENCY = 1;

// Compute XP needed for a card to reach the next level.
// Scales with the card's face value and current level.
export function xpRequirement(value = 1, level = 1) {
  const valueFactor = 1 + (value - 1) / 12;
  return Math.round(10 * level * valueFactor);
}

// Estimate an enemy's effective level based on stage and world.
export function effectiveLevel(stage = 1, world = 1) {
  return stage + (world - 1) * 10;
}

export function calculateKillXp(level = 1, multiplier = 1) {
  return level * multiplier * XP_EFFICIENCY;
}
