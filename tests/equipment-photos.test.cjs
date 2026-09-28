const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const jpeg='data:image/jpeg;base64,/9j/2Q==';
function setup(fail=false) {
 const docs=new Map([['existing',jpeg]]), writes=[];
 let seq=0;
 const context={window:{},React:{createElement(){}},db:{},crypto:{randomUUID:()=>String(++seq)},
  doc:(_db,collection,id)=>({collection,id}),
  getDoc:async ref=>({exists:()=>docs.has(ref.id),data:()=>({data:docs.get(ref.id)})}),
  writeBatch:()=>({set:(ref,value)=>writes.push([ref,value]),commit:async()=>{if(fail)throw Error('offline');}})
 };
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/equipment-media.js'),'utf8'),context);
 const code=fs.readFileSync(path.join(__dirname,'../src/equipment-photos-store.js'),'utf8').replace(/^import .*;\r?$/gm,'').replaceAll('export async function','async function');
 vm.runInNewContext(code,context);
 return {context,writes};
}
test('backup includes referenced photographs without modifying inventory',async()=>{
 const {context}=setup();
 const input={items:[{id:'a',photoId:'existing'},{id:'b'}],movements:[],people:[],schemaVersion:1};
 const result=await context.withEquipmentPhotos(input);
 assert.equal(result.items[0].photoData,jpeg);
 assert.equal(input.items[0].photoData,undefined);
});
test('restore uploads new photo IDs, preserves existing images and strips inline data',async()=>{
 const {context,writes}=setup();
 const input={items:[{id:'a',photoId:'existing',photoData:jpeg},{id:'b'}]};
 const result=await context.prepareEquipmentRestore(input);
 assert.notEqual(result.items[0].photoId,'existing');
 assert.equal(result.items[0].photoData,undefined);
 assert.equal(result.items[1].id,'b');
 assert.equal(writes.length,1);
 assert.notEqual(writes[0][0].id,'existing');
 assert.equal(input.items[0].photoId,'existing');
});
test('invalid photos or upload failures abort restore; old inventory remains supported',async()=>{
 const {context,writes}=setup();
 await assert.rejects(context.prepareEquipmentRestore({items:[{id:'a',photoId:'existing',photoData:'bad'}]}),/invalidă/);
 assert.equal(writes.length,0);
 const legacy=await context.prepareEquipmentRestore({items:[{id:'a'}]});
 assert.equal(legacy.items[0].id,'a');
 assert.equal(writes.length,0);
 const failure=setup(true);
 await assert.rejects(failure.context.prepareEquipmentRestore({items:[{id:'a',photoId:'existing',photoData:jpeg}]}),/offline/);
});
