(function () {
  const h = React.createElement;

  function athleteName(athlete) {
    return `${athlete.lastName} ${athlete.firstName}`;
  }

  function formatMoney(value) {
    return `${Number(value || 0).toLocaleString("ro-RO")} lei`;
  }

  function getGroups(athletes) {
    return [...new Set(athletes.map((athlete) => athlete.group).filter(Boolean))].sort();
  }

  function formatDate(value) {
    if (!value) return "-";
    const parts = String(value).split("-");

    if (parts.length === 3) {
      return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }

    return value;
  }

  function formatDateTime(value) {
    if (!value) return "-";

    try {
      return new Date(value).toLocaleString("ro-RO");
    } catch (error) {
      return value;
    }
  }

  function Field({ label, children }) {
    return h("label", { className: "field" }, h("span", null, label), children);
  }

  function EmptyState({ title, text }) {
    return h("div", { className: "empty-state" }, h("strong", null, title), h("p", null, text));
  }

  function StatusPill({ children, tone }) {
    return h("span", { className: `pill ${tone || ""}` }, children);
  }

  function AthleteForm({ initialValue, onSave, onCancel }) {
    const [form, setForm] = React.useState(
      initialValue || {
        firstName: "",
        lastName: "",
        group: "",
        parentPhone: "",
        active: true,
        notes: "",
        joinMonth: new Date().toISOString().slice(0, 7)
      }
    );

    function update(field, value) {
      setForm((current) => ({ ...current, [field]: value }));
    }

    function submit(event) {
      event.preventDefault();
      if (!form.firstName.trim() || !form.lastName.trim() || !form.group.trim()) return;

      onSave({
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        group: form.group.trim()
      });
    }

    return h(
      "form",
      { className: "panel form-grid", onSubmit: submit },
      h(Field, { label: "Nume" }, h("input", { value: form.lastName, onChange: (e) => update("lastName", e.target.value), required: true })),
      h(Field, { label: "Prenume" }, h("input", { value: form.firstName, onChange: (e) => update("firstName", e.target.value), required: true })),
      h(Field, { label: "Grupa" }, h("input", { value: form.group, onChange: (e) => update("group", e.target.value), placeholder: "U10", required: true })),
      h(Field, { label: "Telefon parinte" }, h("input", { value: form.parentPhone, onChange: (e) => update("parentPhone", e.target.value), inputMode: "tel" })),
      h(Field, { label: "Luna inscrierii" }, h("input", { type: "month", value: form.joinMonth || "", onChange: (e) => update("joinMonth", e.target.value) })),
      h(
        Field,
        { label: "Status" },
        h(
          "select",
          { value: form.active ? "active" : "inactive", onChange: (e) => update("active", e.target.value === "active") },
          h("option", { value: "active" }, "Activ"),
          h("option", { value: "inactive" }, "Inactiv")
        )
      ),
      h(Field, { label: "Observatii" }, h("textarea", { value: form.notes, onChange: (e) => update("notes", e.target.value), rows: 2 })),
      h("div", { className: "form-actions" }, h("button", { className: "primary", type: "submit" }, "Salveaza"), h("button", { type: "button", onClick: onCancel }, "Anuleaza"))
    );
  }

  function PaymentHistory({ athlete, fees }) {
    const rows = fees
      .filter((fee) => fee.athleteId === athlete.id && (Number(fee.amountPaid || 0) > 0 || fee.paymentDate))
      .sort((a, b) => String(b.month || "").localeCompare(String(a.month || "")));
    const totalPaid = rows.reduce((sum, fee) => sum + Number(fee.amountPaid || 0), 0);
    const lastPayment = rows.find((fee) => fee.paymentDate);

    return h(
      "div",
      { className: "report-block", style: { boxShadow: "none", marginTop: "8px" } },
      h("h2", null, "Fisa incasari: " + athleteName(athlete)),
      h(
        "div",
        { className: "metrics", style: { marginBottom: "14px" } },
        h("div", null, h("span", null, "Total incasat"), h("strong", null, formatMoney(totalPaid))),
        h("div", null, h("span", null, "Plati gasite"), h("strong", null, rows.length)),
        h("div", null, h("span", null, "Ultima plata"), h("strong", null, lastPayment ? formatDate(lastPayment.paymentDate) : "-"))
      ),
      rows.length
        ? h(
            "div",
            { className: "table-wrap wide" },
            h(
              "table",
              null,
              h(
                "thead",
                null,
                h(
                  "tr",
                  null,
                  ["Luna", "Datorat", "Platit", "Data platii", "Metoda", "Status", "Operat de", "ID", "Modificat la"].map((head) => h("th", { key: head }, head))
                )
              ),
              h(
                "tbody",
                null,
                rows.map((fee) =>
                  h(
                    "tr",
                    { key: fee.id || `${fee.athleteId}-${fee.month}` },
                    h("td", { "data-label": "Luna" }, fee.month || "-"),
                    h("td", { "data-label": "Datorat" }, formatMoney(fee.amountDue)),
                    h("td", { "data-label": "Platit" }, h("strong", null, formatMoney(fee.amountPaid))),
                    h("td", { "data-label": "Data platii" }, formatDate(fee.paymentDate)),
                    h("td", { "data-label": "Metoda" }, fee.method || "-"),
                    h("td", { "data-label": "Status" }, fee.status || "-"),
                    h("td", { "data-label": "Operat de" }, fee.updatedByEmail || fee.updatedBy || "-"),
                    h("td", { "data-label": "ID" }, fee.updatedById || "-"),
                    h("td", { "data-label": "Modificat la" }, formatDateTime(fee.updatedAt))
                  )
                )
              )
            )
          )
        : h("p", null, "Nu exista plati inregistrate pentru acest sportiv."),
      h("small", null, "Pentru platile vechi, utilizatorul apare doar dupa ce plata este modificata din nou.")
    );
  }

  function AthletesView({ athletes, fees = [], onAdd, onUpdate, onDelete }) {
    const [editingId, setEditingId] = React.useState(null);
    const [profileId, setProfileId] = React.useState(null);
    const [isAdding, setAdding] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [groupFilter, setGroupFilter] = React.useState("toate");
    const groups = getGroups(athletes);
    const filtered = athletes
      .filter((athlete) => groupFilter === "toate" || athlete.group === groupFilter)
      .filter((athlete) => athleteName(athlete).toLowerCase().includes(query.toLowerCase()));

    return h(
      "section",
      { className: "stack" },
      h(
        "div",
        { className: "toolbar" },
        h(
          "div",
          { className: "filters" },
          h("input", { value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Cauta sportiv" }),
          h(
            "select",
            { value: groupFilter, onChange: (e) => setGroupFilter(e.target.value) },
            h("option", { value: "toate" }, "Toate grupele"),
            groups.map((group) => h("option", { key: group, value: group }, group))
          )
        ),
        h("button", { className: "primary", onClick: () => setAdding(true) }, "Adauga sportiv")
      ),
      isAdding &&
        h(AthleteForm, {
          onSave: (athlete) => {
            onAdd(athlete);
            setAdding(false);
          },
          onCancel: () => setAdding(false)
        }),
      h(
        "div",
        { className: "table-wrap" },
        h(
          "table",
          null,
          h("thead", null, h("tr", null, ["Sportiv", "Grupa", "Telefon parinte", "Status", "Observatii", ""].map((head) => h("th", { key: head }, head)))),
          h(
            "tbody",
            null,
            filtered.map((athlete) =>
              editingId === athlete.id
                ? h(
                    "tr",
                    { key: athlete.id },
                    h("td", { colSpan: 6 }, h(AthleteForm, { initialValue: athlete, onSave: (updated) => { onUpdate(athlete.id, updated); setEditingId(null); }, onCancel: () => setEditingId(null) }))
                  )
                : h(
                    React.Fragment,
                    { key: athlete.id },
                    h(
                      "tr",
                      null,
                      h("td", { "data-label": "Sportiv" }, h("strong", null, athleteName(athlete))),
                      h("td", { "data-label": "Grupa" }, athlete.group),
                      h("td", { "data-label": "Telefon parinte" }, athlete.parentPhone || "-"),
                      h("td", { "data-label": "Status" }, h(StatusPill, { tone: athlete.active ? "ok" : "muted" }, athlete.active ? "Activ" : "Inactiv")),
                      h("td", { "data-label": "Observatii" }, athlete.notes || "-"),
                      h(
                        "td",
                        { className: "row-actions" },
                        h("button", { onClick: () => setEditingId(athlete.id) }, "Editeaza"),
                        h("button", { onClick: () => setProfileId(profileId === athlete.id ? null : athlete.id) }, "Fisa"),
                        h("button", { onClick: () => onDelete(athlete.id) }, "Sterge")
                      )
                    ),
                    profileId === athlete.id &&
                      h("tr", null, h("td", { colSpan: 6 }, h(PaymentHistory, { athlete, fees }), h("button", { onClick: () => setProfileId(null), style: { marginTop: "10px" } }, "Inchide fisa")))
                  )
            )
          )
        )
      ),
      !filtered.length && h(EmptyState, { title: "Nu exista sportivi in filtrul curent.", text: "Schimba grupa, cauta alt nume sau adauga un sportiv nou." })
    );
  }

  window.AthletesView = AthletesView;
  window.CSHeartComponents = {
    ...window.CSHeartComponents,
    AthletesView
  };
})();
