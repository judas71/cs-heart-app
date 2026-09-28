(function () {
  function identity(record) {
    const email = String(record?.recordedByEmail || "").trim();
    return email && email !== "necunoscut" ? email : "";
  }

  // Initial operator is immutable. Last editor is not evidence of original receipt ownership.
  function stampReceipt(receipt, previous, user, now, historical = false) {
    const result = { ...receipt };
    if (previous || historical) {
      result.recordedByEmail = previous?.recordedByEmail || "";
      result.recordedById = previous?.recordedById || "";
      result.recordedAt = previous?.recordedAt || "";
    } else {
      result.recordedByEmail = user?.email || "";
      result.recordedById = user?.uid || "";
      result.recordedAt = now;
    }
    return result;
  }

  function stampFee(fee, previous, user, now) {
    if (!Array.isArray(fee.payments)) return { ...fee };
    const old = previous?.payments || [];
    const legacyId = previous ? `legacy-${previous.id || `${previous.athleteId}-${previous.month}`}` : "";
    return { ...fee, payments: fee.payments.map(payment => {
      const existing = payment.id ? old.find(item => item.id === payment.id) : null;
      const historical = !payment.id || payment.id === legacyId;
      return stampReceipt(payment, existing, user, now, historical);
    }) };
  }

  function dateISO(value) {
    const text = String(value || "").trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
    const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(text);
    return match ? `${match[3]}-${match[2]}-${match[1]}` : "";
  }

  function buildRows({ athletes = [], fees = [], otherPayments = [] }) {
    const names = new Map(athletes.map(a => [a.id, `${a.lastName || ""} ${a.firstName || ""}`.trim()]));
    const rows = [];
    function add(payment, context) {
      const cents = Math.round(Number(payment.amount || 0) * 100);
      if (!Number.isFinite(cents) || cents <= 0) return;
      rows.push({ ...context, id: `${context.source}-${context.parentId}-${payment.id || rows.length}`,
        cents, currency: payment.currency === "euro" ? "euro" : "lei",
        date: dateISO(payment.date), operator: identity(payment),
        lastEditor: payment.updatedByEmail || context.lastEditor || "",
        method: ["cash", "transfer"].includes(payment.method) ? payment.method : "necunoscut"
      });
    }
    fees.forEach(fee => {
      const payments = Array.isArray(fee.payments) ? fee.payments : Number(fee.amountPaid || 0) > 0 ? [{
        id: "legacy", amount: fee.amountPaid, date: fee.paymentDate, method: fee.method
      }] : [];
      payments.forEach(payment => add(payment, {
        source: "taxe", parentId: fee.id || `${fee.athleteId}-${fee.month}`,
        payer: names.get(fee.athleteId) || "Sportiv necunoscut",
        description: `Taxă — înregistrată în ${fee.month || "lună nespecificată"}`,
        lastEditor: fee.updatedByEmail || fee.updatedBy || ""
      }));
    });
    otherPayments.forEach(payment => {
      if (payment.paymentType && !["incasare", "plata"].includes(payment.paymentType)) return;
      add(payment, {
        source: "alte", parentId: payment.id || "other",
        payer: names.get(payment.athleteId) || payment.payerName || payment.partnerName || payment.name || "Plătitor nespecificat",
        description: [payment.actionName, payment.category, payment.notes].filter(Boolean).join(" / ") || "Alte încasări"
      });
    });
    return rows.sort((a, b) => b.date.localeCompare(a.date) || a.payer.localeCompare(b.payer, "ro"));
  }

  function summarize(rows) {
    const totals = { cash: { lei: 0, euro: 0 }, transfer: { lei: 0, euro: 0 }, necunoscut: { lei: 0, euro: 0 } };
    rows.forEach(row => { totals[row.method][row.currency] += row.cents; });
    return totals;
  }

  function groupRows(rows) {
    const groups = new Map();
    rows.forEach(row => {
      const key = row.operator.toLowerCase();
      if (!groups.has(key)) groups.set(key, { key, operator: row.operator, rows: [] });
      groups.get(key).rows.push(row);
    });
    return [...groups.values()].sort((a, b) => !a.key ? 1 : !b.key ? -1 : a.key.localeCompare(b.key, "ro"))
      .map(group => ({ ...group, totals: summarize(group.rows) }));
  }

  function Report(props) {
    const h = React.createElement;
    const now = new Date();
    const [month, setMonth] = React.useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
    const [source, setSource] = React.useState("toate");
    const [method, setMethod] = React.useState("toate");
    const [operator, setOperator] = React.useState("toate");
    const all = buildRows(props);
    const monthly = all.filter(row => row.date && row.date.slice(0, 7) === month);
    const options = groupRows(monthly);
    const rows = monthly.filter(row => (source === "toate" || row.source === source)
      && (method === "toate" || row.method === method)
      && (operator === "toate" || (row.operator.toLowerCase() || "neidentificat") === operator));
    const groups = groupRows(rows);
    const totals = summarize(rows);
    const noDate = all.filter(row => !row.date).length;
    const money = cents => (cents / 100).toLocaleString("ro-RO", { maximumFractionDigits: 2 });
    const dual = total => `${money(total.lei)} lei / ${money(total.euro)} euro`;
    const methodLabel = value => value === "cash" ? "Cash" : value === "transfer" ? "Transfer" : "Metodă neprecizată";
    function select(label, value, setter, items) {
      return h("label", { className: "field" }, h("span", null, label), h("select", {
        value, "aria-label": label, onChange: e => setter(e.target.value)
      }, items.map(([id, title]) => h("option", { key: id, value: id }, title))));
    }
    function cards(total) {
      return h("div", { className: "metrics" }, ["cash", "transfer", "necunoscut"].filter(key => key !== "necunoscut" || total[key].lei || total[key].euro).map(key =>
        h("div", { key }, h("span", null, methodLabel(key)), h("strong", null, dual(total[key])))));
    }
    return h("section", { className: "stack" },
      h("h2", null, "Încasări pe operator"),
      h("p", null, "Cine a înregistrat banii, după data încasării — indiferent de luna datoriei achitate. Sumele în lei și euro rămân separate."),
      h("div", { className: "panel compact-grid" },
        h("label", { className: "field" }, h("span", null, "Luna încasării"), h("input", { type: "month", value: month, onChange: e => { setMonth(e.target.value); setOperator("toate"); } })),
        select("Încasări", source, setSource, [["toate", "Taxe și alte încasări"], ["taxe", "Doar taxe"], ["alte", "Doar alte încasări"]]),
        select("Modalitate", method, setMethod, [["toate", "Cash și transfer"], ["cash", "Cash"], ["transfer", "Transfer"], ["necunoscut", "Metodă neprecizată"]]),
        select("Operator", operator, setOperator, [["toate", "Toate persoanele"], ...options.map(g => [g.key || "neidentificat", g.operator || "Operator neidentificat"])])
      ),
      cards(totals),
      h("p", null, `${rows.length} ${rows.length === 1 ? "încasare" : "încasări"} în selecția curentă. Taxele și celelalte încasări sunt incluse o singură dată; plățile și retururile nu sunt încasări.`),
      h("div", { className: "panel" }, h("strong", null, "Despre încasările vechi"),
        h("p", null, "Dacă autorul inițial nu a fost păstrat, încasarea apare la «Operator neidentificat». Ultimul editor este doar un indiciu, nu dovada persoanei care a încasat. Pentru încasările noi păstrăm separat autorul inițial. Fiecare persoană trebuie să folosească propriul cont."),
        noDate > 0 && h("p", null, `${noDate} încasări din istoric nu au o dată identificabilă și nu pot fi incluse într-o lună.`)
      ),
      !groups.length && h("p", { className: "empty-state" }, "Nu există încasări în selecția aleasă."),
      groups.map(group => h("article", { className: "panel stack", key: group.key || "unknown" },
        h("h3", null, group.operator || "Operator neidentificat"),
        cards(group.totals),
        h("p", null, `Taxe: ${group.rows.filter(r => r.source === "taxe").length} / Alte încasări: ${group.rows.filter(r => r.source === "alte").length}`),
        h("details", null, h("summary", { style: { cursor: "pointer", fontWeight: 700 } }, group.rows.length === 1 ? "Vezi încasarea" : `Vezi cele ${group.rows.length} încasări`),
          h("ul", { className: "clean-list" }, group.rows.map(row => h("li", { key: row.id },
            h("div", null, h("strong", null, row.payer),
              h("p", null, `${row.date.split("-").reverse().join(".")} · ${methodLabel(row.method)} · ${row.description}`),
              !row.operator && row.lastEditor && h("small", null, `Ultimul editor al evidenței: ${row.lastEditor} (autor inițial neconfirmat)`)),
            h("strong", null, `${money(row.cents)} ${row.currency}`)
          )))
        )
      ))
    );
  }
  window.CSHeartOperatorReceipts = { stampReceipt, stampFee, buildRows, summarize, groupRows, Report };
})();
