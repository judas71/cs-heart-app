const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({ window: {}, Date });
vm.runInContext(fs.readFileSync(path.join(root, "src/membership-fees.js"), "utf8"), context);
const membership = context.window.CSHeartMembershipFees;

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

test("an inactive athlete owes the departure month, but no later monthly fee", () => {
  const athlete = {
    id: "a1",
    active: false,
    joinMonth: "2026-04",
    inactiveMonth: "2026-07",
    membershipPeriods: [{ startMonth: "2026-04", endMonth: "2026-07" }]
  };

  assert.equal(membership.isFeeDueForMonth(athlete, "2026-06"), true);
  assert.equal(membership.isFeeDueForMonth(athlete, "2026-07"), true);
  assert.equal(membership.isFeeDueForMonth(athlete, "2026-08"), false);
  assert.equal(membership.isFeeDueForMonth(athlete, "2027-01"), false);
});

test("legacy inactive athletes are stopped at their last recorded fee or attendance month", () => {
  const state = {
    athletes: [{ id: "a1", active: false, joinMonth: "2026-04" }],
    fees: [{ athleteId: "a1", month: "2026-05", amountDue: 200, amountPaid: 200 }],
    trainings: [{ date: "2026-06-20", attendance: { a1: "prezent" } }],
    athleteRevisions: []
  };
  const originalFees = plain(state.fees);
  const migration = membership.migrateInactiveAthletes(state, {
    currentMonth: "2026-09",
    migratedAt: "2026-09-04T12:00:00.000Z"
  });

  assert.equal(migration.changed, true);
  assert.deepEqual(plain(migration.changes), [{ athleteId: "a1", inactiveMonth: "2026-06", source: "last-recorded-activity" }]);
  assert.equal(migration.state.athletes[0].inactiveMonth, "2026-06");
  assert.deepEqual(plain(migration.state.fees), originalFees);
  assert.equal(membership.migrateInactiveAthletes(migration.state).changed, false);
});

test("a recorded status change is preferred over an inferred activity month", () => {
  const state = {
    athletes: [{ id: "a1", active: false, joinMonth: "2026-04" }],
    fees: [],
    trainings: [{ date: "2026-08-30", attendance: { a1: "prezent" } }],
    athleteRevisions: [{ id: "a1", active: true, revisionSavedAt: "2026-09-03T10:00:00.000Z" }]
  };

  assert.deepEqual(plain(membership.inferInactiveMonth(state.athletes[0], state)), {
    month: "2026-09",
    source: "status-history"
  });
});

test("reactivation keeps the inactive gap and resumes fees only in the return month", () => {
  const inactive = {
    id: "a1",
    active: false,
    joinMonth: "2026-04",
    inactiveMonth: "2026-07",
    membershipPeriods: [{ startMonth: "2026-04", endMonth: "2026-07" }]
  };
  const activeAgain = membership.applyStatusChange(inactive, { ...inactive, active: true }, "2027-01-12T08:00:00.000Z");

  assert.equal(membership.isFeeDueForMonth(activeAgain, "2026-07"), true);
  assert.equal(membership.isFeeDueForMonth(activeAgain, "2026-10"), false);
  assert.equal(membership.isFeeDueForMonth(activeAgain, "2027-01"), true);
  assert.deepEqual(plain(activeAgain.membershipPeriods), [
    { startMonth: "2026-04", endMonth: "2026-07" },
    { startMonth: "2027-01", endMonth: "" }
  ]);
});

test("manually correcting the inactive month updates the closed fee period", () => {
  const previous = {
    id: "a1",
    active: false,
    joinMonth: "2026-04",
    inactiveMonth: "2026-07",
    membershipPeriods: [{ startMonth: "2026-04", endMonth: "2026-07" }]
  };
  const corrected = membership.applyStatusChange(previous, { ...previous, inactiveMonth: "2026-06" });

  assert.equal(corrected.inactiveMonth, "2026-06");
  assert.deepEqual(plain(corrected.membershipPeriods), [{ startMonth: "2026-04", endMonth: "2026-06" }]);
});
