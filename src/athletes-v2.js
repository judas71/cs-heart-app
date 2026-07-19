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
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const entries = trainings
      .filter(
        (training) =>
          String(training.date || "").startsWith(currentMonth) &&
          training.attendance &&
          training.attendance[athleteId]
      );

    if (!entries.length) return null;
    const present = entries.filter((training) => training.attendance[athleteId] === "prezent").length;
    return Math.round((present / entries.length) * 100);
  }

  function currentMonthValue() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }

  function getAttendanceDetails(athleteId, trainings, month) {
    const rows = trainings
      .filter(
        (training) =>
          String(training.date || "").startsWith(month) &&
          training.attendance &&
          training.attendance[athleteId]
      )
      .map((training) => ({
        id: training.id || `${training.date}-${training.group || "antrenament"}`,
        date: training.date,
        group: training.group || "",
        type: training.type || "grupa",
        status: training.attendance[athleteId]
      }))
      .sort((first, second) => String(second.date || "").localeCompare(String(first.date || "")));

    const counts = rows.reduce(
      (result, row) => {
        if (row.status === "prezent") result.present += 1;
        if (row.status === "absent") result.absent += 1;
        if (row.status === "\u00eenvoit") result.excused += 1;
        if (row.status === "accidentat") result.injured += 1;
        return result;
      },
      { present: 0, absent: 0, excused: 0, injured: 0 }
    );

    return {
      rows,
      counts,
      percentage: rows.length ? Math.round((counts.present / rows.length) * 100) : null
    };
  }

  function attendanceStatusLabel(status) {
    if (status === "prezent") return "Prezent";
    if (status === "absent") return "Absent";
    if (status === "\u00eenvoit") return "\u00cenvoit";
    if (status === "accidentat") return "Accidentat";
    return status || "-";
  }

  function trainingLabel(row) {
    if (row.type === "individual") return "Individual";
    if (row.type === "mixt") return "Mixt";
    return row.group ? `Grupa ${row.group}` : "Antrenament";
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

  function formatCurrency(value, currency = "lei") {
    return `${Number(value || 0).toLocaleString("ro-RO")} ${currency === "euro" ? "euro" : "lei"}`;
  }

  function formatDate(value) {
    if (!value) return "-";
    const parts = String(value).split("-");
    return parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : value;
  }

  function paymentCurrency(payment) {
    return payment.currency || "lei";
  }

  function paymentType(payment) {
    return !payment.paymentType || payment.paymentType === "plata" ? "incasare" : payment.paymentType;
  }

  function paymentTypeLabel(payment) {
    const type = paymentType(payment);
    if (type === "cheltuiala") return "Plată";
    if (type === "retur") return "Retur de sume";
    if (type === "avans") return "Avans";
    return "Încasare";
  }

  function isOutgoingPayment(payment) {
    return ["avans", "cheltuiala", "retur"].includes(paymentType(payment));
  }

  function feePaymentStatus(fee) {
    const paid = Number(fee.amountPaid || 0);
    const due = Number(fee.amountDue || 0);
    if (paid <= 0) return "Neplătită";
    if (due > 0 && paid < due) return "Parțial plătită";
    return "Plătită";
  }

  function Field({ label, children }) {
    return h("label", { className: "field" }, h("span", null, label), children);
  }

  function AthleteFormV2({ initialValue, onSave, onCancel, formRef }) {
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
      { className: "panel form-grid athletes-v2-form", onSubmit: submit, ref: formRef, tabIndex: -1 },
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

  function StatusPill({ tone, children, onClick, actionLabel }) {
    if (onClick) {
      return h(
        "button",
        {
          className: `pill athlete-v2-status-action ${tone || ""}`,
          type: "button",
          onClick,
          "aria-label": actionLabel
        },
        children
      );
    }

    return h("span", { className: `pill ${tone || ""}` }, children);
  }

  function AthleteCard({ athlete, trainings, fees, onEdit, onProfile, onTaxes }) {
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
        h(
          StatusPill,
          {
            tone: isActiveAthlete(athlete) ? "ok" : "muted",
            onClick: onEdit,
            actionLabel: `${isActiveAthlete(athlete) ? "Activ" : "Inactiv"} — modifică statusul sportivului`
          },
          isActiveAthlete(athlete) ? "Activ" : "Inactiv"
        ),
        h(
          StatusPill,
          {
            tone: medicalValid ? "ok" : "warn",
            onClick: onEdit,
            actionLabel: `${medicalValid ? "Viză valabilă" : "Fără viză"} — actualizează viza medicală`
          },
          medicalValid ? "Viză valabilă" : "Fără viză"
        ),
        h(
          StatusPill,
          {
            tone: outstanding > 0 ? "danger-soft" : "ok",
            onClick: onTaxes,
            actionLabel: `${outstanding > 0 ? `Restanță ${formatMoney(outstanding)}` : "Taxe la zi"} — deschide taxele`
          },
          outstanding > 0 ? `Restanță ${formatMoney(outstanding)}` : "Taxe la zi"
        )
      ),
      h(
        "div",
        { className: "athlete-v2-summary" },
        h("span", null, "Prezență luna curentă"),
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

  function PaymentHistoryV2({ athlete, fees, otherPayments = [] }) {
    const feeRows = fees
      .filter((fee) => fee.athleteId === athlete.id && (Number(fee.amountPaid || 0) > 0 || fee.paymentDate))
      .sort((a, b) => String(b.paymentDate || b.month || "").localeCompare(String(a.paymentDate || a.month || "")));
    const otherRows = otherPayments
      .filter((payment) => payment.athleteId === athlete.id)
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
    const feeTotal = feeRows.reduce((sum, fee) => sum + Number(fee.amountPaid || 0), 0);
    const otherIncomingLei = otherRows
      .filter((payment) => paymentCurrency(payment) === "lei" && !isOutgoingPayment(payment))
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const otherIncomingEuro = otherRows
      .filter((payment) => paymentCurrency(payment) === "euro" && !isOutgoingPayment(payment))
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    return h(
      "section",
      { className: "athlete-v2-payments" },
      h("div", { className: "athlete-v2-payments-head" }, h("div", null, h("h3", null, "Istoric încasări"), h("p", null, `Toate operațiunile pentru ${athleteName(athlete)}`))),
      h(
        "div",
        { className: "athlete-v2-payment-summary" },
        h("div", null, h("span", null, "Taxe încasate"), h("strong", null, formatMoney(feeTotal))),
        h("div", null, h("span", null, "Alte încasări lei"), h("strong", null, formatMoney(otherIncomingLei))),
        h("div", null, h("span", null, "Alte încasări euro"), h("strong", null, formatCurrency(otherIncomingEuro, "euro")))
      ),
      h("h4", null, "Taxe lunare"),
      feeRows.length
        ? h(
            "div",
            { className: "table-wrap wide" },
            h(
              "table",
              null,
              h("thead", null, h("tr", null, ["Data", "Luna", "Încasat", "Metoda", "Status", "Observații"].map((head) => h("th", { key: head }, head)))),
              h(
                "tbody",
                null,
                feeRows.map((fee) =>
                  h(
                    "tr",
                    { key: fee.id || `${fee.athleteId}-${fee.month}` },
                    h("td", { "data-label": "Data" }, formatDate(fee.paymentDate)),
                    h("td", { "data-label": "Luna" }, fee.month || "-"),
                    h("td", { "data-label": "Încasat" }, h("strong", null, formatMoney(fee.amountPaid))),
                    h("td", { "data-label": "Metoda" }, fee.method || "-"),
                    h("td", { "data-label": "Status" }, feePaymentStatus(fee)),
                    h("td", { "data-label": "Observații" }, fee.notes || "-")
                  )
                )
              )
            )
          )
        : h("p", { className: "athlete-v2-payment-empty" }, "Nu există taxe încasate pentru acest sportiv."),
      h("h4", null, "Alte încasări / plăți"),
      otherRows.length
        ? h(
            "div",
            { className: "table-wrap wide" },
            h(
              "table",
              null,
              h("thead", null, h("tr", null, ["Data", "Categorie", "Tip", "Sumă", "Metoda", "Observații"].map((head) => h("th", { key: head }, head)))),
              h(
                "tbody",
                null,
                otherRows.map((payment) =>
                  h(
                    "tr",
                    { key: payment.id || `${payment.date}-${payment.category}-${payment.amount}` },
                    h("td", { "data-label": "Data" }, formatDate(payment.date)),
                    h("td", { "data-label": "Categorie" }, payment.category || "-"),
                    h("td", { "data-label": "Tip" }, paymentTypeLabel(payment)),
                    h("td", { "data-label": "Sumă" }, h("strong", { className: isOutgoingPayment(payment) ? "arrears" : "" }, `${isOutgoingPayment(payment) ? "- " : ""}${formatCurrency(payment.amount, paymentCurrency(payment))}`)),
                    h("td", { "data-label": "Metoda" }, payment.method || "-"),
                    h("td", { "data-label": "Observații" }, payment.notes || "-")
                  )
                )
              )
            )
          )
        : h("p", { className: "athlete-v2-payment-empty" }, "Nu există alte încasări sau plăți pentru acest sportiv.")
    );
  }

  function AttendanceHistoryV2({ athlete, trainings }) {
    const [month, setMonth] = React.useState(currentMonthValue());
    const details = getAttendanceDetails(athlete.id, trainings, month);
    const monthLabel = new Date(`${month}-01T00:00:00`).toLocaleDateString("ro-RO", {
      month: "long",
      year: "numeric"
    });

    return h(
      "section",
      { className: "athlete-v2-attendance" },
      h(
        "div",
        { className: "athlete-v2-attendance-head" },
        h(
          "div",
          null,
          h("h3", null, "Prezen\u021b\u0103 detaliat\u0103"),
          h("p", null, `Situa\u021bia pentru ${monthLabel}`)
        ),
        h(
          "label",
          { className: "athlete-v2-attendance-month" },
          h("span", null, "Alege luna"),
          h("input", {
            type: "month",
            value: month,
            onChange: (event) => setMonth(event.target.value || currentMonthValue())
          })
        )
      ),
      h(
        "div",
        { className: "athlete-v2-attendance-summary" },
        h("article", { className: "percentage" }, h("span", null, "Prezen\u021b\u0103"), h("strong", null, details.percentage === null ? "-" : `${details.percentage}%`)),
        h("article", { className: "present" }, h("span", null, "Prezent"), h("strong", null, details.counts.present)),
        h("article", { className: "absent" }, h("span", null, "Absent"), h("strong", null, details.counts.absent)),
        h("article", { className: "excused" }, h("span", null, "\u00cenvoit"), h("strong", null, details.counts.excused)),
        h("article", { className: "injured" }, h("span", null, "Accidentat"), h("strong", null, details.counts.injured))
      ),
      h(
        "p",
        { className: "athlete-v2-attendance-explanation" },
        "Procentul este calculat doar din antrenamentele lunii alese la care sportivul apare \u00een prezen\u021b\u0103."
      ),
      details.rows.length
        ? h(
            "div",
            { className: "athlete-v2-attendance-list" },
            details.rows.map((row) =>
              h(
                "article",
                { key: row.id, className: `athlete-v2-attendance-row ${row.status}` },
                h("div", null, h("strong", null, formatDate(row.date)), h("small", null, trainingLabel(row))),
                h("span", { className: `athlete-v2-attendance-status ${row.status}` }, attendanceStatusLabel(row.status))
              )
            )
          )
        : h(
            "div",
            { className: "athlete-v2-attendance-empty" },
            h("strong", null, "Nu exist\u0103 prezen\u021be pentru luna aleas\u0103."),
            h("p", null, "Alege alt\u0103 lun\u0103 pentru a vedea istoricul sportivului.")
          )
    );
  }

  function AthleteProfile({ athlete, trainings, fees, otherPayments, onClose, onEdit, onNavigate, profileRef }) {
    const attendance = getAttendance(athlete.id, trainings);
    const outstanding = getOutstanding(athlete, fees);
    const expiry = getMedicalExpiry(athlete);

    return h(
      "div",
      { className: "panel athlete-v2-profile", ref: profileRef, tabIndex: -1 },
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
          h("span", null, "Prezență luna curentă"),
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
      athlete.notes && h("div", { className: "athlete-v2-notes" }, h("span", null, "Observații"), h("p", null, athlete.notes)),
      h(AttendanceHistoryV2, { athlete, trainings }),
      h(PaymentHistoryV2, { athlete, fees, otherPayments })
    );
  }

  function AthletesViewV2({ athletes, trainings = [], fees = [], otherPayments = [], onAdd, onUpdate, onNavigate = () => {} }) {
    const [editingId, setEditingId] = React.useState(null);
    const [profileId, setProfileId] = React.useState(null);
    const [isAdding, setAdding] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("active");
    const [groupFilter, setGroupFilter] = React.useState("toate");
    const profileRef = React.useRef(null);
    const formRef = React.useRef(null);
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

    React.useEffect(() => {
      if (!profileId || !profileRef.current) return;

      const frame = window.requestAnimationFrame(() => {
        profileRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        profileRef.current?.focus({ preventScroll: true });
      });

      return () => window.cancelAnimationFrame(frame);
    }, [profileId]);

    React.useEffect(() => {
      if ((!editingId && !isAdding) || !formRef.current) return;

      const frame = window.requestAnimationFrame(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        formRef.current?.focus({ preventScroll: true });
      });

      return () => window.cancelAnimationFrame(frame);
    }, [editingId, isAdding]);

    function openProfile(athleteId) {
      setEditingId(null);
      setAdding(false);

      if (profileId === athleteId && profileRef.current) {
        profileRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        profileRef.current.focus({ preventScroll: true });
        return;
      }

      setProfileId(athleteId);
    }

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
          formRef,
          onSave: (athlete) => {
            onAdd(athlete);
            setAdding(false);
          },
          onCancel: () => setAdding(false)
        }),
      editingId &&
        h(AthleteFormV2, {
          formRef,
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
          otherPayments,
          onClose: () => setProfileId(null),
          onEdit: () => {
            setEditingId(profileAthlete.id);
            setProfileId(null);
            setAdding(false);
          },
          onNavigate,
          profileRef
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
                      onProfile: () => openProfile(athlete.id),
                      onTaxes: () => openProfile(athlete.id)
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
