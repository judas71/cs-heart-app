(function () {
  const h = React.createElement;

  function athleteName(athlete) {
    return `${athlete.lastName || ""} ${athlete.firstName || ""}`.trim();
  }

  function getGroups(athletes) {
    return [...new Set(athletes.map((athlete) => athlete.group).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, "ro", { numeric: true })
    );
  }

  function initials(athlete) {
    return [athlete.firstName, athlete.lastName]
      .filter(Boolean)
      .map((part) => part.trim().charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function getMedicalExpiry(athlete) {
    return (
      athlete.medicalVisaTo ||
      athlete.medicalVisaExpiry ||
      athlete.medicalExpiry ||
      athlete.medicalValidUntil ||
      athlete.medicalVisaValidUntil ||
      athlete.visaMedicalaPanaLa ||
      ""
    );
  }

  function isActiveAthlete(athlete) {
    return athlete.active !== false;
  }

  function hasValidMedicalVisa(athlete) {
    const expiry = getMedicalExpiry(athlete);
    if (!expiry) return false;
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    return new Date(`${expiry}T23:59:59`) >= endOfToday;
  }

  function getAttendance(athleteId, trainings) {
    const entries = trainings
      .filter((training) => training.attendance && training.attendance[athleteId])
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .slice(0, 12);

    if (!entries.length) return null;
    const present = entries.filter((training) => training.attendance[athleteId] === "prezent").length;
    return Math.round((present / entries.length) * 100);
  }

  function getOutstanding(athlete, fees) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (!athlete.joinMonth || athlete.joinMonth > currentMonth) return 0;

    const [startYear, startMonth] = athlete.joinMonth.split("-").map(Number);
    const [endYear, endMonth] = currentMonth.split("-").map(Number);
    const cursor = new Date(Date.UTC(startYear, startMonth - 1, 1));
    const end = new Date(Date.UTC(endYear, endMonth - 1, 1));
    let balance = 0;

    while (cursor <= end) {
      const month = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}`;
      const fee = fees.find((item) => item.athleteId === athlete.id && item.month === month);
      const due = Number(fee?.amountDue ?? athlete.feeDue ?? 200);
      const paid = Number(fee?.amountPaid || 0);

      balance += due - paid;
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }

    return Math.max(balance, 0);
  }

  function formatMoney(value) {
    return `${Number(value || 0).toLocaleString("ro-RO")} lei`;
  }

  function Field({ label, children }) {
    return h("label", { className: "field" }, h("span", null, label), children);
  }

  function AthleteFormV2({ initialValue, onSave, onCancel }) {
    const [form, setForm] = React.useState(
      initialValue || {
        firstName: "",
        lastName: "",
        group: "",
        parentPhone: "",
        active: true,
        feeDue: 200,
        notes: "",
        joinMonth: new Date().toISOString().slice(0, 7),
        medicalVisaFrom: "",
        medicalVisaTo: ""
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
        group: form.group.trim(),
        feeDue: Number(form.feeDue || 0)
      });
    }

    return h(
      "form",
      { className: "panel form-grid athletes-v2-form", onSubmit: submit },
      h(Field, { label: "Nume" }, h("input", { value: form.lastName || "", onChange: (e) => update("lastName", e.target.value), required: true })),
      h(Field, { label: "Prenume" }, h("input", { value: form.firstName || "", onChange: (e) => update("firstName", e.target.value), required: true })),
      h(Field, { label: "Grupa" }, h("input", { value: form.group || "", onChange: (e) => update("group", e.target.value), placeholder: "U14", required: true })),
      h(Field, { label: "Telefon părinte" }, h("input", { value: form.parentPhone || "", onChange: (e) => update("parentPhone", e.target.value), inputMode: "tel" })),
      h(Field, { label: "Taxă lunară" }, h("input", { type: "number", min: "0", step: "1", value: form.feeDue ?? 200, onChange: (e) => update("feeDue", e.target.value), inputMode: "numeric" })),
      h(Field, { label: "Luna înscrierii" }, h("input", { type: "month", value: form.joinMonth || "", onChange: (e) => update("joinMonth", e.target.value) })),
      h(Field, { label: "Viză medicală de la" }, h("input", { type: "date", value: form.medicalVisaFrom || "", onChange: (e) => update("medicalVisaFrom", e.target.value) })),
      h(Field, { label: "Viză medicală până la" }, h("input", { type: "date", value: form.medicalVisaTo || getMedicalExpiry(form), onChange: (e) => update("medicalVisaTo", e.target.value) })),
      h(Field, { label: "Status" }, h("select", { value: form.active ? "active" : "inactive", onChange: (e) => update("active", e.target.value === "active") }, h("option", { value: "active" }, "Activ"), h("option", { value: "inactive" }, "Inactiv"))),
      h(Field, { label: "Observații" }, h("textarea", { value: form.notes || "", onChange: (e) => update("notes", e.target.value), rows: 3 })),
      h("div", { className: "form-actions" }, h("button", { className: "primary", type: "submit" }, "Salvează"), h("button", { type: "button", onClick: onCancel }, "Anulează"))
    );
  }

  function StatusPill({ tone, children }) {
    return h("span", { className: `pill ${tone || ""}` }, children);
  }

  function AthleteCard({ athlete, trainings, fees, onEdit, onProfile }) {
    const attendance = getAttendance(athlete.id, trainings);
    const outstanding = getOutstanding(athlete, fees);
    const medicalValid = hasValidMedicalVisa(athlete);

    return h(
      "article",
      { className: "athlete-v2-card" },
      h(
        "div",
        { className: "athlete-v2-card-head" },
        h("div", { className: "athlete-v2-avatar", "aria-hidden": "true" }, initials(athlete)),
        h(
          "div",
          { className: "athlete-v2-identity" },
          h("strong", null, athleteName(athlete)),
          h("span", null, athlete.group || "Fără grupă")
        )
      ),
      h(
        "div",
        { className: "athlete-v2-statuses" },
        h(StatusPill, { tone: isActiveAthlete(athlete) ? "ok" : "muted" }, isActiveAthlete(athlete) ? "Activ" : "Inactiv"),
        h(StatusPill, { tone: medicalValid ? "ok" : "warn" }, medicalValid ? "Viză valabilă" : "Fără viză"),
        h(StatusPill, { tone: outstanding > 0 ? "danger-soft" : "ok" }, outstanding > 0 ? `Restanță ${formatMoney(outstanding)}` : "Taxe la zi")
      ),
      h(
        "div",
        { className: "athlete-v2-summary" },
        h("span", null, "Prezență"),
        h("strong", null, attendance === null ? "Fără date" : `${attendance}%`)
      ),
      h(
        "div",
        { className: "athlete-v2-actions" },
        h("button", { onClick: onEdit }, "Editează"),
        h("button", { className: "primary", onClick: onProfile }, "Deschide fișa")
      )
    );
  }

  function AthleteProfile({ athlete, trainings, fees, onClose, onEdit, onNavigate }) {
    const attendance = getAttendance(athlete.id, trainings);
    const outstanding = getOutstanding(athlete, fees);
    const expiry = getMedicalExpiry(athlete);

    return h(
      "div",
      { className: "panel athlete-v2-profile" },
      h(
        "div",
        { className: "athlete-v2-profile-head" },
        h("div", null, h("p", { className: "eyebrow" }, athlete.group), h("h2", null, athleteName(athlete))),
        h(
          "div",
          { className: "athlete-v2-profile-head-actions" },
          h("button", { className: "primary", onClick: onEdit }, "Editează sportivul"),
          h("button", { onClick: onClose }, "Închide")
        )
      ),
      h(
        "div",
        { className: "athlete-v2-profile-grid" },
        h("div", null, h("span", null, "Telefon părinte"), h("strong", null, athlete.parentPhone || "Necompletat")),
        h(
          "button",
          { className: "athlete-v2-profile-action", type: "button", onClick: () => onNavigate("prezenta") },
          h("span", null, "Prezență recentă"),
          h("strong", null, attendance === null ? "Fără date" : `${attendance}%`),
          h("small", null, "Deschide prezența →")
        ),
        h(
          "button",
          { className: "athlete-v2-profile-action", type: "button", onClick: () => onNavigate("taxe") },
          h("span", null, "Situație taxe"),
          h("strong", null, outstanding > 0 ? formatMoney(outstanding) : "La zi"),
          h("small", null, "Deschide taxele →")
        ),
        h(
          "button",
          { className: "athlete-v2-profile-action", type: "button", onClick: onEdit },
          h("span", null, "Viză medicală"),
          h("strong", null, expiry || "Neînregistrată"),
          h("small", null, "Actualizează viza →")
        )
      ),
      athlete.notes && h("div", { className: "athlete-v2-notes" }, h("span", null, "Observații"), h("p", null, athlete.notes))
    );
  }

  function AthletesViewV2({ athletes, trainings = [], fees = [], onAdd, onUpdate, onNavigate = () => {} }) {
    const [editingId, setEditingId] = React.useState(null);
    const [profileId, setProfileId] = React.useState(null);
    const [isAdding, setAdding] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("active");
    const [groupFilter, setGroupFilter] = React.useState("toate");
    const groups = getGroups(athletes);
    const effectiveTrainings =
      trainings.length > 0
        ? trainings
        : window.CSHeartStorage?.loadState?.().trainings || [];

    function matchesStatus(athlete) {
      if (statusFilter === "active") return isActiveAthlete(athlete);
      if (statusFilter === "inactive") return !isActiveAthlete(athlete);
      if (statusFilter === "medical") return isActiveAthlete(athlete) && !hasValidMedicalVisa(athlete);
      if (statusFilter === "overdue") return isActiveAthlete(athlete) && getOutstanding(athlete, fees) > 0;
      return true;
    }

    const filtered = athletes
      .filter(matchesStatus)
      .filter((athlete) => groupFilter === "toate" || athlete.group === groupFilter)
      .filter((athlete) => `${athleteName(athlete)} ${athlete.group || ""}`.toLocaleLowerCase("ro").includes(query.toLocaleLowerCase("ro")));

    const metrics = [
      { id: "active", label: "Activi", value: athletes.filter(isActiveAthlete).length, detail: "în loturile curente" },
      { id: "inactive", label: "Inactivi", value: athletes.filter((athlete) => !isActiveAthlete(athlete)).length, detail: "păstrați în arhivă" },
      { id: "medical", label: "Fără viză", value: athletes.filter((athlete) => isActiveAthlete(athlete) && !hasValidMedicalVisa(athlete)).length, detail: "necesită actualizare" },
      { id: "overdue", label: "Restanțieri", value: athletes.filter((athlete) => isActiveAthlete(athlete) && getOutstanding(athlete, fees) > 0).length, detail: "au taxe restante" }
    ];

    const profileAthlete = athletes.find((athlete) => athlete.id === profileId);

    return h(
      "section",
      { className: "stack athletes-v2" },
      h(
        "div",
        { className: "athletes-v2-hero" },
        h("div", null, h("p", { className: "eyebrow" }, "Centrul de comandă"), h("h2", null, "Sportivi"), h("p", null, "Vezi rapid cine are nevoie de atenție.")),
        h("input", { type: "search", value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Caută după nume sau categorie…" }),
        h("button", { className: "primary", onClick: () => { setAdding(true); setEditingId(null); } }, "Adaugă sportiv")
      ),
      h(
        "div",
        { className: "athletes-v2-metrics" },
        metrics.map((metric) =>
          h(
            "button",
            {
              key: metric.id,
              className: `athletes-v2-metric ${statusFilter === metric.id ? "selected" : ""}`,
              onClick: () => setStatusFilter(metric.id),
              "aria-pressed": statusFilter === metric.id
            },
            h("span", null, metric.label),
            h("strong", null, metric.value),
            h("small", null, metric.detail)
          )
        )
      ),
      isAdding &&
        h(AthleteFormV2, {
          onSave: (athlete) => {
            onAdd(athlete);
            setAdding(false);
          },
          onCancel: () => setAdding(false)
        }),
      editingId &&
        h(AthleteFormV2, {
          initialValue: athletes.find((athlete) => athlete.id === editingId),
          onSave: (updated) => {
            onUpdate(editingId, updated);
            setEditingId(null);
          },
          onCancel: () => setEditingId(null)
        }),
      profileAthlete &&
        h(AthleteProfile, {
          athlete: profileAthlete,
          trainings: effectiveTrainings,
          fees,
          onClose: () => setProfileId(null),
          onEdit: () => {
            setEditingId(profileAthlete.id);
            setProfileId(null);
            setAdding(false);
          },
          onNavigate
        }),
      h(
        "div",
        { className: "athletes-v2-filterbar" },
        h(
          "div",
          { className: "athletes-v2-group-filters", "aria-label": "Categorii" },
          ["toate", ...groups].map((group) =>
            h(
              "button",
              {
                key: group,
                className: groupFilter === group ? "selected" : "",
                onClick: () => setGroupFilter(group),
                "aria-pressed": groupFilter === group
              },
              group === "toate" ? "Toți" : group,
              h("span", null, athletes.filter((athlete) => matchesStatus(athlete) && (group === "toate" || athlete.group === group)).length)
            )
          )
        ),
        h("span", { className: "athletes-v2-result-count" }, `${filtered.length} ${filtered.length === 1 ? "sportiv" : "sportivi"}`)
      ),
      filtered.length
        ? groups
            .map((group) => ({ group, items: filtered.filter((athlete) => athlete.group === group) }))
            .filter(({ items }) => items.length)
            .map(({ group, items }) =>
              h(
                "section",
                { className: "athletes-v2-group", key: group },
                h("div", { className: "athletes-v2-group-head" }, h("h2", null, group), h("span", null, `${items.length} ${items.length === 1 ? "sportiv" : "sportivi"}`)),
                h(
                  "div",
                  { className: "athletes-v2-grid" },
                  items.map((athlete) =>
                    h(AthleteCard, {
                      key: athlete.id,
                      athlete,
                      trainings: effectiveTrainings,
                      fees,
                      onEdit: () => { setEditingId(athlete.id); setProfileId(null); setAdding(false); },
                      onProfile: () => { setProfileId(profileId === athlete.id ? null : athlete.id); setEditingId(null); setAdding(false); }
                    })
                  )
                )
              )
            )
        : h("div", { className: "empty-state" }, h("strong", null, "Nu există sportivi în filtrul curent."), h("p", null, "Schimbă indicatorul, categoria sau textul căutat."))
    );
  }

  window.AthletesView = AthletesViewV2;
  window.CSHeartComponents = {
    ...window.CSHeartComponents,
    AthletesView: AthletesViewV2
  };
})();
