export class CashRateTracker {
  constructor(windowMs = 10000) {
    this.windowMs = windowMs;
    this.samples = [];
  }

  record(cash, time = Date.now()) {
    this.samples.push({ time, cash });
    this.prune(time);
  }

  prune(now = Date.now()) {
    const cutoff = now - this.windowMs;
    while (this.samples.length && this.samples[0].time < cutoff) {
      this.samples.shift();
    }
  }

  getRate(now = Date.now()) {
    this.prune(now);
    if (this.samples.length < 2) return 0;
    const first = this.samples[0];
    const last = this.samples[this.samples.length - 1];
    const deltaCash = last.cash - first.cash;
    const deltaTime = last.time - first.time;
    return deltaTime > 0 ? deltaCash / (deltaTime / 1000) : 0;
  }

  reset(initialCash = 0, time = Date.now()) {
    this.samples = [];
    this.record(initialCash, time);
  }
}

export class WorldProgressTracker {
  constructor(progressData = {}, target = 1820, stageWeightFn = s => (s <= 10 ? s : 10 + Math.sqrt(s - 10))) {
    this.progressData = progressData;
    this.target = target;
    this.stageWeightFn = stageWeightFn;
  }

  record(world, stage, count = 1) {
    const data = this.progressData[world];
    if (!data) return;
    data.stageKills[stage] = (data.stageKills[stage] || 0) + count;
  }

  compute(world) {
    const data = this.progressData[world];
    if (!data) return 0;
    let weight = 0;
    for (const [stage, kills] of Object.entries(data.stageKills)) {
      weight += this.stageWeightFn(parseInt(stage)) * kills;
    }
    return Math.min(weight / this.target, 1);
  }
}

