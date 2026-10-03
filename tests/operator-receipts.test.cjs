const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/operator-receipts.js'), 'utf8'), context);
const { stampReceipt, stampFee, buildRows, groupRows, summarize } = context.window.CSHeartOperatorReceipts;
const alina = { email: 'alina@example.test', uid: 'a' };
const liviu = { email: 'liviu@example.test', uid: 'l' };
const now = '2026-09-28T12:00:00Z';

test('receipt details never infer initial operator from later fee edits', () => {
  const { receiptAudit } = context.window.CSHeartOperatorReceipts;
  const payment = { id: 'old', amount: 200, date: '2026-09-15', method: 'cash' };
  const parent = { updatedByEmail: 'liviu.vera@gmail.com', updatedAt: '2026-09-15T20:25:23Z' };
  const before = JSON.stringify({ payment, parent });
  const audit = receiptAudit(payment, parent);
  assert.equal(audit.operator, 'Operator neidentificat');
  assert.equal(audit.known, false);
  assert.equal(audit.lastEditor, 'Operator neidentificat');
  assert.equal(audit.updatedAt, '');
  assert.equal(JSON.stringify({ payment, parent }), before);
  const known = receiptAudit({ ...payment, recordedByEmail: 'tatucualina@yahoo.com', recordedAt: now }, parent);
  assert.equal(known.operator, 'Alina');
  assert.equal(known.lastEditor, 'Operator neidentificat');
  assert.equal(known.recordedAt, now);
});

test('separate cash and transfer keep their own creation times, never monthly edit time', () => {
  const { receiptAudit, ReceiptDetails } = context.window.CSHeartOperatorReceipts;
  context.React = { createElement: (type, props, ...children) => ({ type, props, children }) };
  const parent = { updatedByEmail: 'tatucualina@yahoo.com', updatedAt: '2026-09-17T16:40:05.413Z' };
  const transfer = { id: 'transfer', createdAt: '2026-09-13T17:29:54.149Z', amount: 200 };
  const cash = { id: 'cash', createdAt: '2026-09-17T16:40:05.413Z', amount: 200 };
  assert.equal(receiptAudit(transfer, parent).recordedAt, transfer.createdAt);
  assert.equal(receiptAudit(cash, parent).recordedAt, cash.createdAt);
  for (const receipt of [transfer, cash]) {
    const output = JSON.stringify(ReceiptDetails({ receipt, parent }));
    assert.ok(!output.includes('Alina'));
    assert.ok(!output.includes('Ultima modificare'));
    assert.ok(output.includes('Operator neidentificat'));
  }
  assert.equal(receiptAudit({ id: 'legacy-fee', createdAt: parent.updatedAt }, parent).recordedAt, '');
});

test('receipt provenance is accessible in monthly receipts and payment histories', () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/extra-payments.js'), 'utf8');
  assert.ok(source.includes('h(window.CSHeartOperatorReceipts.ReceiptDetails, { receipt: payment, parent: feePanelFee })'));
  assert.ok(source.includes('h(window.CSHeartOperatorReceipts.ReceiptDetails, { receipt: payment, parent: fee })'));
  assert.ok(source.includes('receiptSummary.rows.filter(row => row.payment.method === method)'));
  assert.ok(source.includes('recordedByEmail: payment.recordedByEmail || ""'));
  assert.ok(!source.includes('["Operat de", operatorLabel(fee.updatedByEmail || fee.updatedBy)]'));
});

test('operator names map exact accounts; both people remain selectable in empty months', () => {
  const { operatorLabel, operatorOptions } = context.window.CSHeartOperatorReceipts;
  assert.equal(operatorLabel(' LIVIU.VERA@gmail.com '), 'Liviu');
  assert.equal(operatorLabel('tatucualina@yahoo.com'), 'Alina');
  assert.equal(operatorLabel('other@example.test'), 'other@example.test');
  assert.equal(operatorLabel(''), 'Operator neidentificat');
  const options = operatorOptions([]);
  assert.ok(options.some(([key, label]) => key === 'liviu.vera@gmail.com' && label === 'Liviu'));
  assert.ok(options.some(([key, label]) => key === 'tatucualina@yahoo.com' && label === 'Alina'));
  assert.ok(options.some(([key]) => key === 'neidentificat'));
  assert.equal(operatorOptions([{operator:'LIVIU.VERA@gmail.com'}]).length, options.length);
});

test('new cash receipt retains initial operator through editing by another user', () => {
  const initial = stampReceipt({ id: 'p', amount: 200 }, null, alina, now);
  const edited = stampReceipt({ ...initial, amount: 250, recordedByEmail: liviu.email }, initial, liviu, now);
  assert.equal(edited.recordedByEmail, alina.email);
  assert.equal(edited.recordedById, 'a');
  assert.equal(edited.recordedAt, now);
  assert.equal(edited.amount, 250);
  assert.equal(initial.amount, 200);
});

