(function () {
  const h = React.createElement;
  const types = { in: "Intrare în stoc", gift: "Oferit definitiv", loan: "Împrumutat", return: "Returnat", adjust: "Corecție stoc" };
  const empty = () => ({ schemaVersion: 1, items: [], people: [], movements: [] });
  const clean = value => String(value || "").trim().replace(/\s+/g, " ");
  const key = value => clean(value).toLocaleLowerCase("ro");
  const localDate = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  function validateState(value) {
    if (!value || value.schemaVersion !== 1 || ![value.items, value.people, value.movements].every(Array.isArray)) throw Error("Evidența echipamentelor nu are un format recunoscut. Datele nu au fost schimbate.");
    for (const list of [value.items, value.people, value.movements]) {
      if (list.some(row => !row || !clean(row.id)) || new Set(list.map(row => row.id)).size !== list.length) throw Error("Evidența echipamentelor conține identificatori lipsă sau repetați.");
    }
    value.movements.forEach(m => {
      if (!types[m.type] || !value.items.some(i => i.id === m.itemId) || !Number.isSafeInteger(m.quantity) || (m.type !== "adjust" && m.quantity <= 0)) throw Error("Există o mișcare de stoc invalidă. Verifică fișierul înainte de restaurare.");
    });
    return value;
  }
  const active = data => data.movements.filter(m => !m.canceledAt);
  const delta = m => ["loan", "gift"].includes(m.type) ? -m.quantity : m.quantity;
  const available = (data, itemId) => active(data).filter(m => m.itemId === itemId).reduce((n,m) => n + delta(m), 0);
  const outstanding = (data, loan) => loan.canceledAt ? 0 : loan.quantity - active(data).filter(m => m.type === "return" && m.loanId === loan.id).reduce((n,m) => n + m.quantity, 0);
  const itemLabel = item => [item?.name || "Articol necunoscut", item?.color, item?.size && `mărime ${item.size}`, item?.personalization].filter(Boolean).join(" · ");
  const modelKey = item => JSON.stringify(["name","color","category","unit"].map(field=>key(item[field])));
  function groupStock(items) {
    const groups=new Map();
    for(const item of items.filter(i=>!i.deletedAt)){
      const id=modelKey(item);
      if(!groups.has(id))groups.set(id,{id,model:item,items:[]});
      groups.get(id).items.push(item);
    }
    return [...groups.values()].map(g=>({...g,photo:g.items.find(i=>i.photoId),items:[...g.items].sort((a,b)=>(a.size||"").localeCompare(b.size||"","ro",{numeric:true})||(a.personalization||"").localeCompare(b.personalization||"","ro",{numeric:true}))}));
  }
  function positive(value) { const n = Number(value); if (!Number.isSafeInteger(n) || n <= 0 || n > 1000000) throw Error("Cantitatea trebuie să fie un număr întreg pozitiv."); return n; }
  function date(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "") || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0,10) !== value || value > localDate()) throw Error("Alege o dată validă, cel târziu astăzi.");
    return value;
  }
  function applyCommand(current, command, actor, now) {
    validateState(current);
    if (!clean(command.id)) throw Error("Operațiunea nu are identificator.");
    if (command.type === "handover") {
      if (!Array.isArray(command.lines) || !command.lines.length || command.lines.length > 50) throw Error("Adaugă între 1 și 50 de echipamente.");
      if (!["gift","loan"].includes(command.mode)) throw Error("Alege tipul predării.");
      if (current.movements.some(m=>m.batchId===command.id)) return current;
      let next=current;
      for (const [index,line] of command.lines.entries()) {
        next=applyCommand(next,{id:command.id+"-line-"+index,type:command.mode,itemId:line.itemId,quantity:line.quantity,date:command.date,note:command.note,recipient:command.recipient},actor,now);
        next.movements[next.movements.length-1].batchId=command.id;
      }
      return next;
    }
    if (current.movements.some(m => m.id === command.id || m.cancellationId === command.id)) return current;
    const data = JSON.parse(JSON.stringify(current));
    if (command.type === "delete-item" || command.type === "restore-item") {
      const item = data.items.find(i => i.id === command.itemId);
      if (!item) throw Error("Articolul nu mai există.");
      if (command.type === "delete-item") {
        if (item.deletedAt) return current;
        if (active(data).some(m => m.itemId === item.id && ["gift", "loan", "return"].includes(m.type))) throw Error("Articolul are predări înregistrate. Corectează întâi predările din Istoric; nu le ștergem automat.");
        item.deletedAt = now; item.deletedBy = actor; item.deletionId = command.id;
        data.movements.filter(m => m.itemId === item.id && !m.canceledAt).forEach(m => {
          m.canceledAt = now; m.canceledBy = actor; m.cancellationReason = "Articol introdus greșit — șters din stoc"; m.deletedWithItem = command.id;
        });
      } else {
        if (!item.deletedAt) return current;
        data.movements.filter(m => m.deletedWithItem === item.deletionId).forEach(m => {
          delete m.canceledAt; delete m.canceledBy; delete m.cancellationReason; delete m.deletedWithItem;
        });
        delete item.deletedAt; delete item.deletedBy; delete item.deletionId;
      }
      return data;
    }
    if (command.type === "edit-item") {
      const item = data.items.find(i => i.id === command.itemId && !i.deletedAt);
      if (!item) throw Error("Articolul nu mai este disponibil.");
      const color = clean(command.color);
      const candidate = {...item, color};
      if (data.items.some(i => !i.deletedAt && i.id !== item.id && ["name","category","size","color","personalization","unit"].every(field => key(i[field]) === key(candidate[field])))) throw Error("Există deja această variantă. Culorile nu se comasează automat.");
      item.color = color;
      if (command.photoData) {
        if (!window.CSHeartEquipmentMedia.validPhoto(command.photoData)) throw Error("Fotografie invalidă.");
        item.photoId = `photo-${command.id}`;
      } else if (command.removePhoto) delete item.photoId;
      item.updatedAt = now; item.updatedBy = actor;
      return data;
    }
    if (command.type === "cancel") {
      const movement = data.movements.find(m => m.id === command.movementId);
      if (!movement || movement.canceledAt) throw Error("Operațiunea este deja anulată sau nu mai există.");
      if (!clean(command.reason)) throw Error("Scrie motivul corectării.");
      if (movement.type === "loan" && active(data).some(m => m.type === "return" && m.loanId === movement.id)) throw Error("Acest împrumut are returnări. Corectează întâi returnările asociate.");
      movement.canceledAt = now;
      movement.canceledBy = actor;
      movement.cancellationReason = clean(command.reason);
      movement.cancellationId = command.id;
      if (available(data, movement.itemId) < 0) throw Error("Anularea ar duce stocul sub zero. Corectează întâi predările care folosesc această intrare.");
      return data;
    }
    const movement = { id: command.id, type: command.type, itemId: clean(command.itemId), quantity: 0, date: date(command.date), note: clean(command.note), createdAt: now, recordedBy: actor };
    if (command.type === "in" && !movement.itemId) {
      const fields = command.item || {};
      if (!clean(fields.name)) throw Error("Completează denumirea articolului.");
      const candidate = { id: `item-${command.id}`, name: clean(fields.name), category: clean(fields.category) || "Echipament", size: clean(fields.size), color: clean(fields.color), personalization: clean(fields.personalization), unit: clean(fields.unit) || "buc." };
      const duplicate = data.items.find(i => !i.deletedAt && ["name","category","size","color","personalization","unit"].every(field => key(i[field]) === key(candidate[field])));
      if (duplicate) {
        if (command.photoData) throw Error("Articolul există deja. Pentru fotografia lui folosește «Mai multe → Poză și culoare» din stoc.");
        movement.itemId = duplicate.id;
      }
      else {
        const source=data.items.find(i=>i.id===command.sourceItemId&&!i.deletedAt);
        if(source?.photoId && modelKey(source)===modelKey(candidate)) candidate.photoId=source.photoId;
        if (command.photoData) {
          if (!window.CSHeartEquipmentMedia.validPhoto(command.photoData)) throw Error("Fotografie invalidă.");
          candidate.photoId = `photo-${command.id}`;
        }
        data.items.push(candidate); movement.itemId = candidate.id;
      }
    }
    if (!data.items.some(i => i.id === movement.itemId && !i.deletedAt)) throw Error("Selectează un articol din stoc. Articolul ales poate fi șters între timp.");
    if (command.type === "adjust") {
      const count = Number(command.count);
      if (!Number.isSafeInteger(count) || count < 0 || count > 1000000) throw Error("Stocul numărat trebuie să fie un număr întreg, cel puțin zero.");
      if (!movement.note) throw Error("Scrie motivul corecției de stoc.");
      movement.quantity = count - available(data, movement.itemId);
      if (!movement.quantity) throw Error("Stocul este deja egal cu numărul introdus.");
    } else movement.quantity = positive(command.quantity);
    if (["gift", "loan"].includes(command.type)) {
      const recipient = command.recipient || {};
      if (!["club", "external"].includes(recipient.type)) throw Error("Alege destinatarul.");
      if (recipient.type === "external") {
        let person = data.people.find(p => p.id === recipient.id);
        if (!person) {
          if (recipient.id) throw Error("Sportivul extern nu mai există.");
          if (!clean(recipient.name)) throw Error("Completează numele sportivului extern.");
          person = data.people.find(p => key(p.name) === key(recipient.name) && key(p.club) === key(recipient.club));
          if (!person) { person = { id: `person-${command.id}`, name: clean(recipient.name).toLocaleUpperCase("ro"), club: clean(recipient.club), phone: clean(recipient.phone) }; data.people.push(person); }
        }
        movement.recipient = { type: "external", id: person.id, name: person.name, club: person.club };
      } else {
        if (!clean(recipient.id) || !clean(recipient.name)) throw Error("Selectează sportivul clubului.");
        movement.recipient = { type: "club", id: clean(recipient.id), name: clean(recipient.name), club: "CS HEART" };
      }
      if (available(data, movement.itemId) < movement.quantity) throw Error("Nu ai suficiente articole disponibile în stoc.");
    } else if (command.type === "return") {
      const loan = data.movements.find(m => m.id === command.loanId && m.type === "loan" && !m.canceledAt);
      if (!loan || loan.itemId !== movement.itemId) throw Error("Împrumutul nu mai este disponibil.");
      if (movement.quantity > outstanding(data, loan)) throw Error("Cantitatea depășește ce mai are sportivul de returnat.");
      if (movement.date < loan.date) throw Error("Returnarea nu poate fi înaintea predării.");
      movement.loanId = loan.id;
      movement.recipient = { ...loan.recipient };
    } else if (!["in", "adjust"].includes(command.type)) throw Error("Tip de operațiune necunoscut.");
    data.movements.push(movement);
    return data;
  }

  function groupAssignments(movements) {
    const groups=new Map();
    for (const m of movements) {
      const id=m.recipient.type+":"+m.recipient.id;
      if (!groups.has(id)) groups.set(id,{id,recipient:m.recipient,movements:[]});
      groups.get(id).movements.push(m);
    }
    return [...groups.values()].sort((a,b)=>a.recipient.name.localeCompare(b.recipient.name,"ro"));
  }
  function View({ data, athletes = [], onCommand, onDirtyChange = () => {}, loadPhoto }) {
    const [tab, setTab] = React.useState("stock");
    const [search, setSearch] = React.useState("");
    const [filter, setFilter] = React.useState("all");
    const [form, setForm] = React.useState(null);
    const [busy, setBusy] = React.useState(false);
    const [photoBusy,setPhotoBusy] = React.useState(false);
    const [error, setError] = React.useState("");
    const [notice, setNotice] = React.useState("");
    const [historyLimit, setHistoryLimit] = React.useState(50);
    React.useEffect(() => { onDirtyChange(Boolean(form)); return () => onDirtyChange(false); }, [Boolean(form)]);
    React.useEffect(() => {
      if (!form) return;
      const guard = event => { event.preventDefault(); event.returnValue = ""; };
      window.addEventListener("beforeunload", guard);
      return () => window.removeEventListener("beforeunload", guard);
    }, [Boolean(form)]);
    const items = data.items.filter(i => !i.deletedAt).sort((a,b) => itemLabel(a).localeCompare(itemLabel(b), "ro"));
    async function removeItem(item, restore = false) {
      if (busy) return;
      if (form) { alert("Salvează sau închide formularul înainte de această operațiune."); return; }
      if (!confirm(restore ? `Restabilești articolul «${itemLabel(item)}» și cantitatea lui în stoc?` : `Ștergi articolul «${itemLabel(item)}» și cantitatea introdusă? Îl poți introduce din nou corect. Istoricul se păstrează și îl poți restabili din Istoric.`)) return;
      setBusy(true); setNotice(""); setError("");
      try { await onCommand({id:`eq-${Date.now()}-${Math.random().toString(36).slice(2,10)}`,type:restore?"restore-item":"delete-item",itemId:item.id}); setNotice(restore?"Articolul a fost restabilit.":"Articolul a fost șters din stoc. Îl poți introduce din nou corect."); }
      catch(e) { setError(e.message || "Operațiunea nu s-a salvat. Încearcă din nou."); }
      finally { setBusy(false); }
    }
    const lookup = id => data.items.find(i => i.id === id);
    const matching = text => !search || key(text).includes(key(search));
    const loans = active(data).filter(m => m.type === "loan");
    const gifts = active(data).filter(m => m.type === "gift");
    function start(type, extra = {}) {
      if (busy || photoBusy) return;
      if (form && !confirm("Renunți la formularul nesalvat?")) return;
      setError(""); setNotice("");
      setForm({ id: `eq-${Date.now()}-${Math.random().toString(36).slice(2,10)}`, type, itemId: "", quantity: "1", date: localDate(), note: "", recipientType: "external", recipientId: "", name: "", club: "", phone: "", item: { name: "", category: "Echipament", size: "", color: "", personalization: "", unit: "buc." }, ...extra });
      window.setTimeout(() => document.getElementById("equipment-form")?.scrollIntoView({behavior:"smooth",block:"start"}), 0);
    }
    function close() { if (!busy && !photoBusy && confirm("Renunți la formularul nesalvat?")) { setForm(null); setError(""); } }
    function update(field, value) { setForm(old => ({...old, [field]:value})); }
    async function submit(event) {
      event.preventDefault(); if (!form || busy || photoBusy) return;
      setBusy(true); setError("");
      const command = { ...form };
      if (["gift","loan"].includes(form.type)) {
        command.type="handover"; command.mode=form.type;
        command.lines=[{itemId:form.itemId,quantity:form.quantity},...(form.extraLines||[])];
        const athlete = athletes.find(a => a.id === form.recipientId);
        command.recipient = form.recipientType === "club"
          ? { type:"club", id:athlete?.id || "", name:athlete ? `${athlete.lastName} ${athlete.firstName}` : "" }
          : { type:"external", id:form.recipientId, name:form.name, club:form.club, phone:form.phone };
      }
      try { await onCommand(command); setForm(null); setNotice("Operațiunea a fost salvată."); }
      catch (e) { setError(e.message || "Nu s-a putut salva. Formularul a fost păstrat; verifică legătura la internet."); }
      finally { setBusy(false); }
    }
    function field(label, control) { return h("label", {className:"field"}, h("span", null, label), control); }
    function input(label, name, options = {}) { return field(label, h("input", {"aria-label":label, value:form[name] ?? "", onChange:e=>update(name,e.target.value), ...options})); }
    function select(label, name, options) { return field(label,h("select",{"aria-label":label,value:form[name],onChange:e=>update(name,e.target.value)},options.map(([value,title])=>h("option",{key:value,value},title)))); }
    function person(m) { return `${m.recipient?.name || ""}${m.recipient?.type === "external" ? ` · Extern${m.recipient.club ? ` / ${m.recipient.club}` : ""}` : " · CS HEART"}`; }
    function buttons(children) { return h("div",{className:"equipment-actions"},children); }
    const assignments = [...loans,...gifts].filter(m=>matching(`${person(m)} ${itemLabel(lookup(m.itemId))}`) && (filter === "all" || (filter === "out" && m.type === "loan" && outstanding(data,m)>0) || (filter === "gift" && m.type === "gift") || (filter === "returned" && m.type === "loan" && outstanding(data,m)===0))).sort((a,b)=>b.date.localeCompare(a.date));
    const history = [...data.movements].reverse().filter(m=>matching(`${types[m.type]} ${itemLabel(lookup(m.itemId))} ${m.recipient ? person(m) : ""} ${m.note}`));
    const stock = items.filter(i=>matching(`${itemLabel(i)} ${i.category}`));
    return h("section",{className:"stack equipment"},
      h("div",{className:"panel"},h("p",{className:"eyebrow"},"GESTIUNE CLUB"),h("h2",null,"Echipamente și materiale"),h("p",null,"Ce ai la club, ce ai predat și cui. Fără taxe sau datorii generate automat."),
        buttons([h("button",{key:"in",className:"primary",onClick:()=>start("in"),disabled:busy},"Adaugă în stoc"),h("button",{key:"out",onClick:()=>start("gift"),disabled:busy || !items.length},"Predă echipament")])
      ),
      notice && h("p",{role:"status",className:"panel"},notice),
      error && !form && h("p",{role:"alert",className:"panel auth-error"},error),
      tab === "stock" && items.length > 0 && h("details",{className:"panel"},h("summary",null,"Șterge un articol introdus greșit"),h("p",null,"Articolele cu predări active sunt protejate. Ștergerea poate fi anulată din Istoric."),items.filter(i=>matching(itemLabel(i))).map(i=>h("div",{key:i.id,className:"equipment-actions"},h("span",null,itemLabel(i)),h("button",{disabled:busy,onClick:()=>removeItem(i)},"Șterge articolul")))),
      tab === "history" && data.items.some(i=>i.deletedAt) && h("details",{className:"panel"},h("summary",null,"Articole șterse"),data.items.filter(i=>i.deletedAt).map(i=>h("div",{key:i.id,className:"equipment-actions"},h("span",null,`${itemLabel(i)} — șters ${i.deletedAt.slice(0,10)}`),h("button",{disabled:busy,onClick:()=>removeItem(i,true)},"Restabilește articolul")))),
      form && h("form",{id:"equipment-form",className:"panel stack",onSubmit:submit},
        h("h3",null, form.type === "edit-item" ? "Poză și culoare" : form.type === "cancel" ? "Anulează operațiunea cu motiv" : types[form.type]),
        h("fieldset",{disabled:busy,className:"equipment-fieldset"},h("div",{className:"compact-grid"},
          !["cancel","edit-item"].includes(form.type) && select("Articol", "itemId", [...(form.type === "in" ? [["","Articol nou"]] : [["","Alege articolul"]]), ...items.map(i=>[i.id,`${itemLabel(i)} — disponibil ${available(data,i.id)} ${i.unit}`])]),
          form.type === "in" && !form.itemId && ["name","category","size","color","personalization","unit"].map((name,index)=>field(["Denumire articol","Categorie","Mărime (opțional)","Culoare (opțional)","Număr / personalizare (opțional)","Unitate (buc., set etc.)"][index],h("input",{key:name,value:form.item[name],required:name === "name" || name === "unit",onChange:e=>update("item",{...form.item,[name]:e.target.value})}))),
          form.type === "edit-item" ? input("Culoare (opțional)", "color") : form.type === "cancel" ? input("Motivul anulării", "reason", {required:true}) : form.type === "adjust" ? input("Cantitate fizică disponibilă la club", "count", {type:"number",min:0,step:1,required:true}) : input("Cantitate", "quantity", {type:"number",min:1,step:1,required:true}),
          !["cancel","edit-item"].includes(form.type) && input("Data", "date", {type:"date",max:localDate(),required:true}),
          ["gift","loan"].includes(form.type) && select("Tip predare", "type", [["gift","Oferit definitiv — gratuit"],["loan","Împrumutat — de returnat"]]),
          ["gift","loan"].includes(form.type) && field("Destinatar",h("select",{"aria-label":"Destinatar",value:form.recipientType,onChange:e=>setForm(old=>({...old,recipientType:e.target.value,recipientId:""}))},h("option",{value:"external"},"Sportiv extern"),h("option",{value:"club"},"Sportiv CS HEART"))),
          ["gift","loan"].includes(form.type) && select("Sportiv", "recipientId", form.recipientType === "club" ? [["","Alege sportivul"],...[...athletes].sort((a,b)=>`${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`,"ro")).map(a=>[a.id,`${a.lastName} ${a.firstName}${a.active===false ? " (inactiv)" : ""}`])] : [["","Sportiv extern nou"],...data.people.map(p=>[p.id,`${p.name}${p.club ? ` / ${p.club}` : ""}`])]),
          ["gift","loan"].includes(form.type) && form.recipientType === "external" && !form.recipientId && [input("Nume sportiv extern","name",{required:true}),input("Club de origine (opțional)","club"),input("Telefon de contact (opțional)","phone",{type:"tel"})],
          !["cancel","edit-item"].includes(form.type) && input(form.type === "adjust" ? "Motivul corecției" : "Observații (opțional)", "note", {required:form.type === "adjust"})
        )),
        ["gift","loan"].includes(form.type) && h("div",{className:"stack"},h("p",null,"Alege articolele din stoc; pozele, culorile și mărimile lor se păstrează automat."),
          lookup(form.itemId)&&h(window.CSHeartEquipmentMedia.Thumbnail,{item:lookup(form.itemId),loadPhoto}),
          (form.extraLines||[]).map((line,index)=>h("div",{key:index,className:"panel compact-grid"},
            field("Echipament "+(index+2),h("select",{"aria-label":"Echipament "+(index+2),required:true,disabled:busy,value:line.itemId,onChange:e=>update("extraLines",form.extraLines.map((l,n)=>n===index?{...l,itemId:e.target.value}:l))},h("option",{value:""},"Alege articolul"),items.map(i=>h("option",{key:i.id,value:i.id},itemLabel(i)+" — disponibil "+available(data,i.id)+" "+i.unit)))),
            field("Cantitate "+(index+2),h("input",{"aria-label":"Cantitate "+(index+2),type:"number",min:1,step:1,required:true,disabled:busy,value:line.quantity,onChange:e=>update("extraLines",form.extraLines.map((l,n)=>n===index?{...l,quantity:e.target.value}:l))})),
            lookup(line.itemId)&&h(window.CSHeartEquipmentMedia.Thumbnail,{item:lookup(line.itemId),loadPhoto}),
            h("button",{type:"button",disabled:busy,onClick:()=>update("extraLines",form.extraLines.filter((_,n)=>n!==index))},"Elimină din predare")
          )),
          h("button",{type:"button",disabled:busy||(form.extraLines||[]).length>=49,onClick:()=>update("extraLines",[...(form.extraLines||[]),{itemId:"",quantity:"1"}])},"Adaugă încă un echipament")
        ),
        ((form.type === "in" && !form.itemId) || form.type === "edit-item") && h(window.CSHeartEquipmentMedia.Picker,{key:form.id,disabled:busy,value:form.photoData,onChange:photoData=>setForm(old=>old?.id===form.id?({...old,photoData,removePhoto:false}):old),onBusy:setPhotoBusy,onError:setError}),
        form.type === "edit-item" && h("p",null,"Completarea culorii se aplică acestui articol și predărilor lui existente. Cantitățile nu se schimbă. Pentru o altă culoare fizică, adaugă un articol separat."),
        form.type === "edit-item" && lookup(form.itemId)?.photoId && h(window.CSHeartEquipmentMedia.Thumbnail,{item:lookup(form.itemId),loadPhoto}),
        form.type === "edit-item" && lookup(form.itemId)?.photoId && h("label",null,h("input",{type:"checkbox",checked:!!form.removePhoto,onChange:e=>setForm(old=>({...old,removePhoto:e.target.checked,photoData:""}))})," Elimină fotografia existentă"),
        form.type === "return" && h("p",null,"Poți returna și o parte din cantitate. Articolele reintră în stocul disponibil."),
        form.type === "cancel" && h("p",null,"Înregistrarea rămâne în istoric, marcată ca anulată. Stocul va fi recalculat."),
        error && h("p",{role:"alert",className:"auth-error"},error),
        buttons([h("button",{key:"save",type:"submit",className:"primary",disabled:busy || photoBusy},busy?"Se salvează…":"Salvează"),h("button",{key:"close",type:"button",disabled:busy,onClick:close},"Renunță")])
      ),
      h("nav",{className:"equipment-actions","aria-label":"Evidență echipamente"},[["stock","Stoc"],["assigned","Predări"],["history","Istoric"]].map(([value,title])=>h("button",{key:value,"aria-pressed":tab===value,className:tab===value?"primary":"",onClick:()=>{setTab(value);setSearch("");setHistoryLimit(50);}},title))),
      field("Caută articol sau sportiv",h("input",{type:"search",value:search,onChange:e=>setSearch(e.target.value),placeholder:"Trening, minge, numele sportivului…"})),
      tab === "stock" && h("div",{className:"stack"},
        !stock.length && h("div",{className:"panel"},items.length?"Niciun articol găsit.":"Stocul este gol. Începe cu «Adaugă în stoc»."),
        groupStock(stock).map(g=>h("article",{key:g.id,className:"panel equipment-model"},
          g.photo&&h(window.CSHeartEquipmentMedia.Thumbnail,{item:g.photo,loadPhoto}),
          h("h3",null,[g.model.name,g.model.color].filter(Boolean).join(" · ")),
          h("p",null,g.model.category),
          h("p",null,"Disponibil"+(search?" în selecție":"")+": "+g.items.reduce((n,i)=>n+available(data,i.id),0)+" "+g.model.unit),
          h("div",{className:"equipment-stock-table"},h("table",null,
            h("thead",null,h("tr",null,["Mărime","Număr / personalizare","Disponibil","Împrumutat","Oferit definitiv","Acțiuni"].map(t=>h("th",{key:t,scope:"col"},t)))),
            h("tbody",null,g.items.map(i=>h("tr",{key:i.id},
              h("td",{"data-label":"Mărime"},i.size||"—"),
              h("td",{"data-label":"Număr / personalizare"},i.personalization||"—"),
              h("td",{"data-label":"Disponibil"},available(data,i.id)+" "+i.unit),
              h("td",{"data-label":"Împrumutat"},loans.filter(m=>m.itemId===i.id).reduce((n,m)=>n+outstanding(data,m),0)),
              h("td",{"data-label":"Oferit definitiv"},gifts.filter(m=>m.itemId===i.id).reduce((n,m)=>n+m.quantity,0)),
              h("td",{"data-label":"Acțiuni"},buttons([
                h("button",{key:"give",disabled:busy||available(data,i.id)<=0,onClick:()=>start("gift",{itemId:i.id})},"Predă"),
                h("details",{key:"more"},h("summary",null,"Mai multe"),buttons([
                  h("button",{key:"photo",disabled:busy||photoBusy,onClick:()=>start("edit-item",{itemId:i.id,color:i.color||""})},"Poză și culoare"),
                  h("button",{key:"count",disabled:busy,onClick:()=>start("adjust",{itemId:i.id,count:String(available(data,i.id))})},"Corectează stocul")
                ]))
              ]))
            )))
          )),
          h("button",{disabled:busy||photoBusy,onClick:()=>start("in",{sourceItemId:g.model.id,item:{name:g.model.name,category:g.model.category,color:g.model.color||"",unit:g.model.unit,size:"",personalization:""}})},"Adaugă mărime / număr")
        ))
      ),
      tab === "assigned" && h("div",{className:"stack"},field("Arată predările",h("select",{value:filter,onChange:e=>setFilter(e.target.value)},[["all","Toate"],["out","De returnat"],["gift","Oferite definitiv"],["returned","Returnate complet"]].map(([value,title])=>h("option",{key:value,value},title)))),!assignments.length&&h("p",{className:"panel"},"Nu există predări în selecția aleasă."),groupAssignments(assignments).map(g=>h("details",{key:g.id,className:"panel"},h("summary",null,person({recipient:g.recipient})+" — "+g.movements.length+" predări"),h("button",{disabled:busy,onClick:()=>start("gift",{recipientType:g.recipient.type,recipientId:g.recipient.id})},"Predă alte echipamente"),g.movements.map(m=>h("article",{key:m.id,className:"panel"},h(window.CSHeartEquipmentMedia.Thumbnail,{item:lookup(m.itemId),loadPhoto}),h("p",null,`${itemLabel(lookup(m.itemId))} — ${m.quantity} ${lookup(m.itemId)?.unit}`),h("p",null,`${m.date.split("-").reverse().join(".")} · ${m.type === "gift"?"Oferit definitiv — gratuit":outstanding(data,m)?`La sportiv: ${outstanding(data,m)} · Returnat: ${m.quantity-outstanding(data,m)}`:"Returnat complet"}`),m.note&&h("p",null,m.note),m.type === "loan"&&outstanding(data,m)>0&&h("button",{disabled:busy,onClick:()=>start("return",{itemId:m.itemId,loanId:m.id,quantity:String(outstanding(data,m))})},"Marchează returnat")))))),
      tab === "history" && h("div",{className:"stack"},h("p",null,"Istoric în ordinea înregistrării. Corectările nu șterg operațiunile inițiale."),!history.length&&h("p",{className:"panel"},"Nu există mișcări în istoric."),history.slice(0,historyLimit).map(m=>h("article",{key:m.id,className:"panel"},h("h3",null,`${types[m.type]}${m.canceledAt?" — ANULATĂ":""}`),h("p",null,`${itemLabel(lookup(m.itemId))} · ${m.quantity} ${lookup(m.itemId)?.unit} · ${m.date.split("-").reverse().join(".")}`),m.recipient&&h("p",null,person(m)),h("small",null,`Operat de: ${window.CSHeartOperatorReceipts?.operatorLabel(m.recordedBy)||m.recordedBy||"Necunoscut"}`),m.note&&h("p",null,m.note),m.canceledAt?h("p",null,`Motiv: ${m.cancellationReason} · ${m.canceledAt.slice(0,10)} · ${window.CSHeartOperatorReceipts?.operatorLabel(m.canceledBy)||m.canceledBy}`):h("div",null,h("button",{disabled:busy,onClick:()=>start("cancel",{movementId:m.id,reason:""})},"Anulează operațiunea")))),history.length>historyLimit&&h("button",{onClick:()=>setHistoryLimit(n=>n+50)},"Arată încă 50"))
    );
  }
  window.CSHeartEquipment = { empty, validateState, applyCommand, available, outstanding, itemLabel, groupAssignments, groupStock, View };
})();
