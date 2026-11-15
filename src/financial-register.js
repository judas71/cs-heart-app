(function () {
  const key = value => String(value || "").trim().toLocaleLowerCase("ro").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const roDate = value => value ? value.split("-").reverse().join(".") : "Dată nepăstrată";
  function parseDate(value) {
    const text = String(value || "").trim();
    const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(text);
    const iso = m ? `${m[3]}-${m[2]}-${m[1]}` : text;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
    const date = new Date(iso + "T12:00:00Z");
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === iso ? iso : "";
  }
  const methodLabel = method => ({ cash: "Numerar", transfer: "Transfer" }[method] || "Metodă neprecizată");
  const money = cents => (cents / 100).toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function buildRows(props, kind) {
    const athletes = new Map((props.athletes || []).map(a => [a.id, a]));
    if (kind === "taxe") {
      const groups = new Map((props.fees || []).map(f => [f.id || `${f.athleteId}-${f.month}`, athletes.get(f.athleteId)?.group || "—"]));
      return window.CSHeartOperatorReceipts.buildRows({ athletes: props.athletes, fees: props.fees }).map(r => ({ ...r, date: parseDate(r.date), group: groups.get(r.parentId) || "—", category: "Taxe", estimated: false }));
    }
    const rows = [];
    function add(p, source) {
      const cents = Math.round(Number(p.amount || 0) * 100);
      if (!Number.isFinite(cents) || cents <= 0) return;
      const athlete = athletes.get(p.athleteId);
      let date = parseDate(p.date), estimated = false;
      if (!date && !p.date && source === "Taxe" && /^\d{4}-(0[1-9]|1[0-2])$/.test(p.month || "")) {
        const [y, m] = p.month.split("-").map(Number);
        date = `${p.month}-${new Date(Date.UTC(y, m, 0)).getUTCDate()}`; estimated = true;
      }
      rows.push({ id: `${source}-${p.id || rows.length}`, date, estimated, source,
        payer: (source === "Taxe" ? p.recipient : athlete ? `${athlete.lastName || ""} ${athlete.firstName || ""}` : p.payerName) || "Beneficiar neprecizat",
        category: source === "Taxe" ? ({salariu: "Salarii", chirie: "Chirii"}[p.paymentType] || p.paymentType || "Altele") : p.category || "Altele",
        description: [p.actionName, p.notes, p.paymentType === "retur" ? "Retur de sume" : p.paymentType === "avans" ? "Avans" : ""].filter(Boolean).join(" / "),
        method: ["cash", "transfer"].includes(p.method) ? p.method : "necunoscut",
        cents, currency: p.currency === "euro" ? "euro" : "lei" });
    }
    (props.taxPayments || []).forEach(p => add(p, "Taxe"));
    (props.otherPayments || []).filter(p => ["cheltuiala", "avans", "retur"].includes(p.paymentType)).forEach(p => add(p, "Alte încasări"));
    return rows.sort((a,b) => b.date.localeCompare(a.date) || a.payer.localeCompare(b.payer, "ro"));
  }
  function filterRows(rows, filters) {
    const from = parseDate(filters.from), to = parseDate(filters.to);
    const error = (filters.from && !from) || (filters.to && !to) ? "Completează date valide în format zz.ll.aaaa." : from && to && from > to ? "Data de început trebuie să fie înaintea datei de sfârșit." : "";
    if (error) return { rows: [], error };
    return { error: "", rows: rows.filter(r => r.date && (!from || r.date >= from) && (!to || r.date <= to)
      && (!filters.method || r.method === filters.method)
      && (!filters.operator || (key(r.operator) || "neidentificat") === filters.operator)
      && (!filters.category || key(r.category) === filters.category)
      && (!filters.beneficiary || key(r.payer) === filters.beneficiary)) };
  }
  function totals(rows) {
    return ["lei", "euro"].map(currency => ({ currency, cents: rows.filter(r => r.currency === currency).reduce((s,r) => s + r.cents, 0) }));
  }
  const totalText = rows => totals(rows).map(t => `${money(t.cents)} ${t.currency}`).join(" / ");
  function summaryRows(rows, kind) {
    const groups = kind === "taxe" ? [...new Set(rows.map(r => key(r.operator)))] : [""];
    return groups.map(operator => {
      const selected = kind === "taxe" ? rows.filter(r => key(r.operator) === operator) : rows;
      return [kind === "taxe" ? window.CSHeartOperatorReceipts.operatorLabel(operator) : "Total selecție", ...["cash", "transfer", "necunoscut"].map(m => totalText(selected.filter(r => r.method === m))), totalText(selected)];
    });
  }
  function tableData(rows, kind) {
    return { headers: kind === "taxe" ? ["Data încasării", "Sportiv", "Grupa actuală", "Detalii", "Modalitate", "Operator inițial", "Sumă"] : ["Data plății", "Beneficiar", "Categorie", "Explicație", "Modalitate", "Sursă", "Sumă"],
      body: rows.map(r => [roDate(r.date) + (r.estimated ? " *" : ""), r.payer, kind === "taxe" ? r.group : r.category, r.description || "—", methodLabel(r.method), kind === "taxe" ? window.CSHeartOperatorReceipts.operatorLabel(r.operator) : r.source, `${money(r.cents)} ${r.currency}`]) };
  }
  const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"}[c]));
  const summaryHeaders = ["Operator / selecție", "Numerar", "Transfer", "Neprecizat", "Total"];
  const note = "Operatorul este persoana care a înregistrat încasarea, nu ultimul editor. Grupa este cea actuală. Încasările sunt selectate după data banilor primiți, indiferent de luna datoriei. * Pentru o plată veche fără dată, ultima zi a lunii este folosită ca reper, nu ca dată confirmată.";
  function printHTML(rows, kind, filtersText) {
    const data = tableData(rows, kind);
    const table = (headers, body) => `<table><thead><tr>${headers.map(x => `<th>${escape(x)}</th>`).join("")}</tr></thead><tbody>${body.map(row => `<tr>${row.map(x => `<td>${escape(x)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    return `<!doctype html><html lang="ro"><head><meta charset="utf-8"><title>Registru ${kind === "taxe" ? "încasări taxe" : "plăți"}</title><style>body{font:12px Arial;color:#111;margin:24px}table{border-collapse:collapse;width:100%;margin:18px 0}th,td{border:1px solid #bbb;padding:7px;text-align:left;overflow-wrap:anywhere}th{background:#eee}tr{break-inside:avoid}thead{display:table-header-group}@page{size:A4 landscape;margin:12mm}@media print{button{display:none}body{margin:0}}small{display:block;margin:12px 0}</style></head><body><button onclick="window.print()">Tipărește / Salvează PDF</button><h1>Registru ${kind === "taxe" ? "încasări taxe" : "plăți"}</h1><p>${escape(filtersText)}</p><p>${rows.length} operațiuni · Total: ${escape(totalText(rows))}</p>${table(summaryHeaders, summaryRows(rows, kind))}${table(data.headers, data.body)}<small>${escape(note)}</small></body></html>`;
  }
  function Report(props) {
    const h = React.createElement, kind = props.kind || "taxe";
    const now = new Date(), iso = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
    const [filters, setFilters] = React.useState({ from: roDate(iso.slice(0,7)+"-01"), to: roDate(iso), method: "", operator: "", category: "", beneficiary: "" });
    const [preview, setPreview] = React.useState("");
    const all = buildRows(props, kind), result = filterRows(all, filters), rows = result.rows;
    const set = (field, value) => setFilters(f => ({ ...f, [field]: value }));
    const options = field => [...new Map(all.map(r => [key(r[field]), r[field]])).entries()].sort((a,b) => a[1].localeCompare(b[1],"ro"));
    const operators = window.CSHeartOperatorReceipts.operatorOptions(all).filter(([id]) => id !== "toate");
    const fields = kind === "taxe" ? [["Operator", "operator", operators]] : [["Categorie", "category", options("category")], ["Beneficiar", "beneficiary", options("payer")]];
    fields.push(["Modalitate", "method", [["cash","Numerar"],["transfer","Transfer"],["necunoscut","Metodă neprecizată"]]]);
    const filtersText = `Interval: ${filters.from || "început"} — ${filters.to || "prezent"}; ` + fields.map(([label, field, opts]) => `${label}: ${opts.find(([id]) => id === filters[field])?.[1] || "Toate"}`).join("; ");
    const data = tableData(rows, kind);
    function table(headers, body) {
      return h("div", { style: { overflowX: "auto" } }, h("table", { style: { minWidth: "760px", width: "100%" } }, h("thead", null, h("tr", null, headers.map(t => h("th", {key:t}, t)))), h("tbody", null, body.map((r,i) => h("tr", {key:i}, r.map((v,j) => h("td", {key:j, "data-label":headers[j]}, v)))))));
    }
    return h("section", {className:"panel stack"},
      h("h2", null, kind === "taxe" ? "Registru încasări taxe" : "Registru plăți"),
      h("p", null, "Filtrează operațiunile și tipărește exact selecția afișată. Nu se modifică nicio înregistrare."),
      h("div", {className:"compact-grid"}, ["from","to"].map(field => h("label", {className:"field",key:field}, h("span",null,field === "from" ? "De la" : "Până la"), h("input", {"aria-label":field === "from" ? "De la" : "Până la", placeholder:"zz.ll.aaaa",value:filters[field],onChange:e=>set(field,e.target.value)}))),
        fields.map(([label,field,opts]) => h("label", {className:"field",key:field},h("span",null,label),h("select",{"aria-label":label,value:filters[field],onChange:e=>set(field,e.target.value)},h("option",{value:""},"Toate"),opts.map(([id,title])=>h("option",{key:id,value:id},title)))))),
      h("div", {className:"form-actions"}, h("button", {type:"button",onClick:()=>setFilters({from:"",to:"",method:"",operator:"",category:"",beneficiary:""})},"Tot istoricul / șterge filtrele"),
        h("button", {type:"button",disabled:!!result.error || !rows.length,onClick:()=>setPreview(printHTML(rows,kind,filtersText))},"Tipărește / PDF")),
      preview && h("div", {role:"dialog","aria-modal":true,"aria-label":"Previzualizare raport",style:{position:"fixed",inset:0,zIndex:10000,background:"#fff",padding:"16px",display:"flex",flexDirection:"column",gap:"12px"}},
        h("div",{className:"form-actions"},h("strong",null,"Previzualizare — doar selecția filtrată"),h("button",{type:"button",onClick:()=>setPreview("")},"Închide previzualizarea")),
        h("p",null,"Apasă Tipărește / Salvează PDF în document. În fereastra de tipărire poți alege imprimanta sau Salvare ca PDF."),
        h("iframe",{title:"Raport pentru tipărire",srcDoc:preview,style:{width:"100%",flex:1,border:"1px solid #ddd",background:"white"}})),
      result.error && h("p", {role:"alert"}, result.error),
      h("p", null, filtersText), h("strong", null, `${rows.length} operațiuni · Total: ${totalText(rows)}`),
      table(summaryHeaders,summaryRows(rows,kind)),
      !rows.length ? h("p",null,"Nu există operațiuni în selecția aleasă.") : table(data.headers,data.body),
      all.some(r=>!r.date) && h("p", {role:"status"}, `${all.filter(r=>!r.date).length} operațiuni fără dată validă nu sunt incluse în tabel și totaluri.`),
      h("small",null,note));
  }
  window.CSHeartFinancialRegister = { buildRows, filterRows, totals, tableData, summaryRows, printHTML, parseDate, Report };
})();
