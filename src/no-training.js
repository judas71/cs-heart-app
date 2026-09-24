(function () {
  function affected(training, athlete) {
    return training.type === "no-training" && (training.scope === "all" || (training.athleteIds || []).includes(athlete.id));
  }
  function conflicts(trainings, record, athletes) {
    return trainings.some((training) => {
      if (training.id === record.id || training.date !== record.date) return false;
      const ids = training.type === "no-training" ? training.athleteIds || [] : Object.keys(training.attendance || {});
      if (training.type !== "no-training" && !ids.length) return false;
      if (record.scope === "all" || training.scope === "all") return true;
      const otherGroups = training.groups || [training.group];
      return record.groups.some((group) => otherGroups.includes(group)) || ids.some((id) => record.athleteIds.includes(id));
    });
  }
  function createRecord({ date, groups, scope, reason, athletes, id }) {
    return { id, date, type: "no-training", scope, groups: scope === "all" ? [] : groups,
      group: scope === "all" ? "Toate grupele" : groups.join(" + "),
      reason: String(reason || "").trim(), attendance: {},
      athleteIds: athletes.filter((athlete) => athlete.active !== false && (scope === "all" || groups.includes(athlete.group))).map((athlete) => athlete.id)
    };
  }
  function Form({ athletes, trainings, date, onSave, onClose }) {
    const h = React.createElement;
    const [day, setDay] = React.useState(date);
    const [scope, setScope] = React.useState("groups");
    const [groups, setGroups] = React.useState([]);
    const [reason, setReason] = React.useState("");
    const [error, setError] = React.useState("");
    const choices = [...new Set(athletes.filter((a) => a.active !== false).map((a) => a.group).filter(Boolean))].sort();
    return h("form", { className: "panel stack", onSubmit: (event) => {
      event.preventDefault();
      if (!day || (scope !== "all" && !groups.length)) { setError("Alege data și cel puțin o grupă."); return; }
      const record = createRecord({ date: day, groups, scope, reason, athletes, id: `no-training-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` });
      if (conflicts(trainings, record, athletes)) { setError("Există deja o înregistrare în această zi pentru grupele alese. Verifică istoricul; prezențele existente nu au fost modificate."); return; }
      onSave(record); onClose();
    } },
      h("h3", null, "Nu s-a ținut antrenamentul"),
      h("p", null, "Poți alege orice zi, inclusiv sâmbătă sau duminică. Marcajul apare în istoric și nu influențează procentul de prezență."),
      h("label", { className: "field" }, "Data fără antrenament", h("input", { type: "date", required: true, value: day, onChange: (e) => setDay(e.target.value) })),
      h("label", { className: "field" }, "Pentru", h("select", { value: scope, onChange: (e) => setScope(e.target.value) }, h("option", { value: "groups" }, "Grupele alese"), h("option", { value: "all" }, "Întreaga zi — toate grupele"))),
      scope === "groups" && h("div", { className: "row-actions" }, choices.map((group) => h("label", { key: group }, h("input", { type: "checkbox", checked: groups.includes(group), onChange: (e) => setGroups((current) => e.target.checked ? [...current, group] : current.filter((g) => g !== group)) }), " " + group))),
      h("label", { className: "field" }, "Motiv (opțional)", h("input", { value: reason, onChange: (e) => setReason(e.target.value), placeholder: "Ex.: sală indisponibilă, pauză" })),
      error && h("p", { role: "alert" }, error),
      h("div", { className: "row-actions" }, h("button", { type: "submit", className: "primary" }, "Salvează ziua fără antrenament"), h("button", { type: "button", onClick: onClose }, "Renunță"))
    );
  }
  window.CSHeartNoTraining = { affected, conflicts, createRecord, Form };
})();