test('fee changes, confirmations and deletions never attribute old receipts to current editor', () => {
  const previous = { id: 'f', athleteId: 'a', month: '2026-06', amountPaid: 150, payments: [{id:'old', amount:150, date:'2026-07-01', method:'cash'}] };
  const before = JSON.stringify(previous);
  const result = stampFee({ ...previous, payments: [...previous.payments, {id:'new', amount:200, date:'2026-09-28', method:'transfer'}] }, previous, alina, now);
  assert.equal(result.payments[0].recordedByEmail, '');
  assert.equal(result.payments[1].recordedByEmail, alina.email);
  const confirmation = stampFee({ ...result, confirmationCount: 2 }, result, liviu, now);
  assert.equal(confirmation.payments[1].recordedByEmail, alina.email);
  const deleted = stampFee({ ...confirmation, payments: [confirmation.payments[0]] }, confirmation, liviu, now);
  assert.equal(deleted.payments.length, 1);
  assert.equal(deleted.payments[0].recordedByEmail, '');
  assert.equal(JSON.stringify(previous), before);
});

test('legacy conversion leaves original unknown and assigns only the newly added receipt', () => {
  const old = { id: 'f', amountPaid: 200, paymentDate: '2026-08-01' };
  const result = stampFee({ ...old, payments: [{ id:'legacy-f', amount:200 }, {id:'new', amount:100}] }, old, liviu, now);
  assert.equal(result.payments[0].recordedByEmail, '');
  assert.equal(result.payments[1].recordedByEmail, liviu.email);
  assert.equal(stampReceipt({id:'old', updatedByEmail:alina.email}, {id:'old'}, liviu, now).recordedByEmail, '');
});

test('report uses receipt dates not debt months, combines both sources and separates methods/currencies', () => {
  const props = {
    athletes: [{id:'a', lastName:'SPORTIV', firstName:'TEST'}],
    fees: [{id:'f', athleteId:'a', month:'2026-06', amountPaid:9999, updatedByEmail:liviu.email, payments:[
      {id:'j', amount:100, date:'2026-07-01', method:'cash', recordedByEmail:alina.email},
      {id:'s', amount:200, date:'2026-09-01', method:'cash', recordedByEmail:alina.email},
      {id:'old', amount:50, date:'02.09.2026', method:'transfer'},
    ]}],
    otherPayments: [
      {id:'o', payerName:'SPONSOR', amount:30.25, date:'2026-09-04', method:'transfer', currency:'euro', recordedByEmail:alina.email},
      ...['cheltuiala','retur','anulare','avans'].map((paymentType, i) => ({id:i, amount:999, date:'2026-09-01', method:'cash', paymentType})),
      {id:'legacy', amount:10, date:'2026-09-05', method:'cash', paymentType:'plata'},
      {id:'noDate', amount:20, method:'cash'},
    ]
  };
  const before = JSON.stringify(props);
  const all = buildRows(props);
  const rows = all.filter(r => r.date.startsWith('2026-09'));
  assert.equal(rows.length, 4);
  assert.equal(all.filter(r => !r.date).length, 1);
  const totals = summarize(rows);
  assert.equal(totals.cash.lei, 21000);
  assert.equal(totals.transfer.lei, 5000);
  assert.equal(totals.transfer.euro, 3025);
  const groups = groupRows(rows);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].operator, alina.email);
  assert.equal(groups[0].rows.length, 2);
  assert.equal(groups[1].operator, '');
  assert.equal(JSON.stringify(props), before);
});

test('legacy aggregate is counted once; no payment date or method is guessed', () => {
  const rows = buildRows({ fees: [{id:'l', amountPaid:200, month:'2026-09', updatedByEmail:liviu.email}, {id:'empty', amountPaid:500, payments:[]}] });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].operator, '');
  assert.equal(rows[0].date, '');
  assert.equal(rows[0].method, 'necunoscut');
});

test('new fee author stamping is wired in live save handlers and report is reachable', () => {
  const app = fs.readFileSync(path.join(__dirname, '../src/app.js'), 'utf8');
  assert.match(app, /CSHeartOperatorReceipts\.stampFee\(fee, existing, user/);
  assert.match(app, /CSHeartOperatorReceipts\.stampReceipt\(payment, existing, user/);
  const view = fs.readFileSync(path.join(__dirname, '../src/extra-payments.js'), 'utf8');
  assert.match(view, /value: "operatori"/);
  assert.match(view, /h\(window\.CSHeartOperatorReceipts.Report, props\)/);
});
