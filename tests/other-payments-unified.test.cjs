const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function harness() {
  const state = []; let cursor = 0;
  const React = {
    createElement: (type, props, ...children) => ({ type, props: props || {}, children: children.flat(Infinity).filter(x => x !== false && x != null) }),
    useState: initial => { const i = cursor++; if (!(i in state)) state[i] = typeof initial === 'function' ? initial() : initial; return [state[i], value => { state[i] = typeof value === 'function' ? value(state[i]) : value; }]; },
    useEffect: () => {}, useRef: () => ({ current: null })
  };
  const window = { CSHeartMembershipFees: {}, CSHeartMonthlyFeeOptions: {}, CSHeartFeeLedger: {}, CSHeartOperatorReceipts: { ReceiptDetails: () => null } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/extra-payments.js'), 'utf8'), { React, window });
  const props = {
    athletes: ['paid', 'partial', 'unpaid'].map(id => ({ id, lastName: id, firstName: 'TEST', group: 'GR 2', active: true })),
    otherActions: [{ id: 'kit', name: 'Echipament', category: 'echipament', currency: 'lei', amountDue: 400, participantIds: ['paid', 'partial', 'unpaid'] }, { id: 'trip', name: 'Kasta transport', category: 'transport', currency: 'lei', amountDue: 200, participantIds: ['paid'] }],
    otherPayments: [{ id: 'a', athleteId: 'paid', actionId: 'kit', actionName: 'Echipament', category: 'echipament', date: '2026-01-01', amount: 400, currency: 'lei', method: 'cash', paymentType: 'incasare' }, { id: 'b', athleteId: 'partial', actionId: 'kit', actionName: 'Echipament', category: 'echipament', date: '2026-01-01', amount: 100, currency: 'lei', method: 'transfer', paymentType: 'incasare' }],
    onSavePayment: () => { throw new Error('Unexpected data write'); }, onSaveAction: () => {}, onDeletePayment: () => {}
  };
  let tree;
  const render = () => { cursor = 0; tree = window.OtherPaymentsView(props); return tree; };
  const nodes = (node = tree) => typeof node !== 'object' ? [] : [node, ...node.children.flatMap(nodes)];
  const text = (node = tree) => typeof node !== 'object' ? String(node) : node.children.map(text).join(' ');
  const click = label => { const node = nodes().find(n => n.type === 'button' && text(n) === label); assert.ok(node, label); node.props.onClick(); render(); };
  render();
  return { render, nodes, text, click, props };
}

test('unified view offers one overview and debt filter disabled until an action is chosen', () => {
  const ui = harness();
  assert.doesNotMatch(ui.text(), /Registru si cautare|Situatie pe actiuni/);
  assert.doesNotMatch(ui.text(), /Încasări și situație/);
  assert.ok(!ui.nodes().some(n => String(n.props.className || '').includes('extra-income-v2-modes')));
  assert.ok(ui.nodes().find(n => n.type === 'button' && ui.text(n).startsWith('Restanțieri')).props.disabled);
});

test('debtors include zero-payment participants and use full history despite month filter', () => {
  const ui = harness(); const before = JSON.stringify(ui.props);
  ui.click('Echipament'); ui.click('Luna aceasta');
  const debt = ui.nodes().find(n => n.type === 'button' && ui.text(n).startsWith('Restanțieri'));
  assert.match(ui.text(debt), /2 sportivi \/ 700 lei/);
  debt.props.onClick(); ui.render();
  const rows = ui.nodes().filter(n => n.type === 'tr').map(ui.text);
  assert.ok(rows.some(text => text.includes('unpaid TEST') && text.includes('400 lei')));
  assert.ok(rows.some(text => text.includes('partial TEST') && text.includes('300 lei')));
  assert.ok(!rows.some(text => text.startsWith('paid TEST')));
  assert.equal(JSON.stringify(ui.props), before);
  ui.click('Înapoi la operațiuni');
  assert.doesNotMatch(ui.text(), /Restanțieri —/);
});

test('all action definitions remain selectable even without receipts', () => {
  const ui = harness();
  const select = ui.nodes().find(n => n.type === 'select' && n.props['aria-label'] === 'Alege acțiunea');
  assert.match(ui.text(select), /Kasta transport/);
  select.props.onChange({ target: { value: 'trip' } }); ui.render();
  assert.match(ui.text(ui.nodes().find(n => n.type === 'button' && ui.text(n).startsWith('Restanțieri'))), /1 sportivi \/ 200 lei/);
});

test('manage action contains settings only, without a second financial view', () => {
  const ui = harness();
  ui.click('Echipament'); ui.click('Gestionează acțiunea');
  assert.equal(ui.nodes().filter(n => n.type === 'table').length, 0);
  assert.doesNotMatch(ui.text(), /Actiune urmarita|Sold actiune|Arata doar cei cu rest|TOTAL/);
  assert.ok(ui.nodes().some(n => n.props.label === 'Suma de achitat / sportiv'));
  ui.click('Înapoi la încasări');
  assert.match(ui.text(), /Restanțieri/);
});

test('compact add receipt command has a working return to the single overview', () => {
  const ui = harness();
  ui.click('+ Adaugă încasare / plată');
  ui.click('Înapoi la încasări');
  assert.match(ui.text(), /Restanțieri/);
});

test('club payment saves independently without athlete or action and preserves existing data', () => {
  const ui = harness(); const before = JSON.stringify(ui.props);
  let saved;
  ui.props.onSavePayment = payment => { saved = payment; };
  ui.click('+ Plată club');
  assert.ok(!ui.nodes().some(n => n.props.label === 'Sportiv'));
  const fill = (label, value) => {
    const field = ui.nodes().find(n => n.props.label === label);
    assert.ok(field, label);
    field.children[0].props.onChange({ target: { value } }); ui.render();
  };
  fill('Furnizor / beneficiar', 'Furnizor TEST');
  fill('Suma', '300');
  fill('Data platii', '07.11.2026');
  fill('Ce ai plătit / observații', 'Maieuri departajare 20 buc.');
  ui.nodes().find(n => n.type === 'form').props.onSubmit({ preventDefault() {} });
  assert.equal(saved.paymentType, 'cheltuiala');
  assert.equal(saved.payerName, 'Furnizor TEST');
  assert.equal(saved.amount, 300);
  assert.equal(saved.athleteId, '');
  assert.equal(saved.actionId, '');
  assert.equal(saved.actionName, '');
  assert.equal(saved.notes, 'Maieuri departajare 20 buc.');
  assert.equal(saved.date, '2026-11-07');
  assert.equal(JSON.stringify(ui.props), before);
});

test('club payment requires a beneficiary and positive amount', () => {
  const ui = harness(); let saves = 0;
  ui.props.onSavePayment = () => { saves++; };
  ui.click('+ Plată club');
  ui.nodes().find(n => n.type === 'form').props.onSubmit({ preventDefault() {} });
  assert.equal(saves, 0);
});
