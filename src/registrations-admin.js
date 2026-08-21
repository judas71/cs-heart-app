(function () {
  const h = React.createElement;

  const objectiveLabels = {
    movement: "Mișcare și dezvoltare",
    performance: "Pregătire pentru performanță",
    recommendation: "Recomandarea antrenorului"
  };

  function athleteName(athlete) {
    return `${athlete.lastName || ""} ${athlete.firstName || ""}`.trim();
  }

  function formatDate(value) {
    if (!value) return "-";
    const raw = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
    if (Number.isNaN(raw.getTime())) return String(value);
    return raw.toLocaleString("ro-RO", { dateStyle: "medium", timeStyle: "short" });
  }

  function splitSuggestedName(value) {
    const parts = String(value || "").trim().split(/\s+/).filter(Boolean);
    if (parts.length < 2) return { lastName: parts[0] || "", firstName: "" };
    return { lastName: parts[0], firstName: parts.slice(1).join(" ") };
  }

  function publicUrl(type) {
    const url = new URL("./inscriere.html", window.location.href);
    if (type === "update") url.searchParams.set("tip", "actualizare");
    return url.href;
  }

  async function copyText(text) {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return;
    }
    window.prompt("Copiază textul:", text);
  }

  function openWhatsApp(type) {
    const link = publicUrl(type);
    const text = type === "update"
      ? `CS HEART - te rog să completezi actualizarea datelor și a condițiilor: ${link}`
      : `CS HEART - cererea de înscriere se completează aici: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  function safe(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function printRequest(request) {
    const popup = window.open("", "_blank");
    if (!popup) {
      alert("Browserul a blocat fereastra. Permite ferestrele pop-up și încearcă din nou.");
      return;
    }

    const typeLabel = request.requestType === "update" ? "Actualizare date și condiții" : "Cerere de înscriere";
    popup.document.write(`<!doctype html><html lang="ro"><head><meta charset="utf-8"><title>${safe(typeLabel)} - ${safe(request.athleteName)}</title><style>
      body{font-family:Arial,sans-serif;color:#172026;margin:38px;line-height:1.45}header{border-bottom:3px solid #c5162e;padding-bottom:16px;margin-bottom:22px}h1{margin:0;font-size:24px}header p{margin:6px 0 0;color:#66727a}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.item{border:1px solid #dbe3e8;border-radius:8px;padding:10px}.item span{display:block;color:#66727a;font-size:12px}.item strong{display:block;margin-top:3px}.wide{grid-column:1/-1}.agreement{margin-top:20px;border-top:1px solid #dbe3e8;padding-top:16px;font-size:13px}.ref{margin-top:24px;color:#66727a;font-size:11px}@media print{button{display:none}body{margin:20mm}}</style></head><body>
      <header><h1>CS HEART · ${safe(typeLabel)}</h1><p>Document transmis la ${safe(formatDate(request.submittedAt || request.submittedAtClient))}</p></header>
      <div class="grid">
        <div class="item"><span>Sportiv</span><strong>${safe(request.athleteName)}</strong></div>
        <div class="item"><span>Data nașterii</span><strong>${safe(request.birthDate)} · anul ${safe(request.birthYear)}</strong></div>
        <div class="item"><span>Părinte / tutore</span><strong>${safe(request.parentName)}</strong></div>
        <div class="item"><span>Telefon</span><strong>${safe(request.parentPhone)}</strong></div>
        <div class="item"><span>Al doilea telefon</span><strong>${safe(request.secondaryPhone || "-")}</strong></div>
        <div class="item"><span>Școala / clasa</span><strong>${safe([request.school, request.schoolClass].filter(Boolean).join(" · ") || "-")}</strong></div>
        <div class="item wide"><span>Opțiunea familiei</span><strong>${safe(objectiveLabels[request.objective] || request.objective)}</strong></div>
      </div>
      <div class="agreement"><strong>Acorduri confirmate:</strong> corectitudinea datelor, regulile și condițiile cotizației, informarea despre date.<br>Versiuni documente: regulament ${safe(request.documentVersions?.rules)}, cotizație ${safe(request.documentVersions?.fees)}, informare ${safe(request.documentVersions?.privacy)}.</div>
      <p class="ref">Referință cerere: ${safe(request.id)} · Status: ${safe(request.status)}</p>
      <button onclick="window.print()">Tipărește / Salvează PDF</button>
      <script>window.addEventListener('load',()=>setTimeout(()=>window.print(),250));<\/script></body></html>`);
    popup.document.close();
  }

  function RegistrationCard({ request, athletes, onCreate, onLink, onReject, onDelete }) {
    const suggestion = React.useMemo(() => splitSuggestedName(request.athleteName), [request.athleteName]);
    const [mode, setMode] = React.useState("");
    const [busy, setBusy] = React.useState(false);
    const [error, setError] = React.useState("");
    const [createForm, setCreateForm] = React.useState({
      lastName: suggestion.lastName,
      firstName: suggestion.firstName,
      group: "",
      feeDue: 250,
      active: true
    });
    const [existingId, setExistingId] = React.useState("");
    const [applyPhone, setApplyPhone] = React.useState(true);
    const [applyBirthYear, setApplyBirthYear] = React.useState(true);

    async function createAthlete(event) {
      event.preventDefault();
      setError("");
      if (!createForm.lastName.trim() || !createForm.firstName.trim() || !createForm.group.trim()) {
        setError("Completează numele, prenumele și grupa înainte de creare.");
        return;
      }
      setBusy(true);
      try {
        await onCreate(request, createForm);
      } catch (err) {
        setError(err?.message || "Nu am putut crea sportivul.");
      } finally {
        setBusy(false);
      }
    }

    async function linkAthlete(event) {
      event.preventDefault();
      setError("");
      const athlete = athletes.find((item) => item.id === existingId);
      if (!athlete) {
        setError("Alege sportivul existent.");
        return;
      }
      setBusy(true);
      try {
        await onLink(request, athlete, { applyPhone, applyBirthYear });
      } catch (err) {
        setError(err?.message || "Nu am putut lega cererea.");
      } finally {
        setBusy(false);
      }
    }

    async function rejectRequest() {
      if (!confirm(`Marchezi cererea pentru ${request.athleteName} drept respinsă? Cererea va rămâne în istoric.`)) return;
      setBusy(true);
      setError("");
      try {
        await onReject(request);
      } catch (err) {
        setError(err?.message || "Nu am putut actualiza cererea.");
      } finally {
        setBusy(false);
      }
    }

    async function deleteRequest() {
      const linkedWarning = request.status === "accepted"
        ? " Sportivul, taxele și încasările lui NU vor fi șterse. Se elimină doar cererea și legătura ei din fișa sportivului."
        : "";
      if (!confirm(`Ștergi definitiv cererea pentru ${request.athleteName}? Nu va mai apărea în istoric și nu poate fi recuperată.${linkedWarning}`)) return;
      setBusy(true);
      setError("");
      try {
        await onDelete(request);
      } catch (err) {
        setError(err?.message || "Nu am putut șterge cererea.");
        setBusy(false);
      }
    }

    const processed = request.status !== "pending";

    return h(
      "article",
      { className: `registration-card ${processed ? "processed" : ""}` },
      h(
        "div",
        { className: "registration-card-head" },
        h("div", null,
          h("div", { className: "registration-card-title" },
            h("h3", null, request.athleteName),
            h("span", { className: `registration-status ${request.status}` }, request.status === "pending" ? "De verificat" : request.status === "accepted" ? "Acceptată" : "Respinsă")
          ),
          h("p", null, `${request.requestType === "update" ? "Actualizare" : "Înscriere nouă"} · ${formatDate(request.submittedAt || request.submittedAtClient)}`)
        ),
        h("div", { className: "registration-card-head-actions" },
          h("button", { type: "button", onClick: () => printRequest(request) }, "Copia / PDF"),
          h("button", { type: "button", className: "danger-button", disabled: busy, onClick: deleteRequest }, busy ? "Se șterge…" : "Șterge")
        )
      ),
      h(
        "div",
        { className: "registration-data-grid" },
        h("div", null, h("span", null, "Născut"), h("strong", null, `${request.birthDate || "-"} · ${request.birthYear || "-"}`)),
        h("div", null, h("span", null, "Părinte"), h("strong", null, request.parentName || "-")),
        h("div", null, h("span", null, "Telefon"), h("strong", null, request.parentPhone || "-")),
        h("div", null, h("span", null, "Obiectiv"), h("strong", null, objectiveLabels[request.objective] || request.objective || "-")),
        h("div", null, h("span", null, "Școală / clasă"), h("strong", null, [request.school, request.schoolClass].filter(Boolean).join(" · ") || "-")),
        h("div", null, h("span", null, "Al doilea telefon"), h("strong", null, request.secondaryPhone || "-"))
      ),
      processed
        ? h("p", { className: "registration-processed-note" }, request.status === "accepted" ? `Cererea este legată de o fișă de sportiv (${request.adminDecision === "created" ? "fișă creată" : "fișă existentă"}).` : "Cererea a fost respinsă, dar rămâne păstrată în istoric.")
        : h(
            React.Fragment,
            null,
            h(
              "div",
              { className: "registration-actions" },
              h("button", { type: "button", className: mode === "create" ? "primary" : "", onClick: () => setMode(mode === "create" ? "" : "create") }, "Creează sportiv"),
              h("button", { type: "button", className: mode === "link" ? "primary" : "", onClick: () => setMode(mode === "link" ? "" : "link") }, "Leagă de sportiv existent"),
              h("button", { type: "button", className: "danger-button", disabled: busy, onClick: rejectRequest }, "Respinge")
            ),
            mode === "create" && h(
              "form",
              { className: "registration-decision-form", onSubmit: createAthlete },
              h("label", null, h("span", null, "Nume"), h("input", { value: createForm.lastName, onChange: (e) => setCreateForm({ ...createForm, lastName: e.target.value }), required: true })),
              h("label", null, h("span", null, "Prenume"), h("input", { value: createForm.firstName, onChange: (e) => setCreateForm({ ...createForm, firstName: e.target.value }), required: true })),
              h("label", null, h("span", null, "Grupa stabilită de club"), h("input", { value: createForm.group, onChange: (e) => setCreateForm({ ...createForm, group: e.target.value }), placeholder: "ex. U14", required: true })),
              h("label", null, h("span", null, "Cotizația lunară"), h("select", { value: createForm.feeDue, onChange: (e) => setCreateForm({ ...createForm, feeDue: Number(e.target.value) }) }, h("option", { value: 250 }, "250 lei"), h("option", { value: 200 }, "200 lei · al doilea frate"))),
              h("label", null, h("span", null, "Status"), h("select", { value: createForm.active ? "active" : "inactive", onChange: (e) => setCreateForm({ ...createForm, active: e.target.value === "active" }) }, h("option", { value: "active" }, "Activ"), h("option", { value: "inactive" }, "Inactiv"))),
              h("div", { className: "registration-submit-row" }, h("button", { type: "submit", className: "primary", disabled: busy }, busy ? "Se salvează…" : "Confirmă și creează"))
            ),
            mode === "link" && h(
              "form",
              { className: "registration-link-form", onSubmit: linkAthlete },
              h("label", null, h("span", null, "Sportiv existent"), h("select", { value: existingId, onChange: (e) => setExistingId(e.target.value), required: true }, h("option", { value: "" }, "Alege sportivul…"), athletes.slice().sort((a, b) => athleteName(a).localeCompare(athleteName(b), "ro")).map((athlete) => h("option", { key: athlete.id, value: athlete.id }, `${athleteName(athlete)} · ${athlete.group || "fără grupă"}`)))),
              h("div", { className: "registration-link-checks" },
                h("label", null, h("input", { type: "checkbox", checked: applyPhone, onChange: (e) => setApplyPhone(e.target.checked) }), h("span", null, "Actualizează telefonul părintelui")),
                h("label", null, h("input", { type: "checkbox", checked: applyBirthYear, onChange: (e) => setApplyBirthYear(e.target.checked) }), h("span", null, "Actualizează anul nașterii"))
              ),
              h("div", { className: "registration-submit-row" }, h("button", { type: "submit", className: "primary", disabled: busy }, busy ? "Se salvează…" : "Confirmă legătura"))
            ),
            error && h("p", { className: "registration-error" }, error)
          )
    );
  }

  function RegistrationsAdminView({ requests = [], athletes = [], loading, error, onCreate, onLink, onReject, onDelete }) {
    const [filter, setFilter] = React.useState("pending");
    const [notice, setNotice] = React.useState("");
    const counts = {
      pending: requests.filter((item) => item.status === "pending").length,
      accepted: requests.filter((item) => item.status === "accepted").length,
      rejected: requests.filter((item) => item.status === "rejected").length,
      all: requests.length
    };
    const filtered = filter === "all" ? requests : requests.filter((item) => item.status === filter);

    async function copyLink(type) {
      await copyText(publicUrl(type));
      setNotice(type === "update" ? "Linkul pentru actualizare a fost copiat." : "Linkul pentru înscriere a fost copiat.");
      window.setTimeout(() => setNotice(""), 3000);
    }

    return h(
      "section",
      { className: "stack registrations-admin" },
      h(
        "div",
        { className: "registrations-hero" },
        h("div", null, h("p", { className: "eyebrow" }, "Înscrieri online"), h("h2", null, "Cereri și actualizări"), h("p", null, "Părintele completează linkul public. Numai tu decizi ce intră în fișa sportivului.")),
        h("div", { className: "registrations-link-groups" },
          h("div", null, h("strong", null, "Sportiv nou"), h("button", { type: "button", className: "primary", onClick: () => copyLink("new") }, "Copiază linkul"), h("button", { type: "button", onClick: () => openWhatsApp("new") }, "WhatsApp")),
          h("div", null, h("strong", null, "Sportiv existent"), h("button", { type: "button", className: "primary", onClick: () => copyLink("update") }, "Copiază actualizarea"), h("button", { type: "button", onClick: () => openWhatsApp("update") }, "WhatsApp"))
        ),
        notice && h("p", { className: "registration-notice" }, notice)
      ),
      h("div", { className: "registration-filters" }, [
        ["pending", "De verificat"], ["accepted", "Acceptate"], ["rejected", "Respinse"], ["all", "Tot istoricul"]
      ].map(([id, label]) => h("button", { key: id, type: "button", className: filter === id ? "selected" : "", onClick: () => setFilter(id) }, label, h("span", null, counts[id])))),
      loading && h("div", { className: "panel" }, "Se încarcă cererile…"),
      error && h("div", { className: "panel registration-error" }, error),
      !loading && !error && !filtered.length && h("div", { className: "panel empty-state" }, h("strong", null, filter === "pending" ? "Nu ai cereri de verificat." : "Nu există cereri în această categorie."), h("p", null, "Cererile transmise vor apărea aici automat.")),
      filtered.map((request) => h(RegistrationCard, { key: request.id, request, athletes, onCreate, onLink, onReject, onDelete }))
    );
  }

  window.RegistrationsAdminView = RegistrationsAdminView;
})();
