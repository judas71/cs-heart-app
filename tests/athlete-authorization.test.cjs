const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const source = fs.readFileSync(path.join(__dirname, "../src/athletes-v2.js"), "utf8");

test("authorization date can be added, edited, cleared and saved without changing existing fields", () => {
  let state;
  let saved;
  const context = {
    React: { useState: init => {
      if (state === undefined) state = init();
      return [state, update => { state = update(state); }];
    } },
    h: (type, props, ...children) => ({ type, props: props || {}, children }),
    Field: "Field", Date, getBirthYear: a => a.birthYear || "",
    getFrbLicense: a => a.frbLicense || "", getMedicalExpiry: () => "",
    normalizePersonName: s => s, normalizeGroupLabel: s => s,
    normalizeBirthYear: s => s, normalizeFrbLicense: s => s
  };
  vm.createContext(context);
  vm.runInContext(source.slice(source.indexOf("  function AthleteFormV2("), source.indexOf("  function StatusPill(")), context);
  const initialValue = { id: "test", firstName: "ANA", lastName: "TEST", group: "ALINA",
    active: true, feeDue: 250, notes: "keep", medicalVisaTo: "2027-01-01" };
  const before = JSON.stringify(initialValue);
  const render = () => context.AthleteFormV2({ initialValue, onSave: a => { saved = a; } });
  for (const value of ["2027-10-02", "2028-04-15", ""]) {
    const form = render();
    const field = form.children.find(n => n?.props?.label === "Valabilitate împuternicire");
    const input = field.children[0];
    assert.equal(input.props.type, "date");
    assert.ok(!input.props.required);
    input.props.onChange({ target: { value } });
    render().props.onSubmit({ preventDefault() {} });
    assert.equal(saved.authorizationValidUntil, value);
    assert.equal(saved.feeDue, 250);
    assert.equal(saved.medicalVisaTo, "2027-01-01");
    assert.equal(saved.notes, "keep");
  }
  state = { ...saved, authorizationValidUntil: "2028-04-15" };
  const reopened = render().children.find(n => n?.props?.label === "Valabilitate împuternicire");
  assert.equal(reopened.children[0].props.value, "2028-04-15");
  assert.equal(JSON.stringify(initialValue), before);
});

test("normalization preserves authorization date and profile formats it with an empty fallback", () => {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../src/athlete-normalization.js"), "utf8"), context);
  const result = context.window.CSHeartAthleteNormalization.normalizeAthleteRecord({ authorizationValidUntil: "2027-10-02" });
  assert.equal(result.authorizationValidUntil, "2027-10-02");
  assert.match(source, /athlete.authorizationValidUntil \? formatDate\(athlete.authorizationValidUntil\) : "Necompletată"/);
});
