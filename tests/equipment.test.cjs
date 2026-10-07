const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const context = {window:{},React:{createElement(){}}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/equipment-media.js'),'utf8'),context);
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/equipment.js'),'utf8'),context);
const {empty,applyCommand:apply,available,outstanding,validateState} = context.window.CSHeartEquipment;
let sequence=0;
const cmd = data => ({id:`command-${++sequence}`,date:'2026-09-01',...data});
const act = (state, command) => apply(state,command,'operator@example.test','2026-09-28T12:00:00Z');
const add = (quantity=10, item={name:'Trening',size:'M'}) => act(empty(),cmd({type:'in',quantity,item}));
const external = {type:'external',name:'TEST EXTERN',club:'Club Test'};
test('multiple equipment handover is atomic, retry-safe and uses one external person',()=>{
 let state=add(3);const first=state.items[0].id;
 state=act(state,cmd({type:'in',quantity:2,item:{name:'Tricou'}}));const second=state.items[1].id;
 const original=JSON.stringify(state);
 const command=cmd({type:'handover',mode:'gift',lines:[{itemId:first,quantity:1},{itemId:second,quantity:2}],recipient:external});
 const next=act(state,command);
 assert.equal(next.people.length,1);assert.equal(available(next,first),2);assert.equal(available(next,second),0);
 assert.equal(act(next,command),next);
 assert.equal(JSON.stringify(state),original);
 assert.throws(()=>act(state,cmd({...command,id:'fail',lines:[{itemId:first,quantity:1},{itemId:second,quantity:3}]})),/suficiente/);
 assert.equal(JSON.stringify(state),original);
 assert.throws(()=>act(state,cmd({...command,id:'repeated',lines:[{itemId:first,quantity:2},{itemId:first,quantity:2}]})),/suficiente/);
 const groups=context.window.CSHeartEquipment.groupAssignments(next.movements.filter(m=>m.recipient));
 assert.equal(groups.length,1);assert.equal(groups[0].movements.length,2);
});
test('grouping uses identity, not name; batch loans retain individual returns',()=>{
 let state=add(5);const itemId=state.items[0].id;
 state=act(state,cmd({type:'handover',mode:'loan',lines:[{itemId,quantity:1},{itemId,quantity:2}],recipient:{type:'club',id:'a',name:'TEST'}}));
 state=act(state,cmd({type:'gift',itemId,quantity:1,recipient:{type:'club',id:'b',name:'TEST'}}));
 const loan=state.movements[1];
 state=act(state,cmd({type:'return',itemId,quantity:1,loanId:loan.id}));
 assert.equal(outstanding(state,loan),0);assert.equal(outstanding(state,state.movements[2]),2);
 assert.equal(context.window.CSHeartEquipment.groupAssignments(state.movements.filter(m=>['loan','gift'].includes(m.type))).length,2);
});
const photo = 'data:image/jpeg;base64,/9j/2Q==';
test('edit corrects model and size in place while retaining movements and photo',()=>{
 let state=act(empty(),cmd({type:'in',quantity:2,item:{name:'echip',size:'xl',color:'Alb'},photoData:photo}));
 const itemId=state.items[0].id;
 state=act(state,cmd({type:'loan',quantity:1,itemId,recipient:external}));
 const before=JSON.stringify(state);
 const fields={...state.items[0],name:'Echip',size:'xl',personalization:'71'};
 const next=act(state,cmd({type:'edit-item',itemId,item:fields}));
 assert.equal(next.items[0].name,'Echip');assert.equal(next.items[0].size,'XL');
 assert.equal(next.items[0].id,itemId);assert.equal(next.items[0].photoId,state.items[0].photoId);
 assert.equal(JSON.stringify(next.movements),JSON.stringify(state.movements));
 assert.equal(available(next,itemId),1);assert.equal(outstanding(next,next.movements[1]),1);
 assert.equal(next.items[0].edits[0].before.name,'echip');
 assert.equal(next.items[0].edits[0].after.name,'Echip');
 assert.equal(JSON.stringify(state),before);
 assert.throws(()=>act(state,cmd({type:'edit-item',itemId,item:{...fields,name:' '}})),/denumirea/);
});
test('edit refuses a conflicting variant and form exposes editable metadata',()=>{
 let state=add(1,{name:'Echip',size:'S'});
 state=act(state,cmd({type:'in',quantity:1,item:{name:'Echip',size:'L'}}));
 assert.throws(()=>act(state,cmd({type:'edit-item',itemId:state.items[1].id,item:{...state.items[1],size:'S'}})),/deja/);
 const source=fs.readFileSync(path.join(__dirname,'../src/equipment.js'),'utf8');
 assert.match(source,/"Modifică articolul"/);
 assert.match(source,/form.type === "edit-item"\) && \["name","category","size","color","personalization","unit"\]/);
});
test('stock groups sizes by normalized model and color without changing records',()=>{
 const rows=[
 {id:'a',name:'Echip.Personalizat',color:'Turcoaz',category:'Echipament',unit:'buc.',size:'L',personalization:'15'},
 {id:'b',name:'echip.personalizat',color:' turcoaz ',category:'Echipament',unit:'buc.',size:'S',personalization:'71'},
 {id:'c',name:'Echip.Personalizat',color:'Negru/mov',category:'Echipament',unit:'buc.',size:'S',personalization:'71'},
 {id:'d',name:'Echip.Personalizat',color:'Turcoaz',category:'Echipament',unit:'buc.',deletedAt:'2026-09-29'}
 ];
 const before=JSON.stringify(rows);
 const groups=context.window.CSHeartEquipment.groupStock(rows);
 assert.equal(groups.length,2);assert.equal(groups[0].items.length,2);
 assert.equal(JSON.stringify(rows),before);
});
test('new size inherits only matching model photo and leaves source stock unchanged',()=>{
 let state=act(empty(),cmd({type:'in',quantity:2,item:{name:'Tricou',color:'Alb',size:'L'},photoData:photo}));
 const source=state.items[0];
 state=act(state,cmd({type:'in',quantity:3,sourceItemId:source.id,item:{name:'Tricou',color:'Alb',size:'S'}}));
 assert.equal(state.items[1].photoId,source.photoId);assert.equal(available(state,source.id),2);
 state=act(state,cmd({type:'in',quantity:1,sourceItemId:source.id,item:{name:'Tricou',color:'Roșu',size:'S'}}));
 assert.equal(state.items[2].photoId,undefined);
});
test('color variants retain distinct stock and normalize case',()=>{
 let state=add(3,{name:'Tricou',size:'M',color:'Roșu'});
 state=act(state,cmd({type:'in',quantity:2,item:{name:'Tricou',size:'M',color:' ROȘU '}}));
 assert.equal(state.items.length,1); assert.equal(available(state,state.items[0].id),5);
 state=act(state,cmd({type:'in',quantity:4,item:{name:'Tricou',size:'M',color:'Alb'}}));
 assert.equal(state.items.length,2);assert.equal(available(state,state.items[1].id),4);
 assert.throws(()=>act(state,cmd({type:'edit-item',itemId:state.items[1].id,color:'Roșu'})),/deja/);
});
test('photo and color editing preserve stock, loans and original state',()=>{
 let state=add();const itemId=state.items[0].id;
 state=act(state,cmd({type:'loan',itemId,quantity:2,recipient:external}));
 const original=JSON.stringify(state);
 const edit=cmd({type:'edit-item',itemId,color:'Alb',photoData:photo});
 const next=act(state,edit);
 assert.equal(JSON.stringify(state),original);assert.equal(available(next,itemId),8);
 assert.equal(outstanding(next,next.movements[1]),2);
 assert.equal(next.items[0].photoId,'photo-'+edit.id);
 assert.equal(next.items[0].photoData,undefined);
 assert.equal(act(next,cmd({type:'edit-item',itemId,color:'Alb',removePhoto:true})).items[0].photoId,undefined);
 assert.throws(()=>act(state,cmd({type:'edit-item',itemId,color:'Alb',photoData:'https://bad.test'})),/invalidă/);
 assert.throws(()=>act(state,cmd({type:'edit-item',itemId,photoData:photo+'A'.repeat(100000)})),/invalidă/);
});
test('new article photograph is referenced, duplicate upload never silently discarded',()=>{
 const command=cmd({type:'in',quantity:1,item:{name:'Tricou'},photoData:photo});
 const state=act(empty(),command);
 assert.equal(state.items[0].photoId,'photo-'+command.id);
 assert.throws(()=>act(state,cmd({type:'in',quantity:1,item:{name:'Tricou'},photoData:photo})),/există deja/);
 assert.equal(available(state,state.items[0].id),1);
});

