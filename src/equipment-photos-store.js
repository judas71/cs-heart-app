import { db, doc, getDoc } from "./firebase.js?v=20260821e";
import "./equipment-media.js?v=20260928e";
import { writeBatch } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
export async function loadEquipmentPhoto(id) {
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) throw Error("Fotografie invalidă.");
  const snapshot=await getDoc(doc(db,"equipmentPhotos",id));
  const photo=snapshot.exists()?snapshot.data().data:"";
  if (!window.CSHeartEquipmentMedia.validPhoto(photo)) throw Error("Fotografie indisponibilă.");
  return photo;
}
export async function withEquipmentPhotos(equipment) {
  const ids=[...new Set(equipment.items.map(i=>i.photoId).filter(Boolean))];
  const photos=new Map();
  for(const id of ids) photos.set(id,await loadEquipmentPhoto(id));
  return {...equipment,items:equipment.items.map(i=>i.photoId?{...i,photoData:photos.get(i.photoId)}:{...i})};
}
export async function prepareEquipmentRestore(equipment) {
  // Upload immutable images before the state swap. A failed upload leaves current club data untouched.
  const photos=new Map();
  for(const i of equipment.items) if(i.photoData !== undefined){
    if(!/^[a-zA-Z0-9_-]+$/.test(i.photoId||"")||!window.CSHeartEquipmentMedia.validPhoto(i.photoData))throw Error("Fotografie invalidă în backup.");
    if(photos.has(i.photoId)&&photos.get(i.photoId)!==i.photoData)throw Error("Fotografii contradictorii în backup.");
    photos.set(i.photoId,i.photoData);
  }
  for (const i of equipment.items) if(i.photoId && !photos.has(i.photoId)) photos.set(i.photoId,await loadEquipmentPhoto(i.photoId));
  const newIds=new Map([...photos.keys()].map(id=>[id,"photo-restore-"+crypto.randomUUID()]));
  const entries=[...photos].map(([id,data])=>[newIds.get(id),data]);
  for(let start=0;start<entries.length;start+=25){const batch=writeBatch(db);for(const [id,data] of entries.slice(start,start+25))batch.set(doc(db,"equipmentPhotos",id),{data});await batch.commit();}
  return {...equipment,items:equipment.items.map(({photoData,...item})=>item.photoId?{...item,photoId:newIds.get(item.photoId)}:item)};
}
