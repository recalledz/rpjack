export default class RateTracker {
  constructor(windowMs = 10000) {
    this.windowMs = windowMs;
    this.samples = [];
  }

  record(value, time = (typeof performance !== 'undefined' ? performance.now() : Date.now())) {
    this.samples.push({ time, value });
    this._cleanup(time);
  }

  _cleanup(now) {
    const cutoff = now - this.windowMs;
    while (this.samples.length && this.samples[0].time < cutoff) {
      this.samples.shift();
    }
  }

  getRate() {
    if (this.samples.length < 2) return 0;
    const first = this.samples[0];
    const last = this.samples[this.samples.length - 1];
    const dt = (last.time - first.time) / 1000;
    if (dt <= 0) return 0;
    return (last.value - first.value) / dt;
  }

  reset(value = 0, time = (typeof performance !== 'undefined' ? performance.now() : Date.now())) {
    this.samples = [{ time, value }];
  }
}
