console.log("✅ basic.test.js is loaded!");

// test/basic.test.js
describe("🔥 Force Fail Test", () => {
  it("should fail if this is being run", () => {
    chai.expect(true).to.equal(false);
  });
});
