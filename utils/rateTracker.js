export default class RateTracker {
  constructor(windowMs = 1000) {
    this.windowMs = windowMs;
    this.lastTime = performance.now();
    this.lastValue = 0;
    this.rate = 0;
  }

  record(value) {
    const now = performance.now();
    const elapsed = now - this.lastTime;
    if (elapsed > 0) {
      this.rate = (value - this.lastValue) / (elapsed / 1000);
    }
    this.lastValue = value;
    this.lastTime = now;
  }

  reset(value = 0) {
    this.lastValue = value;
    this.rate = 0;
    this.lastTime = performance.now();
  }

  // legacy method used by some modules
  mark(count = 1) {
    this.record(this.lastValue + count);
  }

  getRate() {
    return this.rate;
  }
}
