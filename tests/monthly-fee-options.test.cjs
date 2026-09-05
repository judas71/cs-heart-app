const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const context = { window: {} };
vm.runInNewContext(
  fs.readFileSync(path.resolve(__dirname, "../src/monthly-fee-options.js"), "utf8"),
  context
);
const options = context.window.CSHeartMonthlyFeeOptions;

test("monthly fee presets cover trial sessions and use the athlete standard fee without changing it", () => {
  const athlete = { id: "sofia", feeDue: 250 };
  const presets = options.getMonthlyFeePresets(athlete);

  assert.deepEqual(Array.from(presets, (preset) => preset.amount), [50, 100, 250, 125, 0]);
  assert.equal(athlete.feeDue, 250);
});

test("trial payments remain credited when the athlete continues the month", () => {
  const athlete = { id: "sofia", feeDue: 250 };
  const presets = options.getMonthlyFeePresets(athlete);
  const amount = (id) => presets.find((preset) => preset.id === id).amount;

  assert.equal(amount("trial-one") - 50, 0);
  assert.equal(amount("trial-two") - 50, 50);
  assert.equal(amount("standard") - 100, 150);
});

test("a monthly exception can be zero or half while the next month remains standard", () => {
  const athlete = { id: "sofia", feeDue: 250 };
  const septemberFee = { athleteId: athlete.id, month: "2026-09", amountDue: 0 };
  const octoberFee = null;
  const due = (fee) => fee?.amountDue ?? options.getStandardFee(athlete);

  assert.equal(due(septemberFee), 0);
  assert.equal(due(octoberFee), 250);
  septemberFee.amountDue = options.getMonthlyFeePresets(athlete).find((preset) => preset.id === "half").amount;
  assert.equal(due(septemberFee), 125);
  assert.equal(due(octoberFee), 250);
});

test("typed monthly amounts are validated and rounded safely", () => {
  assert.equal(options.normalizeMonthlyFeeAmount("250"), 250);
  assert.equal(options.normalizeMonthlyFeeAmount("125.555"), 125.56);
  assert.equal(options.normalizeMonthlyFeeAmount(""), null);
  assert.equal(options.normalizeMonthlyFeeAmount("-1"), null);
  assert.equal(options.normalizeMonthlyFeeAmount("abc"), null);
});
