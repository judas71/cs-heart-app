const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function harness(trainings = []) {
  const state = []; let cursor = 0; const effects = []; const pending = [];
  const React = {
    createElement: (type, props, ...children) => ({ type, props: props || {}, children: children.flat(Infinity).filter(x => x != null && x !== false) }),
    useState: initial => { const i = cursor++; if (!(i in state)) state[i] = typeof initial === 'function' ? initial() : initial; return [state[i], v => { state[i] = typeof v === 'function' ? v(state[i]) : v; }]; },
    useEffect: (fn, deps) => { const i = cursor++; if (!effects[i] || deps.some((v, n) => v !== effects[i][n])) { effects[i] = deps; pending.push(fn); } }
  };
  const window = { addEventListener() {}, removeEventListener() {}, setTimeout() {}, CSHeartNoTraining: { conflicts: () => false } };
  const src = fs.readFileSync(path.join(__dirname, '../src/attendance-guests.js'), 'utf8').replace('window.AttendanceView = AttendanceView;', 'window.helpers = { findTraining, displayTrainingLabel }; window.AttendanceView = AttendanceView;');
  vm.runInNewContext(src, { React, window, confirm: () => true, alert: message => { throw Error(message); } });
  const athletes = [{ id: 'a', lastName: 'GAZDA', firstName: 'ANA', group: 'A' }, { id: 'b', lastName: 'ȘERBAN', firstName: 'RADU', group: 'B' }, { id: 'c', lastName: 'ALTUL', firstName: 'ION', group: 'B' }];
  const saved = []; let dirty = false; let tree;
  const props = { athletes, trainings, onSaveTraining: t => saved.push(t), onDirtyChange: v => { dirty = v; } };
  const render = () => { for (let n = 0; n < 5; n++) { cursor = 0; tree = window.AttendanceView(props); if (!pending.length) break; pending.splice(0).forEach(fn => fn()); } };
  const nodes = (node = tree) => typeof node !== 'object' ? [] : [node, ...node.children.flatMap(nodes)];
  const text = (node = tree) => typeof node !== 'object' ? String(node) : node.children.map(text).join(' ');
  const click = label => { const b = nodes().find(n => n.type === 'button' && (text(n) === label || n.props['aria-label'] === label)); assert.ok(b, label); assert.ok(!b.props.disabled, label); b.props.onClick(); render(); };
  const search = value => { nodes().find(n => n.props['aria-label'] === 'Caută sportiv din altă grupă').props.onChange({ target: { value } }); render(); };
  render(); return { nodes, text, click, search, render, props, saved, window, dirty: () => dirty };
}

test('group guest search ignores accents, adds only the child, not marked and not duplicated', () => {
  const ui = harness();
  ui.click('+ Sportivi din alte grupe'); ui.search('serban');
  assert.match(ui.text(), /ȘERBAN RADU/);
  ui.click('Adaugă ȘERBAN RADU');
  assert.equal(ui.props.athletes[1].group, 'B');
  assert.ok(ui.dirty());
  assert.match(ui.text(), /Din alte grupe/);
  const cards = ui.nodes().filter(n => n.type === 'article' && String(n.props.className).includes('attendance-v2-athlete'));
  assert.equal(cards.length, 2);
  assert.ok(cards.every(card => ui.text(card).includes('Nemarcat')));
  ui.search('serban'); assert.match(ui.text(), /Niciun sportiv disponibil/);
  ui.click('Scoate');
  assert.equal(ui.nodes().filter(n => n.type === 'article' && String(n.props.className).includes('attendance-v2-athlete')).length, 1);
});

test('saving group guests preserves group identity and reopening updates the same training', () => {
  const ui = harness(); ui.click('+ Sportivi din alte grupe'); ui.search('radu'); ui.click('Adaugă ȘERBAN RADU');
  ui.nodes().filter(n => n.type === 'button' && ui.text(n) === 'prezent').forEach(button => button.props.onClick()); ui.render();
  ui.click('Salveaza prezenta (2/2)');
  const saved = ui.saved[0];
  assert.equal(saved.type, 'grupa'); assert.equal(saved.group, 'A');
  assert.deepEqual(Array.from(saved.guestAthleteIds), ['b']);
  assert.equal(saved.attendance.a, 'prezent'); assert.equal(saved.attendance.b, 'prezent'); assert.equal(saved.attendance.c, undefined);
  const other = { id: 'other', date: saved.date, type: 'mixt', group: 'Mixt', attendance: { c: 'prezent' } };
  assert.equal(ui.window.helpers.findTraining([other, saved], saved.date, 'grupa', 'A', ui.props.athletes, ''), saved);
  assert.equal(ui.window.helpers.findTraining([other, saved], saved.date, 'mixt', '', ui.props.athletes, 'other'), other);
  const reopened = harness([saved, other]);
  assert.match(reopened.text(), /Din alte grupe/);
  reopened.click('Salveaza modificarile');
  assert.equal(reopened.saved[0].id, saved.id);
  assert.equal(other.attendance.c, 'prezent');
});

test('legacy group-with-guests records still open as their original mixed session', () => {
  const ui = harness(); const legacy = { id: 'legacy', date: '2026-11-07', type: 'grupa', group: 'A', attendance: { a: 'prezent', b: 'absent' } };
  assert.equal(ui.window.helpers.findTraining([legacy], legacy.date, 'mixt', '', ui.props.athletes, legacy.id), legacy);
  assert.equal(ui.window.helpers.findTraining([legacy], legacy.date, 'grupa', 'A', ui.props.athletes, ''), undefined);
});
