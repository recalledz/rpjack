export const XP_EFFICIENCY = 1;

export function calculateKillXp(level = 1, multiplier = 1) {
  return level * multiplier * XP_EFFICIENCY;
}
