import enemy from "./enemy.js"

class Boss extends enemy {
  constructor(stage, world, config = {}) {
    super(stage, world, { 
      ...config,
      name: config.name || "Boss",
      attackInterval: config.attackInterval || 1000,
    });
      this.icon = config.icon || "👑";
      this.abilities = config.abilities || [];
  }

  tick(deltaTime) {
    super.tick(deltaTime);
    this.abilities.forEach(ability => ability.tick(deltaTime, this)
  )}
    
  die() {
    this.defeated = true;
  }
}

export default Boss