const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const context = { window: {} };
for (const file of ['operator-receipts.js','financial-register.js']) vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src',file),'utf8'),context);
const api = context.window.CSHeartFinancialRegister;
const props = {
  athletes:[{id:'a',lastName:'TEST',firstName:'Ana',group:'ALINA',active:false}],
  fees:[{id:'fee',athleteId:'a',month:'2026-07',amountPaid:600,payments:[
    {id:'one',amount:200,date:'2026-11-01',method:'cash',recordedByEmail:'tatucualina@yahoo.com'},
    {id:'two',amount:200,date:'2026-11-15',method:'transfer',recordedByEmail:'liviu.vera@gmail.com'},
    {id:'three',amount:200,date:'2026-10-31',method:'cash',updatedByEmail:'liviu.vera@gmail.com'}]},
    {id:'old',athleteId:'a',month:'2026-08',amountPaid:50,paymentDate:'02.11.2026',method:'cash',updatedByEmail:'liviu.vera@gmail.com'}],
  taxPayments:[{id:'s1',recipient:'Alina',paymentType:'salariu',amount:1200,date:'2026-11-03',method:'cash'},
    {id:'s2',recipient:'ALINA',paymentType:'salariu',amount:800,date:'2026-11-14',method:'transfer'},
    {id:'s3',recipient:'Liviu',paymentType:'salariu',amount:500,date:'2026-11-14',method:'cash'},
    {id:'rent',recipient:'Alina',paymentType:'chirie',amount:100,date:'2026-11-14',method:'cash'},
    {id:'legacy',recipient:'Alina',paymentType:'salariu',amount:300,month:'2026-09'}],
  otherPayments:[{id:'buy',payerName:'Furnizor <script>',category:'echipament',amount:20,currency:'euro',paymentType:'cheltuiala',date:'2026-11-15',method:'transfer'},
    {id:'notexpense',amount:999,paymentType:'plata',date:'2026-11-15'},
    {id:'waiver',amount:999,paymentType:'anulare',date:'2026-11-15'},
    {id:'bad-date',amount:1,paymentType:'retur',date:'31.02.2026'}]
};
const range={from:'01.11.2026',to:'15.11.2026'};
test('receipts use actual payment dates, include inactive athletes, avoid aggregate duplication and retain unknown author',()=>{
  const before=JSON.stringify(props), all=api.buildRows(props,'taxe');
  const rows=api.filterRows(all,{...range,source:'taxe'}).rows;
  assert.equal(rows.length,3); assert.equal(api.totals(rows)[0].cents,45000);
  assert.equal(api.filterRows(all,{...range,operator:'tatucualina@yahoo.com'}).rows.length,1);
  const unknown=api.filterRows(all,{...range,source:'taxe',operator:'neidentificat'}).rows;
  assert.equal(unknown.length,1); assert.equal(unknown[0].cents,5000);
  assert.equal(api.filterRows(all,{...range,method:'transfer'}).rows.length,1);
  assert.equal(rows[0].group,'ALINA'); assert.equal(JSON.stringify(props),before);
});

test('unified receipts partition into fees and other receipts without counting totals twice',()=>{
  const before=JSON.stringify(props), all=api.filterRows(api.buildRows(props,'taxe'),range).rows;
  const fees=api.filterRows(all,{source:'taxe'}).rows;
  const other=api.filterRows(all,{source:'alte'}).rows;
  assert.equal(all.length,fees.length+other.length);
  assert.equal(api.totals(all)[0].cents,api.totals(fees)[0].cents+api.totals(other)[0].cents);
  assert.equal(other.length,1); assert.equal(other[0].cents,99900);
  assert.ok(!all.some(r=>r.parentId==='buy'||r.parentId==='waiver'||r.parentId==='bad-date'));
  assert.equal(new Set(all.map(r=>r.id)).size,all.length);
  assert.equal(JSON.stringify(props),before);
  const html=api.printHTML(other,'taxe','Încasări: Alte încasări');
  assert.match(html,/Încasări: Alte încasări/); assert.doesNotMatch(html,/Registru încasări taxe/);
});

test('navigation exposes one income register, not duplicate reports',()=>{
  const source=fs.readFileSync(path.join(__dirname,'../src/extra-payments.js'),'utf8');
  assert.equal((source.match(/value: "registruTaxe"/g)||[]).length,1);
  assert.doesNotMatch(source,/value: "operatori"|label: "Încasări taxe"/);
});
test('salary recipient filter is separate from operator, supports case normalization and category',()=>{
  const rows=api.filterRows(api.buildRows(props,'plati'),{...range,beneficiary:'alina',category:'salarii'}).rows;
  assert.equal(rows.length,2); assert.equal(api.totals(rows)[0].cents,200000);
  assert.equal(api.filterRows(rows,{...range,method:'cash'}).rows.length,1);
});
test('expense direction, currency and uncertain legacy dates remain explicit',()=>{
  const all=api.buildRows(props,'plati');
  assert.ok(!all.some(r=>r.id.endsWith('notexpense')||r.id.endsWith('waiver')));
  const legacy=all.find(r=>r.id.endsWith('legacy')); assert.equal(legacy.date,'2026-09-30'); assert.equal(legacy.estimated,true);
  assert.equal(all.find(r=>r.id.endsWith('bad-date')).date,'');
  assert.equal(api.totals(api.filterRows(all,range).rows)[1].cents,2000);
});
test('invalid or reversed intervals never silently show all entries; boundaries are inclusive',()=>{
  assert.equal(api.parseDate('29.02.2026'),''); assert.equal(api.parseDate('29.02.2024'),'2024-02-29');
  assert.ok(api.filterRows([],{from:'15.11.2026',to:'01.11.2026'}).error);
  assert.ok(api.filterRows([],{from:'oops'}).error);
  assert.equal(api.filterRows(api.buildRows(props,'taxe'),{from:'15.11.2026',to:'15.11.2026',source:'taxe'}).rows.length,1);
});
test('print contains exactly filtered table, totals and filter labels, with escaped user text',()=>{
  const rows=api.filterRows(api.buildRows(props,'plati'),{...range,beneficiary:'furnizor <script>'}).rows;
  const html=api.printHTML(rows,'plati','Beneficiar: Furnizor <script>');
  assert.match(html,/Furnizor &lt;script&gt;/); assert.doesNotMatch(html,/<script>|1200|Salarii/);
  assert.match(html,/20,00 euro/); assert.match(html,/1 operațiuni/);
  assert.equal(api.tableData(rows,'plati').body.length,1);
});
