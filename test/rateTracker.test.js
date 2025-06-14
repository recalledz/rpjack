import assert from 'node:assert/strict';
import test from 'node:test';
import RateTracker from '../utils/rateTracker.js';

test('calculates average rate within window', () => {
  const tracker = new RateTracker(5000);
  const start = 0;
  tracker.record(0, start);
  tracker.record(10, start + 1000);
  tracker.record(30, start + 3000);
  const rate = tracker.getRate();
  assert.ok(Math.abs(rate - 10) < 0.001);
});

test('slides window when exceeding range', () => {
  const tracker = new RateTracker(5000);
  const start = 0;
  tracker.record(0, start);
  tracker.record(10, start + 1000);
  tracker.record(30, start + 3000);
  tracker.record(60, start + 7000);
  const rate = tracker.getRate();
  assert.ok(Math.abs(rate - 7.5) < 0.001);
});
