class Boss {
  constructor(config) {
    const stageData = config.stageData;
    
    this.name = config.name;
    this.icon = config.icon || '👑';
    this.maxHp = config.maxHp ?? Math.floor(20 * (Math.pow(stageData.stage, 0.5)) * 1.5); //may recacl later
    this.currentHp = this.maxHp;
    this.damage = config.damage;
    this.xp = config.xp ?? Math.floor(stageData.stage **1.2 * 4.5);
    this.attackInterval = config.attackInterval ?? 10000;
    this.reward = config.reward;
    this.attackTimer = 0;
    this.abilities = config.abilities || [];
  }

  takeDamage(amount) {
    this.currentHp = Math.max(0, this.currentHp - amount);
    if (this.currentHp === 0) this.die();
  }

  tick(deltaTime) {
    this.abilities.forEach(ability => ability.tick(deltaTime, this))
    
    this.attackTimer += deltaTime;
    if (this.attackTimer >= this.attackInterval) {
      bossAttackHandler(this);
      this.attackTimer = 0;
    }
  }

  die() {
    onBossDefeat(this)
  }
}

export default Boss