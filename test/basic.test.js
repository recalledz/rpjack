import { expect } from 'chai';

console.log("✅ basic.test.js is loaded!");

describe("🔥 Force Fail Test", () => {
  it("should fail if this is being run", () => {
    expect(true).to.equal(false); // this is meant to fail on purpose
  });
});

