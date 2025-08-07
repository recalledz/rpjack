export default class RateTracker {
  constructor() {
    this.lastTime = performance.now();
    this.count = 0;
    this.rate = 0;
  }

  mark(count = 1) {
    const now = performance.now();
    this.count += count;
    const elapsed = now - this.lastTime;
    if (elapsed >= 1000) {
      this.rate = this.count / (elapsed / 1000);
      this.count = 0;
      this.lastTime = now;
    }
  }

  getRate() {
    return this.rate;
  }
}
