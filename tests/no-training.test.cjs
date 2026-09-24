const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname, '../src/no-training.js'), 'utf8'), context);
const api = context.window.CSHeartNoTraining;
const athletes = [{ id: 'a', group: 'A', active: true }, { id: 'b', group: 'B', active: true }];
const make = (scope = 'groups') => api.createRecord({ id: 'off', date: '2026-09-20', scope, groups: ['A'], reason: 'Sală închisă', athletes });
test('Sunday or any date can be recorded without attendance or absences', () => {
  const record = make();
  assert.equal(record.date, '2026-09-20');
  assert.equal(Object.keys(record.attendance).length, 0);
  assert.equal(api.affected(record, athletes[0]), true);
  assert.equal(api.affected(record, athletes[1]), false);
});
test('other group training on same day is preserved; overlaps and duplicates are rejected', () => {
  const training = { id: 'tr', date: '2026-09-20', type: 'grupa', group: 'B', attendance: { b: 'prezent' } };
  assert.equal(api.conflicts([training], make(), athletes), false);
  assert.equal(api.conflicts([training], make('all'), athletes), true);
  assert.equal(api.conflicts([{ ...training, group: 'A', attendance: { a: 'prezent' } }], make(), athletes), true);
  assert.equal(api.conflicts([{ ...make(), id: 'other' }], make(), athletes), true);
  assert.equal(training.attendance.b, 'prezent');
});
test('all-day records apply to both groups without introducing percentage entries', () => {
  const record = make('all');
  for (const athlete of athletes) {
    assert.equal(api.affected(record, athlete), true);
    assert.equal([record].filter((t) => t.attendance?.[athlete.id]).length, 0);
  }
});
