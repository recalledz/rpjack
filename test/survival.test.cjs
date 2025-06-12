const { expect } = require('chai');

describe('🛡️ Deck survival simulator', () => {
  it('base deck falls within default range', async () => {
    const { simulateDeckSurvival } = await import('../survival.js');
    const ticks = simulateDeckSurvival({ globalDamageLevel: 0, baseCardHpLevel: 0 });
    expect(ticks).to.be.at.least(80);
    expect(ticks).to.be.below(110);
  });

  it('upgraded deck survives longer', async () => {
    const { simulateDeckSurvival } = await import('../survival.js');
    const ticks = simulateDeckSurvival({ globalDamageLevel: 8, baseCardHpLevel: 3 });
    expect(ticks).to.be.above(120);
    expect(ticks).to.be.below(150);
  });

  it('matrix helper generates summary', async () => {
    const { runSurvivalMatrix } = await import('../survival.js');
    const res = runSurvivalMatrix({ globalDamageLevels: [0, 2], baseCardHpLevels: [0] });
    expect(res).to.have.length(2);
    res.forEach(r => expect(r).to.have.keys(['globalDamageLevel', 'baseCardHpLevel', 'ticks']));
  });
});
