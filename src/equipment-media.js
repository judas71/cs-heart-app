(function () {
  const h = React.createElement;
  const validPhoto = value => typeof value === "string" && value.length <= 100000 && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(value);
  async function resize(file) {
    if (!file || !["image/jpeg","image/png","image/webp"].includes(file.type)) throw Error("Alege o fotografie JPG, PNG sau WebP. Pentru HEIC, exportă întâi ca JPG.");
    if (file.size > 20 * 1024 * 1024) throw Error("Fotografia depășește 20 MB. Alege o variantă mai mică.");
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      await new Promise((resolve,reject) => { img.onload=resolve; img.onerror=()=>reject(Error("Fotografia nu poate fi citită.")); img.src=url; });
      if (!img.naturalWidth || !img.naturalHeight) throw Error("Fotografie invalidă.");
      for (const edge of [800,600,400,240]) {
        const scale=Math.min(1,edge/Math.max(img.naturalWidth,img.naturalHeight));
        const canvas=document.createElement("canvas"); canvas.width=Math.max(1,Math.round(img.naturalWidth*scale)); canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
        const ctx=canvas.getContext("2d"); ctx.fillStyle="#fff"; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0,canvas.width,canvas.height);
        const photo=canvas.toDataURL("image/jpeg",0.78);
        if (validPhoto(photo)) return photo;
      }
      throw Error("Nu am reușit să micșorez fotografia. Alege alta.");
    } finally { URL.revokeObjectURL(url); }
  }
  function Thumbnail({item,loadPhoto}) {
    const [photo,setPhoto]=React.useState(""); const [error,setError]=React.useState(false); const [open,setOpen]=React.useState(false);
    React.useEffect(()=>{let live=true;setPhoto("");setError(false);setOpen(false);if(item.photoId&&loadPhoto)loadPhoto(item.photoId).then(value=>{if(live)setPhoto(value);}).catch(()=>{if(live)setError(true);});return()=>{live=false;};},[item.photoId,loadPhoto]);
    React.useEffect(()=>{if(!open)return;const close=e=>{if(e.key==="Escape")setOpen(false);};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close);},[open]);
    if (!item.photoId) return null;
    if (!photo) return h("small",null,error?"Fotografia nu poate fi încărcată.":"Se încarcă fotografia…");
    return h(React.Fragment,null,h("button",{type:"button",className:"equipment-thumbnail","aria-label":`Mărește fotografia: ${item.name}`,onClick:()=>setOpen(true)},h("img",{src:photo,alt:item.name})),open&&h("div",{className:"equipment-photo-overlay",role:"dialog","aria-modal":true,"aria-label":`Fotografie ${item.name}`,onClick:()=>setOpen(false)},h("div",{className:"equipment-photo-dialog",onClick:e=>e.stopPropagation()},h("button",{type:"button",autoFocus:true,onClick:()=>setOpen(false)},"Închide fotografia"),h("img",{src:photo,alt:item.name}))));
  }
  function Picker({value,onChange,onBusy,onError,disabled}) {
    const [working,setWorking]=React.useState(false);
    const live=React.useRef(true);
    React.useEffect(()=>{live.current=true;return()=>{live.current=false;onBusy(false);};},[]);
    return h("div",{className:"field"},h("span",null,"Fotografie (opțional)"),h("input",{type:"file",accept:"image/jpeg,image/png,image/webp",disabled:working||disabled,"aria-label":"Alege fotografia",onChange:async e=>{const file=e.target.files[0];if(!file)return;setWorking(true);onBusy(true);onError("");try{const result=await resize(file);if(live.current)onChange(result);}catch(error){if(live.current)onError(error.message);}finally{if(live.current){setWorking(false);onBusy(false);}}}}),h("small",null,working?"Se micșorează fotografia…":"JPG, PNG sau WebP. Fotografia este micșorată automat."),value&&h("img",{className:"equipment-photo-preview",src:value,alt:"Fotografie aleasă"}));
  }
  window.CSHeartEquipmentMedia={validPhoto,resize,Thumbnail,Picker};
})();
