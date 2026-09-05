const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const context = { window: {} };
vm.runInNewContext(
  fs.readFileSync(path.resolve(__dirname, "../src/athlete-normalization.js"), "utf8"),
  context
);
const normalization = context.window.CSHeartAthleteNormalization;

test("athlete names are saved with uppercase Romanian letters and clean spacing", () => {
  assert.equal(normalization.normalizePersonName("  ariciu   sofia  "), "ARICIU SOFIA");
  assert.equal(normalization.normalizePersonName("  Țîrlea  "), "ȚÎRLEA");
});

test("group labels with different casing resolve to the same saved group", () => {
  for (const value of ["Alina", " alina ", "ALINA"]) {
    assert.equal(normalization.normalizeGroupLabel(value), "ALINA");
  }
});

test("identity migration is safe, preserves the records and is idempotent", () => {
  const state = {
    athletes: [
      { id: "1", lastName: "Popescu", firstName: "Ana", group: "Alina", feeDue: 250 },
      { id: "2", lastName: "ionescu", firstName: "Mara", group: "ALINA", feeDue: 200 }
    ],
    fees: [{ id: "fee-1", athleteId: "1" }]
  };
  const migration = normalization.migrateAthleteIdentities(state);

  assert.equal(migration.changed, true);
  assert.deepEqual(Array.from(migration.state.athletes, (athlete) => athlete.group), ["ALINA", "ALINA"]);
  assert.equal(migration.state.athletes[0].lastName, "POPESCU");
  assert.equal(migration.state.athletes[1].firstName, "MARA");
  assert.equal(migration.state.athletes[0].feeDue, 250);
  assert.equal(migration.state.fees[0].id, "fee-1");
  assert.equal(normalization.migrateAthleteIdentities(migration.state).changed, false);
});
