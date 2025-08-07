export function calculateMaxStamina(base = 100, endurance = 0) {
  return base + endurance * 10;
}

export function calculateStaminaRegen(base = 1, dexterity = 0) {
  return base + dexterity * 0.1;
}
