const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const source = fs.readFileSync(path.join(__dirname, "../src/athletes-v2.js"), "utf8");

test("Romanian date input displays day first and validates without corrupting saved dates", () => {
  let result = "unchanged";
  let validity = "";
  const context = {
    React: { useState: init => [init(), () => {}] },
    h: (type, props) => ({ type, props }), Date,
    formatDate: value => value.split("-").reverse().join(".")
  };
  vm.createContext(context);
  vm.runInContext(source.slice(source.indexOf("  function RomanianDateInput("), source.indexOf("  function AthleteFormV2(")), context);
  const input = context.RomanianDateInput({ value: "2026-10-02", onChange: value => { result = value; } });
  assert.equal(input.props.value, "02.10.2026");
  assert.equal(input.props.type, "text");
  const change = value => input.props.onChange({ target: { value, setCustomValidity: text => { validity = text; } } });
  change("03.11.2027");
  assert.equal(result, "2027-11-03");
  assert.equal(validity, "");
  for (const invalid of ["31.02.2027", "29.02.2027", "12.25.2026", "02.10."]) {
    change(invalid);
    assert.ok(validity);
    assert.equal(result, "2027-11-03");
  }
  change("29.02.2028");
  assert.equal(result, "2028-02-29");
  change("");
  assert.equal(result, "");
  assert.equal(validity, "");
});

test("authorization date can be added, edited, cleared and saved without changing existing fields", () => {
  let state;
  let saved;
  const context = {
    React: { useState: init => {
      if (state === undefined) state = init();
      return [state, update => { state = update(state); }];
    } },
    h: (type, props, ...children) => ({ type, props: props || {}, children }),
    Field: "Field", RomanianDateInput: "RomanianDateInput", Date, getBirthYear: a => a.birthYear || "",
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
    const field = form.children.find(n => n?.props?.label === "Valabilitate împuternicire (zi.lună.an)");
    const input = field.children[0];
    assert.equal(input.type, "RomanianDateInput");
    assert.ok(!input.props.required);
    input.props.onChange(value);
    render().props.onSubmit({ preventDefault() {} });
    assert.equal(saved.authorizationValidUntil, value);
    assert.equal(saved.feeDue, 250);
    assert.equal(saved.medicalVisaTo, "2027-01-01");
    assert.equal(saved.notes, "keep");
  }
  state = { ...saved, authorizationValidUntil: "2028-04-15" };
  const reopened = render().children.find(n => n?.props?.label === "Valabilitate împuternicire (zi.lună.an)");
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