test('empty inventory does not require migration or touch athletes or money',()=>{
  assert.equal(empty().items.length,0);
  assert.equal(Object.keys(empty()).sort().join(','),'items,movements,people,schemaVersion');
  const state = add();
  assert.equal(available(state,state.items[0].id),10);
  assert.equal(state.movements[0].recordedBy,'operator@example.test');
});
test('delete removes stock without destroying history, supports restore and re-entry',()=>{
  let state=add(5); const itemId=state.items[0].id; const original=JSON.stringify(state);
  state=act(state,cmd({type:'delete-item',itemId}));
  assert.ok(state.items[0].deletedAt); assert.equal(available(state,itemId),0);
  assert.equal(state.movements.length,1); validateState(state);
  assert.throws(()=>act(state,cmd({type:'in',itemId,quantity:1})),/șters/);
  state=act(state,cmd({type:'in',quantity:2,item:{name:'Trening',size:'M'}}));
  assert.equal(state.items.length,2); assert.notEqual(state.items[1].id,itemId);
  state=act(state,cmd({type:'restore-item',itemId}));
  assert.equal(available(state,itemId),5); assert.equal(state.items[0].deletedAt,undefined);
  assert.ok(original.includes('movements'));
});
test('delete refuses active handovers and does not revive previously canceled entries',()=>{
  let state=add(); const itemId=state.items[0].id;
  state=act(state,cmd({type:'gift',itemId,quantity:1,recipient:external}));
  assert.throws(()=>act(state,cmd({type:'delete-item',itemId})),/predări/);
  state=act(state,cmd({type:'cancel',movementId:state.movements[1].id,reason:'Greșeală'}));
  state=act(state,cmd({type:'delete-item',itemId}));
  state=act(state,cmd({type:'restore-item',itemId}));
  assert.ok(state.movements[1].canceledAt); assert.equal(available(state,itemId),10);
});
test('gift to external is free, reduces stock and retains person without a club athlete',()=>{
  const state=add(); const before=JSON.stringify(state); const itemId=state.items[0].id;
  const next=act(state,cmd({type:'gift',itemId,quantity:2,recipient:external}));
  assert.equal(available(next,itemId),8);
  assert.equal(next.people.length,1);
  assert.equal(next.movements[1].recipient.name,'TEST EXTERN');
  assert.equal(JSON.stringify(state),before);
  assert.equal(next.fees,undefined);
  assert.equal(next.athletes,undefined);
});
test('loan supports partial and full return, never returns more than issued',()=>{
  let state=add(); const itemId=state.items[0].id;
  state=act(state,cmd({type:'loan',itemId,quantity:3,recipient:external}));
  const loan=state.movements[1];
  state=act(state,cmd({type:'return',itemId,quantity:1,loanId:loan.id}));
  assert.equal(available(state,itemId),8); assert.equal(outstanding(state,loan),2);
  assert.throws(()=>act(state,cmd({type:'return',itemId,quantity:3,loanId:loan.id})),/depășește/);
  state=act(state,cmd({type:'return',itemId,quantity:2,loanId:loan.id}));
  assert.equal(outstanding(state,loan),0); assert.equal(available(state,itemId),10);
  assert.throws(()=>act(state,cmd({type:'return',itemId,quantity:1,loanId:loan.id})),/depășește/);
});
test('insufficient stock and sequential concurrent issues are rejected',()=>{
  let state=add(1);const itemId=state.items[0].id;
  state=act(state,cmd({type:'gift',itemId,quantity:1,recipient:external}));
  assert.throws(()=>act(state,cmd({type:'loan',itemId,quantity:1,recipient:external})),/suficiente/);
  assert.equal(available(state,itemId),0);
});
test('stock corrections and cancellations are auditable and cannot create negative stock',()=>{
  let state=add(5);const itemId=state.items[0].id;const incoming=state.movements[0];
  state=act(state,cmd({type:'gift',itemId,quantity:2,recipient:external}));
  assert.throws(()=>act(state,cmd({type:'cancel',movementId:incoming.id,reason:'Eroare'})),/sub zero/);
  state=act(state,cmd({type:'adjust',itemId,count:1,note:'Articole deteriorate'}));
  assert.equal(available(state,itemId),1);
  const correction=state.movements[2];
  state=act(state,cmd({type:'cancel',movementId:correction.id,reason:'Corecție introdusă greșit'}));
  assert.equal(available(state,itemId),3);
  assert.equal(state.movements.length,3);
  assert.equal(state.movements[2].cancellationReason,'Corecție introdusă greșit');
});
test('cannot cancel loan with active returns or return a gift',()=>{
  let state=add();const itemId=state.items[0].id;
  state=act(state,cmd({type:'loan',itemId,quantity:2,recipient:external})); const loan=state.movements[1];
  state=act(state,cmd({type:'return',itemId,quantity:1,loanId:loan.id}));
  assert.throws(()=>act(state,cmd({type:'cancel',movementId:loan.id,reason:'Eroare'})),/returnări/);
  state=act(state,cmd({type:'gift',itemId,quantity:1,recipient:external}));
  assert.throws(()=>act(state,cmd({type:'return',itemId,quantity:1,loanId:state.movements[3].id})),/Împrumutul/);
});
test('retries are idempotent; same variants and external person reuse identities',()=>{
  let state=add();const itemId=state.items[0].id;
  const command=cmd({type:'gift',itemId,quantity:1,recipient:external});
  state=act(state,command); assert.equal(act(state,command),state);
  state=act(state,cmd({type:'gift',itemId,quantity:1,recipient:{...external,name:'test extern'}}));
  assert.equal(state.people.length,1);
  state=act(state,cmd({type:'in',quantity:1,item:{name:' TRENING ',size:'m'}}));
  assert.equal(state.items.length,1);
  state=act(state,cmd({type:'in',quantity:1,item:{name:'Trening',size:'L'}}));
  assert.equal(state.items.length,2);
});
test('invalid quantity, missing reasons and invalid dates cannot alter the ledger',()=>{
  const state=add();const itemId=state.items[0].id;
  for(const quantity of [0,-1,1.5,'wrong']) assert.throws(()=>act(state,cmd({type:'in',itemId,quantity})),/Cantitatea/);
  assert.throws(()=>act(state,cmd({type:'in',itemId,quantity:1,date:'2026-02-30'})),/dată validă/);
  assert.throws(()=>act(state,cmd({type:'adjust',itemId,count:0})),/motivul/);
  assert.throws(()=>validateState({items:[],people:[],movements:[]}),/format/);
});
test('club recipient is captured without modifying athlete records and unknown ids are rejected',()=>{
  const state=add();const itemId=state.items[0].id;
  const result=act(state,cmd({type:'loan',itemId,quantity:1,recipient:{type:'club',id:'athlete1',name:'TEST CLUB'}}));
  assert.equal(result.people.length,0);
  assert.equal(result.movements[1].recipient.id,'athlete1');
  assert.throws(()=>act(state,cmd({type:'in',itemId:'missing',quantity:1})),/articol/);
});
test('equipment persistence is isolated and transaction revalidates latest stock',()=>{
  const store=fs.readFileSync(path.join(__dirname,'../src/equipment-store.js'),'utf8');
  assert.match(store,/runTransaction/); assert.match(store,/"equipment", "state"/);
  assert.doesNotMatch(store,/"app", "state"/);
  assert.match(store,/model.applyCommand\(current/);
  const rules=fs.readFileSync(path.join(__dirname,'../firestore.rules'),'utf8');
  assert.match(rules,/match \/equipment\/state/);
});
test('backup includes separate equipment and legacy restore preserves current stock',()=>{
  const backup=fs.readFileSync(path.join(__dirname,'../src/backup-export.js'),'utf8');
  const restore=fs.readFileSync(path.join(__dirname,'../src/restore-backup.js'),'utf8');
  assert.match(backup,/state.equipment =/);
  assert.match(restore,/if \(equipment\) transaction.set\(doc\(db, 'equipment', 'state'\), restoredEquipment\)/);
  assert.match(restore,/await downloadCurrentSafetyCopy\(\)/);
  assert.match(restore,/const \{ equipment, ...clubState \} = state/);
});
