import { db, doc, onSnapshot } from "./firebase.js?v=20260821e";
import { runTransaction } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { loadEquipmentPhoto } from "./equipment-photos-store.js?v=20260928e";

export function EquipmentApp({ athletes, user, onDirtyChange }) {
  const h = React.createElement;
  const model = window.CSHeartEquipment;
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState("");
  const [retry, setRetry] = React.useState(0);
  React.useEffect(() => {
    setData(null); setError("");
    return onSnapshot(doc(db, "equipment", "state"), snapshot => {
      try { setData(snapshot.exists() ? model.validateState(snapshot.data()) : model.empty()); setError(""); }
      catch (e) { setData(null); setError(e.message); }
    }, () => { setData(null); setError("Echipamentele nu pot fi citite. Verifică accesul și conexiunea la internet."); });
  }, [user.uid, retry]);
  async function save(command) {
    if (!data) throw Error("Așteaptă încărcarea stocului.");
    await runTransaction(db, async transaction => {
      const reference = doc(db, "equipment", "state");
      const snapshot = await transaction.get(reference);
      const current = snapshot.exists() ? model.validateState(snapshot.data()) : model.empty();
      const next = model.applyCommand(current, command, user.email || "", new Date().toISOString());
      if (command.photoData && next.items.some(i => i.photoId === `photo-${command.id}`)) {
        if (!window.CSHeartEquipmentMedia.validPhoto(command.photoData)) throw Error("Fotografie invalidă.");
        transaction.set(doc(db,"equipmentPhotos",`photo-${command.id}`),{data:command.photoData});
      }
      transaction.set(reference, next);
    });
  }
  if (error) return h("section",{className:"panel"},h("p",{role:"alert"},error),h("button",{onClick:()=>setRetry(n=>n+1)},"Reîncearcă"));
  if (!data) return h("p",{className:"panel",role:"status"},"Se încarcă stocul…");
  return h(model.View, { data, athletes, onCommand:save, onDirtyChange, loadPhoto:loadEquipmentPhoto });
}
