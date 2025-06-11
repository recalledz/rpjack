// test/simulation.test.cjs
const { expect } = require('chai');
const { GameSimulator } = require('../simulator.cjs');

describe("💡 Simulation: Upgrade Scaling", () => {
  it("should increase stage progression with globalDamage upgrades", () => {
    const sim = new GameSimulator("aggressive");
    const result = sim.run(100);

    expect(result.finalStage).to.be.greaterThan(10);
    expect(result.totalCash).to.be.greaterThan(1000);
  });
});

