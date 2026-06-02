(function () {
  const h = React.createElement;

  const feeStatuses = ["nepl\u0103tit\u0103", "pl\u0103tit\u0103", "par\u021bial pl\u0103tit\u0103"];
  const categories = ["echipament", "cantonament", "turneu", "legitimatie", "transport", "sponsorizare", "parteneriat", "altele"];
  const payerTypes = ["sportiv", "partener", "altul"];
  const paymentTypes = ["incasare", "avans"];
  const paymentMethods = ["cash", "transfer"];
  const currencies = ["lei", "euro"];

  function injectReportStyles() {
    if (typeof document === "undefined" || document.getElementById("cs-heart-report-style")) return;

    const style = document.createElement("style");
    style.id = "cs-heart-report-style";
    style.textContent = `
      .cs-report-summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
        gap: 12px;
      }
      .cs-report-card {
        min-height: 104px;
        border: 1px solid var(--line, #d9e0e5);
        border-left: 4px solid #3d4a52;
        border-radius: 8px;
        background: #fff;
        box-shadow: var(--shadow, 0 10px 24px rgba(23, 32, 38, 0.08));
        padding: 14px;
        display: grid;
        align-content: start;
        gap: 4px;
      }
      .cs-report-card span {
        color: var(--muted, #66727a);
        font-size: 0.82rem;
        font-weight: 800;
        text-transform: uppercase;
      }
      .cs-report-card strong {
        color: var(--text, #172026);
        font-size: clamp(1.24rem, 2vw, 1.64rem);
        line-height: 1.15;
      }
      .cs-report-card small {
        color: var(--muted, #66727a);
        line-height: 1.35;
      }
      .cs-report-card.tone-green { border-left-color: #15803d; }
      .cs-report-card.tone-red { border-left-color: #b91c1c; }
      .cs-report-card.tone-blue { border-left-color: #1d4ed8; }
      .cs-report-card.tone-amber { border-left-color: #b45309; }
      .cs-report-card.tone-purple { border-left-color: #7e22ce; }
      .cs-report-sections {
        display: grid;
        gap: 12px;
      }
      .cs-report-section {
        border: 1px solid var(--line, #d9e0e5);
        border-radius: 8px;
        background: #fff;
        box-shadow: var(--shadow, 0 10px 24px rgba(23, 32, 38, 0.08));
        overflow: hidden;
      }
      .cs-report-section summary {
        list-style: none;
        min-height: 56px;
        padding: 14px 16px;
        cursor: pointer;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto 28px;
        align-items: center;
        gap: 12px;
      }
      .cs-report-section summary::-webkit-details-marker {
        display: none;
      }
      .cs-report-section summary::after {
        content: "+";
        width: 28px;
        height: 28px;
        border-radius: 999px;
        background: #eef3f6;
        color: #172026;
        display: grid;
        place-items: center;
        font-weight: 900;
      }
      .cs-report-section[open] summary::after {
        content: "-";
      }
      .cs-report-section-title {
        font-weight: 850;
        color: var(--text, #172026);
      }
      .cs-report-section-meta {
        color: var(--muted, #66727a);
        font-size: 0.9rem;
        white-space: nowrap;
      }
      .cs-report-section-body {
        border-top: 1px solid var(--line, #d9e0e5);
        padding: 14px 16px 16px;
      }
      .cs-report-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 8px;
      }
      .cs-report-item {
        border: 1px solid #edf1f4;
        border-radius: 8px;
        background: #fff;
        padding: 10px 12px;
        display: grid;
        gap: 8px;
      }
      .cs-report-item-main {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
      }
      .cs-report-item-title {
        color: var(--text, #172026);
        font-weight: 800;
      }
      .cs-report-item small {
        color: var(--muted, #66727a);
        display: block;
        margin-top: 3px;
        line-height: 1.35;
      }
      .cs-report-amount {
        color: var(--text, #172026);
        font-size: 0.98rem;
        white-space: nowrap;
      }
      .cs-report-amount.negative {
        color: var(--danger, #b91c1c);
      }
      .cs-report-item-extra {
        display: flex;
        flex-wrap: wrap;
        gap: 5px 10px;
        line-height: 1.5;
      }
      .cs-report-empty {
        margin: 0;
        color: var(--muted, #66727a);
      }
      .cs-report-sublist {
        display: grid;
        gap: 8px;
      }
      .cs-report-sublist h3 {
        margin: 0;
        color: var(--muted, #66727a);
        font-size: 0.86rem;
        text-transform: uppercase;
      }
      .cs-report-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .cs-report-legend span {
        border: 1px solid #edf1f4;
        border-radius: 999px;
        background: #fff;
        padding: 4px 9px;
        font-size: 0.82rem;
        font-weight: 800;
      }
      @media (width <= 640px) {
        .cs-report-section summary {
          grid-template-columns: minmax(0, 1fr) 28px;
        }
        .cs-report-section-meta {
          grid-column: 1 / -1;
          white-space: normal;
        }
        .cs-report-item-main {
          display: grid;
        }
        .cs-report-amount {
          white-space: normal;
        }
      }
    `;
    document.head.appendChild(style);
  }

  injectReportStyles();

  function athleteName(athlete) {
    return `${athlete.lastName} ${athlete.firstName}`;
  }

  function compareText(first, second) {
    return String(first || "").localeCompare(String(second || ""), "ro-RO", { sensitivity: "base" });
  }

  function compareAthletesByName(first, second) {
    return compareText(athleteName(first), athleteName(second));
  }

  function formatMoney(value, currency = "lei") {
    return `${Number(value || 0).toLocaleString("ro-RO")} ${currency === "euro" ? "euro" : "lei"}`;
  }

  function formatDate(value) {
    if (!value) return "-";
    const parts = String(value).split("-");
    return parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : value;
  }

  function getGroups(athletes) {
    return [...new Set(athletes.map((athlete) => athlete.group).filter(Boolean))].sort();
  }

  function getMonth(value) {
    return String(value || "").slice(0, 7);
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function currentMonth() {
    return new Date().toISOString().slice(0, 7);
  }

  function findAthlete(athletes, athleteId) {
    return athletes.find((athlete) => athlete.id === athleteId);
  }

  function isActiveAthlete(athlete) {
    return athlete.active !== false;
  }

  function shouldShowAthleteInReports(athlete) {
    return isActiveAthlete(athlete);
  }

  function sortByDateDesc(first, second) {
    return String(second.date || "").localeCompare(String(first.date || ""));
  }

  function formatAttendanceDay(value) {
    const parts = String(value || "").split("-");
    return parts.length === 3 ? `${parts[2]}.${parts[1]}` : value || "-";
  }

  function attendanceColor(status) {
    if (status === "absent") return "#b91c1c";
    if (status === "\u00eenvoit") return "#1d4ed8";
    if (status === "accidentat") return "#7e22ce";
    return "#172026";
  }

  function getMonthRange(startMonth, endMonth) {
    if (!startMonth || !endMonth || startMonth >= endMonth) return [];

    const months = [];
    const date = new Date(startMonth + "-01");
    const endDate = new Date(endMonth + "-01");

    while (date < endDate) {
      months.push(date.toISOString().slice(0, 7));
      date.setMonth(date.getMonth() + 1);
    }

    return months;
  }

  function getFeeForMonth(fees, athleteId, month) {
    return fees.find((fee) => fee.athleteId === athleteId && fee.month === month);
  }

  function hasAmountDue(fee) {
    return fee && fee.amountDue !== undefined && fee.amountDue !== null && fee.amountDue !== "";
  }

  function getLastKnownFeeBeforeMonth(fees, athleteId, month) {
    return [...fees]
      .filter((fee) => fee.athleteId === athleteId && fee.month < month && hasAmountDue(fee))
      .sort((first, second) => String(second.month || "").localeCompare(String(first.month || "")))[0];
  }

  function getDefaultAmountDue(fees, athlete, month) {
    const lastKnownFee = getLastKnownFeeBeforeMonth(fees, athlete.id, month);
    return Number(lastKnownFee?.amountDue ?? athlete.feeDue ?? 200);
  }

  function getMonthlyDue(athlete, fee, fees, month) {
    return hasAmountDue(fee) ? Number(fee.amountDue) : getDefaultAmountDue(fees, athlete, month);
  }

  function getPreviousBalance(fees, athlete, month) {
    return getMonthRange(athlete.joinMonth, month).reduce((balance, itemMonth) => {
      const fee = getFeeForMonth(fees, athlete.id, itemMonth);
      const due = getMonthlyDue(athlete, fee, fees, itemMonth);
      const paid = Number(fee?.amountPaid || 0);

      return balance + due - paid;
    }, 0);
  }

  function getTotalToPay(fee, previousBalance, fallbackDue) {
    const amountDue = Number(fee?.amountDue ?? fallbackDue ?? 0);
    return Math.max(amountDue + previousBalance, 0);
  }

  function getOutstandingAmount(fee, previousBalance, fallbackDue) {
    const amountDue = Number(fee?.amountDue ?? fallbackDue ?? 0);
    const amountPaid = Number(fee?.amountPaid || 0);

    return Math.max(Math.max(amountDue + previousBalance, 0) - amountPaid, 0);
  }

  function getBalanceAfterMonth(fee, previousBalance, fallbackDue) {
    const amountDue = Number(fee?.amountDue ?? fallbackDue ?? 0);
    const amountPaid = Number(fee?.amountPaid || 0);

    return previousBalance + amountDue - amountPaid;
  }

  function paymentType(payment) {
    return !payment.paymentType || payment.paymentType === "plata" ? "incasare" : payment.paymentType;
  }

  function paymentCurrency(payment) {
    return payment.currency || "lei";
  }

  function signedAmount(payment) {
    const amount = Number(payment.amount || 0);
    return paymentType(payment) === "avans" ? -amount : amount;
  }

  function formatPaymentAmount(payment) {
    const prefix = paymentType(payment) === "avans" ? "- " : "";
    return prefix + formatMoney(payment.amount, paymentCurrency(payment));
  }

  function payerType(payment) {
    if (payment.payerType) return payment.payerType;
    return payment.athleteId ? "sportiv" : "partener";
  }

  function payerLabel(athletes, payment) {
    const athlete = findAthlete(athletes, payment.athleteId);
    if (athlete) return athleteName(athlete);
    if (payment.payerName) return payment.payerName;
    return payerType(payment) === "partener" ? "Partener fara nume" : "Sursa necunoscuta";
  }

  function comparePaymentsByPayer(athletes) {
    return (first, second) =>
      compareText(payerLabel(athletes, first), payerLabel(athletes, second)) ||
      sortByDateDesc(first, second);
  }

  function compareFeesByAthlete(athletes) {
    return (first, second) => {
      const firstAthlete = findAthlete(athletes, first.athleteId);
      const secondAthlete = findAthlete(athletes, second.athleteId);

      return compareText(firstAthlete ? athleteName(firstAthlete) : "Sportiv necunoscut", secondAthlete ? athleteName(secondAthlete) : "Sportiv necunoscut");
    };
  }

  function sumPayments(rows, currency, method) {
    return rows
      .filter((payment) => paymentCurrency(payment) === currency)
      .filter((payment) => !method || payment.method === method)
      .reduce((sum, payment) => sum + signedAmount(payment), 0);
  }

  function formatDualAmount(rows, method) {
    return formatMoney(sumPayments(rows, "lei", method), "lei") + " / " + formatMoney(sumPayments(rows, "euro", method), "euro");
  }

  function Field({ label, children }) {
    return h("label", { className: "field" }, h("span", null, label), children);
  }

  function EmptyState({ title, text }) {
    return h("div", { className: "empty-state" }, h("strong", null, title), h("p", null, text));
  }

  function SummaryCard({ label, value, hint, tone }) {
    return h(
      "div",
      { className: `cs-report-card ${tone || ""}` },
      h("span", null, label),
      h("strong", null, value),
      hint && h("small", null, hint)
    );
  }

  function DetailSection({ title, meta, children, open }) {
    return h(
      "details",
      { className: "cs-report-section", open: Boolean(open) },
      h("summary", null, h("span", { className: "cs-report-section-title" }, title), meta && h("strong", { className: "cs-report-section-meta" }, meta)),
      h("div", { className: "cs-report-section-body" }, children)
    );
  }

  function ReportItem({ title, subtitle, amount, negative, children }) {
    return h(
      "li",
      { className: "cs-report-item" },
      h(
        "div",
        { className: "cs-report-item-main" },
        h("span", { className: "cs-report-item-title" }, title, subtitle && h("small", null, subtitle)),
        amount && h("strong", { className: `cs-report-amount ${negative ? "negative" : ""}` }, amount)
      ),
      children && h("div", { className: "cs-report-item-extra" }, children)
    );
  }

  function EmptyReportLine({ text }) {
    return h("p", { className: "cs-report-empty" }, text);
  }

  function BalanceCell({ previousBalance }) {
    const previousDebt = Math.max(previousBalance, 0);
    const previousCredit = Math.max(-previousBalance, 0);

    if (previousDebt > 0) {
      return h("strong", { className: "arrears" }, formatMoney(previousDebt));
    }

    if (previousCredit > 0) {
      return h("span", { className: "pill ok" }, "Avans " + formatMoney(previousCredit));
    }

    return "-";
  }

  function FeesView({ athletes, fees, onSaveFee, onResetMonth }) {
    const monthNow = currentMonth();
    const [month, setMonth] = React.useState(monthNow);
    const [group, setGroup] = React.useState("toate");
    const groups = getGroups(athletes);
    const listedAthletes = athletes.filter((athlete) => {
      if (!athlete.active) return false;
      if (group !== "toate" && athlete.group !== group) return false;
      if (!athlete.joinMonth) return false;

      return athlete.joinMonth <= month;
    });
    const listedAthleteIds = listedAthletes.map((athlete) => athlete.id);
    const monthlyCollected = fees
      .filter((fee) => fee.month === month && listedAthleteIds.includes(fee.athleteId))
      .reduce((sum, fee) => sum + Number(fee.amountPaid || 0), 0);

    function getFee(athleteId) {
      const athlete = athletes.find((item) => item.id === athleteId);
      const defaultAmountDue = athlete ? getDefaultAmountDue(fees, athlete, month) : 200;

      return getFeeForMonth(fees, athleteId, month) || {
        athleteId,
        month,
        status: defaultAmountDue === 0 ? "pl\u0103tit\u0103" : "nepl\u0103tit\u0103",
        amountDue: defaultAmountDue,
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

    const monthlyOutstanding = listedAthletes.reduce((sum, athlete) => {
      const fee = getFee(athlete.id);
      const previousBalance = getPreviousBalance(fees, athlete, month);
      const fallbackDue = getDefaultAmountDue(fees, athlete, month);

      return sum + getOutstandingAmount(fee, previousBalance, fallbackDue);
    }, 0);
    const originalOrder = new Map(listedAthletes.map((athlete, index) => [athlete.id, index]));
    const displayedAthletes = [...listedAthletes].sort((first, second) => {
      const firstOutstanding = getOutstandingAmount(
        getFee(first.id),
        getPreviousBalance(fees, first, month),
        getDefaultAmountDue(fees, first, month)
      );
      const secondOutstanding = getOutstandingAmount(
        getFee(second.id),
        getPreviousBalance(fees, second, month),
        getDefaultAmountDue(fees, second, month)
      );
      const firstIsUnpaid = firstOutstanding > 0 ? 1 : 0;
      const secondIsUnpaid = secondOutstanding > 0 ? 1 : 0;

      return secondIsUnpaid - firstIsUnpaid || originalOrder.get(first.id) - originalOrder.get(second.id);
    });

    return h(
      "section",
      { className: "stack" },
      h(
        "div",
        { className: "panel compact-grid" },
        h(Field, { label: "Luna" }, h("input", { type: "month", value: month, onChange: (event) => setMonth(event.target.value) })),
        h(
          Field,
          { label: "Grupa" },
          h(
            "select",
            { value: group, onChange: (event) => setGroup(event.target.value) },
            h("option", { value: "toate" }, "Toate grupele"),
            groups.map((item) => h("option", { key: item, value: item }, item))
          )
        ),
        h("button", { className: "danger align-end", onClick: () => onResetMonth(month, listedAthleteIds), disabled: !listedAthletes.length }, "Reset luna")
      ),
      h(
        "div",
        { className: "metrics" },
        h("div", null, h("span", null, "Total incasari luna"), h("strong", null, formatMoney(monthlyCollected))),
        h("div", null, h("span", null, "De incasat total"), h("strong", null, formatMoney(monthlyOutstanding))),
        h(
          "div",
          null,
          h("span", null, "Impartire incasari"),
          h("strong", null, "60% = " + formatMoney(monthlyCollected * 0.6)),
          h("strong", null, "40% = " + formatMoney(monthlyCollected * 0.4))
        )
      ),
      h(
        "div",
        { className: "table-wrap wide" },
        h(
          "table",
          null,
          h("thead", null, h("tr", null, ["Sportiv", "Status", "Datorat", "Restanta / Avans", "Total", "Platit", "Data platii", "Metoda", "Observatii"].map((head) => h("th", { key: head }, head)))),
          h(
            "tbody",
            null,
            displayedAthletes.map((athlete) => {
              const fee = getFee(athlete.id);
              const previousBalance = getPreviousBalance(fees, athlete, month);
              const fallbackDue = getDefaultAmountDue(fees, athlete, month);
              const totalToPay = getTotalToPay(fee, previousBalance, fallbackDue);
              const outstanding = getOutstandingAmount(fee, previousBalance, fallbackDue);
              const balanceAfterMonth = getBalanceAfterMonth(fee, previousBalance, fallbackDue);
              const creditAfterMonth = Math.max(-balanceAfterMonth, 0);

              return h(
                "tr",
                { key: athlete.id, className: outstanding > 0 ? "row-unpaid" : "" },
                h(
                  "td",
                  { "data-label": "Sportiv" },
                  h("strong", null, athleteName(athlete)),
                  h("small", null, athlete.group + " / inscris: " + (athlete.joinMonth || "FARA LUNA"))
                ),
                h(
                  "td",
                  { "data-label": "Status" },
                  h(
                    "select",
                    { value: fee.status, onChange: (event) => updateFee(athlete.id, "status", event.target.value) },
                    feeStatuses.map((status) => h("option", { key: status, value: status }, status))
                  )
                ),
                h("td", { "data-label": "Datorat" }, h("input", { type: "number", min: "0", value: fee.amountDue, onChange: (event) => updateFee(athlete.id, "amountDue", Number(event.target.value)) })),
                h("td", { "data-label": "Restanta / Avans" }, h(BalanceCell, { previousBalance })),
                h("td", { "data-label": "Total" }, h("strong", null, formatMoney(totalToPay)), creditAfterMonth > 0 && h("small", null, "Avans ramas: " + formatMoney(creditAfterMonth))),
                h("td", { "data-label": "Platit" }, h("input", { type: "number", min: "0", value: Number(fee.amountPaid || 0) === 0 ? "" : fee.amountPaid, onChange: (event) => updateFee(athlete.id, "amountPaid", event.target.value === "" ? 0 : Number(event.target.value)) })),
                h("td", { "data-label": "Data platii" }, h("input", { type: "date", value: fee.paymentDate, onChange: (event) => updateFee(athlete.id, "paymentDate", event.target.value) })),
                h(
                  "td",
                  { "data-label": "Metoda" },
                  h(
                    "select",
                    { value: fee.method, onChange: (event) => updateFee(athlete.id, "method", event.target.value) },
                    paymentMethods.map((method) => h("option", { key: method, value: method }, method))
                  )
                ),
                h("td", { "data-label": "Observatii" }, h("input", { value: fee.notes, onChange: (event) => updateFee(athlete.id, "notes", event.target.value), placeholder: "Optional" }))
              );
            })
          )
        )
      )
    );
  }

  function emptyForm() {
    return {
      id: "",
      payerType: "sportiv",
      athleteId: "",
      payerName: "",
      date: today(),
      category: categories[0],
      paymentType: "incasare",
      amount: "",
      method: "cash",
      currency: "lei",
      notes: ""
    };
  }

  function OtherPaymentsView({ athletes, otherPayments = [], onSavePayment, onDeletePayment }) {
    const [month, setMonth] = React.useState(currentMonth());
    const [group, setGroup] = React.useState("toate");
    const [category, setCategory] = React.useState("toate");
    const [typeFilter, setTypeFilter] = React.useState("toate");
    const [currencyFilter, setCurrencyFilter] = React.useState("toate");
    const [query, setQuery] = React.useState("");
    const [form, setForm] = React.useState(emptyForm);

    const groups = getGroups(athletes);
    const activeAthletes = [...athletes]
      .filter((athlete) => athlete.active)
      .sort(compareAthletesByName);

    const filteredPayments = otherPayments
      .filter((payment) => getMonth(payment.date) === month)
      .filter((payment) => category === "toate" || payment.category === category)
      .filter((payment) => typeFilter === "toate" || paymentType(payment) === typeFilter)
      .filter((payment) => currencyFilter === "toate" || paymentCurrency(payment) === currencyFilter)
      .filter((payment) => {
        const athlete = findAthlete(athletes, payment.athleteId);
        return group === "toate" || athlete?.group === group;
      })
      .filter((payment) => {
        const text = [
          payerLabel(athletes, payment),
          payerType(payment),
          payment.category,
          paymentType(payment),
          payment.method,
          paymentCurrency(payment),
          payment.notes
        ]
          .join(" ")
          .toLowerCase();
        return text.includes(query.toLowerCase());
      })
      .sort(comparePaymentsByPayer(athletes));

    const totalLei = sumPayments(filteredPayments, "lei");
    const totalEuro = sumPayments(filteredPayments, "euro");

    function update(field, value) {
      setForm((current) => ({ ...current, [field]: value }));
    }

    function submit(event) {
      event.preventDefault();

      const isSportiv = form.payerType === "sportiv";
      const payerName = String(form.payerName || "").trim();

      if ((isSportiv && !form.athleteId) || (!isSportiv && !payerName) || !form.date || !form.category || Number(form.amount || 0) <= 0) return;

      onSavePayment({
        ...form,
        athleteId: isSportiv ? form.athleteId : "",
        payerName: isSportiv ? "" : payerName,
        amount: Number(form.amount || 0),
        notes: String(form.notes || "").trim()
      });
      setForm(emptyForm());
    }

    function edit(payment) {
      setForm({
        id: payment.id || "",
        payerType: payerType(payment),
        athleteId: payment.athleteId || "",
        payerName: payment.payerName || "",
        date: payment.date || today(),
        category: payment.category || categories[0],
        paymentType: paymentType(payment),
        amount: payment.amount || "",
        method: payment.method || "cash",
        currency: paymentCurrency(payment),
        notes: payment.notes || ""
      });
    }

    return h(
      "section",
      { className: "stack" },
      h(
        "form",
        { className: "panel form-grid", onSubmit: submit },
        h(
          Field,
          { label: "De la" },
          h(
            "select",
            { value: form.payerType, onChange: (event) => update("payerType", event.target.value) },
            payerTypes.map((item) => h("option", { key: item, value: item }, item))
          )
        ),
        form.payerType === "sportiv"
          ? h(
              Field,
              { label: "Sportiv" },
              h(
                "select",
                { value: form.athleteId, onChange: (event) => update("athleteId", event.target.value), required: true },
                h("option", { value: "" }, "Alege sportiv"),
                activeAthletes.map((athlete) => h("option", { key: athlete.id, value: athlete.id }, athleteName(athlete) + " - " + athlete.group))
              )
            )
          : h(
              Field,
              { label: form.payerType === "partener" ? "Nume partener" : "Sursa banilor" },
              h("input", { value: form.payerName, onChange: (event) => update("payerName", event.target.value), placeholder: form.payerType === "partener" ? "Nume partener" : "Ex: donatie, sponsor, alta sursa", required: true })
            ),
        h(Field, { label: "Data incasarii" }, h("input", { type: "date", value: form.date, onChange: (event) => update("date", event.target.value), required: true })),
        h(
          Field,
          { label: "Categorie" },
          h(
            "select",
            { value: form.category, onChange: (event) => update("category", event.target.value) },
            categories.map((item) => h("option", { key: item, value: item }, item))
          )
        ),
        h(
          Field,
          { label: "Tip" },
          h(
            "select",
            { value: form.paymentType, onChange: (event) => update("paymentType", event.target.value) },
            paymentTypes.map((item) => h("option", { key: item, value: item }, item))
          )
        ),
        h(Field, { label: "Suma" }, h("input", { type: "number", min: "0", value: form.amount, onChange: (event) => update("amount", event.target.value), required: true })),
        h(
          Field,
          { label: "Moneda" },
          h(
            "select",
            { value: form.currency, onChange: (event) => update("currency", event.target.value) },
            currencies.map((item) => h("option", { key: item, value: item }, item))
          )
        ),
        h(
          Field,
          { label: "Metoda" },
          h(
            "select",
            { value: form.method, onChange: (event) => update("method", event.target.value) },
            paymentMethods.map((method) => h("option", { key: method, value: method }, method))
          )
        ),
        h(Field, { label: "Observatii" }, h("input", { value: form.notes, onChange: (event) => update("notes", event.target.value), placeholder: "Optional" })),
        h(
          "div",
          { className: "form-actions" },
          h("button", { className: "primary", type: "submit" }, form.id ? "Actualizeaza incasarea" : "Adauga incasarea"),
          form.id && h("button", { type: "button", onClick: () => setForm(emptyForm()) }, "Renunta")
        )
      ),
      h(
        "div",
        { className: "panel compact-grid" },
        h(Field, { label: "Luna" }, h("input", { type: "month", value: month, onChange: (event) => setMonth(event.target.value) })),
        h(
          Field,
          { label: "Grupa" },
          h(
            "select",
            { value: group, onChange: (event) => setGroup(event.target.value) },
            h("option", { value: "toate" }, "Toate grupele"),
            groups.map((item) => h("option", { key: item, value: item }, item))
          )
        ),
        h(
          Field,
          { label: "Categorie" },
          h(
            "select",
            { value: category, onChange: (event) => setCategory(event.target.value) },
            h("option", { value: "toate" }, "Toate categoriile"),
            categories.map((item) => h("option", { key: item, value: item }, item))
          )
        ),
        h(
          Field,
          { label: "Tip" },
          h(
            "select",
            { value: typeFilter, onChange: (event) => setTypeFilter(event.target.value) },
            h("option", { value: "toate" }, "Plati si avansuri"),
            paymentTypes.map((item) => h("option", { key: item, value: item }, item))
          )
        ),
        h(
          Field,
          { label: "Moneda" },
          h(
            "select",
            { value: currencyFilter, onChange: (event) => setCurrencyFilter(event.target.value) },
            h("option", { value: "toate" }, "Lei si euro"),
            currencies.map((item) => h("option", { key: item, value: item }, item))
          )
        ),
        h(Field, { label: "Cauta" }, h("input", { value: query, onChange: (event) => setQuery(event.target.value), placeholder: "Nume, categorie, observatii" }))
      ),
      h(
        "div",
        { className: "metrics" },
        h("div", null, h("span", null, "Total lei"), h("strong", null, formatMoney(totalLei, "lei"))),
        h("div", null, h("span", null, "Total euro"), h("strong", null, formatMoney(totalEuro, "euro"))),
        h("div", null, h("span", null, "Cash / Transfer"), h("strong", null, "Cash: " + formatDualAmount(filteredPayments, "cash")), h("strong", null, "Transfer: " + formatDualAmount(filteredPayments, "transfer")))
      ),
      h(
        "div",
        { className: "table-wrap wide" },
        h(
          "table",
          null,
          h("thead", null, h("tr", null, ["Data", "De la", "Categorie", "Tip", "Suma", "Moneda", "Metoda", "Observatii", "Operat de", ""].map((head) => h("th", { key: head }, head)))),
          h(
            "tbody",
            null,
            filteredPayments.map((payment) => {
              const athlete = findAthlete(athletes, payment.athleteId);

              return h(
                "tr",
                { key: payment.id },
                h("td", { "data-label": "Data" }, formatDate(payment.date)),
                h("td", { "data-label": "De la" }, h("strong", null, payerLabel(athletes, payment)), h("small", null, athlete ? athlete.group : payerType(payment))),
                h("td", { "data-label": "Categorie" }, payment.category || "-"),
                h("td", { "data-label": "Tip" }, paymentType(payment)),
                h("td", { "data-label": "Suma" }, h("strong", { className: paymentType(payment) === "avans" ? "arrears" : "" }, formatPaymentAmount(payment))),
                h("td", { "data-label": "Moneda" }, paymentCurrency(payment)),
                h("td", { "data-label": "Metoda" }, payment.method || "-"),
                h("td", { "data-label": "Observatii" }, payment.notes || "-"),
                h("td", { "data-label": "Operat de" }, payment.updatedByEmail || "-"),
                h(
                  "td",
                  { className: "row-actions" },
                  h("button", { onClick: () => edit(payment) }, "Editeaza"),
                  h("button", { className: "danger", onClick: () => onDeletePayment(payment.id) }, "Sterge")
                )
              );
            })
          )
        )
      ),
      !filteredPayments.length && h(EmptyState, { title: "Nu exista alte incasari in filtrul curent.", text: "Adauga o incasare sau schimba luna, grupa ori categoria." })
    );
  }

  function ExtraPaymentsReport({ athletes, otherPayments = [] }) {
    const [month, setMonth] = React.useState(currentMonth());
    const [group, setGroup] = React.useState("toate");
    const [category, setCategory] = React.useState("toate");
    const [typeFilter, setTypeFilter] = React.useState("toate");
    const [currencyFilter, setCurrencyFilter] = React.useState("toate");
    const groups = getGroups(athletes);
    const rows = otherPayments
      .filter((payment) => getMonth(payment.date) === month)
      .filter((payment) => category === "toate" || payment.category === category)
      .filter((payment) => typeFilter === "toate" || paymentType(payment) === typeFilter)
      .filter((payment) => currencyFilter === "toate" || paymentCurrency(payment) === currencyFilter)
      .filter((payment) => {
        const athlete = findAthlete(athletes, payment.athleteId);
        return group === "toate" || athlete?.group === group;
      })
      .sort(comparePaymentsByPayer(athletes));
    const totalLei = sumPayments(rows, "lei");
    const totalEuro = sumPayments(rows, "euro");
    const categoryTotals = categories
      .map((item) => ({
        category: item,
        totalLei: sumPayments(rows.filter((payment) => payment.category === item), "lei"),
        totalEuro: sumPayments(rows.filter((payment) => payment.category === item), "euro")
      }))
      .filter((item) => item.totalLei !== 0 || item.totalEuro !== 0);

    return h(
      "section",
      { className: "stack" },
      h("h2", null, "Alte incasari"),
      h(
        "div",
        { className: "panel compact-grid" },
        h(Field, { label: "Luna" }, h("input", { type: "month", value: month, onChange: (event) => setMonth(event.target.value) })),
        h(
          Field,
          { label: "Grupa" },
          h(
            "select",
            { value: group, onChange: (event) => setGroup(event.target.value) },
            h("option", { value: "toate" }, "Toate grupele"),
            groups.map((item) => h("option", { key: item, value: item }, item))
          )
        ),
        h(
          Field,
          { label: "Categorie" },
          h(
            "select",
            { value: category, onChange: (event) => setCategory(event.target.value) },
            h("option", { value: "toate" }, "Toate categoriile"),
            categories.map((item) => h("option", { key: item, value: item }, item))
          )
        ),
        h(
          Field,
          { label: "Tip" },
          h(
            "select",
            { value: typeFilter, onChange: (event) => setTypeFilter(event.target.value) },
            h("option", { value: "toate" }, "Plati si avansuri"),
            paymentTypes.map((item) => h("option", { key: item, value: item }, item))
          )
        ),
        h(
          Field,
          { label: "Moneda" },
          h(
            "select",
            { value: currencyFilter, onChange: (event) => setCurrencyFilter(event.target.value) },
            h("option", { value: "toate" }, "Lei si euro"),
            currencies.map((item) => h("option", { key: item, value: item }, item))
          )
        )
      ),
      h(
        "div",
        { className: "cs-report-summary" },
        h(SummaryCard, { label: "Total lei", value: formatMoney(totalLei, "lei"), hint: `${rows.length} inregistrari`, tone: "tone-green" }),
        h(SummaryCard, { label: "Total euro", value: formatMoney(totalEuro, "euro"), hint: "Incasari in euro", tone: "tone-blue" }),
        h(SummaryCard, { label: "Cash", value: formatDualAmount(rows, "cash"), hint: "Doar filtrul ales", tone: "tone-amber" }),
        h(SummaryCard, { label: "Transfer", value: formatDualAmount(rows, "transfer"), hint: "Doar filtrul ales", tone: "tone-purple" })
      ),
      h(
        "div",
        { className: "cs-report-sections" },
        h(
          DetailSection,
          { title: "Pe categorii", meta: `${categoryTotals.length} categorii`, open: true },
          categoryTotals.length
            ? h(
                "ul",
                { className: "cs-report-list" },
                categoryTotals.map((item) =>
                  h(ReportItem, {
                    key: item.category,
                    title: item.category,
                    amount: formatMoney(item.totalLei, "lei") + " / " + formatMoney(item.totalEuro, "euro")
                  })
                )
              )
            : h(EmptyReportLine, { text: "Nu exista incasari in filtrul ales." })
        ),
        h(
          DetailSection,
          { title: "Lista incasari", meta: `${rows.length} inregistrari`, open: false },
          rows.length
            ? h(
                "ul",
                { className: "cs-report-list" },
                rows.map((payment) =>
                  h(ReportItem, {
                    key: payment.id,
                    title: payerLabel(athletes, payment),
                    subtitle: formatDate(payment.date) + " / " + payerType(payment) + " / " + (payment.category || "-") + " / " + paymentType(payment) + " / " + (payment.method || "-"),
                    amount: formatPaymentAmount(payment),
                    negative: paymentType(payment) === "avans"
                  })
                )
              )
            : h(EmptyReportLine, { text: "Nu exista incasari in filtrul ales." })
        )
      )
    );
  }

  function FeePaymentRows({ title, rows, athletes, emptyText }) {
    const subtotal = rows.reduce((sum, fee) => sum + Number(fee.amountPaid || 0), 0);

    return h(
      "div",
      { className: "cs-report-sublist" },
      h("h3", null, `${title}: ${formatMoney(subtotal)}`),
      rows.length
        ? h(
            "ul",
            { className: "cs-report-list" },
            [...rows].sort(compareFeesByAthlete(athletes)).map((fee) => {
              const athlete = findAthlete(athletes, fee.athleteId);

              return h(ReportItem, {
                key: fee.id || `${fee.athleteId}-${fee.month}-${fee.method}-${fee.amountPaid}`,
                title: athlete ? athleteName(athlete) : "Sportiv necunoscut",
                subtitle: fee.paymentDate ? "Data platii: " + fee.paymentDate : "Fara data de plata",
                amount: formatMoney(fee.amountPaid)
              });
            })
          )
        : h(EmptyReportLine, { text: emptyText })
    );
  }

  function TaxReportsView({ athletes, fees = [] }) {
    const [month, setMonth] = React.useState(currentMonth());
    const [group, setGroup] = React.useState("toate");
    const [reportType, setReportType] = React.useState("toate");
    const groups = getGroups(athletes);
    const athletesInFilter = athletes.filter(
      (athlete) =>
        shouldShowAthleteInReports(athlete) &&
        (group === "toate" || athlete.group === group) &&
        (!athlete.joinMonth || athlete.joinMonth <= month)
    ).sort(compareAthletesByName);
    const debtorRows = athletesInFilter
      .map((athlete) => {
        const fee = getFeeForMonth(fees, athlete.id, month);
        const previousBalance = getPreviousBalance(fees, athlete, month);
        const outstanding = getOutstandingAmount(fee, previousBalance, getDefaultAmountDue(fees, athlete, month));

        return { athlete, outstanding };
      })
      .filter((row) => row.outstanding > 0);
    const creditRows = athletesInFilter
      .map((athlete) => {
        const fee = getFeeForMonth(fees, athlete.id, month);
        const previousBalance = getPreviousBalance(fees, athlete, month);
        const balanceAfterMonth = getBalanceAfterMonth(fee, previousBalance, getDefaultAmountDue(fees, athlete, month));
        const credit = Math.max(-balanceAfterMonth, 0);

        return { athlete, credit };
      })
      .filter((row) => row.credit > 0);
    const collectedFees = fees.filter(
      (fee) =>
        fee.month === month &&
        Number(fee.amountPaid || 0) > 0 &&
        athletesInFilter.some((athlete) => athlete.id === fee.athleteId)
    );
    const cashRows = collectedFees.filter((fee) => fee.method === "cash");
    const transferRows = collectedFees.filter((fee) => fee.method === "transfer");
    const totalCollected = collectedFees.reduce((sum, fee) => sum + Number(fee.amountPaid || 0), 0);
    const totalCash = cashRows.reduce((sum, fee) => sum + Number(fee.amountPaid || 0), 0);
    const totalTransfer = transferRows.reduce((sum, fee) => sum + Number(fee.amountPaid || 0), 0);
    const observationRows = athletesInFilter.filter((athlete) => athlete.notes && athlete.notes.trim()).sort(compareAthletesByName);
    const totalOutstanding = debtorRows.reduce((sum, row) => sum + row.outstanding, 0);
    const totalCredit = creditRows.reduce((sum, row) => sum + row.credit, 0);

    return h(
      "section",
      { className: "stack" },
      h("h2", null, "Taxe"),
      h(
        "div",
        { className: "panel compact-grid" },
        h(
          Field,
          { label: "Grupa" },
          h(
            "select",
            { value: group, onChange: (event) => setGroup(event.target.value) },
            h("option", { value: "toate" }, "Toate grupele"),
            groups.map((item) => h("option", { key: item, value: item }, item))
          )
        ),
        h(Field, { label: "Luna" }, h("input", { type: "month", value: month, onChange: (event) => setMonth(event.target.value) })),
        h(
          Field,
          { label: "Tip raport" },
          h(
            "select",
            { value: reportType, onChange: (event) => setReportType(event.target.value) },
            h("option", { value: "toate" }, "Toate taxele"),
            h("option", { value: "restantieri" }, "Restantieri"),
            h("option", { value: "avansuri" }, "Avansuri"),
            h("option", { value: "observatii" }, "Cu observatii"),
            h("option", { value: "cash" }, "Doar cash"),
            h("option", { value: "transfer" }, "Doar transfer")
          )
        )
      ),
      h(
        "div",
        { className: "cs-report-summary" },
        h(SummaryCard, { label: "Incasari taxe", value: formatMoney(totalCollected), hint: "Cash: " + formatMoney(totalCash) + " / Transfer: " + formatMoney(totalTransfer), tone: "tone-green" }),
        h(SummaryCard, { label: "Restante", value: formatMoney(totalOutstanding), hint: `${debtorRows.length} sportivi`, tone: "tone-red" }),
        h(SummaryCard, { label: "Avansuri", value: formatMoney(totalCredit), hint: `${creditRows.length} sportivi`, tone: "tone-blue" }),
        h(SummaryCard, { label: "Observatii", value: observationRows.length, hint: "Sportivi cu observatii", tone: "tone-amber" })
      ),
      h(
        "div",
        { className: "cs-report-sections" },
        (reportType === "restantieri" || reportType === "toate") &&
          h(
            DetailSection,
            { title: "Restantieri", meta: `${debtorRows.length} sportivi / ${formatMoney(totalOutstanding)}`, open: reportType === "restantieri" },
            debtorRows.length
              ? h(
                  "ul",
                  { className: "cs-report-list" },
                  debtorRows.map(({ athlete, outstanding }) =>
                    h(ReportItem, {
                      key: athlete.id,
                      title: athleteName(athlete),
                      amount: formatMoney(outstanding)
                    })
                  )
                )
              : h(EmptyReportLine, { text: "Nu exista restantieri." })
          ),
        (reportType === "avansuri" || reportType === "toate") &&
          h(
            DetailSection,
            { title: "Avansuri", meta: `${creditRows.length} sportivi / ${formatMoney(totalCredit)}`, open: reportType === "avansuri" },
            creditRows.length
              ? h(
                  "ul",
                  { className: "cs-report-list" },
                  creditRows.map(({ athlete, credit }) =>
                    h(ReportItem, {
                      key: athlete.id,
                      title: athleteName(athlete),
                      amount: formatMoney(credit)
                    })
                  )
                )
              : h(EmptyReportLine, { text: "Nu exista avansuri." })
          ),
        reportType === "observatii" &&
          h(
            DetailSection,
            { title: "Sportivi cu observatii", meta: `${observationRows.length} sportivi`, open: true },
            observationRows.length
              ? h(
                  "ul",
                  { className: "cs-report-list" },
                  observationRows.map((athlete) =>
                    h(ReportItem, {
                      key: athlete.id,
                      title: athleteName(athlete),
                      subtitle: athlete.notes
                    })
                  )
                )
              : h(EmptyReportLine, { text: "Nu exista observatii." })
          ),
        reportType === "cash" &&
          h(
            DetailSection,
            { title: "Incasari cash", meta: `${cashRows.length} plati / ${formatMoney(totalCash)}`, open: true },
            h(FeePaymentRows, { title: "Cash", rows: cashRows, athletes, emptyText: "Nu exista incasari cash." })
          ),
        reportType === "transfer" &&
          h(
            DetailSection,
            { title: "Incasari transfer", meta: `${transferRows.length} plati / ${formatMoney(totalTransfer)}`, open: true },
            h(FeePaymentRows, { title: "Transfer", rows: transferRows, athletes, emptyText: "Nu exista incasari prin transfer." })
          ),
        reportType === "toate" &&
          h(
            DetailSection,
            { title: "Incasari pe luna", meta: `${collectedFees.length} plati / ${formatMoney(totalCollected)}`, open: false },
            collectedFees.length
              ? h("div", { style: { display: "grid", gap: "12px" } }, h(FeePaymentRows, { title: "Cash", rows: cashRows, athletes, emptyText: "Nu exista incasari cash." }), h(FeePaymentRows, { title: "Transfer", rows: transferRows, athletes, emptyText: "Nu exista incasari prin transfer." }))
              : h(EmptyReportLine, { text: "Nu exista incasari." })
          )
      )
    );
  }

  function AttendanceReportsView({ athletes, trainings = [] }) {
    const [month, setMonth] = React.useState(currentMonth());
    const [group, setGroup] = React.useState("toate");
    const [mode, setMode] = React.useState("peSportiv");
    const groups = getGroups(athletes);
    const athletesInFilter = athletes.filter(
      (athlete) =>
        shouldShowAthleteInReports(athlete) &&
        (group === "toate" || athlete.group === group) &&
        (!athlete.joinMonth || athlete.joinMonth <= month)
    ).sort(compareAthletesByName);
    const rows = athletesInFilter.map((athlete) => {
      const entries = trainings
        .filter((training) => training.attendance?.[athlete.id] && training.date.startsWith(month))
        .sort((first, second) => first.date.localeCompare(second.date));
      const present = entries.filter((training) => training.attendance[athlete.id] === "prezent").length;
      return { athlete, total: entries.length, present, entries };
    });
    const visibleRows = mode === "sub50" ? rows.filter((row) => row.total > 0 && row.present / row.total < 0.5) : rows;
    const athletesWithAttendance = rows.filter((row) => row.total > 0).length;
    const lowAttendance = rows.filter((row) => row.total > 0 && row.present / row.total < 0.5).length;
    const totalEntries = rows.reduce((sum, row) => sum + row.total, 0);
    const totalPresent = rows.reduce((sum, row) => sum + row.present, 0);

    return h(
      "section",
      { className: "stack" },
      h("h2", null, "Prezenta"),
      h(
        "div",
        { className: "panel compact-grid" },
        h(
          Field,
          { label: "Grupa" },
          h(
            "select",
            { value: group, onChange: (event) => setGroup(event.target.value) },
            h("option", { value: "toate" }, "Toate grupele"),
            groups.map((item) => h("option", { key: item, value: item }, item))
          )
        ),
        h(Field, { label: "Luna" }, h("input", { type: "month", value: month, onChange: (event) => setMonth(event.target.value) })),
        h(
          Field,
          { label: "Tip raport" },
          h(
            "select",
            { value: mode, onChange: (event) => setMode(event.target.value) },
            h("option", { value: "peSportiv" }, "Prezente pe sportiv"),
            h("option", { value: "sub50" }, "Prezenta sub 50%")
          )
        )
      ),
      h(
        "div",
        { className: "cs-report-summary" },
        h(SummaryCard, { label: "Sportivi cu prezenta", value: athletesWithAttendance, hint: `${totalEntries} zile marcate`, tone: "tone-green" }),
        h(SummaryCard, { label: "Prezente", value: totalPresent, hint: "Total prezente in filtrul ales", tone: "tone-blue" }),
        h(SummaryCard, { label: "Sub 50%", value: lowAttendance, hint: "Sportivi de verificat", tone: "tone-red" }),
        h(SummaryCard, { label: "Legenda", value: "Culori", hint: "Negru prezent / Rosu absent / Albastru invoit / Mov accidentat", tone: "tone-purple" })
      ),
      h(
        DetailSection,
        {
          title: mode === "sub50" ? "Sportivi cu prezenta sub 50%" : "Prezente pe sportiv",
          meta: `${visibleRows.length} sportivi`,
          open: mode === "sub50"
        },
        visibleRows.length
          ? h(
              "ul",
              { className: "cs-report-list" },
              visibleRows.map(({ athlete, present, total, entries }) =>
                h(
                  ReportItem,
                  {
                    key: athlete.id,
                    title: athleteName(athlete),
                    subtitle: total > 0 ? "Date marcate in luna aleasa" : "Fara prezenta in luna aleasa",
                    amount: `${present}/${total}`
                  },
                  entries.length > 0 &&
                    entries.map((training) =>
                      h(
                        "span",
                        { key: training.id || training.date, style: { color: attendanceColor(training.attendance[athlete.id]), fontSize: "0.84rem", fontWeight: 800 } },
                        formatAttendanceDay(training.date)
                      )
                    )
                )
              )
            )
          : h(EmptyState, { title: "Nu exista date in filtrul ales.", text: "Schimba luna, grupa sau tipul raportului." })
      )
    );
  }

  function ReportsView(props) {
    const [section, setSection] = React.useState("taxe");

    return h(
      "div",
      { className: "stack" },
      h(
        "div",
        { className: "panel compact-grid" },
        h(
          Field,
          { label: "Ce raport vezi" },
          h(
            "select",
            { value: section, onChange: (event) => setSection(event.target.value) },
            h("option", { value: "taxe" }, "Taxe"),
            h("option", { value: "prezenta" }, "Prezenta"),
            h("option", { value: "alteIncasari" }, "Alte incasari"),
            h("option", { value: "tot" }, "Tot")
          )
        )
      ),
      (section === "taxe" || section === "tot") && h(TaxReportsView, props),
      (section === "prezenta" || section === "tot") && h(AttendanceReportsView, props),
      (section === "alteIncasari" || section === "tot") && h(ExtraPaymentsReport, props)
    );
  }

  window.OtherPaymentsView = OtherPaymentsView;
  window.FeesView = FeesView;
  window.ReportsView = ReportsView;
  window.CSHeartComponents = {
    ...window.CSHeartComponents,
    FeesView,
    OtherPaymentsView,
    ReportsView
  };
})();
