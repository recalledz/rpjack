import Enemy from './enemy.js';
import { Boss, BossTemplates } from './boss.js';
import { AbilityRegistry } from './dealerabilities.js';

export function calculateEnemyHp(stage, world, isBoss = false) {
  const baseHp = 10 + stage;
  const effectiveStage = stage + 10 * (world - 1);
  let hp = baseHp * Math.pow(effectiveStage, 1.1);
  if (isBoss) hp *= 5;
  return Math.floor(hp);
}

export function calculateEnemyBasicDamage(stage, world) {
  let baseDamage;
  if (stage === 10) {
    baseDamage = stage * 2;
  } else if (stage <= 10) {
    baseDamage = stage;
  } else {
    baseDamage = Math.floor(0.1 * stage * stage);
  }
  const scaledDamage = baseDamage * world ** 2;
  const maxDamage = Math.max(scaledDamage, 1);
  const minDamage = Math.floor(0.5 * maxDamage) + 1;
  return { minDamage, maxDamage };
}

export function spawnDealer(stageData, enemyAttackProgress, onAttack, onDefeat) {
  const stage = stageData.stage;
  const world = stageData.world;
  const enemy = new Enemy(stage, world, {
    maxHp: calculateEnemyHp(stage, world),
    onAttack,
    onDefeat
  });
  enemy.attackTimer = enemy.attackInterval * enemyAttackProgress;
  return enemy;
}

export function spawnBoss(stageData, enemyAttackProgress, onAttack, onDefeat) {
  const stage = stageData.stage;
  const world = stageData.world;
  const template = BossTemplates[world];
  const abilities = template.abilityKeys.map(key => {
    const [group, fn] = key.split('.');
    return AbilityRegistry[group][fn]();
  });
  const boss = new Boss(stage, world, {
    maxHp: calculateEnemyHp(stage, world, true),
    name: template.name,
    icon: template.icon,
    iconColor: template.iconColor,
    xp: Math.pow(stage, 1.5) * world,
    abilities,
    onAttack,
    onDefeat
  });
  boss.attackTimer = boss.attackInterval * enemyAttackProgress;
  return boss;
}
