const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../src/monthly-fee-receipts.js"), "utf8"), context);
const { collect } = context.window.CSHeartMonthlyFeeReceipts;
const athletes = [{ id: "a", group: "ALINA", active: false }, { id: "b", group: "LIVIU", active: true }];

test("old debt paid in October counts for October split, even for inactive athlete", () => {
  const fees = [{ athleteId: "a", month: "2026-07", amountPaid: 200,
    payments: [{ id: "p", amount: 200, date: "2026-10-01", method: "transfer" }] }];
  const before = JSON.stringify(fees);
  const result = collect({ athletes, fees, month: "2026-10", group: "ALINA" });
  assert.equal(result.total, 200);
  assert.equal(result.total * .6, 120);
  assert.equal(result.total * .4, 80);
  assert.equal(result.rows[0].fee.month, "2026-07");
  assert.equal(collect({ athletes, fees, month: "2026-07" }).total, 0);
  assert.equal(collect({ athletes, fees, month: "2026-09" }).total, 0);
  assert.equal(JSON.stringify(fees), before);
});

test("each receipt uses its own date, no aggregate duplication; groups remain separate", () => {
  const fees = [
    { athleteId: "a", month: "2026-07", amountPaid: 600, payments: [
      { amount: 200, date: "2026-09-30", method: "cash" },
      { amount: 400, date: "2026-10-02", method: "transfer" }] },
    { athleteId: "b", month: "2026-10", amountPaid: 250, paymentDate: "2026-10-01", method: "cash" }
  ];
  assert.equal(collect({ athletes, fees, month: "2026-09", group: "ALINA" }).total, 200);
  assert.equal(collect({ athletes, fees, month: "2026-10", group: "ALINA" }).total, 400);
  assert.equal(collect({ athletes, fees, month: "2026-10" }).total, 650);
});

test("legacy dates supported; missing dates not guessed; empty payment arrays are authoritative", () => {
  const fees = [
    { athleteId: "a", month: "2026-07", amountPaid: 200, paymentDate: "01.10.2026" },
    { athleteId: "a", month: "2026-10", amountPaid: 100 },
    { athleteId: "a", month: "2026-10", amountPaid: 300, paymentDate: "2026-10-01", payments: [] }
  ];
  const result = collect({ athletes, fees, month: "2026-10" });
  assert.equal(result.total, 200);
  assert.equal(result.undated.length, 1);
});
