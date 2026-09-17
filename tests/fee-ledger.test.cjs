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

const fifoAthlete = { id: "fifo", active: true, feeDue: 200, joinMonth: "2026-06" };
function fifoFee(month, amount, date, extra = {}) {
  return { athleteId: "fifo", month, amountDue: 200, amountPaid: amount, payments: amount ? [{ id: `pay-${month}`, amount, date, method: "cash", confirmationCount: 2 }] : [], ...extra };
}

test("a July receipt settles June first, including when viewing June history", () => {
  const fees = [fifoFee("2026-06", 0, ""), fifoFee("2026-07", 200, "2026-07-10")];
  const before = JSON.stringify(fees);
  const june = ledger.getSettlement(fees, fifoAthlete, "2026-06", "2026-07");
  assert.equal(june.outstanding, 0);
  assert.equal(june.months[0].amountPaid, 200);
  assert.equal(june.months[1].balance, 200);
  assert.deepEqual(plain(june.payments[0].allocations), [{ month: "2026-06", amount: 200 }]);
  assert.equal(june.payments[0].date, "2026-07-10");
  assert.equal(june.payments[0].confirmationCount, 2);
  assert.equal(JSON.stringify(fees), before);
});

test("partial payments cover oldest debt then the next month; excess remains credit", () => {
  const fees = [fifoFee("2026-08", 300, "2026-08-10")];
  const result = ledger.getSettlement(fees, fifoAthlete, "2026-08", "2026-08");
  assert.deepEqual(plain(result.months.map((row) => row.balance)), [0, 100, 200]);
  assert.equal(result.previousDebt, 100);
  assert.equal(result.outstanding, 300);
  const prepaid = ledger.getSettlement([fifoFee("2026-08", 650, "2026-08-10")], fifoAthlete, "2026-08", "2026-08");
  assert.equal(prepaid.credit, 50);
  assert.equal(prepaid.outstanding, 0);
});

test("legacy receipts are included, payment arrays are not counted twice, other athletes are excluded", () => {
  const result = ledger.getSettlement([
    { athleteId: "fifo", month: "2026-06", amountDue: 200, amountPaid: 100, paymentDate: "2026-06-20" },
    fifoFee("2026-07", 200, "2026-07-10"),
    { athleteId: "other", month: "2026-06", amountPaid: 9999 }
  ], fifoAthlete, "2026-07", "2026-07");
  assert.equal(result.outstanding, 100);
  assert.equal(result.payments.length, 2);
  assert.deepEqual(plain(result.payments[1].allocations), [{ month: "2026-06", amount: 100 }, { month: "2026-07", amount: 100 }]);
});

test("cancellation uses allocated payment, preserves cash and reallocates when a receipt is deleted", () => {
  const june = fifoFee("2026-06", 0, "");
  const july = fifoFee("2026-07", 250, "2026-07-10");
  const settlement = ledger.getSettlement([june, july], fifoAthlete, "2026-07", "2026-07");
  const paidJune = ledger.cancelOutstandingFee(june, { allocatedPaid: settlement.months[0].amountPaid });
  assert.equal(paidJune.changed, false);
  const canceledJuly = ledger.cancelOutstandingFee(july, { allocatedPaid: settlement.months[1].amountPaid, reason: "Pauză" });
  assert.equal(canceledJuly.adjustment.amount, 150);
  assert.equal(canceledJuly.fee.amountDue, 50);
  assert.equal(canceledJuly.fee.amountPaid, 250);
  assert.equal(ledger.getSettlement([june, canceledJuly.fee], fifoAthlete, "2026-07", "2026-07").outstanding, 0);
  const deleted = { ...july, payments: [], amountPaid: 0 };
  assert.equal(ledger.getSettlement([june, deleted], fifoAthlete, "2026-07", "2026-07").outstanding, 400);
});

test("FIFO respects inactive gaps and cent precision", () => {
  const athlete = { ...fifoAthlete, feeDue: 200.10, membershipPeriods: [{ startMonth: "2026-06", endMonth: "2026-06" }, { startMonth: "2026-08", endMonth: "" }] };
  const result = ledger.getSettlement([fifoFee("2026-08", 300.15, "2026-08-10", { amountDue: 200.10 })], athlete, "2026-08", "2026-08");
  assert.deepEqual(plain(result.months.map((row) => row.balance)), [0, 0, 100.05]);
  assert.equal(result.outstanding, 100.05);
});

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
