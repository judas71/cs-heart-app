const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ctx={window:{},console:{warn(){}}};
vm.runInNewContext(fs.readFileSync('src/safe-state.js','utf8'),ctx);
const {prepare,cache,equal}=ctx.window.CSHeartSafeState;
test('stale second page cannot delete a receipt saved by first page',()=>{
 const base={fees:[]};
 const first=prepare(base,{fees:[{id:'test',payments:[{id:'p',amount:250}]}]},base);
 assert.throws(()=>prepare(base,{fees:[],trainings:[{id:'t'}]},first),/altă pagină/);
 assert.equal(first.fees[0].payments[0].amount,250);
});
test('local storage full does not stop the following server save',()=>{
 assert.equal(cache(()=>{throw Error('QuotaExceededError')},{}),false);
 assert.equal(prepare({fees:[]},{fees:[{id:'p'}]},{fees:[]}).syncRevision,1);
});
test('retry identical operation does not silently add a duplicate',()=>{
 const base={fees:[]}; const next={fees:[{id:'fee',payments:[{id:'p',amount:250}]}]};
 const saved=prepare(base,next,base);
 assert.throws(()=>prepare(base,next,saved));
 assert.equal(saved.fees.length,1);
});
test('object key ordering is irrelevant but a revision change conflicts',()=>{
 assert.ok(equal({a:1,b:2},{b:2,a:1}));
 assert.throws(()=>prepare({fees:[],syncRevision:1},{fees:[]},{fees:[],syncRevision:2}));
});
test('missing server registry never uploads demo/local data',()=>assert.throws(()=>prepare({}, {},null)));
test('server guard rejects old writes and UI is disabled pending acknowledgement',()=>{
 const app=fs.readFileSync('src/app.js','utf8');
 assert.match(app,/getDocFromServer\(appRef\)/);
 assert.match(app,/fieldset'.*disabled: blocked/);
 assert.match(app,/transaction\.set\(ref, updated\)/);
 assert.doesNotMatch(app,/setDoc\(appRef, state\)/);
 assert.match(fs.readFileSync('firestore.rules','utf8'),/syncRevision == resource.data.get\('syncRevision', 0\) \+ 1/);
});
