const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({ window: {}, Date, Math });
vm.runInContext(fs.readFileSync(path.join(root, "src/membership-fees.js"), "utf8"), context);
vm.runInContext(fs.readFileSync(path.join(root, "src/fee-ledger.js"), "utf8"), context);
const ledger = context.window.CSHeartFeeLedger;

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

test("the previous balance shows the exact unpaid months across an inactive gap", () => {
  const athlete = {
    id: "eliza",
    feeDue: 200,
    joinMonth: "2026-04",
    active: true,
    membershipPeriods: [
      { startMonth: "2026-04", endMonth: "2026-07" },
      { startMonth: "2026-09", endMonth: "" }
    ]
  };
  const fees = [
    { athleteId: "eliza", month: "2026-04", amountDue: 200, amountPaid: 200 },
    { athleteId: "eliza", month: "2026-05", amountDue: 200, amountPaid: 200 }
  ];

  const result = ledger.getPreviousBalanceBreakdown(fees, athlete, "2026-09");

  assert.equal(result.balance, 400);
  assert.deepEqual(plain(result.debts), [
    { month: "2026-06", amountDue: 200, amountPaid: 0, balance: 200 },
    { month: "2026-07", amountDue: 200, amountPaid: 0, balance: 200 }
  ]);
  assert.equal(result.months.find((item) => item.month === "2026-08").amountDue, 0);
});

test("canceling a fee preserves payments and records who canceled it and why", () => {
  const fee = {
    id: "fee-june",
    athleteId: "eliza",
    month: "2026-06",
    amountDue: 200,
    amountPaid: 50,
    payments: [{ id: "payment-1", amount: 50, date: "2026-06-02", method: "cash" }]
  };
  const result = ledger.cancelOutstandingFee(fee, {
    reason: "Pauză de vară",
    canceledAt: "2026-09-15T10:00:00.000Z",
    canceledByEmail: "liviu@example.com",
    id: "adjustment-1"
  });

  assert.equal(result.changed, true);
  assert.equal(result.fee.amountDue, 50);
  assert.equal(result.fee.amountPaid, 50);
  assert.deepEqual(plain(result.fee.payments), plain(fee.payments));
  assert.deepEqual(plain(result.adjustment), {
    id: "adjustment-1",
    type: "anulare-taxa",
    month: "2026-06",
    previousAmountDue: 200,
    amountDue: 50,
    amount: 150,
    reason: "Pauză de vară",
    canceledAt: "2026-09-15T10:00:00.000Z",
    canceledByEmail: "liviu@example.com"
  });
});

test("all cancellations remain available in the athlete history", () => {
  const fees = [
    { athleteId: "a1", month: "2026-06", feeAdjustments: [{ id: "one", amount: 200, canceledAt: "2026-09-15T09:00:00.000Z", reason: "Pauză" }] },
    { athleteId: "a1", month: "2026-07", feeAdjustments: [{ id: "two", amount: 200, canceledAt: "2026-09-15T10:00:00.000Z", reason: "Pauză" }] },
    { athleteId: "a2", month: "2026-07", feeAdjustments: [{ id: "other", amount: 200, canceledAt: "2026-09-15T11:00:00.000Z" }] }
  ];

  assert.deepEqual(plain(ledger.getFeeAdjustments(fees, "a1")).map((item) => item.id), ["two", "one"]);
});
