(function () {
  const h = React.createElement;

  const attendanceStatuses = ["prezent", "absent", "învoit", "accidentat"];
  const feeStatuses = ["neplătită", "plătită", "parțial plătită"];
  const paymentMethods = ["cash", "transfer"];

  function athleteName(athlete) {
    return `${athlete.lastName} ${athlete.firstName}`;
  }

  function formatMoney(value) {
    return `${Number(value || 0).toLocaleString("ro-RO")} lei`;
  }

  function getGroups(athletes) {
    return [...new Set(athletes.map((athlete) => athlete.group).filter(Boolean))].sort();
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
      h(Field, { label: "Telefon părinte" }, h("input", { value: form.parentPhone, onChange: (e) => update("parentPhone", e.target.value), inputMode: "tel" })),
      h(Field, { label: "Luna înscrierii" }, h("input", { type: "month", value: form.joinMonth || "", onChange: (e) => update("joinMonth", e.target.value) })),
      h(Field, { label: "Status" }, h("select", { value: form.active ? "active" : "inactive", onChange: (e) => update("active", e.target.value === "active") }, h("option", { value: "active" }, "Activ"), h("option", { value: "inactive" }, "Inactiv"))),
      h(Field, { label: "Observații" }, h("textarea", { value: form.notes, onChange: (e) => update("notes", e.target.value), rows: 2 })),
      h("div", { className: "form-actions" }, h("button", { className: "primary", type: "submit" }, "Salvează"), h("button", { type: "button", onClick: onCancel }, "Anulează"))
    );
  }

  function AthletesView({ athletes, onAdd, onUpdate, onDelete }) {
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
      h("div", { className: "toolbar" }, h("div", { className: "filters" }, h("input", { value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Caută sportiv" }), h("select", { value: groupFilter, onChange: (e) => setGroupFilter(e.target.value) }, h("option", { value: "toate" }, "Toate grupele"), groups.map((group) => h("option", { key: group, value: group }, group)))), h("button", { className: "primary", onClick: () => setAdding(true) }, "Adaugă sportiv")),
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
          h("thead", null, h("tr", null, ["Sportiv", "Grupa", "Telefon părinte", "Status", "Observații", ""].map((head) => h("th", { key: head }, head)))),
          h(
            "tbody",
            null,
            filtered.map((athlete) =>
              editingId === athlete.id
                ? h("tr", { key: athlete.id }, h("td", { colSpan: 6 }, h(AthleteForm, { initialValue: athlete, onSave: (updated) => { onUpdate(athlete.id, updated); setEditingId(null); }, onCancel: () => setEditingId(null) })))
                : h(
                    "tr",
                    { key: athlete.id },
                    h("td", { "data-label": "Sportiv" }, h("strong", null, athleteName(athlete))),
                    h("td", { "data-label": "Grupa" }, athlete.group),
                    h("td", { "data-label": "Telefon părinte" }, athlete.parentPhone || "-"),
                    h("td", { "data-label": "Status" }, h(StatusPill, { tone: athlete.active ? "ok" : "muted" }, athlete.active ? "Activ" : "Inactiv")),
                    h("td", { "data-label": "Observații" }, athlete.notes || "-"),
                     h(
  "td",
  { className: "row-actions" },
  h("button", { onClick: () => setEditingId(athlete.id) }, "Editează"),
  h("button", { onClick: () => setProfileId(profileId === athlete.id ? null : athlete.id) }, "Fișă"),
  h("button", { onClick: () => onDelete(athlete.id) }, "Șterge")
),
                    
  profileId === athlete.id && h("tr", { key: "profile-" + athlete.id }, h("td", { colSpan: 6 }, h("div", { className: "profile-card" }, [
  h("h3", null, "Fișă sportiv: " + athleteName(athlete)),
  h("div", { className: "profile-fields" }, [
  h("input", { placeholder: "Poziție / rol" }),
  h("input", { placeholder: "Înălțime" }),
  h("input", { placeholder: "Greutate" }),
 h("textarea", { placeholder: "Puncte forte" }),
h("textarea", { placeholder: "Aspecte de îmbunătățit" }),
h("textarea", { placeholder: "Date medicale / restricții" }),
h("textarea", { placeholder: "Obiective și observații" })
]), 
  h("button", { onClick: () => setProfileId(null) }, "Închide fișa")
])))
                  )
            )
          )
        )
      ),
      !filtered.length && h(EmptyState, { title: "Nu există sportivi în filtrul curent.", text: "Schimbă grupa, caută alt nume sau adaugă un sportiv nou." })
    );
  }

  function AttendanceView({ athletes, trainings, onSaveTraining }) {
    const groups = getGroups(athletes);
    const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
    const [group, setGroup] = React.useState(groups[0] || "");
    const selectedTraining = trainings.find((training) => training.date === date && training.group === group);
    const groupAthletes = athletes.filter((athlete) => athlete.group === group && athlete.active);
    const [attendance, setAttendance] = React.useState({});

    React.useEffect(() => {
      const next = {};
      groupAthletes.forEach((athlete) => {
        next[athlete.id] = selectedTraining?.attendance?.[athlete.id] || "prezent";
      });
      setAttendance(next);
    }, [date, group, selectedTraining?.id, athletes.length]);

    function save() {
      onSaveTraining({
        id: selectedTraining?.id,
        date,
        group,
        attendance
      });
    }

    return h(
      "section",
      { className: "stack" },
      h("div", { className: "panel compact-grid" }, h(Field, { label: "Data antrenamentului" }, h("input", { type: "date", value: date, onChange: (e) => setDate(e.target.value) })), h(Field, { label: "Grupa" }, h("select", { value: group, onChange: (e) => setGroup(e.target.value) }, groups.map((item) => h("option", { key: item, value: item }, item)))), h("button", { className: "primary align-end", onClick: save, disabled: !group || !groupAthletes.length }, "Salvează prezența")),
      h(
        "div",
        { className: "table-wrap" },
        h(
          "table",
          null,
          h("thead", null, h("tr", null, h("th", null, "Sportiv"), h("th", null, "Status prezență"))),
          h(
            "tbody",
            null,
            groupAthletes.map((athlete) =>
              h(
                "tr",
                { key: athlete.id, className: attendance[athlete.id] === "prezent" ? "row-present" : "" },
                h("td", { "data-label": "Sportiv" }, h("strong", null, athleteName(athlete))),
                h(
                  "td",
                  { "data-label": "Status prezență" },
                  h(
                    "div",
                    { className: "segmented" },
                    attendanceStatuses.map((status) => h("button", { key: status, className: attendance[athlete.id] === status ? "selected" : "", onClick: () => setAttendance((current) => ({ ...current, [athlete.id]: status })) }, status))
                  )
                )
              )
            )
          )
        )
      ),
      !groupAthletes.length && h(EmptyState, { title: "Nu sunt sportivi activi în această grupă.", text: "Alege altă grupă sau activează sportivi din lista de administrare." })
    );
  }

  function FeesView({ athletes, fees, onSaveFee, onResetMonth }) {
    const monthNow = new Date().toISOString().slice(0, 7);
    const [month, setMonth] = React.useState(monthNow);
    const [group, setGroup] = React.useState("toate");
    const groups = getGroups(athletes);
    const listedAthletes = athletes.filter((athlete) => athlete.active && (group === "toate" || athlete.group === group));
    const listedAthleteIds = listedAthletes.map((athlete) => athlete.id);
    const monthlyCollected = fees
      .filter((fee) => fee.month === month && listedAthleteIds.includes(fee.athleteId))
      .reduce((sum, fee) => sum + Number(fee.amountPaid || 0), 0);

    function getFee(athleteId) {
      return fees.find((fee) => fee.athleteId === athleteId && fee.month === month) || {
        athleteId,
        month,
        status: "neplătită",
        amountDue: 200,
        amountPaid: 0,
        paymentDate: "",
        method: "cash",
        notes: ""
      };
    }

    function updateFee(athleteId, field, value) {
      const fee = getFee(athleteId);
      onSaveFee({ ...fee, athleteId, month, [field]: value });
    }

    return h(
      "section",
      { className: "stack" },
      h(
        "div",
        { className: "panel compact-grid" },
        h(Field, { label: "Luna" }, h("input", { type: "month", value: month, onChange: (e) => setMonth(e.target.value) })),
        h(Field, { label: "Grupa" }, h("select", { value: group, onChange: (e) => setGroup(e.target.value) }, h("option", { value: "toate" }, "Toate grupele"), groups.map((item) => h("option", { key: item, value: item }, item)))),
        h("button", { className: "danger align-end", onClick: () => onResetMonth(month, listedAthleteIds), disabled: !listedAthletes.length }, "Reset lună")
      ),
      h("div", { className: "metrics single-metric" }, h("div", null, h("span", null, "Total încasări lună"), h("strong", null, formatMoney(monthlyCollected)))),
      h(
        "div",
        { className: "table-wrap wide" },
        h(
          "table",
          null,
          h("thead", null, h("tr", null, ["Sportiv", "Status", "Datorat", "Plătit", "Data plății", "Metodă", "Observații"].map((head) => h("th", { key: head }, head)))),
          h(
            "tbody",
            null,
            listedAthletes.map((athlete) => {
              const fee = getFee(athlete.id);
              return h(
                "tr",
                { key: athlete.id, className: fee.status === "neplătită" ? "row-unpaid" : "" },
                h("td", { "data-label": "Sportiv" }, h("strong", null, athleteName(athlete)), h("small", null, athlete.group)),
                h("td", { "data-label": "Status" }, h("select", { value: fee.status, onChange: (e) => updateFee(athlete.id, "status", e.target.value) }, feeStatuses.map((status) => h("option", { key: status, value: status }, status)))),
                h("td", { "data-label": "Datorat" }, h("input", { type: "number", min: "0", value: fee.amountDue, onChange: (e) => updateFee(athlete.id, "amountDue", Number(e.target.value)) })),
                h("td", { "data-label": "Plătit" }, h("input", { type: "number", min: "0", value: fee.amountPaid, onChange: (e) => updateFee(athlete.id, "amountPaid", Number(e.target.value)) })),
                h("td", { "data-label": "Data plății" }, h("input", { type: "date", value: fee.paymentDate, onChange: (e) => updateFee(athlete.id, "paymentDate", e.target.value) })),
                h("td", { "data-label": "Metodă" }, h("select", { value: fee.method, onChange: (e) => updateFee(athlete.id, "method", e.target.value) }, paymentMethods.map((method) => h("option", { key: method, value: method }, method)))),
                h("td", { "data-label": "Observații" }, h("input", { value: fee.notes, onChange: (e) => updateFee(athlete.id, "notes", e.target.value), placeholder: "Opțional" }))
              );
            })
          )
        )
      )
    );
  }

  function ReportsView({ athletes, trainings, fees }) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const groups = getGroups(athletes);
    const [group, setGroup] = React.useState("toate");
    const [month, setMonth] = React.useState(currentMonth);
    const athletesInFilter = athletes.filter((athlete) => group === "toate" || athlete.group === group);
    const debtorRows = athletesInFilter
      .map((athlete) => ({ athlete, fee: fees.find((fee) => fee.athleteId === athlete.id && fee.month === month) }))
      .filter((row) => !row.fee || row.fee.status !== "plătită");
    const collectedFees = fees.filter((fee) => fee.month === month && Number(fee.amountPaid || 0) > 0 && athletesInFilter.some((athlete) => athlete.id === fee.athleteId));
    const totalCollected = collectedFees.reduce((sum, fee) => sum + Number(fee.amountPaid || 0), 0);
    const attendanceRows = athletesInFilter.map((athlete) => {
      const entries = trainings.filter((training) => training.attendance?.[athlete.id] && training.date.startsWith(month));
      const present = entries.filter((training) => training.attendance[athlete.id] === "prezent").length;
      return { athlete, total: entries.length, present };
    });

    return h(
      "section",
      { className: "stack" },
      h("div", { className: "panel compact-grid" }, h(Field, { label: "Grupa" }, h("select", { value: group, onChange: (e) => setGroup(e.target.value) }, h("option", { value: "toate" }, "Toate grupele"), groups.map((item) => h("option", { key: item, value: item }, item)))), h(Field, { label: "Luna" }, h("input", { type: "month", value: month, onChange: (e) => setMonth(e.target.value) }))),
      h("div", { className: "metrics" }, h("div", null, h("span", null, "Restanțieri"), h("strong", null, debtorRows.length)), h("div", null, h("span", null, "Încasări lună"), h("strong", null, formatMoney(totalCollected))), h("div", null, h("span", null, "Antrenamente"), h("strong", null, trainings.filter((training) => training.date.startsWith(month) && (group === "toate" || training.group === group)).length))),
      h("div", { className: "report-grid" },
        h("div", { className: "report-block" }, h("h2", null, "Sportivi restanțieri"), debtorRows.length ? h("ul", { className: "clean-list" }, debtorRows.map(({ athlete, fee }) => h("li", { key: athlete.id, className: !fee || fee.status === "neplătită" ? "row-unpaid" : "" }, h("span", null, athleteName(athlete), " · ", athlete.group), h(StatusPill, { tone: "warn" }, fee?.status || "neplătită")))) : h(EmptyState, { title: "Nu sunt restanțe.", text: "Toate taxele din filtrul curent sunt marcate ca plătite." })),
        h("div", { className: "report-block" }, h("h2", null, "Prezențe pe sportiv"), h("ul", { className: "clean-list" }, attendanceRows.map(({ athlete, total, present }) => h("li", { key: athlete.id }, h("span", null, athleteName(athlete)), h("strong", null, `${present}/${total}`))))),
        h("div", { className: "report-block" }, h("h2", null, "Încasări pe lună"), collectedFees.length ? h("ul", { className: "clean-list" }, collectedFees.map((fee) => { const athlete = athletes.find((item) => item.id === fee.athleteId); return h("li", { key: fee.id }, h("span", null, athlete ? athleteName(athlete) : "Sportiv șters"), h("strong", null, formatMoney(fee.amountPaid))); })) : h(EmptyState, { title: "Nu sunt încasări.", text: "Schimbă luna sau marchează plăți în secțiunea Taxe." }))
      )
    );
  }

  window.CSHeartComponents = {
    AthletesView,
    AttendanceView,
    FeesView,
    ReportsView
  };
})();
