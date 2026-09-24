const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
test('parent report includes canceled days without changing attendance counts', () => {
  const context = { React: { createElement() {} }, window: { CSHeartMembershipFees: {}, CSHeartMonthlyFeeOptions: {}, CSHeartFeeLedger: {} } };
  const source = fs.readFileSync(path.join(__dirname, '../src/extra-payments.js'), 'utf8').replace('window.ReportsView = ReportsView;', 'window.messageForTest = attendanceShareMessage; window.ReportsView = ReportsView;');
  vm.runInNewContext(source, context);
  const athlete = { id: 'a', firstName: 'TEST', lastName: 'SPORTIV' };
  const off = { type: 'no-training', date: '2026-09-20', attendance: {}, reason: 'Sală închisă' };
  const text = context.window.messageForTest(athlete, '2026-09', [{ date: '2026-09-21', attendance: { a: 'prezent' } }], [off]);
  assert.match(text, /Antrenamente inregistrate: 1/);
  assert.match(text, /Absent: 0/);
  assert.match(text, /Procent prezenta: 100%/);
  assert.match(text, /20.09.2026 - Nu s-a ținut antrenamentul: Sală închisă/);
  assert.ok(text.indexOf('20.09.2026') < text.indexOf('21.09.2026'));
  assert.match(context.window.messageForTest(athlete, '2026-09', [], [off]), /Nu s-a ținut antrenamentul/);
});
