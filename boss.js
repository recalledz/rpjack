import Enemy from "./enemy.js"

 export class Boss extends Enemy {
  constructor(stage, world, config = {}) {
    super(stage, world, { 
      ...config,
      name: config.name || "Boss",
      attackInterval: config.attackInterval || 3000,
    });
      this.icon = config.icon;
      this.abilities = config.abilities || [];
  }

  tick(deltaTime) {
    super.tick(deltaTime);
    this.abilities.forEach(ability => ability.tick(deltaTime, this));
  }
    
  die() {
    this.defeated = true;
  }
}

export const BossTemplates = {
  1: {
    name: "Coqui del Mar",
    icon: "skull",
    abilityKeys: ["healing.heal"],
  },
  2: {
    name: "Ogre",
    icon: "shield",
    abilityKeys: ["defense.shield"],
  },
  // Add more worlds here
};