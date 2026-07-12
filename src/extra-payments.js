(function () {
  const h = React.createElement;

  const categories = ["echipament", "cantonament", "turneu", "legitimatie", "transport", "sponsorizare", "parteneriat", "altele"];
  const payerTypes = ["sportiv", "partener", "altul"];
  const paymentTypes = ["incasare", "avans", "cheltuiala", "retur", "anulare"];
  const taxPaymentTypes = ["salariu", "chirie"];
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
      .cs-report-item.expandable {
        padding: 0;
      }
      .cs-report-item.expandable details {
        padding: 10px 12px;
      }
      .cs-report-item.expandable summary {
        list-style: none;
        cursor: pointer;
      }
      .cs-report-item.expandable summary::-webkit-details-marker {
        display: none;
      }
      .cs-report-item-main {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
      }
      .cs-report-item.expandable .cs-report-item-main {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto 24px;
        align-items: center;
      }
      .cs-report-item.expandable .cs-report-item-main::after {
        content: "+";
        width: 24px;
        height: 24px;
        border-radius: 999px;
        background: #eef3f6;
        color: #172026;
        display: grid;
        place-items: center;
        font-weight: 900;
      }
      .cs-report-item.expandable details[open] .cs-report-item-main::after {
        content: "-";
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
      .cs-report-item.expandable .cs-report-item-extra {
        display: grid;
        margin-top: 10px;
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
      .cs-print-overlay {
        position: fixed;
        inset: 0;
        z-index: 50;
        background: rgba(23, 32, 38, 0.42);
        padding: 20px;
        overflow: auto;
      }
      .cs-print-dialog {
        width: min(760px, 100%);
        margin: 0 auto;
        display: grid;
        gap: 12px;
      }
      .cs-print-actions {
        border: 1px solid var(--line, #d9e0e5);
        border-radius: 8px;
        background: #fff;
        box-shadow: var(--shadow, 0 10px 24px rgba(23, 32, 38, 0.08));
        padding: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .cs-print-warning {
        border: 1px solid #f0c9c9;
        border-left: 4px solid #b91c1c;
        border-radius: 8px;
        background: #fff1f2;
        color: #7f1d1d;
        padding: 10px 12px;
        font-weight: 800;
      }
      .cs-receipt-preview {
        background: #fff;
        border: 1px solid var(--line, #d9e0e5);
        border-radius: 8px;
        box-shadow: var(--shadow, 0 10px 24px rgba(23, 32, 38, 0.08));
        padding: 18px 20px;
      }
      .cs-receipt-top {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        border-bottom: 2px solid #172026;
        padding-bottom: 10px;
        margin-bottom: 12px;
      }
      .cs-receipt-brand {
        font-size: 18px;
        font-weight: 900;
      }
      .cs-receipt-brand-wrap {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .cs-receipt-logo {
        width: 38px;
        height: 38px;
        object-fit: contain;
        border-radius: 6px;
        background: #fff;
      }
      .cs-receipt-title {
        margin-top: 3px;
        color: var(--muted, #66727a);
        font-size: 0.78rem;
        font-weight: 800;
        text-transform: uppercase;
      }
      .cs-receipt-table {
        width: 100%;
        border-collapse: collapse;
      }
      .cs-receipt-table th,
      .cs-receipt-table td {
        border-bottom: 1px solid #e5eaee;
        text-align: left;
        vertical-align: top;
        padding: 6px 6px;
      }
      .cs-receipt-table th {
        width: 34%;
        color: var(--muted, #66727a);
        font-size: 0.72rem;
        text-transform: uppercase;
      }
      .cs-receipt-table td {
        font-size: 0.9rem;
        font-weight: 800;
      }
      .cs-receipt-table .amount td {
        color: var(--primary, #c5162e);
        font-size: 1.08rem;
      }
      .cs-receipt-note {
        margin: 12px 0 0;
        color: var(--muted, #66727a);
        font-size: 0.68rem;
        line-height: 1.35;
      }
      .cs-receipt-sign {
        margin-top: 26px;
        display: grid;
        gap: 14px;
        color: var(--muted, #66727a);
        font-size: 0.76rem;
      }
      .cs-receipt-received {
        color: #172026;
        font-weight: 800;
      }
      .cs-receipt-sign-grid {
        display: flex;
        justify-content: space-between;
        gap: 20px;
      }
      .cs-receipt-line {
        border-top: 1px solid #66727a;
        padding-top: 6px;
        width: 42%;
      }
      @media (width <= 640px) {
        .cs-print-overlay {
          padding: 10px;
        }
        .cs-receipt-preview {
          padding: 18px;
        }
        .cs-receipt-top,
        .cs-receipt-sign-grid {
          display: grid;
        }
        .cs-receipt-line {
          width: 100%;
        }
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
    return `${athlete.lastName || ""} ${athlete.firstName || ""}`.replace(/\s+/g, " ").trim();
  }

  function operatorLabel(value) {
    const text = String(value || "").trim();
    const key = text.toLowerCase().replace(/\s+/g, "");

    if (!text) return "-";
    if (key.includes("liviu.vera") || key.includes("liviu")) return "Liviu";
    if (key.includes("alina")) return "Alina";
    return text;
  }

  function compareText(first, second) {
    return String(first || "").trim().localeCompare(String(second || "").trim(), "ro-RO", { sensitivity: "base", numeric: true });
  }

  function compareAthletesByName(first, second) {
    return compareText(athleteName(first), athleteName(second));
  }

  function sameAthleteIdentity(first, second) {
    if (!first || !second) return false;
    const firstName = normalizeText(athleteName(first));
    const secondName = normalizeText(athleteName(second));
    if (!firstName || firstName !== secondName) return false;

    const firstGroup = normalizeText(first.group);
    const secondGroup = normalizeText(second.group);
    return !firstGroup || !secondGroup || firstGroup === secondGroup;
  }

  function paymentBelongsToAthlete(athletes, payment, athlete) {
    if (!payment || !athlete) return false;
    if (payment.athleteId === athlete.id) return true;
    return sameAthleteIdentity(findAthlete(athletes, payment.athleteId), athlete);
  }

  function formatMoney(value, currency = "lei") {
    return `${Number(value || 0).toLocaleString("ro-RO")} ${currency === "euro" ? "euro" : "lei"}`;
  }

  function formatDate(value) {
    if (!value) return "-";
    const normalized = normalizeDateInput(value);
    const parts = String(normalized || value).split("-");
    return parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : value;
  }

  function formatMonthLabel(value) {
    const parts = String(value || "").split("-");
    return parts.length === 2 ? `${parts[1]}.${parts[0]}` : value || "-";
  }

  function normalizeDateInput(value) {
    const text = String(value || "").trim();
    const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) return text;

    const ro = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
    if (!ro) return "";

    const day = String(ro[1]).padStart(2, "0");
    const month = String(ro[2]).padStart(2, "0");
    return `${ro[3]}-${month}-${day}`;
  }

  function formatDateTime(value) {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("ro-RO");
  }

  function getGroups(athletes) {
    return [...new Set(athletes.map((athlete) => athlete.group).filter(Boolean))].sort();
  }

  function getMonth(value) {
    return String(normalizeDateInput(value) || value || "").slice(0, 7);
  }

  function isSameOrBeforeMonth(value, month) {
    const itemMonth = getMonth(value);
    return Boolean(itemMonth) && itemMonth <= month;
  }

  function getMonthEndDate(month) {
    const parts = String(month || currentMonth()).split("-").map(Number);
    if (parts.length !== 2 || !parts[0] || !parts[1]) return today();

    return new Date(Date.UTC(parts[0], parts[1], 0)).toISOString().slice(0, 10);
  }

  function dateRangeBounds(startDate, endDate) {
    const start = normalizeDateInput(startDate);
    const end = normalizeDateInput(endDate);
    if (start && end && start > end) return { start: end, end: start };
    return { start, end };
  }

  function isDateInRange(value, startDate, endDate) {
    const date = normalizeDateInput(value);
    if (!date) return false;
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    return true;
  }

  function isSameOrBeforeDate(value, endDate) {
    const date = normalizeDateInput(value);
    return Boolean(date && endDate && date <= endDate);
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function todayRo() {
    return formatDate(today());
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

  function parseDateValue(value) {
    if (!value) return null;

    const date = new Date(String(value) + "T00:00:00");
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function daysUntilDate(value) {
    const target = parseDateValue(value);
    if (!target) return null;

    const now = parseDateValue(today());
    return Math.ceil((target.getTime() - now.getTime()) / 86400000);
  }

  function hasMedicalVisa(athlete) {
    return Boolean(athlete.medicalVisaFrom || athlete.medicalVisaTo);
  }

  function medicalVisaStatus(athlete) {
    const daysLeft = daysUntilDate(athlete.medicalVisaTo);

    if (daysLeft === null) return "Fara data finala";
    if (daysLeft < 0) return "Expirata";
    if (daysLeft <= 30) return "Expira curand";
    return "Valabila";
  }

  function MedicalVisaPeriod({ athlete }) {
    const from = athlete.medicalVisaFrom ? formatDate(athlete.medicalVisaFrom) : "-";
    const to = athlete.medicalVisaTo ? formatDate(athlete.medicalVisaTo) : "-";

    return h(
      "span",
      { style: { display: "flex", flexWrap: "wrap", gap: "8px 18px", fontWeight: 800 } },
      h("span", null, "de la - ", h("span", { style: { color: "#c5162e" } }, from)),
      h("span", null, "pana la - ", h("span", { style: { color: "#c5162e" } }, to))
    );
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

  function getFirstKnownFeeMonthBefore(fees, athleteId, month) {
    return [...fees]
      .filter((fee) => fee.athleteId === athleteId && fee.month && fee.month < month)
      .map((fee) => fee.month)
      .sort((first, second) => String(first || "").localeCompare(String(second || "")))[0];
  }

  function getFeeBalanceStartMonth(fees, athlete, month) {
    return athlete.joinMonth || getFirstKnownFeeMonthBefore(fees, athlete.id, month) || month;
  }

  function getFeeForMonth(fees, athleteId, month) {
    return fees.find((fee) => fee.athleteId === athleteId && fee.month === month);
  }

  function hasAmountDue(fee) {
    return fee && fee.amountDue !== undefined && fee.amountDue !== null && fee.amountDue !== "";
  }

  function getDefaultAmountDue(fees, athlete, month) {
    const normalDue = athlete.feeDue !== undefined && athlete.feeDue !== null && athlete.feeDue !== "" ? Number(athlete.feeDue) : 200;

    return normalDue;
  }

  function getMonthlyDue(athlete, fee, fees, month) {
    return hasAmountDue(fee) ? Number(fee.amountDue) : getDefaultAmountDue(fees, athlete, month);
  }

  function getPreviousBalance(fees, athlete, month) {
    return getMonthRange(getFeeBalanceStartMonth(fees, athlete, month), month).reduce((balance, itemMonth) => {
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

  function getAutomaticFeeStatus(fee, previousBalance, fallbackDue) {
    const totalToPay = getTotalToPay(fee, previousBalance, fallbackDue);
    const amountPaid = Number(fee?.amountPaid || 0);

    if (totalToPay <= 0 || amountPaid >= totalToPay) return "plătită";
    if (amountPaid > 0) return "parțial plătită";
    return "neplătită";
  }

  function getFeeStatusTone(status) {
    if (status === "plătită") return "ok";
    if (status === "parțial plătită") return "warn";
    return "";
  }

  function getBalanceAfterMonth(fee, previousBalance, fallbackDue) {
    const amountDue = Number(fee?.amountDue ?? fallbackDue ?? 0);
    const amountPaid = Number(fee?.amountPaid || 0);

    return previousBalance + amountDue - amountPaid;
  }

  function paymentType(payment) {
    return !payment.paymentType || payment.paymentType === "plata" ? "incasare" : payment.paymentType;
  }

  function paymentTypeLabel(type) {
    const value = typeof type === "string" ? type : paymentType(type);
    if (value === "cheltuiala") return "plata";
    if (value === "retur") return "retur de sume";
    if (value === "anulare") return "rest anulat";
    return value;
  }

  function isOutgoingPayment(payment) {
    return ["avans", "cheltuiala", "retur"].includes(paymentType(payment));
  }

  function paymentCurrency(payment) {
    return payment.currency || "lei";
  }

  function signedAmount(payment) {
    const amount = Number(payment.amount || 0);
    if (paymentType(payment) === "anulare") return 0;
    return isOutgoingPayment(payment) ? -amount : amount;
  }

  function formatPaymentAmount(payment) {
    if (paymentType(payment) === "anulare") return "Anulat " + formatMoney(payment.amount, paymentCurrency(payment));
    const prefix = isOutgoingPayment(payment) ? "- " : "";
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

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getPaymentReceiptRows(athletes, payment) {
    const athlete = findAthlete(athletes, payment.athleteId);

    return [
      ["Data", formatDate(payment.date)],
      ["De la", payerLabel(athletes, payment)],
      ["Tip platitor", athlete ? "sportiv / " + athlete.group : payerType(payment)],
      ["Categorie", payment.category || "-"],
      ["Tip", paymentTypeLabel(payment)],
      ["Suma", formatPaymentAmount(payment)],
      ["Metoda", payment.method || "-"],
      ["Observatii", payment.notes || "-"]
    ];
  }

  function getTaxFeeReceiptRows(athlete, fee, previousBalance, fallbackDue) {
    const amountDue = Number(fee?.amountDue ?? fallbackDue ?? 0);
    const amountPaid = Number(fee?.amountPaid || 0);
    const totalToPay = getTotalToPay(fee, previousBalance, fallbackDue);
    const outstanding = getOutstandingAmount(fee, previousBalance, fallbackDue);
    const balanceAfterMonth = getBalanceAfterMonth(fee, previousBalance, fallbackDue);
    const creditAfterMonth = Math.max(-balanceAfterMonth, 0);
    const previousText = previousBalance > 0
      ? formatMoney(previousBalance)
      : previousBalance < 0
        ? "Avans " + formatMoney(Math.abs(previousBalance))
        : "0 lei";

    return [
      ["Data platii", formatDate(fee.paymentDate || today())],
      ["Sportiv", athleteName(athlete)],
      ["Grupa", athlete.group || "-"],
      ["Luna", formatMonthLabel(fee.month)],
      ["Taxa lunii", formatMoney(amountDue)],
      ["Rest/avans anterior", previousText],
      ["Total calculat", formatMoney(totalToPay)],
      ["Suma", formatMoney(amountPaid)],
      ["Rest ramas", creditAfterMonth > 0 ? "Avans " + formatMoney(creditAfterMonth) : formatMoney(outstanding)],
      ["Metoda", fee.method || "-"],
      ["Operat de", operatorLabel(fee.updatedByEmail || fee.updatedBy)],
      ["Observatii", fee.notes || "-"]
    ];
  }

  function taxFeeReceiptMessage(athlete, fee, previousBalance, fallbackDue) {
    const balanceAfterMonth = getBalanceAfterMonth(fee, previousBalance, fallbackDue);
    const creditAfterMonth = Math.max(-balanceAfterMonth, 0);
    const remainingText = creditAfterMonth > 0
      ? "Avans " + formatMoney(creditAfterMonth)
      : formatMoney(getOutstandingAmount(fee, previousBalance, fallbackDue));

    return [
      "CS HEART - Confirmare plata taxa",
      "Sportiv: " + athleteName(athlete),
      "Grupa: " + (athlete.group || "-"),
      "Luna: " + formatMonthLabel(fee.month),
      "Data platii: " + formatDate(fee.paymentDate || today()),
      "Suma achitata: " + formatMoney(fee.amountPaid),
      "Metoda: " + (fee.method || "-"),
      "Rest ramas: " + remainingText,
      "Operat de: " + operatorLabel(fee.updatedByEmail || fee.updatedBy),
      "Confirmare generata din aplicatia CS HEART."
    ].join("\n");
  }

  function printPaymentReceipt(athletes, payment) {
    const receiptWindow = window.open("", "_blank", "width=720,height=900");

    if (!receiptWindow) {
      alert("Browserul a blocat fereastra de imprimare.");
      return;
    }

    const rows = getPaymentReceiptRows(athletes, payment);

    receiptWindow.document.write(`<!doctype html>
<html lang="ro">
  <head>
    <meta charset="UTF-8">
    <title>CS HEART - Confirmare incasare</title>
    <style>
      * { box-sizing: border-box; }
      @page { size: A4; margin: 8mm 10mm; }
      body { margin: 0; color: #172026; font-family: Arial, sans-serif; background: #f4f6f8; }
      .page { width: min(680px, 100%); margin: 0 auto; padding: 14px 24px; }
      .receipt { background: #fff; border: 1px solid #d9e0e5; border-radius: 8px; padding: 18px 20px; }
      .top { display: flex; justify-content: space-between; gap: 12px; border-bottom: 2px solid #172026; padding-bottom: 10px; margin-bottom: 12px; }
      .brand-wrap { display: flex; align-items: center; gap: 10px; }
      .logo { width: 38px; height: 38px; object-fit: contain; border-radius: 6px; background: #fff; }
      .brand { font-size: 18px; font-weight: 800; letter-spacing: 0; }
      .title { margin-top: 3px; color: #66727a; font-size: 12px; font-weight: 700; text-transform: uppercase; }
      table { width: 100%; border-collapse: collapse; }
      th, td { text-align: left; padding: 6px 6px; border-bottom: 1px solid #e5eaee; vertical-align: top; }
      th { width: 34%; color: #66727a; font-size: 11px; text-transform: uppercase; }
      td { font-size: 14px; font-weight: 700; }
      .amount td { font-size: 17px; color: #c5162e; }
      .note { margin-top: 12px; color: #66727a; font-size: 10px; line-height: 1.35; }
      .sign { margin-top: 26px; display: grid; gap: 14px; color: #66727a; font-size: 12px; }
      .received { color: #172026; font-weight: 800; }
      .sign-grid { display: flex; justify-content: space-between; gap: 20px; }
      .line { border-top: 1px solid #66727a; padding-top: 6px; width: 42%; }
      @media print {
        body { background: #fff; }
        .page { width: 100%; padding: 0; }
        .receipt { break-inside: avoid; page-break-inside: avoid; }
      }
    </style>
  </head>
  <body>
    <main class="page">
      <section class="receipt">
        <div class="top">
          <div class="brand-wrap">
            <img class="logo" src="./icon.png" alt="CS HEART" onerror="this.style.display='none'">
            <div>
              <div class="brand">CS HEART</div>
              <div class="title">Confirmare &icirc;ncasare</div>
            </div>
          </div>
        </div>
        <table>
          <tbody>
            ${rows
              .map(([label, value]) => `<tr class="${label === "Suma" ? "amount" : ""}"><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`)
              .join("")}
          </tbody>
        </table>
        <p class="note">Suma achitata reprezinta avans/arvuna pentru rezervarea participarii la actiunea mentionata. In cazul renuntarii unilaterale din partea platitorului/participantului, suma nu se restituie, cu exceptia cazurilor de accident sau boala dovedite cu documente medicale.</p>
        <div class="sign">
          <div class="received">Am primit confirmarea de incasare.</div>
          <div class="sign-grid">
            <div class="line">Nume primitor</div>
            <div class="line">Semnatura primitor</div>
          </div>
        </div>
      </section>
    </main>
  </body>
</html>`);
    receiptWindow.document.close();
    receiptWindow.focus();
    setTimeout(() => receiptWindow.print(), 250);
  }

  function printTaxFeeReceipt(athlete, fee, previousBalance, fallbackDue) {
    const receiptWindow = window.open("", "_blank", "width=720,height=900");

    if (!receiptWindow) {
      alert("Browserul a blocat fereastra de imprimare.");
      return;
    }

    const rows = getTaxFeeReceiptRows(athlete, fee, previousBalance, fallbackDue);

    receiptWindow.document.write(`<!doctype html>
<html lang="ro">
  <head>
    <meta charset="UTF-8">
    <title>CS HEART - Confirmare plata taxa</title>
    <style>
      * { box-sizing: border-box; }
      @page { size: A4; margin: 8mm 10mm; }
      body { margin: 0; color: #172026; font-family: Arial, sans-serif; background: #f4f6f8; }
      .page { width: min(680px, 100%); margin: 0 auto; padding: 14px 24px; }
      .receipt { background: #fff; border: 1px solid #d9e0e5; border-radius: 8px; padding: 18px 20px; }
      .top { display: flex; justify-content: space-between; gap: 12px; border-bottom: 2px solid #172026; padding-bottom: 10px; margin-bottom: 12px; }
      .brand-wrap { display: flex; align-items: center; gap: 10px; }
      .logo { width: 38px; height: 38px; object-fit: contain; border-radius: 6px; background: #fff; }
      .brand { font-size: 18px; font-weight: 800; letter-spacing: 0; }
      .title { margin-top: 3px; color: #66727a; font-size: 12px; font-weight: 700; text-transform: uppercase; }
      table { width: 100%; border-collapse: collapse; }
      th, td { text-align: left; padding: 6px 6px; border-bottom: 1px solid #e5eaee; vertical-align: top; }
      th { width: 34%; color: #66727a; font-size: 11px; text-transform: uppercase; }
      td { font-size: 14px; font-weight: 700; }
      .amount td { font-size: 17px; color: #c5162e; }
      .note { margin-top: 12px; color: #66727a; font-size: 10px; line-height: 1.35; }
      @media print {
        body { background: #fff; }
        .page { width: 100%; padding: 0; }
        .receipt { break-inside: avoid; page-break-inside: avoid; }
      }
    </style>
  </head>
  <body>
    <main class="page">
      <section class="receipt">
        <div class="top">
          <div class="brand-wrap">
            <img class="logo" src="./icon.png" alt="CS HEART" onerror="this.style.display='none'">
            <div>
              <div class="brand">CS HEART</div>
              <div class="title">Confirmare plata taxa</div>
            </div>
          </div>
        </div>
        <table>
          <tbody>
            ${rows
              .map(([label, value]) => `<tr class="${label === "Suma" ? "amount" : ""}"><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`)
              .join("")}
          </tbody>
        </table>
        <p class="note">Confirmare pentru evidenta interna a cotizatiei CS HEART, generata la solicitarea platitorului.</p>
      </section>
    </main>
  </body>
</html>`);
    receiptWindow.document.close();
    receiptWindow.focus();
    setTimeout(() => receiptWindow.print(), 250);
  }

  function ReceiptPreview({ athletes, payment, onClose, onPrint }) {
    if (!payment) return null;

    const rows = getPaymentReceiptRows(athletes, payment);
    const printCount = Number(payment.printCount || 0);
    const wasPrinted = printCount > 0 || Boolean(payment.printedAt);

    return h(
      "div",
      { className: "cs-print-overlay" },
      h(
        "div",
        { className: "cs-print-dialog" },
        h(
          "div",
          { className: "cs-print-actions" },
          h("strong", null, "Previzualizare confirmare incasare"),
          h(
            "div",
            { className: "row-actions" },
            h("button", { className: "primary", onClick: onPrint }, "Tipareste"),
            h("button", { type: "button", onClick: onClose }, "Inchide")
          )
        ),
        wasPrinted &&
          h(
            "div",
            { className: "cs-print-warning" },
            "Atentie: aceasta confirmare a mai fost tiparita",
            printCount ? " (" + printCount + " ori)" : "",
            "."
          ),
        h(
          "section",
          { className: "cs-receipt-preview" },
          h(
            "div",
            { className: "cs-receipt-top" },
            h(
              "div",
              { className: "cs-receipt-brand-wrap" },
              h("img", { className: "cs-receipt-logo", src: "./icon.png", alt: "CS HEART", onError: (event) => { event.currentTarget.style.display = "none"; } }),
              h("div", null, h("div", { className: "cs-receipt-brand" }, "CS HEART"), h("div", { className: "cs-receipt-title" }, "Confirmare \u00eencasare"))
            )
          ),
          h(
            "table",
            { className: "cs-receipt-table" },
            h(
              "tbody",
              null,
              rows.map(([label, value]) =>
                h("tr", { key: label, className: label === "Suma" ? "amount" : "" }, h("th", null, label), h("td", null, value))
              )
            )
          ),
          h("p", { className: "cs-receipt-note" }, "Suma achitata reprezinta avans/arvuna pentru rezervarea participarii la actiunea mentionata. In cazul renuntarii unilaterale din partea platitorului/participantului, suma nu se restituie, cu exceptia cazurilor de accident sau boala dovedite cu documente medicale."),
          h(
            "div",
            { className: "cs-receipt-sign" },
            h("div", { className: "cs-receipt-received" }, "Am primit confirmarea de incasare."),
            h(
              "div",
              { className: "cs-receipt-sign-grid" },
              h("div", { className: "cs-receipt-line" }, "Nume primitor"),
              h("div", { className: "cs-receipt-line" }, "Semnatura primitor")
            )
          )
        )
      )
    );
  }

  function TaxFeeReceiptPreview({ data, onClose, onPrint, onShare }) {
    if (!data) return null;

    const { athlete, fee, previousBalance, fallbackDue } = data;
    const rows = getTaxFeeReceiptRows(athlete, fee, previousBalance, fallbackDue);
    const confirmationCount = Number(fee.confirmationCount || 0);

    return h(
      "div",
      { className: "cs-print-overlay" },
      h(
        "div",
        { className: "cs-print-dialog" },
        h(
          "div",
          { className: "cs-print-actions" },
          h("strong", null, "Previzualizare confirmare taxa"),
          h(
            "div",
            { className: "row-actions" },
            h("button", { className: "primary", type: "button", onClick: onShare }, "Distribuie / copiaza"),
            h("button", { type: "button", onClick: onPrint }, "Tipareste"),
            h("button", { type: "button", onClick: onClose }, "Inchide")
          )
        ),
        confirmationCount > 0 &&
          h(
            "div",
            { className: "cs-print-warning" },
            "Atentie: aceasta confirmare a mai fost generata",
            confirmationCount ? " (" + confirmationCount + " ori)" : "",
            "."
          ),
        h(
          "section",
          { className: "cs-receipt-preview" },
          h(
            "div",
            { className: "cs-receipt-top" },
            h(
              "div",
              { className: "cs-receipt-brand-wrap" },
              h("img", { className: "cs-receipt-logo", src: "./icon.png", alt: "CS HEART", onError: (event) => { event.currentTarget.style.display = "none"; } }),
              h("div", null, h("div", { className: "cs-receipt-brand" }, "CS HEART"), h("div", { className: "cs-receipt-title" }, "Confirmare plata taxa"))
            )
          ),
          h(
            "table",
            { className: "cs-receipt-table" },
            h(
              "tbody",
              null,
              rows.map(([label, value]) =>
                h("tr", { key: label, className: label === "Suma" ? "amount" : "" }, h("th", null, label), h("td", null, value))
              )
            )
          ),
          h("p", { className: "cs-receipt-note" }, "Confirmare pentru evidenta interna a cotizatiei CS HEART, generata la solicitarea platitorului.")
        )
      )
    );
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

  function sumPaymentsByType(rows, currency, type) {
    return rows
      .filter((payment) => paymentCurrency(payment) === currency)
      .filter((payment) => paymentType(payment) === type)
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  }

  function sumPaymentsByTypeAndMethod(rows, currency, type, method) {
    return rows
      .filter((payment) => paymentCurrency(payment) === currency)
      .filter((payment) => paymentType(payment) === type)
      .filter((payment) => !method || payment.method === method)
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  }

  function sumOutgoingPayments(rows, currency) {
    return rows
      .filter((payment) => paymentCurrency(payment) === currency)
      .filter(isOutgoingPayment)
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  }

  function formatDualAmount(rows, method) {
    return formatMoney(sumPayments(rows, "lei", method), "lei") + " / " + formatMoney(sumPayments(rows, "euro", method), "euro");
  }

  function formatDualMoney(lei, euro) {
    const euroAmount = Number(euro || 0);
    return formatMoney(lei, "lei") + (euroAmount ? " / " + formatMoney(euroAmount, "euro") : "");
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function cleanCategory(value) {
    return String(value || "").trim() || "altele";
  }

  function categoryKey(value) {
    return normalizeText(cleanCategory(value));
  }

  function sameCategory(first, second) {
    return categoryKey(first) === categoryKey(second);
  }

  function getCategoryOptions(payments = [], actions = []) {
    const seen = new Set();
    const options = [];
    const add = (value) => {
      const clean = cleanCategory(value);
      const key = categoryKey(clean);
      if (!key || seen.has(key)) return;
      seen.add(key);
      options.push(clean);
    };

    categories.forEach(add);
    payments.forEach((payment) => add(payment.category));
    actions.forEach((action) => add(action.category));
    return options;
  }

  function actionParticipantIds(action) {
    return Array.isArray(action.participantIds) ? action.participantIds : [];
  }

  function actionMatchText(action) {
    return normalizeText(action.matchText || action.name);
  }

  function actionKeywords(value) {
    return normalizeText(value)
      .split(" ")
      .filter((word) => word.length >= 4 && !/^\d+$/.test(word));
  }

  function actionWords(value) {
    return normalizeText(value)
      .replace(/([a-z])(\d)/g, "$1 $2")
      .replace(/(\d)([a-z])/g, "$1 $2")
      .replace(/[^a-z0-9]+/g, " ")
      .split(" ")
      .filter((word) => word.length >= 3 && !/^\d+$/.test(word));
  }

  function fuzzyWordMatch(first, second) {
    if (!first || !second) return false;
    if (first === second || first.startsWith(second) || second.startsWith(first)) return true;

    const maxDistance = Math.max(1, Math.floor(Math.max(first.length, second.length) * 0.15));
    const previous = Array(second.length + 1)
      .fill(0)
      .map((_, index) => index);

    for (let firstIndex = 1; firstIndex <= first.length; firstIndex += 1) {
      const current = [firstIndex];
      let rowMinimum = current[0];

      for (let secondIndex = 1; secondIndex <= second.length; secondIndex += 1) {
        const cost = first[firstIndex - 1] === second[secondIndex - 1] ? 0 : 1;
        current[secondIndex] = Math.min(
          previous[secondIndex] + 1,
          current[secondIndex - 1] + 1,
          previous[secondIndex - 1] + cost
        );
        rowMinimum = Math.min(rowMinimum, current[secondIndex]);
      }

      if (rowMinimum > maxDistance) return false;
      previous.splice(0, previous.length, ...current);
    }

    return previous[second.length] <= maxDistance;
  }

  function isBlankMarker(value) {
    const text = normalizeText(value);
    return !text || text === "-" || text === "—";
  }

  function actionWordSetsMatch(firstWords, secondWords) {
    if (!firstWords.length || firstWords.length !== secondWords.length) return false;

    const used = new Set();
    return firstWords.every((word) => {
      const matchIndex = secondWords.findIndex((candidate, index) => !used.has(index) && fuzzyWordMatch(word, candidate));
      if (matchIndex < 0) return false;
      used.add(matchIndex);
      return true;
    });
  }

  function actionTextMatchesNeedle(value, needle) {
    const text = normalizeText(value);
    const actionText = normalizeText(needle);
    if (!text || !actionText) return false;
    if (text === actionText) return true;

    const textNumbers = actionNumberTokens(text);
    const actionNumbers = actionNumberTokens(actionText);
    if (textNumbers.length && actionNumbers.length && textNumbers.join("|") !== actionNumbers.join("|")) return false;

    return actionWordSetsMatch(actionWords(text), actionWords(actionText));
  }

  function actionWordsIncludedInText(value, needle) {
    const text = normalizeText(value);
    const actionText = normalizeText(needle);
    if (!text || !actionText) return false;
    if (text === actionText) return true;

    const textNumbers = actionNumberTokens(text);
    const actionNumbers = actionNumberTokens(actionText);
    if (textNumbers.length && actionNumbers.length && textNumbers.join("|") !== actionNumbers.join("|")) return false;

    const textWords = actionWords(text);
    const used = new Set();
    return actionWords(actionText).every((word) => {
      const matchIndex = textWords.findIndex((candidate, index) => !used.has(index) && fuzzyWordMatch(word, candidate));
      if (matchIndex < 0) return false;
      used.add(matchIndex);
      return true;
    });
  }

  function actionWordCount(action) {
    return actionWords(actionMatchText(action)).length;
  }

  function actionTextMatchesKnownAction(value, action, allActions = []) {
    const needle = actionMatchText(action);
    if (actionTextMatchesNeedle(value, needle)) return true;
    if (!actionWordsIncludedInText(value, needle)) return false;

    const candidates = (allActions.length ? allActions : [action]).filter((candidate) => actionWordsIncludedInText(value, actionMatchText(candidate)));
    const bestMatchSize = candidates.reduce((best, candidate) => Math.max(best, actionWordCount(candidate)), actionWordCount(action));

    return actionWordCount(action) >= bestMatchSize;
  }

  function actionNameMatchesText(value, action) {
    const needle = actionMatchText(action);
    return actionTextMatchesNeedle(value, needle);
  }

  function findActionByWrittenName(actions, value, category) {
    return actions.find(
      (action) =>
        (!category || !action.category || action.category === "toate" || sameCategory(action.category, category)) &&
        actionNameMatchesText(value, action)
    );
  }

  function actionNumberTokens(value) {
    return normalizeText(value).match(/\d+/g) || [];
  }

  function canMergeActions(first, second) {
    if (!first || !second) return false;
    if ((first.category || "toate") !== (second.category || "toate")) return false;
    if ((first.currency || "lei") !== (second.currency || "lei")) return false;

    const firstNumbers = actionNumberTokens(first.name || first.matchText);
    const secondNumbers = actionNumberTokens(second.name || second.matchText);
    if (firstNumbers.length || secondNumbers.length) {
      if (firstNumbers.join("|") !== secondNumbers.join("|")) return false;
    }

    return actionNameMatchesText(first.name || first.matchText, second) || actionNameMatchesText(second.name || second.matchText, first);
  }

  function actionKey(action) {
    return [
      actionMatchText(action),
      categoryKey(action.category || "toate"),
      action.currency || "lei",
      action.startDate || ""
    ].join("|");
  }

  function actionLabel(action) {
    if (!action) return "-";
    return (action.name || "Actiune fara nume") + " - " + (action.category || "actiune");
  }

  function getUniqueActions(actions = []) {
    const mergedActions = [];

    actions.forEach((action) => {
      const existing = mergedActions.find((item) => actionKey(item) === actionKey(action) || canMergeActions(item, action));

      if (!existing) {
        mergedActions.push({ ...action, participantIds: actionParticipantIds(action), aliasIds: action.id ? [action.id] : [] });
        return;
      }

      if (actionKey(existing) === actionKey(action)) {
        existing.participantIds = [...new Set([...actionParticipantIds(existing), ...actionParticipantIds(action)])];
      }
      existing.aliasIds = [...new Set([...(existing.aliasIds || []), action.id].filter(Boolean))];
      existing.amountDue = existing.amountDue || action.amountDue;
      existing.startDate = existing.startDate || action.startDate;
      existing.notes = existing.notes || action.notes;
    });

    return mergedActions.sort((first, second) => compareText(first.name, second.name));
  }

  function sameActionIdentity(first, second) {
    if (!first || !second) return false;
    if (first === second) return true;
    if (first.id && second.id && first.id === second.id) return true;
    if (first.id && Array.isArray(second.aliasIds) && second.aliasIds.includes(first.id)) return true;
    if (second.id && Array.isArray(first.aliasIds) && first.aliasIds.includes(second.id)) return true;
    return actionKey(first) === actionKey(second);
  }

  function actionHasId(action, id) {
    return Boolean(id && action && (action.id === id || (Array.isArray(action.aliasIds) && action.aliasIds.includes(id))));
  }

  function findActionById(actions, id) {
    if (!id) return null;
    return (actions || []).find((action) => actionHasId(action, id)) || null;
  }

  function hasCompatibleActionId(payment, action, allActions = []) {
    if (!payment.actionId) return true;
    if (actionHasId(action, payment.actionId)) return true;

    const referencedAction = findActionById(allActions, payment.actionId);
    if (!referencedAction) return true;

    return sameActionIdentity(referencedAction, action) || actionNameMatchesText(referencedAction.name, action) || actionNameMatchesText(action.name, referencedAction);
  }

  function canAutoAttachUnmarkedPayment(payment, action, athleteId, allActions = []) {
    if (!payment || !action || !athleteId) return false;
    if (!isBlankMarker(payment.actionName)) return false;
    if (!hasCompatibleActionId(payment, action, allActions)) return false;

    if (!isBlankMarker(payment.notes)) return false;
    if (!actionParticipantIds(action).includes(athleteId)) return false;
    if (action.currency && paymentCurrency(payment) !== action.currency) return false;
    if (action.category && action.category !== "toate" && payment.category && !sameCategory(payment.category, action.category)) return false;

    const actionStartDate = normalizeDateInput(action.startDate) || action.startDate || "";
    const paymentDate = normalizeDateInput(payment.date) || payment.date || "";
    return !actionStartDate || Boolean(paymentDate && String(paymentDate) >= String(actionStartDate));
  }

  function paymentMatchesAction(payment, action, athleteId, allActions = []) {
    if (!payment || !action) return false;
    if (action.currency && paymentCurrency(payment) !== action.currency) return false;
    if (action.id && payment.actionId === action.id) return true;
    if (Array.isArray(action.aliasIds) && action.aliasIds.includes(payment.actionId)) return true;
    if (action.category && action.category !== "toate" && payment.category && !sameCategory(payment.category, action.category)) return false;
    if (!isBlankMarker(payment.actionName)) return actionTextMatchesKnownAction(payment.actionName, action, allActions);

    const actionStartDate = normalizeDateInput(action.startDate) || action.startDate || "";
    const paymentDate = normalizeDateInput(payment.date) || payment.date || "";
    if (actionStartDate && (!paymentDate || String(paymentDate) < String(actionStartDate))) return false;

    const needle = actionMatchText(action);
    if (!needle) return false;

    const haystack = normalizeText([payment.notes, payment.category].join(" "));
    if (actionTextMatchesKnownAction(haystack, action, allActions)) return true;

    if (!canAutoAttachUnmarkedPayment(payment, action, athleteId, allActions)) return false;

    const candidates = (allActions.length ? allActions : [action]).filter((candidate) => canAutoAttachUnmarkedPayment(payment, candidate, athleteId, allActions));
    if (candidates.length === 1) return sameActionIdentity(candidates[0], action);
    return candidates.length > 1 && candidates.every((candidate) => sameActionIdentity(candidate, action) || actionNameMatchesText(candidate.name, action));
  }

  function getActionPayments(athletes, otherPayments, action, athlete, allActions = []) {
    return (otherPayments || [])
      .filter((payment) => paymentBelongsToAthlete(athletes, payment, athlete))
      .filter((payment) => paymentMatchesAction(payment, action, athlete.id, allActions));
  }

  function getActionRows(athletes, otherPayments, action, allActions = []) {
    if (!action) return [];

    const currency = action.currency || "lei";

    return actionParticipantIds(action)
      .map((athleteId) => {
        const athlete = findAthlete(athletes, athleteId);
        if (!athlete) return null;

        const amountDue = Number(action.amountDue || 0);
        const payments = getActionPayments(athletes, otherPayments, action, athlete, allActions).filter((payment) => paymentCurrency(payment) === currency);
        const received = payments
          .filter((payment) => paymentType(payment) === "incasare")
          .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
        const returned = payments
          .filter((payment) => paymentType(payment) === "retur")
          .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
        const waived = payments
          .filter((payment) => paymentType(payment) === "anulare")
          .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
        const netReceived = received - returned;
        const outstanding = Math.max(amountDue - netReceived - waived, 0);
        const extra = Math.max(netReceived - amountDue, 0);

        return { athlete, amountDue, received, returned, waived, netReceived, outstanding, extra, payments };
      })
      .filter(Boolean)
      .sort((first, second) => compareAthletesByName(first.athlete, second.athlete));
  }

  function getActionExternalRows(athletes, otherPayments, action, allActions = []) {
    if (!action) return [];

    const currency = action.currency || "lei";
    const rowsByPayer = new Map();

    (otherPayments || [])
      .filter((payment) => !payment.athleteId)
      .filter((payment) => paymentCurrency(payment) === currency)
      .filter((payment) => paymentMatchesAction(payment, action, "", allActions))
      .forEach((payment) => {
        const label = payerLabel(athletes, payment);
        const kind = payerType(payment);
        const key = [normalizeText(label), kind].join("|");
        const row =
          rowsByPayer.get(key) ||
          {
            id: key,
            label,
            kind,
            received: 0,
            returned: 0,
            waived: 0,
            netReceived: 0,
            payments: []
          };

        if (paymentType(payment) === "incasare") row.received += Number(payment.amount || 0);
        if (paymentType(payment) === "retur") row.returned += Number(payment.amount || 0);
        if (paymentType(payment) === "anulare") row.waived += Number(payment.amount || 0);
        row.netReceived = row.received - row.returned;
        row.payments.push(payment);
        rowsByPayer.set(key, row);
      });

    return [...rowsByPayer.values()].sort((first, second) => compareText(first.label, second.label));
  }

  function Field({ label, children }) {
    return h("label", { className: "field" }, h("span", null, label), children);
  }

  function CategoryField({ label = "Categorie", id, value, onChange, options, required = false }) {
    return h(
      Field,
      { label },
      h(
        React.Fragment,
        null,
        h("input", { list: id, value, onChange, placeholder: "Ex: taxa FRB, cazare, transport", required }),
        h("datalist", { id }, options.map((item) => h("option", { key: item, value: item })))
      )
    );
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

  function ExpandableReportItem({ title, subtitle, amount, children }) {
    return h(
      "li",
      { className: "cs-report-item expandable" },
      h(
        "details",
        null,
        h(
          "summary",
          { className: "cs-report-item-main" },
          h("span", { className: "cs-report-item-title" }, title, subtitle && h("small", null, subtitle)),
          amount && h("strong", { className: "cs-report-amount" }, amount)
        ),
        children && h("div", { className: "cs-report-item-extra" }, children)
      )
    );
  }

  function EmptyReportLine({ text }) {
    return h("p", { className: "cs-report-empty" }, text);
  }

  function feeBalanceDetails(row) {
    const previousText = row.previousBalance > 0
      ? "Rest anterior: " + formatMoney(row.previousBalance)
      : row.previousBalance < 0
        ? "Avans anterior: " + formatMoney(Math.abs(row.previousBalance))
        : "Fara rest anterior";

    return previousText + " / Taxa luna: " + formatMoney(row.amountDue) + " / Platit: " + formatMoney(row.amountPaid);
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

  function emptyTaxPaymentForm(month) {
    return {
      id: "",
      month,
      date: today(),
      paymentType: "salariu",
      athleteId: "",
      amount: "",
      method: "transfer",
      notes: ""
    };
  }

  function taxPaymentTypeLabel(type) {
    if (type === "chirie") return "chirii";
    return type;
  }

  function FeesView({ athletes, fees, taxPayments = [], onSaveFee, onSaveTaxPayment, onDeleteTaxPayment }) {
    const monthNow = currentMonth();
    const [month, setMonth] = React.useState(monthNow);
    const [group, setGroup] = React.useState("toate");
    const [showTaxPaymentForm, setShowTaxPaymentForm] = React.useState(false);
    const [taxPaymentForm, setTaxPaymentForm] = React.useState(() => emptyTaxPaymentForm(monthNow));
    const [taxReceiptPreview, setTaxReceiptPreview] = React.useState(null);
    const groups = getGroups(athletes);
    const listedAthletes = athletes.filter((athlete) => {
      if (!athlete.active) return false;
      if (group !== "toate" && athlete.group !== group) return false;
      if (!athlete.joinMonth) return false;

      return athlete.joinMonth <= month;
    });
    const listedAthleteIds = listedAthletes.map((athlete) => athlete.id);
    const monthlyFeeRows = fees.filter((fee) => fee.month === month && listedAthleteIds.includes(fee.athleteId));
    const monthlyCollected = monthlyFeeRows.reduce((sum, fee) => sum + Number(fee.amountPaid || 0), 0);
    const monthlyCashCollected = monthlyFeeRows
      .filter((fee) => fee.method === "cash")
      .reduce((sum, fee) => sum + Number(fee.amountPaid || 0), 0);
    const monthlyTransferCollected = monthlyFeeRows
      .filter((fee) => fee.method === "transfer")
      .reduce((sum, fee) => sum + Number(fee.amountPaid || 0), 0);
    const monthlyTaxPayments = (taxPayments || [])
      .filter((payment) => payment.month === month)
      .sort((first, second) => String(second.date || "").localeCompare(String(first.date || "")));
    const monthlyTaxPaymentsTotal = monthlyTaxPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const monthlySalaryPaymentsTotal = monthlyTaxPayments
      .filter((payment) => payment.paymentType === "salariu")
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const monthlyRentPaymentsTotal = monthlyTaxPayments
      .filter((payment) => payment.paymentType === "chirie")
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const monthlyTaxBalance = monthlyCollected - monthlyTaxPaymentsTotal;

    function updateMonth(value) {
      setMonth(value);
      setTaxPaymentForm((current) => ({ ...current, month: value }));
    }

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

    function updateTaxPayment(field, value) {
      setTaxPaymentForm((current) => ({ ...current, [field]: value }));
    }

    function submitTaxPayment(event) {
      event.preventDefault();

      if (!onSaveTaxPayment || !taxPaymentForm.date || Number(taxPaymentForm.amount || 0) <= 0) return;

      onSaveTaxPayment({
        ...taxPaymentForm,
        month,
        athleteId: "",
        amount: Number(taxPaymentForm.amount || 0),
        notes: String(taxPaymentForm.notes || "").trim()
      });
      setTaxPaymentForm(emptyTaxPaymentForm(month));
      setShowTaxPaymentForm(false);
    }

    function editTaxPayment(payment) {
      setTaxPaymentForm({
        id: payment.id || "",
        month: payment.month || month,
        date: payment.date || today(),
        paymentType: payment.paymentType || "salariu",
        athleteId: payment.athleteId || "",
        amount: payment.amount || "",
        method: payment.method || "transfer",
        notes: payment.notes || ""
      });
      setShowTaxPaymentForm(true);
    }

    function openTaxReceipt(athlete, fee, previousBalance, fallbackDue) {
      if (Number(fee.amountPaid || 0) <= 0) return;
      setTaxReceiptPreview({ athlete, fee, previousBalance, fallbackDue });
    }

    function markTaxReceiptGenerated(fee) {
      const markedFee = {
        ...fee,
        confirmationCount: Number(fee.confirmationCount || 0) + 1,
        confirmationGeneratedAt: new Date().toISOString()
      };

      onSaveFee(markedFee);
      setTaxReceiptPreview((current) => current ? { ...current, fee: markedFee } : current);
      return markedFee;
    }

    function printTaxReceipt() {
      if (!taxReceiptPreview) return;
      const markedFee = markTaxReceiptGenerated(taxReceiptPreview.fee);
      printTaxFeeReceipt(taxReceiptPreview.athlete, markedFee, taxReceiptPreview.previousBalance, taxReceiptPreview.fallbackDue);
    }

    async function shareTaxReceipt() {
      if (!taxReceiptPreview) return;

      const message = taxFeeReceiptMessage(taxReceiptPreview.athlete, taxReceiptPreview.fee, taxReceiptPreview.previousBalance, taxReceiptPreview.fallbackDue);

      try {
        if (navigator.share) {
          await navigator.share({ title: "CS HEART - Confirmare plata taxa", text: message });
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(message);
          alert("Textul confirmarii a fost copiat. Il poti lipi in WhatsApp.");
        } else {
          window.prompt("Copiaza mesajul pentru WhatsApp:", message);
        }
        markTaxReceiptGenerated(taxReceiptPreview.fee);
      } catch (error) {
        if (error?.name !== "AbortError") {
          alert("Nu am putut distribui confirmarea. Incearca din nou sau foloseste Tipareste.");
        }
      }
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
        h(Field, { label: "Luna" }, h("input", { type: "month", value: month, onChange: (event) => updateMonth(event.target.value) })),
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
        h("button", { className: "primary align-end", type: "button", onClick: () => setShowTaxPaymentForm((current) => !current) }, "PLATI")
      ),
      showTaxPaymentForm &&
        h(
          "form",
          { className: "panel compact-grid", onSubmit: submitTaxPayment },
          h(
            Field,
            { label: "Tip plata" },
            h(
              "select",
              { value: taxPaymentForm.paymentType, onChange: (event) => updateTaxPayment("paymentType", event.target.value) },
              taxPaymentTypes.map((type) => h("option", { key: type, value: type }, taxPaymentTypeLabel(type)))
            )
          ),
          h(Field, { label: "Data platii" }, h("input", { type: "date", value: taxPaymentForm.date, onChange: (event) => updateTaxPayment("date", event.target.value), required: true })),
          h(Field, { label: "Suma" }, h("input", { type: "number", min: "0", value: taxPaymentForm.amount, onChange: (event) => updateTaxPayment("amount", event.target.value), required: true })),
          h(
            Field,
            { label: "Metoda" },
            h(
              "select",
              { value: taxPaymentForm.method, onChange: (event) => updateTaxPayment("method", event.target.value) },
              paymentMethods.map((method) => h("option", { key: method, value: method }, method))
            )
          ),
          h(Field, { label: "Observatii" }, h("input", { value: taxPaymentForm.notes, onChange: (event) => updateTaxPayment("notes", event.target.value), placeholder: "Optional" })),
          h(
            "div",
            { className: "form-actions" },
            h("button", { className: "primary", type: "submit" }, taxPaymentForm.id ? "Actualizeaza plata" : "Adauga plata"),
            taxPaymentForm.id && h("button", { type: "button", onClick: () => setTaxPaymentForm(emptyTaxPaymentForm(month)) }, "Renunta")
          )
        ),
      h(
        "div",
        { className: "metrics" },
        h("div", null, h("span", null, "Total incasari luna"), h("strong", null, formatMoney(monthlyCollected))),
        h("div", null, h("span", null, "Cash / Transfer"), h("strong", null, "Cash: " + formatMoney(monthlyCashCollected)), h("small", null, "Transfer: " + formatMoney(monthlyTransferCollected))),
        h("div", null, h("span", null, "De incasat total"), h("strong", null, formatMoney(monthlyOutstanding))),
        h(
          "div",
          null,
          h("span", null, "Impartire incasari"),
          h("strong", null, "60% = " + formatMoney(monthlyCollected * 0.6)),
          h("strong", null, "40% = " + formatMoney(monthlyCollected * 0.4))
        ),
        h(
          "div",
          null,
          h("span", null, "Plati din taxe"),
          h("strong", null, formatMoney(monthlyTaxPaymentsTotal)),
          h("small", null, "Salarii: " + formatMoney(monthlySalaryPaymentsTotal) + " / Chirii: " + formatMoney(monthlyRentPaymentsTotal))
        ),
        h(
          "div",
          null,
          h("span", null, "Sold dupa plati"),
          h("strong", { className: monthlyTaxBalance < 0 ? "arrears" : "" }, formatMoney(monthlyTaxBalance)),
          h("small", null, "Incasari taxe - salarii/chirii")
        )
      ),
      monthlyTaxPayments.length > 0 &&
        h(
          "div",
          { className: "table-wrap wide" },
          h(
            "table",
            null,
            h("thead", null, h("tr", null, ["Data", "Tip", "Suma", "Metoda", "Observatii", "Operat de", ""].map((head) => h("th", { key: head }, head)))),
            h(
              "tbody",
              null,
              monthlyTaxPayments.map((payment) =>
                h(
                  "tr",
                  { key: payment.id },
                  h("td", { "data-label": "Data" }, formatDate(payment.date)),
                  h("td", { "data-label": "Tip" }, taxPaymentTypeLabel(payment.paymentType || "-")),
                  h("td", { "data-label": "Suma" }, h("strong", { className: "arrears" }, "- " + formatMoney(payment.amount))),
                  h("td", { "data-label": "Metoda" }, payment.method || "-"),
                  h("td", { "data-label": "Observatii" }, payment.notes || "-"),
                  h("td", { "data-label": "Operat de" }, operatorLabel(payment.updatedByEmail)),
                  h(
                    "td",
                    { className: "row-actions" },
                    h("button", { type: "button", onClick: () => editTaxPayment(payment) }, "Editeaza"),
                    h("button", { className: "danger", type: "button", onClick: () => onDeleteTaxPayment && onDeleteTaxPayment(payment.id) }, "Sterge")
                  )
                )
              )
            )
          )
        ),
      h(
        "div",
        { className: "table-wrap wide" },
        h(
          "table",
          null,
            h("thead", null, h("tr", null, ["Sportiv", "Status", "Taxa lunii", "Restanta / Avans", "Total", "Platit", "Data platii", "Metoda", "Confirmare"].map((head) => h("th", { key: head }, head)))),
          h(
            "tbody",
            null,
            displayedAthletes.map((athlete) => {
              const fee = getFee(athlete.id);
              const previousBalance = getPreviousBalance(fees, athlete, month);
              const fallbackDue = getDefaultAmountDue(fees, athlete, month);
              const totalToPay = getTotalToPay(fee, previousBalance, fallbackDue);
              const outstanding = getOutstandingAmount(fee, previousBalance, fallbackDue);
              const automaticStatus = getAutomaticFeeStatus(fee, previousBalance, fallbackDue);
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
                  h("span", { className: "pill " + getFeeStatusTone(automaticStatus) }, automaticStatus)
                ),
                h("td", { "data-label": "Taxa lunii" }, h("input", { type: "number", min: "0", value: fee.amountDue, onChange: (event) => updateFee(athlete.id, "amountDue", Number(event.target.value)) })),
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
                h(
                  "td",
                  { "data-label": "Confirmare", className: "row-actions" },
                  Number(fee.amountPaid || 0) > 0 &&
                    h(
                      "button",
                      { type: "button", onClick: () => openTaxReceipt(athlete, fee, previousBalance, fallbackDue) },
                      Number(fee.confirmationCount || 0) > 0 ? "Retrimite" : "Confirmare"
                    )
                )
              );
            })
          )
        )
      ),
      taxReceiptPreview &&
        h(TaxFeeReceiptPreview, {
          data: taxReceiptPreview,
          onClose: () => setTaxReceiptPreview(null),
          onPrint: printTaxReceipt,
          onShare: shareTaxReceipt
        })
    );
  }

  function emptyForm() {
    return {
      id: "",
      payerType: "sportiv",
      athleteId: "",
      payerName: "",
      date: todayRo(),
      category: categories[0],
      actionId: "",
      actionName: "",
      paymentType: "incasare",
      amount: "",
      method: "cash",
      currency: "lei",
      notes: ""
    };
  }

  function emptyActionForm() {
    return {
      id: "",
      name: "",
      category: "turneu",
      startDate: todayRo(),
      amountDue: "",
      currency: "lei",
      participantIds: [],
      matchText: "",
      notes: ""
    };
  }

  function OtherPaymentsView({ athletes, otherPayments = [], otherActions = [], onSavePayment, onDeletePayment, onSaveAction, onDeleteAction }) {
    const initialMonth = currentMonth();
    const [dateFrom, setDateFrom] = React.useState(initialMonth + "-01");
    const [dateTo, setDateTo] = React.useState(getMonthEndDate(initialMonth));
    const [group, setGroup] = React.useState("toate");
    const [category, setCategory] = React.useState("toate");
    const [typeFilter, setTypeFilter] = React.useState("toate");
    const [currencyFilter, setCurrencyFilter] = React.useState("toate");
    const [query, setQuery] = React.useState("");
    const [form, setForm] = React.useState(emptyForm);
    const [actionForm, setActionForm] = React.useState(emptyActionForm);
    const [actionGroup, setActionGroup] = React.useState("toate");
    const [selectedActionId, setSelectedActionId] = React.useState("");
    const [showOnlyDebtors, setShowOnlyDebtors] = React.useState(false);
    const [workMode, setWorkMode] = React.useState("lista");
    const [printPreviewPayment, setPrintPreviewPayment] = React.useState(null);
    const formRef = React.useRef(null);

    const groups = getGroups(athletes);
    const activeAthletes = [...athletes]
      .filter(isActiveAthlete)
      .sort(compareAthletesByName);
    const selectedAthlete = findAthlete(athletes, form.athleteId);
    const selectableAthletes = [
      ...activeAthletes,
      ...(selectedAthlete && !activeAthletes.some((athlete) => athlete.id === selectedAthlete.id) ? [selectedAthlete] : [])
    ].sort(compareAthletesByName);
    const uniqueActions = getUniqueActions(otherActions);
    const categoryOptions = getCategoryOptions(otherPayments, uniqueActions);
    const actionAthletes = (actionGroup === "toate" ? activeAthletes : activeAthletes.filter((athlete) => athlete.group === actionGroup)).sort(compareAthletesByName);
    const selectedPaymentAction = findActionById(uniqueActions, form.actionId) || findActionByWrittenName(uniqueActions, form.actionName, form.category);
    const hasLegacyPaymentAction = !selectedPaymentAction && !isBlankMarker(form.actionName);
    const paymentActionSelectValue = selectedPaymentAction?.id || (hasLegacyPaymentAction ? "__legacy__" : "");
    const selectedAction = uniqueActions.find((action) => action.id === selectedActionId) || uniqueActions[0] || null;
    const selectedActionRows = getActionRows(athletes, otherPayments, selectedAction, uniqueActions);
    const selectedActionExternalRows = getActionExternalRows(athletes, otherPayments, selectedAction, uniqueActions);
    const visibleActionRows = showOnlyDebtors ? selectedActionRows.filter((row) => row.outstanding > 0) : selectedActionRows;
    const visibleActionExternalRows = showOnlyDebtors ? [] : selectedActionExternalRows;
    const selectedActionCurrency = selectedAction?.currency || "lei";
    const actionTotalDue = selectedActionRows.reduce((sum, row) => sum + row.amountDue, 0);
    const actionTotalExternalReceived = selectedActionExternalRows.reduce((sum, row) => sum + row.netReceived, 0);
    const actionTotalReceived = selectedActionRows.reduce((sum, row) => sum + row.netReceived, 0) + actionTotalExternalReceived;
    const actionTotalOutstanding = selectedActionRows.reduce((sum, row) => sum + row.outstanding, 0);
    const actionPayments = [...selectedActionRows, ...selectedActionExternalRows].flatMap((row) => row.payments || []);
    const actionGrossReceived = actionPayments
      .filter((payment) => paymentCurrency(payment) === selectedActionCurrency)
      .filter((payment) => paymentType(payment) === "incasare")
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const actionPaidOut = actionPayments
      .filter((payment) => paymentCurrency(payment) === selectedActionCurrency)
      .filter(isOutgoingPayment)
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const actionBalance = actionGrossReceived - actionPaidOut;
    const actionOutgoingPayments = actionPayments
      .filter((payment) => paymentCurrency(payment) === selectedActionCurrency)
      .filter(isOutgoingPayment)
      .sort(sortByDateDesc);
    const actionOutgoingPreview = actionOutgoingPayments.slice(0, 3);
    const visibleActionPayments = [...visibleActionRows, ...visibleActionExternalRows].flatMap((row) => row.payments || []);
    const visibleActionTotalDue = visibleActionRows.reduce((sum, row) => sum + row.amountDue, 0);
    const visibleActionAthleteReceived = visibleActionRows.reduce((sum, row) => sum + row.netReceived, 0);
    const visibleActionPartnerReceived = visibleActionExternalRows.reduce((sum, row) => sum + row.netReceived, 0);
    const visibleActionTotalReceived = visibleActionAthleteReceived + visibleActionPartnerReceived;
    const visibleActionTotalOutstanding = visibleActionRows.reduce((sum, row) => sum + row.outstanding, 0);
    const visibleActionCash = sumPaymentsByTypeAndMethod(visibleActionPayments, selectedActionCurrency, "incasare", "cash");
    const visibleActionTransfer = sumPaymentsByTypeAndMethod(visibleActionPayments, selectedActionCurrency, "incasare", "transfer");

    React.useEffect(() => {
      if (!uniqueActions.length && selectedActionId) {
        setSelectedActionId("");
        return;
      }

      if (uniqueActions.length && !uniqueActions.some((action) => action.id === selectedActionId)) {
        setSelectedActionId(uniqueActions[0].id);
      }
    }, [uniqueActions, selectedActionId]);

    const period = dateRangeBounds(dateFrom, dateTo);
    const periodEndForBalance = period.end || period.start || today();
    const periodLabel = (period.start ? formatDate(period.start) : "inceput") + " - " + (period.end ? formatDate(period.end) : "azi");
    const filteredPayments = otherPayments
      .filter((payment) => isDateInRange(payment.date, period.start, period.end))
      .filter((payment) => category === "toate" || sameCategory(payment.category, category))
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
          payment.actionName,
          paymentTypeLabel(payment),
          payment.method,
          paymentCurrency(payment),
          payment.notes
        ]
          .join(" ")
          .toLowerCase();
        return text.includes(query.toLowerCase());
      })
      .sort(comparePaymentsByPayer(athletes));

    const balancePayments = otherPayments
      .filter((payment) => isSameOrBeforeDate(payment.date, periodEndForBalance))
      .filter((payment) => category === "toate" || sameCategory(payment.category, category))
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
          payment.actionName,
          paymentTypeLabel(payment),
          payment.method,
          paymentCurrency(payment),
          payment.notes
        ]
          .join(" ")
          .toLowerCase();
        return text.includes(query.toLowerCase());
      });

    const receivedLei = sumPaymentsByType(filteredPayments, "lei", "incasare");
    const paidLei = sumOutgoingPayments(filteredPayments, "lei");
    const receivedEuro = sumPaymentsByType(filteredPayments, "euro", "incasare");
    const paidEuro = sumOutgoingPayments(filteredPayments, "euro");
    const balanceReceivedLei = sumPaymentsByType(balancePayments, "lei", "incasare");
    const balancePaidLei = sumOutgoingPayments(balancePayments, "lei");
    const balanceReceivedEuro = sumPaymentsByType(balancePayments, "euro", "incasare");
    const balancePaidEuro = sumOutgoingPayments(balancePayments, "euro");
    const balanceLei = balanceReceivedLei - balancePaidLei;
    const balanceEuro = balanceReceivedEuro - balancePaidEuro;
    const isFormPayment = ["cheltuiala", "retur"].includes(form.paymentType);
    const isRefund = form.paymentType === "retur";
    const selectedAthleteBalanceRows = otherPayments.filter((payment) => payment.athleteId === form.athleteId && payment.id !== form.id);
    const selectedAthleteBalanceLei = selectedAthleteBalanceRows
      .filter((payment) => paymentCurrency(payment) === "lei")
      .reduce((sum, payment) => sum + signedAmount(payment), 0);
    const selectedAthleteBalanceEuro = selectedAthleteBalanceRows
      .filter((payment) => paymentCurrency(payment) === "euro")
      .reduce((sum, payment) => sum + signedAmount(payment), 0);
    const selectedCurrencyBalance = form.currency === "euro" ? selectedAthleteBalanceEuro : selectedAthleteBalanceLei;
    const refundAmount = Number(form.amount || 0);
    const refundExceedsBalance = isRefund && form.athleteId && refundAmount > selectedCurrencyBalance;

    function update(field, value) {
      setForm((current) => ({ ...current, [field]: value }));
    }

    function updatePaymentActionId(actionId) {
      setForm((current) => {
        const action = findActionById(uniqueActions, actionId);

        return {
          ...current,
          actionId: action?.id || "",
          actionName: action?.name || "",
          category: action?.category || current.category,
          currency: action?.currency || current.currency
        };
      });
    }

    function choosePaymentAction(value) {
      if (value === "__legacy__") return;

      if (value === "__new__") {
        setForm((current) => ({ ...current, actionId: "", actionName: "" }));
        setWorkMode("actiuni");
        setActionForm({
          ...emptyActionForm(),
          category: form.category || "turneu",
          currency: form.currency || "lei"
        });
        setTimeout(() => document.getElementById("cs-action-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
        return;
      }

      updatePaymentActionId(value);
    }

    function updateAction(field, value) {
      setActionForm((current) => ({ ...current, [field]: value }));
    }

    function toggleActionParticipant(athleteId) {
      setActionForm((current) => {
        const participantIds = actionParticipantIds(current);
        const exists = participantIds.includes(athleteId);

        return {
          ...current,
          participantIds: exists ? participantIds.filter((id) => id !== athleteId) : [...participantIds, athleteId]
        };
      });
    }

    function setParticipantsFromGroup() {
      setActionForm((current) => ({
        ...current,
        participantIds: actionAthletes.map((athlete) => athlete.id)
      }));
    }

    function clearActionParticipants() {
      setActionForm((current) => ({ ...current, participantIds: [] }));
    }

    function submitAction(event) {
      event.preventDefault();

      const name = String(actionForm.name || "").trim();
      const participantIds = actionParticipantIds(actionForm);
      const amountDue = Number(actionForm.amountDue || 0);

      if (!name || amountDue <= 0 || !participantIds.length || !onSaveAction) return;
      const startDate = normalizeDateInput(actionForm.startDate);
      if (!startDate) return;

      const actionDraft = {
        ...actionForm,
        name,
        category: cleanCategory(actionForm.category),
        startDate,
        amountDue,
        participantIds,
        matchText: String(actionForm.matchText || "").trim(),
        notes: String(actionForm.notes || "").trim()
      };
      const existingAction = actionDraft.id
        ? null
        : uniqueActions.find((action) => actionKey(action) === actionKey(actionDraft));
      const action = existingAction
        ? {
            ...actionDraft,
            id: existingAction.id,
            participantIds: [...new Set([...actionParticipantIds(existingAction), ...participantIds])]
          }
        : actionDraft;

      onSaveAction(action);
      setActionForm(emptyActionForm());
      setActionGroup("toate");
    }

    function editAction(action) {
      setWorkMode("actiuni");
      setActionForm({
        id: action.id || "",
        name: action.name || "",
        category: action.category || "turneu",
        startDate: formatDate(action.startDate || today()),
        amountDue: action.amountDue || "",
        currency: action.currency || "lei",
        participantIds: actionParticipantIds(action),
        matchText: action.matchText || "",
        notes: action.notes || ""
      });
      setSelectedActionId(action.id || "");
    }

    function submit(event) {
      event.preventDefault();

      const isSportiv = form.payerType === "sportiv";
      const payerName = String(form.payerName || "").trim();
      const paymentDate = normalizeDateInput(form.date);
      const linkedAction = findActionById(uniqueActions, form.actionId) || findActionByWrittenName(uniqueActions, form.actionName, form.category);
      const writtenActionName = linkedAction?.name || String(form.actionName || "").trim();

      if ((isSportiv && !form.athleteId) || (!isSportiv && !payerName) || !paymentDate || !form.category || Number(form.amount || 0) <= 0) return;

      onSavePayment({
        ...form,
        athleteId: isSportiv ? form.athleteId : "",
        payerName: isSportiv ? "" : payerName,
        date: paymentDate,
        actionId: linkedAction?.id || "",
        actionName: writtenActionName,
        category: linkedAction?.category || cleanCategory(form.category),
        currency: linkedAction?.currency || form.currency,
        amount: Number(form.amount || 0),
        notes: String(form.notes || "").trim()
      });
      setForm(emptyForm());
    }

    function cancelActionOutstanding(row) {
      if (!row || !selectedAction || !onSavePayment || row.outstanding <= 0) return;
      const athlete = row.athlete;
      const confirmed = window.confirm(
        "Anulezi restul de " +
          formatMoney(row.outstanding, selectedActionCurrency) +
          " pentru " +
          athleteName(athlete) +
          " la actiunea " +
          selectedAction.name +
          "?"
      );
      if (!confirmed) return;

      onSavePayment({
        payerType: "sportiv",
        athleteId: athlete.id,
        payerName: "",
        date: today(),
        category: selectedAction.category || "turneu",
        paymentType: "anulare",
        amount: row.outstanding,
        currency: selectedActionCurrency,
        method: "intern",
        actionId: selectedAction.id || "",
        actionName: selectedAction.name || "",
        notes: "Rest anulat"
      });
    }

    function edit(payment) {
      const linkedAction = uniqueActions.find((action) => action.id === payment.actionId || (Array.isArray(action.aliasIds) && action.aliasIds.includes(payment.actionId)));
      setWorkMode("adauga");

      setForm({
        id: payment.id || "",
        payerType: payerType(payment),
        athleteId: payment.athleteId || "",
        payerName: payment.payerName || "",
        date: formatDate(payment.date || today()),
        category: payment.category || categories[0],
        actionId: payment.actionId || "",
        actionName: payment.actionName || linkedAction?.name || "",
        paymentType: paymentType(payment),
        amount: payment.amount || "",
        method: payment.method || "cash",
        currency: paymentCurrency(payment),
        notes: payment.notes || ""
      });
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }

    function printPreview(payment) {
      setPrintPreviewPayment(payment);
    }

    function confirmPrint() {
      if (!printPreviewPayment) return;

      const markedPayment = {
        ...printPreviewPayment,
        printedAt: new Date().toISOString(),
        printCount: Number(printPreviewPayment.printCount || 0) + 1
      };

      onSavePayment(markedPayment);
      setPrintPreviewPayment(markedPayment);
      printPaymentReceipt(athletes, markedPayment);
    }

    return h(
      "section",
      { className: "stack" },
      h(ReceiptPreview, { athletes, payment: printPreviewPayment, onClose: () => setPrintPreviewPayment(null), onPrint: confirmPrint }),
      h(
        "div",
        { className: "panel" },
        h(
          "div",
          { className: "segmented", style: { gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" } },
          h("button", { type: "button", className: workMode === "lista" ? "selected" : "", onClick: () => setWorkMode("lista") }, "Cauta incasari - ce ai introdus"),
          h("button", { type: "button", className: workMode === "actiuni" ? "selected" : "", onClick: () => setWorkMode("actiuni") }, "Situatie actiuni - vezi sau creezi"),
          h("button", { type: "button", className: workMode === "adauga" ? "selected" : "", onClick: () => setWorkMode("adauga") }, form.id ? "Modifica incasare" : "Adauga incasare - inregistreaza banii")
        )
      ),
      workMode === "adauga" &&
        h(
        "form",
        { className: "panel form-grid", ref: formRef, onSubmit: submit },
        h(
          Field,
          { label: isFormPayment ? "Catre" : "De la" },
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
                selectableAthletes.map((athlete) => h("option", { key: athlete.id, value: athlete.id }, athleteName(athlete) + " - " + athlete.group + (athlete.active === false ? " (inactiv)" : "")))
              )
            )
          : h(
              Field,
              { label: isFormPayment ? "Cui ai platit" : form.payerType === "partener" ? "Nume partener" : "Sursa banilor" },
              h("input", { value: form.payerName, onChange: (event) => update("payerName", event.target.value), placeholder: isFormPayment ? "Ex: furnizor, arbitraj, transport" : form.payerType === "partener" ? "Nume partener" : "Ex: donatie, sponsor, alta sursa", required: true })
            ),
        isRefund &&
          h(
            "div",
            { style: { gridColumn: "1 / -1", borderTop: "1px solid #d9e0e5", borderBottom: "1px solid #d9e0e5", padding: "10px 0", display: "grid", gap: "4px" } },
            h("strong", null, form.athleteId ? "Sold alte incasari: " + formatMoney(selectedAthleteBalanceLei, "lei") + " / " + formatMoney(selectedAthleteBalanceEuro, "euro") : "Alege sportivul ca sa vezi soldul din Alte incasari"),
            form.athleteId &&
              h(
                "small",
                { className: refundExceedsBalance ? "arrears" : "" },
                refundExceedsBalance
                  ? "Atentie: returul este mai mare decat soldul pe moneda aleasa."
                  : "Soldul este calculat doar din Alte incasari, fara taxe."
              )
          ),
        h(Field, { label: isFormPayment ? "Data platii" : "Data incasarii" }, h("input", { value: form.date, onChange: (event) => update("date", event.target.value), placeholder: "01.05.2026", required: true })),
        h(CategoryField, { id: "cs-payment-category-options", value: form.category, onChange: (event) => update("category", event.target.value), options: categoryOptions, required: true }),
        h(
          Field,
          { label: "Tip" },
          h(
            "select",
            { value: form.paymentType, onChange: (event) => update("paymentType", event.target.value) },
            paymentTypes.map((item) => h("option", { key: item, value: item }, paymentTypeLabel(item)))
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
        h(
          Field,
          { label: "Actiune" },
          h(
            "select",
            { value: paymentActionSelectValue, onChange: (event) => choosePaymentAction(event.target.value) },
            h("option", { value: "" }, "Fara actiune"),
            h("option", { value: "__new__" }, "+ Creeaza actiune noua"),
            hasLegacyPaymentAction && h("option", { value: "__legacy__" }, "Actiune salvata: " + form.actionName),
            uniqueActions.map((action) => h("option", { key: action.id, value: action.id }, actionLabel(action)))
          )
        ),
        h(Field, { label: "Observatii" }, h("input", { value: form.notes, onChange: (event) => update("notes", event.target.value), placeholder: "Optional" })),
        h(
          "div",
          { className: "form-actions" },
          h("button", { className: "primary", type: "submit" }, form.id ? isFormPayment ? "Actualizeaza plata" : "Actualizeaza incasarea" : isFormPayment ? "Adauga plata" : "Adauga incasarea"),
          form.id && h("button", { type: "button", onClick: () => setForm(emptyForm()) }, "Renunta")
        )
      ),
      workMode === "actiuni" &&
        h(
        "form",
        { id: "cs-action-form", className: "panel form-grid", onSubmit: submitAction },
        h(
          "div",
          { style: { gridColumn: "1 / -1", display: "grid", gap: "4px" } },
          h("h2", { style: { marginBottom: 0 } }, "Situatie actiuni"),
          h("p", { style: { margin: 0, color: "#66727a" } }, "Pentru turnee, cantonamente sau echipamente: setezi suma de achitat si vezi rapid cine mai are rest.")
        ),
        h(Field, { label: "Nume actiune" }, h("input", { value: actionForm.name, onChange: (event) => updateAction("name", event.target.value), placeholder: "Ex: Costinesti 2026", required: true })),
        h(CategoryField, { id: "cs-action-category-options", value: actionForm.category, onChange: (event) => updateAction("category", event.target.value), options: categoryOptions, required: true }),
        h(Field, { label: "Data inceput" }, h("input", { value: actionForm.startDate, onChange: (event) => updateAction("startDate", event.target.value), placeholder: "01.05.2026", required: true })),
        h(Field, { label: "Suma de achitat / sportiv" }, h("input", { type: "number", min: "0", value: actionForm.amountDue, onChange: (event) => updateAction("amountDue", event.target.value), required: true })),
        h(
          Field,
          { label: "Moneda" },
          h(
            "select",
            { value: actionForm.currency, onChange: (event) => updateAction("currency", event.target.value) },
            currencies.map((item) => h("option", { key: item, value: item }, item))
          )
        ),
        h(Field, { label: "Text cautat in observatii" }, h("input", { value: actionForm.matchText, onChange: (event) => updateAction("matchText", event.target.value), placeholder: "Optional, daca difera de nume" })),
        h(
          "div",
          { style: { gridColumn: "1 / -1", display: "grid", gap: "10px" } },
          h(
            "div",
            { className: "compact-grid" },
            h(
              Field,
              { label: "Filtru participanti" },
              h(
                "select",
                { value: actionGroup, onChange: (event) => setActionGroup(event.target.value) },
                h("option", { value: "toate" }, "Toti sportivii"),
                groups.map((item) => h("option", { key: item, value: item }, item))
              )
            ),
            h(
              "div",
              { className: "form-actions align-end" },
              h("button", { type: "button", onClick: setParticipantsFromGroup }, actionGroup === "toate" ? "Adauga toti" : "Adauga grupa"),
              h("button", { type: "button", onClick: clearActionParticipants }, "Goleste")
            ),
            h("div", null, h("span", { className: "pill" }, actionParticipantIds(actionForm).length + " participanti selectati"))
          ),
          h(
            "div",
            { style: { border: "1px solid #d9e0e5", borderRadius: "8px", maxHeight: "210px", overflow: "auto", padding: "10px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "6px 12px" } },
            actionAthletes.map((athlete) => {
              const isSelected = actionParticipantIds(actionForm).includes(athlete.id);

              return h(
                "div",
                { key: athlete.id, style: { border: "1px solid #edf1f4", borderRadius: "8px", padding: "8px" } },
                h(
                  "label",
                  { style: { display: "flex", alignItems: "center", gap: "8px", fontWeight: 800 } },
                  h("input", { type: "checkbox", checked: isSelected, onChange: () => toggleActionParticipant(athlete.id), style: { width: "auto", minHeight: "auto" } }),
                  athleteName(athlete),
                  h("small", { style: { color: "#66727a", fontWeight: 700 } }, athlete.group || "-")
                )
              );
            })
          )
        ),
        h(Field, { label: "Observatii actiune" }, h("input", { value: actionForm.notes, onChange: (event) => updateAction("notes", event.target.value), placeholder: "Optional" })),
        h(
          "div",
          { className: "form-actions" },
          h("button", { className: "primary", type: "submit", disabled: !onSaveAction }, actionForm.id ? "Actualizeaza actiunea" : "Adauga actiunea"),
          actionForm.id && h("button", { type: "button", onClick: () => setActionForm(emptyActionForm()) }, "Renunta")
        )
      ),
      workMode === "actiuni" &&
        uniqueActions.length > 0 &&
        h(
          "div",
          { className: "panel compact-grid" },
          h(
            Field,
            { label: "Actiune urmarita" },
            h(
              "select",
              { value: selectedAction?.id || "", onChange: (event) => setSelectedActionId(event.target.value) },
              uniqueActions.map((action) => h("option", { key: action.id, value: action.id }, actionLabel(action)))
            )
          ),
          h(
            "label",
            { style: { display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, alignSelf: "end", minHeight: "40px" } },
            h("input", { type: "checkbox", checked: showOnlyDebtors, onChange: (event) => setShowOnlyDebtors(event.target.checked), style: { width: "auto", minHeight: "auto" } }),
            "Arata doar cei cu rest"
          ),
          h(
            "div",
            { className: "row-actions align-end" },
            selectedAction && h("button", { type: "button", onClick: () => editAction(selectedAction) }, "Editeaza actiunea"),
            selectedAction && onDeleteAction && h("button", { className: "danger", type: "button", onClick: () => onDeleteAction(selectedAction.id) }, "Sterge actiunea")
          )
        ),
      workMode === "actiuni" &&
        selectedAction &&
        h(
          "div",
          { className: "table-wrap wide" },
          h(
            "table",
            null,
            h("thead", null, h("tr", null, ["Sportiv / sursa", "De achitat", "Incasat", "Rest", "Detalii"].map((head) => h("th", { key: head }, head)))),
            h(
              "tbody",
              null,
              visibleActionRows.map((row) =>
                h(
                  "tr",
                  { key: row.athlete.id, className: row.outstanding > 0 ? "row-unpaid" : "" },
                  h("td", { "data-label": "Sportiv" }, h("strong", null, athleteName(row.athlete)), h("small", null, row.athlete.group || "-")),
                  h("td", { "data-label": "De achitat" }, formatMoney(row.amountDue, selectedActionCurrency)),
                  h(
                    "td",
                    { "data-label": "Incasat" },
                    h("strong", null, formatMoney(row.netReceived, selectedActionCurrency)),
                    row.returned > 0 && h("small", null, "Retur: " + formatMoney(row.returned, selectedActionCurrency)),
                    row.waived > 0 && h("small", null, "Anulat: " + formatMoney(row.waived, selectedActionCurrency))
                  ),
                  h(
                    "td",
                    { "data-label": "Rest" },
                    h("strong", { className: row.outstanding > 0 ? "arrears" : "" }, formatMoney(row.outstanding, selectedActionCurrency)),
                    row.extra > 0 && h("small", null, "Avans: " + formatMoney(row.extra, selectedActionCurrency))
                  ),
                  h(
                    "td",
                    { "data-label": "Detalii" },
                    row.payments.length ? row.payments.map((payment) => h("small", { key: payment.id || payment.date + payment.amount }, formatDate(payment.date) + " - " + formatPaymentAmount(payment))) : h("small", null, "Fara incasari gasite"),
                    row.outstanding > 0 && onSavePayment && h("button", { type: "button", onClick: () => cancelActionOutstanding(row) }, "Anuleaza rest")
                  )
                )
              ),
              visibleActionExternalRows.map((row) =>
                h(
                  "tr",
                  { key: "external-" + row.id },
                  h("td", { "data-label": "Sportiv / sursa" }, h("strong", null, row.label), h("small", null, row.kind === "partener" ? "partener" : "alta sursa")),
                  h("td", { "data-label": "De achitat" }, "-"),
                  h(
                    "td",
                    { "data-label": "Incasat" },
                    h("strong", null, formatMoney(row.netReceived, selectedActionCurrency)),
                    row.returned > 0 && h("small", null, "Retur: " + formatMoney(row.returned, selectedActionCurrency)),
                    row.waived > 0 && h("small", null, "Anulat: " + formatMoney(row.waived, selectedActionCurrency))
                  ),
                  h("td", { "data-label": "Rest" }, "-"),
                  h("td", { "data-label": "Detalii" }, row.payments.map((payment) => h("small", { key: payment.id || payment.date + payment.amount }, formatDate(payment.date) + " - " + formatPaymentAmount(payment))))
                )
              )
            )
          )
        ),
      workMode === "actiuni" &&
        selectedAction &&
        h(
          "div",
          { className: "panel compact-grid" },
          h("div", null, h("span", { className: "pill" }, "TOTAL"), h("strong", { style: { display: "block", marginTop: "8px" } }, selectedAction.name)),
          h(
            "div",
            null,
            h("span", null, "De achitat"),
            h("strong", { style: { display: "block", marginTop: "4px", fontSize: "1.25rem" } }, formatMoney(visibleActionTotalDue, selectedActionCurrency)),
            h("span", { style: { display: "block", marginTop: "4px", color: "#526173", fontSize: "0.95rem" } }, visibleActionRows.length + " sportivi")
          ),
          h(
            "div",
            null,
            h("span", null, "Incasat"),
            h("strong", { style: { display: "block", marginTop: "4px", fontSize: "1.25rem" } }, formatMoney(visibleActionTotalReceived, selectedActionCurrency)),
            h("span", { style: { display: "block", marginTop: "4px", color: "#526173", fontSize: "0.95rem" } }, "Sportivi " + formatMoney(visibleActionAthleteReceived, selectedActionCurrency) + " / parteneri " + formatMoney(visibleActionPartnerReceived, selectedActionCurrency))
          ),
          h(
            "div",
            null,
            h("span", null, "Sold actiune"),
            h("strong", { className: actionBalance < 0 ? "arrears" : "", style: { display: "block", marginTop: "4px", fontSize: "1.25rem" } }, formatMoney(actionBalance, selectedActionCurrency)),
            h("small", null, "Incasat " + formatMoney(actionGrossReceived, selectedActionCurrency) + " / Platit " + formatMoney(actionPaidOut, selectedActionCurrency))
          ),
          h(
            "div",
            null,
            h("span", null, "Plati actiune"),
            h("strong", { style: { display: "block", marginTop: "4px", fontSize: "1.25rem" } }, formatMoney(actionPaidOut, selectedActionCurrency)),
            actionOutgoingPreview.length
              ? actionOutgoingPreview.map((payment) =>
                  h(
                    "small",
                    { key: payment.id || payment.date + payment.amount + payment.category, style: { display: "block", marginTop: "3px" } },
                    formatDate(payment.date) + " - " + payerLabel(athletes, payment) + " - " + (payment.category || "plata") + " - " + formatPaymentAmount(payment)
                  )
                )
              : h("small", null, "Nu exista plati pe actiune"),
            actionOutgoingPayments.length > actionOutgoingPreview.length &&
              h("small", { style: { display: "block", marginTop: "3px" } }, "+" + (actionOutgoingPayments.length - actionOutgoingPreview.length) + " plati in lista")
          ),
          h("div", null, h("span", null, "Incasari cash/transfer"), h("strong", { style: { display: "block", marginTop: "4px" } }, "Cash: " + formatMoney(visibleActionCash, selectedActionCurrency)), h("small", null, "Transfer: " + formatMoney(visibleActionTransfer, selectedActionCurrency)))
        ),
      workMode === "actiuni" &&
        selectedAction &&
        !visibleActionRows.length &&
        !visibleActionExternalRows.length &&
        h(EmptyState, { title: "Nu exista inregistrari in filtrul actiunii.", text: showOnlyDebtors ? "Debifeaza filtrul cu rest sau verifica participantii." : "Adauga participanti sau incasari la actiune." }),
      workMode === "lista" &&
        h(
        "div",
        { className: "panel compact-grid" },
        h(Field, { label: "De la" }, h("input", { value: formatDate(dateFrom), onChange: (event) => setDateFrom(event.target.value), placeholder: "01.05.2026" })),
        h(Field, { label: "Pana la" }, h("input", { value: formatDate(dateTo), onChange: (event) => setDateTo(event.target.value), placeholder: "31.07.2026" })),
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
            categoryOptions.map((item) => h("option", { key: item, value: item }, item))
          )
        ),
        h(
          Field,
          { label: "Tip" },
          h(
            "select",
            { value: typeFilter, onChange: (event) => setTypeFilter(event.target.value) },
            h("option", { value: "toate" }, "Toate tipurile"),
            paymentTypes.map((item) => h("option", { key: item, value: item }, paymentTypeLabel(item)))
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
        h(Field, { label: "Cauta ce vrei" }, h("input", { value: query, onChange: (event) => setQuery(event.target.value), placeholder: "Nume, categorie, actiune, observatii" }))
      ),
      workMode === "lista" &&
        h(
        "div",
        { className: "metrics" },
        h("div", null, h("span", null, "Total lei"), h("strong", null, "Incasat = " + formatMoney(receivedLei, "lei")), h("strong", null, "Platit = " + formatMoney(paidLei, "lei"))),
        h("div", null, h("span", null, "Total euro"), h("strong", null, "Incasat = " + formatMoney(receivedEuro, "euro")), h("strong", null, "Platit = " + formatMoney(paidEuro, "euro"))),
        h("div", null, h("span", null, "Cash / Transfer"), h("strong", null, "Cash: " + formatDualAmount(filteredPayments, "cash")), h("strong", null, "Transfer: " + formatDualAmount(filteredPayments, "transfer")))
      ),
      workMode === "lista" &&
        h(
        "div",
        { className: "metrics" },
        h("div", null, h("span", null, "Sold lei pana la data"), h("strong", null, formatMoney(balanceLei, "lei")), h("small", null, "Incasat total = " + formatMoney(balanceReceivedLei, "lei") + " / Platit total = " + formatMoney(balancePaidLei, "lei"))),
        h("div", null, h("span", null, "Sold euro pana la data"), h("strong", null, formatMoney(balanceEuro, "euro")), h("small", null, "Incasat total = " + formatMoney(balanceReceivedEuro, "euro") + " / Platit total = " + formatMoney(balancePaidEuro, "euro"))),
        h("div", null, h("span", null, "Perioada cautare"), h("strong", null, periodLabel), h("small", null, "Soldul este calculat pana la data finala si respecta filtrele alese."))
      ),
      workMode === "lista" &&
        h(
        "div",
        { className: "table-wrap wide" },
        h(
          "table",
          null,
          h("thead", null, h("tr", null, ["Data", "De la / Catre", "Categorie", "Actiune", "Tip", "Suma", "Moneda", "Metoda", "Observatii", "Operat de", ""].map((head) => h("th", { key: head }, head)))),
          h(
            "tbody",
            null,
            filteredPayments.map((payment) => {
              const athlete = findAthlete(athletes, payment.athleteId);

              return h(
                "tr",
                { key: payment.id },
                h("td", { "data-label": "Data" }, formatDate(payment.date)),
                h("td", { "data-label": "De la / Catre" }, h("strong", null, payerLabel(athletes, payment)), h("small", null, athlete ? athlete.group : payerType(payment))),
                h("td", { "data-label": "Categorie" }, payment.category || "-"),
                h("td", { "data-label": "Actiune" }, payment.actionName || "-"),
                h("td", { "data-label": "Tip" }, paymentTypeLabel(payment)),
                h("td", { "data-label": "Suma" }, h("strong", { className: isOutgoingPayment(payment) ? "arrears" : "" }, formatPaymentAmount(payment))),
                h("td", { "data-label": "Moneda" }, paymentCurrency(payment)),
                h("td", { "data-label": "Metoda" }, payment.method || "-"),
                h("td", { "data-label": "Observatii" }, payment.notes || "-"),
                h("td", { "data-label": "Operat de" }, operatorLabel(payment.updatedByEmail)),
                h(
                  "td",
                  { className: "row-actions" },
                  h("button", { onClick: () => edit(payment) }, "Editeaza"),
                  ["incasare", "avans"].includes(paymentType(payment)) && h("button", { onClick: () => printPreview(payment) }, Number(payment.printCount || 0) > 0 || payment.printedAt ? "Reimprima" : "Imprima"),
                  h("button", { className: "danger", onClick: () => onDeletePayment(payment.id) }, "Sterge")
                )
              );
            })
          )
        )
      ),
      workMode === "lista" &&
        !filteredPayments.length &&
        h(EmptyState, { title: "Nu exista alte incasari in filtrul curent.", text: "Adauga o incasare sau schimba intervalul, grupa ori categoria." })
    );
  }

  function ExtraPaymentsReport({ athletes, otherPayments = [], otherActions = [] }) {
    const [month, setMonth] = React.useState(currentMonth());
    const [group, setGroup] = React.useState("toate");
    const [category, setCategory] = React.useState("toate");
    const [typeFilter, setTypeFilter] = React.useState("toate");
    const [currencyFilter, setCurrencyFilter] = React.useState("toate");
    const [selectedActionId, setSelectedActionId] = React.useState("");
    const [showOnlyDebtors, setShowOnlyDebtors] = React.useState(false);
    const groups = getGroups(athletes);
    const uniqueActions = getUniqueActions(otherActions);
    const categoryOptions = getCategoryOptions(otherPayments, uniqueActions);
    const selectedAction = uniqueActions.find((action) => action.id === selectedActionId) || uniqueActions[0] || null;
    const selectedActionRows = getActionRows(athletes, otherPayments, selectedAction, uniqueActions);
    const selectedActionExternalRows = getActionExternalRows(athletes, otherPayments, selectedAction, uniqueActions);
    const visibleActionRows = showOnlyDebtors ? selectedActionRows.filter((row) => row.outstanding > 0) : selectedActionRows;
    const visibleActionExternalRows = showOnlyDebtors ? [] : selectedActionExternalRows;
    const selectedActionCurrency = selectedAction?.currency || "lei";
    const actionTotalDue = selectedActionRows.reduce((sum, row) => sum + row.amountDue, 0);
    const actionTotalExternalReceived = selectedActionExternalRows.reduce((sum, row) => sum + row.netReceived, 0);
    const actionTotalReceived = selectedActionRows.reduce((sum, row) => sum + row.netReceived, 0) + actionTotalExternalReceived;
    const actionTotalOutstanding = selectedActionRows.reduce((sum, row) => sum + row.outstanding, 0);
    const actionPayments = [...selectedActionRows, ...selectedActionExternalRows].flatMap((row) => row.payments || []);
    const actionGrossReceived = actionPayments
      .filter((payment) => paymentCurrency(payment) === selectedActionCurrency)
      .filter((payment) => paymentType(payment) === "incasare")
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const actionPaidOut = actionPayments
      .filter((payment) => paymentCurrency(payment) === selectedActionCurrency)
      .filter(isOutgoingPayment)
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const actionBalance = actionGrossReceived - actionPaidOut;
    const actionOutgoingPayments = actionPayments
      .filter((payment) => paymentCurrency(payment) === selectedActionCurrency)
      .filter(isOutgoingPayment)
      .sort(sortByDateDesc);
    const actionOutgoingPreview = actionOutgoingPayments.slice(0, 2);
    const actionOutgoingHint = actionOutgoingPreview.length
      ? actionOutgoingPreview.map((payment) => payerLabel(athletes, payment) + " " + formatPaymentAmount(payment)).join(" / ")
      : "Incasat " + formatMoney(actionGrossReceived, selectedActionCurrency) + " / platit " + formatMoney(actionPaidOut, selectedActionCurrency);
    const rows = otherPayments
      .filter((payment) => getMonth(payment.date) === month)
      .filter((payment) => category === "toate" || sameCategory(payment.category, category))
      .filter((payment) => typeFilter === "toate" || paymentType(payment) === typeFilter)
      .filter((payment) => currencyFilter === "toate" || paymentCurrency(payment) === currencyFilter)
      .filter((payment) => {
        const athlete = findAthlete(athletes, payment.athleteId);
        return group === "toate" || athlete?.group === group;
      })
      .sort(comparePaymentsByPayer(athletes));
    const balanceRows = otherPayments
      .filter((payment) => isSameOrBeforeMonth(payment.date, month))
      .filter((payment) => category === "toate" || sameCategory(payment.category, category))
      .filter((payment) => currencyFilter === "toate" || paymentCurrency(payment) === currencyFilter)
      .filter((payment) => {
        const athlete = findAthlete(athletes, payment.athleteId);
        return group === "toate" || athlete?.group === group;
      });
    const receivedLei = sumPaymentsByType(rows, "lei", "incasare");
    const paidLei = sumOutgoingPayments(rows, "lei");
    const receivedEuro = sumPaymentsByType(rows, "euro", "incasare");
    const paidEuro = sumOutgoingPayments(rows, "euro");
    const outgoingRows = rows.filter(isOutgoingPayment).sort(sortByDateDesc);
    const outgoingCashLei = sumPaymentsByTypeAndMethod(outgoingRows, "lei", "cheltuiala", "cash") + sumPaymentsByTypeAndMethod(outgoingRows, "lei", "retur", "cash") + sumPaymentsByTypeAndMethod(outgoingRows, "lei", "avans", "cash");
    const outgoingTransferLei = sumPaymentsByTypeAndMethod(outgoingRows, "lei", "cheltuiala", "transfer") + sumPaymentsByTypeAndMethod(outgoingRows, "lei", "retur", "transfer") + sumPaymentsByTypeAndMethod(outgoingRows, "lei", "avans", "transfer");
    const outgoingCashEuro = sumPaymentsByTypeAndMethod(outgoingRows, "euro", "cheltuiala", "cash") + sumPaymentsByTypeAndMethod(outgoingRows, "euro", "retur", "cash") + sumPaymentsByTypeAndMethod(outgoingRows, "euro", "avans", "cash");
    const outgoingTransferEuro = sumPaymentsByTypeAndMethod(outgoingRows, "euro", "cheltuiala", "transfer") + sumPaymentsByTypeAndMethod(outgoingRows, "euro", "retur", "transfer") + sumPaymentsByTypeAndMethod(outgoingRows, "euro", "avans", "transfer");
    const balanceReceivedLei = sumPaymentsByType(balanceRows, "lei", "incasare");
    const balancePaidLei = sumOutgoingPayments(balanceRows, "lei");
    const balanceReceivedEuro = sumPaymentsByType(balanceRows, "euro", "incasare");
    const balancePaidEuro = sumOutgoingPayments(balanceRows, "euro");
    const balanceLei = balanceReceivedLei - balancePaidLei;
    const balanceEuro = balanceReceivedEuro - balancePaidEuro;
    const categoryTotals = categoryOptions
      .map((item) => ({
        category: item,
        totalLei: sumPayments(rows.filter((payment) => sameCategory(payment.category, item)), "lei"),
        totalEuro: sumPayments(rows.filter((payment) => sameCategory(payment.category, item)), "euro")
      }))
      .filter((item) => item.totalLei !== 0 || item.totalEuro !== 0);

    React.useEffect(() => {
      if (!uniqueActions.length && selectedActionId) {
        setSelectedActionId("");
        return;
      }

      if (uniqueActions.length && !uniqueActions.some((action) => action.id === selectedActionId)) {
        setSelectedActionId(uniqueActions[0].id);
      }
    }, [uniqueActions, selectedActionId]);

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
            categoryOptions.map((item) => h("option", { key: item, value: item }, item))
          )
        ),
        h(
          Field,
          { label: "Tip" },
          h(
            "select",
            { value: typeFilter, onChange: (event) => setTypeFilter(event.target.value) },
            h("option", { value: "toate" }, "Toate tipurile"),
            paymentTypes.map((item) => h("option", { key: item, value: item }, paymentTypeLabel(item)))
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
        h(SummaryCard, { label: "Total lei", value: "Incasat = " + formatMoney(receivedLei, "lei"), hint: "Platit = " + formatMoney(paidLei, "lei"), tone: "tone-green" }),
        h(SummaryCard, { label: "Total euro", value: "Incasat = " + formatMoney(receivedEuro, "euro"), hint: "Platit = " + formatMoney(paidEuro, "euro"), tone: "tone-blue" }),
        h(SummaryCard, { label: "Sold lei", value: formatMoney(balanceLei, "lei"), hint: "Total pana la luna: incasat " + formatMoney(balanceReceivedLei, "lei") + " / platit " + formatMoney(balancePaidLei, "lei"), tone: "tone-red" }),
        h(SummaryCard, { label: "Sold euro", value: formatMoney(balanceEuro, "euro"), hint: "Total pana la luna: incasat " + formatMoney(balanceReceivedEuro, "euro") + " / platit " + formatMoney(balancePaidEuro, "euro"), tone: "tone-purple" }),
        h(SummaryCard, { label: "Cash", value: formatDualAmount(rows, "cash"), hint: "Doar filtrul ales", tone: "tone-amber" }),
        h(SummaryCard, { label: "Transfer", value: formatDualAmount(rows, "transfer"), hint: "Doar filtrul ales", tone: "tone-purple" })
      ),
      h(
        "div",
        { className: "cs-report-summary" },
        h(SummaryCard, { label: "Plati efectuate", value: formatDualMoney(paidLei, paidEuro), hint: `${outgoingRows.length} inregistrari`, tone: "tone-red" }),
        h(SummaryCard, { label: "Plati cash", value: formatDualMoney(outgoingCashLei, outgoingCashEuro), hint: "Doar plati cash", tone: "tone-amber" }),
        h(SummaryCard, { label: "Plati transfer", value: formatDualMoney(outgoingTransferLei, outgoingTransferEuro), hint: "Doar plati prin transfer", tone: "tone-purple" })
      ),
      uniqueActions.length > 0 &&
        h(
          "div",
          { className: "panel compact-grid" },
          h(
            Field,
            { label: "Situatie actiune" },
            h(
              "select",
              { value: selectedAction?.id || "", onChange: (event) => setSelectedActionId(event.target.value) },
              uniqueActions.map((action) => h("option", { key: action.id, value: action.id }, actionLabel(action)))
            )
          ),
          h(
            "label",
            { style: { display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, alignSelf: "end", minHeight: "40px" } },
            h("input", { type: "checkbox", checked: showOnlyDebtors, onChange: (event) => setShowOnlyDebtors(event.target.checked), style: { width: "auto", minHeight: "auto" } }),
            "Arata doar cei cu rest"
          ),
          selectedAction && h("div", null, h("span", { className: "pill" }, "De la " + formatDate(selectedAction.startDate)))
        ),
      selectedAction &&
        h(
          "div",
          { className: "cs-report-summary" },
          h(SummaryCard, { label: "Actiune", value: selectedAction.name, hint: `${selectedActionRows.length} participanti`, tone: "tone-blue" }),
          h(SummaryCard, { label: "De achitat", value: formatMoney(actionTotalDue, selectedActionCurrency), hint: "Suma totala", tone: "tone-amber" }),
          h(SummaryCard, { label: "Incasat", value: formatMoney(actionTotalReceived, selectedActionCurrency), hint: actionTotalExternalReceived > 0 ? "Include parteneri: " + formatMoney(actionTotalExternalReceived, selectedActionCurrency) : "Toate lunile de la data de inceput", tone: "tone-green" }),
          h(SummaryCard, { label: "Sold actiune", value: formatMoney(actionBalance, selectedActionCurrency), hint: actionOutgoingHint, tone: actionBalance < 0 ? "tone-red" : "tone-purple" }),
          h(SummaryCard, { label: "Rest", value: formatMoney(actionTotalOutstanding, selectedActionCurrency), hint: showOnlyDebtors ? "Doar restantierii sunt listati" : "Toti participantii", tone: actionTotalOutstanding > 0 ? "tone-red" : "tone-green" })
        ),
      h(
        "div",
        { className: "cs-report-sections" },
        selectedAction &&
          h(
            DetailSection,
            { title: "Situatie actiune", meta: `${visibleActionRows.length} sportivi / rest ${formatMoney(actionTotalOutstanding, selectedActionCurrency)}`, open: true },
            visibleActionRows.length
              ? h(
                  "ul",
                  { className: "cs-report-list" },
                  visibleActionRows.map((row) =>
                    h(ReportItem, {
                      key: row.athlete.id,
                      title: athleteName(row.athlete),
                      subtitle:
                        (row.athlete.group || "-") +
                        " / incasat " +
                        formatMoney(row.netReceived, selectedActionCurrency) +
                        (row.waived > 0 ? " / anulat " + formatMoney(row.waived, selectedActionCurrency) : ""),
                      amount: "Rest " + formatMoney(row.outstanding, selectedActionCurrency),
                      negative: row.outstanding > 0
                    })
                  )
                )
              : h(EmptyReportLine, { text: showOnlyDebtors ? "Nu exista restanti la actiunea aleasa." : "Nu exista participanti la actiunea aleasa." })
          ),
        selectedAction &&
          visibleActionExternalRows.length > 0 &&
          h(
            DetailSection,
            { title: "Parteneri / alte surse", meta: `${visibleActionExternalRows.length} surse / ${formatMoney(actionTotalExternalReceived, selectedActionCurrency)}`, open: true },
            h(
              "ul",
              { className: "cs-report-list" },
              visibleActionExternalRows.map((row) =>
                h(ReportItem, {
                  key: row.id,
                  title: row.label,
                  subtitle: row.kind + " / " + row.payments.map((payment) => formatDate(payment.date)).join(", "),
                  amount: formatMoney(row.netReceived, selectedActionCurrency),
                  negative: row.netReceived < 0
                })
              )
          )
        ),
        h(
          DetailSection,
          { title: "Plati efectuate", meta: `${outgoingRows.length} plati / ${formatDualMoney(paidLei, paidEuro)}`, open: true },
          outgoingRows.length
            ? h(
                "ul",
                { className: "cs-report-list" },
                outgoingRows.map((payment) =>
                  h(ReportItem, {
                    key: payment.id,
                    title: payerLabel(athletes, payment),
                    subtitle: formatDate(payment.date) + " / " + (payment.category || "-") + " / " + (payment.actionName || "fara actiune") + " / " + (payment.method || "-") + " / operat de " + operatorLabel(payment.updatedByEmail),
                    amount: formatPaymentAmount(payment),
                    negative: true
                  })
                )
              )
            : h(EmptyReportLine, { text: "Nu exista plati in filtrul ales." })
        ),
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
                    subtitle: formatDate(payment.date) + " / " + payerType(payment) + " / " + (payment.category || "-") + " / " + (payment.actionName || "fara actiune") + " / " + paymentTypeLabel(payment) + " / " + (payment.method || "-"),
                    amount: formatPaymentAmount(payment),
                    negative: isOutgoingPayment(payment)
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

  function MonthlyBalanceReport({ athletes = [], fees = [], otherPayments = [], taxPayments = [] }) {
    const [month, setMonth] = React.useState(currentMonth());
    const monthlyFees = fees.filter((fee) => fee.month === month && Number(fee.amountPaid || 0) > 0);
    const monthlyOtherPayments = (otherPayments || []).filter((payment) => getMonth(payment.date) === month);
    const monthlyTaxPayments = (taxPayments || []).filter((payment) => payment.month === month);
    const previousFees = fees.filter((fee) => fee.month && fee.month < month && Number(fee.amountPaid || 0) > 0);
    const previousOtherPayments = (otherPayments || []).filter((payment) => {
      const paymentMonth = getMonth(payment.date);
      return Boolean(paymentMonth && paymentMonth < month);
    });
    const previousTaxPayments = (taxPayments || []).filter((payment) => payment.month && payment.month < month);
    const taxIncome = monthlyFees.reduce((sum, fee) => sum + Number(fee.amountPaid || 0), 0);
    const taxPaymentsTotal = monthlyTaxPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const otherIncomeLei = sumPaymentsByType(monthlyOtherPayments, "lei", "incasare");
    const otherIncomeEuro = sumPaymentsByType(monthlyOtherPayments, "euro", "incasare");
    const otherOutgoingLei = sumOutgoingPayments(monthlyOtherPayments, "lei");
    const otherOutgoingEuro = sumOutgoingPayments(monthlyOtherPayments, "euro");
    const previousTaxIncome = previousFees.reduce((sum, fee) => sum + Number(fee.amountPaid || 0), 0);
    const previousTaxPaymentsTotal = previousTaxPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const previousOtherIncomeLei = sumPaymentsByType(previousOtherPayments, "lei", "incasare");
    const previousOtherIncomeEuro = sumPaymentsByType(previousOtherPayments, "euro", "incasare");
    const previousOtherOutgoingLei = sumOutgoingPayments(previousOtherPayments, "lei");
    const previousOtherOutgoingEuro = sumOutgoingPayments(previousOtherPayments, "euro");
    const totalIncomeLei = taxIncome + otherIncomeLei;
    const totalPaymentsLei = taxPaymentsTotal + otherOutgoingLei;
    const monthBalanceLei = totalIncomeLei - totalPaymentsLei;
    const monthBalanceEuro = otherIncomeEuro - otherOutgoingEuro;
    const previousBalanceLei = previousTaxIncome + previousOtherIncomeLei - previousTaxPaymentsTotal - previousOtherOutgoingLei;
    const previousBalanceEuro = previousOtherIncomeEuro - previousOtherOutgoingEuro;
    const finalBalanceLei = previousBalanceLei + monthBalanceLei;
    const finalBalanceEuro = previousBalanceEuro + monthBalanceEuro;
    const groupTotals = [...monthlyFees.reduce((map, fee) => {
      const athlete = findAthlete(athletes, fee.athleteId);
      const group = athlete?.group || "Fara grupa";
      const current = map.get(group) || { group, count: 0, total: 0, rows: [] };

      current.count += 1;
      current.total += Number(fee.amountPaid || 0);
      current.rows.push({ athlete, fee });
      map.set(group, current);
      return map;
    }, new Map()).values()]
      .map((row) => ({ ...row, rows: row.rows.sort((first, second) => compareText(first.athlete ? athleteName(first.athlete) : "Sportiv necunoscut", second.athlete ? athleteName(second.athlete) : "Sportiv necunoscut")) }))
      .sort((first, second) => compareText(first.group, second.group));
    const otherCategoryTotals = [...monthlyOtherPayments
      .filter((payment) => paymentType(payment) === "incasare")
      .reduce((map, payment) => {
        const category = payment.category || "altele";
        const current = map.get(category) || { category, count: 0, lei: 0, euro: 0 };
        const currency = paymentCurrency(payment);

        current.count += 1;
        if (currency === "euro") current.euro += Number(payment.amount || 0);
        else current.lei += Number(payment.amount || 0);
        map.set(category, current);
        return map;
      }, new Map()).values()].sort((first, second) => compareText(first.category, second.category));
    const taxPaymentTotals = taxPaymentTypes.map((type) => ({
      type,
      total: monthlyTaxPayments
        .filter((payment) => payment.paymentType === type)
        .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
    })).filter((item) => item.total > 0);
    const otherOutgoingRows = monthlyOtherPayments.filter(isOutgoingPayment);

    return h(
      "section",
      { className: "stack" },
      h("h2", null, "Balanta lunii"),
      h(
        "div",
        { className: "panel compact-grid" },
        h(Field, { label: "Luna" }, h("input", { type: "month", value: month, onChange: (event) => setMonth(event.target.value) }))
      ),
      h(
        "div",
        { className: "cs-report-summary" },
        h(SummaryCard, { label: "Incasari taxe", value: formatMoney(taxIncome), hint: `${monthlyFees.length} sportivi cu taxa achitata`, tone: "tone-green" }),
        h(SummaryCard, { label: "Alte incasari", value: formatMoney(otherIncomeLei, "lei"), hint: otherIncomeEuro ? formatMoney(otherIncomeEuro, "euro") : "Doar incasari, fara plati", tone: "tone-blue" }),
        h(SummaryCard, { label: "Plati", value: formatMoney(totalPaymentsLei), hint: "Salarii/chirii + plati/retururi din alte incasari", tone: "tone-red" }),
        h(SummaryCard, { label: "Sold anterior", value: formatMoney(previousBalanceLei), hint: previousBalanceEuro ? "Euro: " + formatMoney(previousBalanceEuro, "euro") : "Pana inainte de luna aleasa", tone: previousBalanceLei < 0 ? "tone-red" : "tone-amber" }),
        h(SummaryCard, { label: "Sold sfarsit luna", value: formatMoney(finalBalanceLei), hint: (finalBalanceEuro ? "Euro: " + formatMoney(finalBalanceEuro, "euro") + " / " : "") + "Luna curenta: " + formatMoney(monthBalanceLei), tone: finalBalanceLei < 0 ? "tone-red" : "tone-purple" })
      ),
      h(
        "div",
        { className: "cs-report-sections" },
        h(
          DetailSection,
          { title: "Incasari taxe pe grupe", meta: `${groupTotals.length} grupe / ${formatMoney(taxIncome)}`, open: true },
          groupTotals.length
            ? h(
                "ul",
                { className: "cs-report-list" },
                groupTotals.map((row) =>
                  h(
                    ExpandableReportItem,
                    {
                      key: row.group,
                      title: row.group,
                      subtitle: `${row.count} sportivi cu taxa achitata`,
                      amount: formatMoney(row.total)
                    },
                    h(
                      "ul",
                      { className: "cs-report-list" },
                      row.rows.map(({ athlete, fee }) =>
                        h(ReportItem, {
                          key: fee.id || `${row.group}-${fee.athleteId}-${fee.month}-${fee.amountPaid}-${fee.method}`,
                          title: athlete ? athleteName(athlete) : "Sportiv necunoscut",
                          subtitle: (fee.paymentDate ? "Data platii: " + formatDate(fee.paymentDate) : "Fara data de plata") + (fee.method ? " / " + fee.method : ""),
                          amount: formatMoney(fee.amountPaid)
                        })
                      )
                    )
                  )
                )
              )
            : h(EmptyReportLine, { text: "Nu exista taxe incasate in luna aleasa." })
        ),
        h(
          DetailSection,
          { title: "Plati", meta: `${monthlyTaxPayments.length + otherOutgoingRows.length} inregistrari / ${formatMoney(totalPaymentsLei)}`, open: true },
          taxPaymentTotals.length || otherOutgoingRows.length
            ? h(
                "ul",
                { className: "cs-report-list" },
                taxPaymentTotals.map((row) =>
                  h(ReportItem, {
                    key: row.type,
                    title: taxPaymentTypeLabel(row.type),
                    subtitle: "Din taxele lunare",
                    amount: "- " + formatMoney(row.total),
                    negative: true
                  })
                ),
                otherOutgoingRows.map((payment) =>
                  h(ReportItem, {
                    key: payment.id,
                    title: paymentTypeLabel(payment) + " - " + (payment.category || "altele"),
                    subtitle: payerLabel(athletes, payment) + " / " + formatDate(payment.date),
                    amount: formatPaymentAmount(payment),
                    negative: true
                  })
                )
              )
            : h(EmptyReportLine, { text: "Nu exista plati in luna aleasa." })
        ),
        h(
          DetailSection,
          { title: "Alte incasari", meta: `${otherCategoryTotals.length} categorii`, open: true },
          otherCategoryTotals.length
            ? h(
                "ul",
                { className: "cs-report-list" },
                otherCategoryTotals.map((row) =>
                  h(ReportItem, {
                    key: row.category,
                    title: row.category,
                    subtitle: `${row.count} incasari`,
                    amount: formatMoney(row.lei, "lei") + (row.euro ? " / " + formatMoney(row.euro, "euro") : "")
                  })
                )
              )
            : h(EmptyReportLine, { text: "Nu exista alte incasari in luna aleasa." })
        )
      )
    );
  }

  function TaxReportsView({ athletes, fees = [] }) {
    const [month, setMonth] = React.useState(currentMonth());
    const [group, setGroup] = React.useState("toate");
    const [reportType, setReportType] = React.useState("situatie");
    const groups = getGroups(athletes);
    const athletesInFilter = athletes.filter(
      (athlete) =>
        shouldShowAthleteInReports(athlete) &&
        (group === "toate" || athlete.group === group) &&
        (!athlete.joinMonth || athlete.joinMonth <= month)
    ).sort(compareAthletesByName);
    const feeRows = athletesInFilter.map((athlete) => {
      const fee = getFeeForMonth(fees, athlete.id, month);
      const previousBalance = getPreviousBalance(fees, athlete, month);
      const fallbackDue = getDefaultAmountDue(fees, athlete, month);
      const amountDue = Number(fee?.amountDue ?? fallbackDue ?? 0);
      const amountPaid = Number(fee?.amountPaid || 0);
      const totalToPay = getTotalToPay(fee, previousBalance, fallbackDue);
      const outstanding = getOutstandingAmount(fee, previousBalance, fallbackDue);
      const balanceAfterMonth = getBalanceAfterMonth(fee, previousBalance, fallbackDue);
      const credit = Math.max(-balanceAfterMonth, 0);

      return { athlete, outstanding, previousBalance, amountDue, amountPaid, totalToPay, credit };
    });
    const debtorRows = feeRows.filter((row) => row.outstanding > 0);
    const creditRows = feeRows.filter((row) => row.credit > 0);
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
    const totalToPay = feeRows.reduce((sum, row) => sum + row.totalToPay, 0);
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
            h("option", { value: "situatie" }, "Situatie sportivi"),
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
        h(SummaryCard, { label: "Total calculat", value: formatMoney(totalToPay), hint: "Rest anterior + taxa lunii", tone: "tone-amber" }),
        h(SummaryCard, { label: "Restante", value: formatMoney(totalOutstanding), hint: `${debtorRows.length} sportivi`, tone: "tone-red" }),
        h(SummaryCard, { label: "Avansuri", value: formatMoney(totalCredit), hint: `${creditRows.length} sportivi`, tone: "tone-blue" }),
        h(SummaryCard, { label: "Observatii", value: observationRows.length, hint: "Sportivi cu observatii", tone: "tone-amber" })
      ),
      h(
        "div",
        { className: "cs-report-sections" },
        (reportType === "situatie" || reportType === "toate") &&
          h(
            DetailSection,
            { title: "Situatie taxe sportivi", meta: `${feeRows.length} sportivi / rest ${formatMoney(totalOutstanding)}`, open: reportType === "situatie" },
            feeRows.length
              ? h(
                  "ul",
                  { className: "cs-report-list" },
                  feeRows.map((row) =>
                    h(ReportItem, {
                      key: row.athlete.id,
                      title: athleteName(row.athlete),
                      subtitle: feeBalanceDetails(row) + " / Total calculat: " + formatMoney(row.totalToPay),
                      amount: row.outstanding > 0 ? formatMoney(row.outstanding) : row.credit > 0 ? "Avans " + formatMoney(row.credit) : "0 lei",
                      negative: row.outstanding > 0
                    })
                  )
                )
              : h(EmptyReportLine, { text: "Nu exista sportivi in filtrul ales." })
          ),
        (reportType === "restantieri" || reportType === "toate") &&
          h(
            DetailSection,
            { title: "Restantieri", meta: `${debtorRows.length} sportivi / ${formatMoney(totalOutstanding)}`, open: reportType === "restantieri" },
            debtorRows.length
              ? h(
                  "ul",
                  { className: "cs-report-list" },
                  debtorRows.map((row) =>
                    h(ReportItem, {
                      key: row.athlete.id,
                      title: athleteName(row.athlete),
                      subtitle: feeBalanceDetails(row),
                      amount: formatMoney(row.outstanding)
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
                  creditRows.map((row) =>
                    h(ReportItem, {
                      key: row.athlete.id,
                      title: athleteName(row.athlete),
                      subtitle: feeBalanceDetails(row),
                      amount: formatMoney(row.credit)
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

  function MedicalVisaReportsView({ athletes = [] }) {
    const [group, setGroup] = React.useState("toate");
    const groups = getGroups(athletes);
    const athletesInFilter = athletes.filter(
      (athlete) =>
        shouldShowAthleteInReports(athlete) &&
        (group === "toate" || athlete.group === group)
    ).sort(compareAthletesByName);
    const rows = athletesInFilter
      .filter(hasMedicalVisa)
      .map((athlete) => ({ athlete, status: medicalVisaStatus(athlete), daysLeft: daysUntilDate(athlete.medicalVisaTo) }));
    const validRows = rows.filter((row) => row.status === "Valabila");
    const soonRows = rows.filter((row) => row.status === "Expira curand");
    const expiredRows = rows.filter((row) => row.status === "Expirata");
    const noFinalDateRows = rows.filter((row) => row.status === "Fara data finala");

    return h(
      "section",
      { className: "stack" },
      h("h2", null, "Vize medicale"),
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
        )
      ),
      h(
        "div",
        { className: "cs-report-summary" },
        h(SummaryCard, { label: "Vize introduse", value: rows.length, hint: `${athletesInFilter.length} sportivi in filtrul ales`, tone: "tone-blue" }),
        h(SummaryCard, { label: "Valabile", value: validRows.length, hint: "Peste 30 zile ramase", tone: "tone-green" }),
        h(SummaryCard, { label: "Expira curand", value: soonRows.length, hint: "30 zile sau mai putin", tone: "tone-amber" }),
        h(SummaryCard, { label: "Expirate", value: expiredRows.length, hint: noFinalDateRows.length ? `${noFinalDateRows.length} fara data finala` : "De verificat", tone: "tone-red" })
      ),
      h(
        DetailSection,
        { title: "Sportivi cu viza medicala", meta: `${rows.length} sportivi`, open: true },
        rows.length
          ? h(
              "ul",
              { className: "cs-report-list" },
              rows.map(({ athlete, status, daysLeft }) =>
                h(
                  ReportItem,
                  {
                    key: athlete.id,
                    title: athleteName(athlete),
                    subtitle: athlete.group || "-",
                    amount: status === "Valabila" && daysLeft !== null ? `${daysLeft} zile` : status,
                    negative: status === "Expirata"
                  },
                  h(MedicalVisaPeriod, { athlete })
                )
              )
            )
          : h(EmptyReportLine, { text: "Nu exista vize medicale introduse in filtrul ales." })
      )
    );
  }

  function PaymentsMadeReport({ athletes = [], otherPayments = [], taxPayments = [], dateFrom, dateTo }) {
    const period = dateRangeBounds(dateFrom, dateTo);
    const taxRows = (taxPayments || [])
      .map((payment) => ({
        id: "tax-" + (payment.id || payment.date || payment.month),
        date: payment.date || getMonthEndDate(payment.month),
        source: "Taxe",
        title: taxPaymentTypeLabel(payment.paymentType || "-"),
        subtitle: "Taxe / " + (payment.method || "-") + " / " + (payment.notes || "-") + " / operat de " + operatorLabel(payment.updatedByEmail),
        amount: Number(payment.amount || 0),
        currency: "lei",
        method: payment.method || "-"
      }))
      .filter((row) => isDateInRange(row.date, period.start, period.end));
    const otherRows = (otherPayments || [])
      .filter(isOutgoingPayment)
      .filter((payment) => isDateInRange(payment.date, period.start, period.end))
      .map((payment) => ({
        id: "other-" + (payment.id || payment.date || payment.amount),
        date: payment.date,
        source: "Alte incasari",
        title: payerLabel(athletes, payment),
        subtitle: "Alte incasari / " + paymentTypeLabel(payment) + " / " + (payment.category || "-") + " / " + (payment.actionName || "fara actiune") + " / " + (payment.method || "-") + " / operat de " + operatorLabel(payment.updatedByEmail),
        amount: Number(payment.amount || 0),
        currency: paymentCurrency(payment),
        method: payment.method || "-"
      }));
    const rows = [...taxRows, ...otherRows].sort(sortByDateDesc);
    const paidLei = rows.filter((row) => row.currency === "lei").reduce((sum, row) => sum + row.amount, 0);
    const paidEuro = rows.filter((row) => row.currency === "euro").reduce((sum, row) => sum + row.amount, 0);
    const cashLei = rows.filter((row) => row.currency === "lei" && row.method === "cash").reduce((sum, row) => sum + row.amount, 0);
    const cashEuro = rows.filter((row) => row.currency === "euro" && row.method === "cash").reduce((sum, row) => sum + row.amount, 0);
    const transferLei = rows.filter((row) => row.currency === "lei" && row.method === "transfer").reduce((sum, row) => sum + row.amount, 0);
    const transferEuro = rows.filter((row) => row.currency === "euro" && row.method === "transfer").reduce((sum, row) => sum + row.amount, 0);

    return h(
      "section",
      { className: "stack" },
      h("h2", null, "Plati efectuate"),
      h(
        "div",
        { className: "cs-report-summary" },
        h(SummaryCard, { label: "Total plati", value: formatDualMoney(paidLei, paidEuro), hint: `${rows.length} inregistrari`, tone: "tone-red" }),
        h(SummaryCard, { label: "Cash", value: formatDualMoney(cashLei, cashEuro), hint: "Plati cash in interval", tone: "tone-amber" }),
        h(SummaryCard, { label: "Transfer", value: formatDualMoney(transferLei, transferEuro), hint: "Plati prin transfer in interval", tone: "tone-purple" })
      ),
      h(
        DetailSection,
        { title: "Lista platilor", meta: `${rows.length} plati / ${formatDualMoney(paidLei, paidEuro)}`, open: true },
        rows.length
          ? h(
              "ul",
              { className: "cs-report-list" },
              rows.map((row) =>
                h(ReportItem, {
                  key: row.id,
                  title: row.title,
                  subtitle: formatDate(row.date) + " / " + row.source + " / " + row.subtitle,
                  amount: "- " + formatMoney(row.amount, row.currency),
                  negative: true
                })
              )
            )
          : h(EmptyReportLine, { text: "Nu exista plati in intervalul ales." })
      )
    );
  }

  function ReportsView(props) {
    const [section, setSection] = React.useState("balanta");
    const initialMonth = currentMonth();
    const [paymentDateFrom, setPaymentDateFrom] = React.useState(initialMonth + "-01");
    const [paymentDateTo, setPaymentDateTo] = React.useState(today());

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
            h("option", { value: "balanta" }, "Balanta lunii"),
            h("option", { value: "taxe" }, "Taxe"),
            h("option", { value: "prezenta" }, "Prezenta"),
            h("option", { value: "vizeMedicale" }, "Vize medicale"),
            h("option", { value: "alteIncasari" }, "Alte incasari"),
            h("option", { value: "platiEfectuate" }, "Plati efectuate"),
            h("option", { value: "tot" }, "Tot")
          )
        ),
        section === "platiEfectuate" && h(Field, { label: "De la" }, h("input", { value: formatDate(paymentDateFrom), onChange: (event) => setPaymentDateFrom(event.target.value), placeholder: "01.07.2026" })),
        section === "platiEfectuate" && h(Field, { label: "Pana la" }, h("input", { value: formatDate(paymentDateTo), onChange: (event) => setPaymentDateTo(event.target.value), placeholder: "31.07.2026" }))
      ),
      (section === "balanta" || section === "tot") && h(MonthlyBalanceReport, props),
      (section === "taxe" || section === "tot") && h(TaxReportsView, props),
      (section === "prezenta" || section === "tot") && h(AttendanceReportsView, props),
      (section === "vizeMedicale" || section === "tot") && h(MedicalVisaReportsView, props),
      (section === "alteIncasari" || section === "tot") && h(ExtraPaymentsReport, props),
      section === "platiEfectuate" && h(PaymentsMadeReport, { ...props, dateFrom: paymentDateFrom, dateTo: paymentDateTo })
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
