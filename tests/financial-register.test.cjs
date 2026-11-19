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
test('fee waivers retain reason, month and author in the same registry without inflating cash totals',()=>{
  const data=JSON.parse(JSON.stringify(props));
  data.fees[0].feeAdjustments=[
    {id:'cancel',type:'anulare-taxa',month:'2026-07',amount:200,reason:'Nu mai achită <motiv>',canceledAt:'2026-11-14T22:30:00Z',canceledByEmail:'liviu.vera@gmail.com'},
    {id:'unknown',type:'anulare-taxa',amount:50,reason:'Dată lipsă'}];
  const before=JSON.stringify(data);
  const rows=api.filterRows(api.buildRows(data,'taxe'),{...range,athleteId:'a'}).rows;
  const waiver=rows.find(r=>r.waiver);
  assert.equal(waiver.date,'2026-11-15');
  assert.equal(waiver.operator,'liviu.vera@gmail.com');
  assert.match(waiver.description,/2026-07.*Nu mai achită/);
  assert.equal(api.totals(rows)[0].cents,45000);
  assert.equal(api.filterRows(rows,{method:'cash'}).rows.some(r=>r.waiver),false);
  assert.equal(api.filterRows(rows,{method:'transfer'}).rows.some(r=>r.waiver),false);
  const waived=api.filterRows(rows,{method:'renuntare',operator:'liviu.vera@gmail.com'}).rows;
  assert.equal(waived.length,1);
  assert.equal(api.totals(waived)[0].cents,0);
  assert.equal(api.summaryRows(waived,'taxe').length,0);
  const html=api.printHTML(rows,'taxe','Sportiv: TEST Ana');
  assert.match(html,/Total încasat: 450,00 lei/);
  assert.match(html,/Renunțat la încasare \(separat\): 200,00 lei/);
  assert.match(html,/Nu mai achită &lt;motiv&gt;/);
  assert.match(html,/Transfer bancar/);
  assert.equal(api.tableData(rows,'taxe').body.length,4);
  assert.equal(JSON.stringify(data),before);
});
test('athlete filter combines fee and other receipts by identity, not matching names',()=>{
  const data=JSON.parse(JSON.stringify(props));
  data.athletes.push({...data.athletes[0],id:'b'});
  data.otherPayments.push({id:'extra-a',athleteId:'a',amount:30,date:'2026-11-10',paymentType:'incasare',method:'cash',recordedByEmail:'tatucualina@yahoo.com'},
    {id:'extra-b',athleteId:'b',amount:70,date:'2026-11-10',paymentType:'incasare',method:'cash'},
    {id:'external',payerName:'TEST Ana',amount:90,date:'2026-11-10',paymentType:'incasare',method:'cash'});
  const before=JSON.stringify(data),all=api.buildRows(data,'taxe');
  const selected=api.filterRows(all,{...range,athleteId:'a'}).rows;
  assert.equal(selected.length,4); assert.equal(api.totals(selected)[0].cents,48000);
  assert.equal(api.filterRows(all,{...range,athleteId:'a',source:'alte'}).rows.length,1);
  assert.equal(api.filterRows(all,{...range,athleteId:'a',method:'cash',operator:'tatucualina@yahoo.com'}).rows.length,2);
  assert.equal(api.filterRows(all,{...range,athleteId:'missing'}).rows.length,0);
  assert.equal(JSON.stringify(data),before);
});

test('athlete control feeds preview and reset, including inactive athletes',()=>{
  const state=[];let cursor=0,tree;
  context.React={createElement:(type,props,...children)=>({type,props:props||{},children:children.flat(Infinity).filter(x=>x!==false&&x!=null)}),useState:initial=>{const i=cursor++;if(!(i in state))state[i]=initial;return[state[i],v=>state[i]=typeof v==='function'?v(state[i]):v];}};
  const render=()=>{cursor=0;tree=api.Report({...props,kind:'taxe'});};
  const nodes=(n=tree)=>typeof n==='object'?[n,...n.children.flatMap(nodes)]:[];
  render();
  const field=nodes().find(n=>n.props['aria-label']==='Sportiv');
  assert.ok(field);assert.ok(field.children.some(n=>n.props.value==='a'&&n.children.join('').includes('(inactiv)')));
  field.props.onChange({target:{value:'a'}});render();
  nodes().find(n=>n.type==='button'&&n.children.includes('Tipărește / PDF')).props.onClick();render();
  const html=nodes().find(n=>n.type==='iframe').props.srcDoc;
  assert.match(html,/Sportiv: TEST Ana — ALINA \(inactiv\)/);
  assert.doesNotMatch(html,/999,00/);
  nodes().find(n=>n.type==='button'&&n.children.includes('Închide previzualizarea')).props.onClick();render();
  nodes().find(n=>n.type==='button'&&n.children.includes('Tot istoricul / șterge filtrele')).props.onClick();render();
  assert.equal(nodes().find(n=>n.props['aria-label']==='Sportiv').props.value,'');
});
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
