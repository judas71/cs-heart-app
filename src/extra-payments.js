(function () {
  const h = React.createElement;

  const categories = ["echipament", "cantonament", "turneu", "legitimatie", "transport", "sponsorizare", "parteneriat", "altele"];
  const payerTypes = ["sportiv", "partener", "altul"];
  const paymentTypes = ["incasare", "avans", "cheltuiala", "retur"];
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

  function compareText(first, second) {
    return String(first || "").trim().localeCompare(String(second || "").trim(), "ro-RO", { sensitivity: "base", numeric: true });
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

  function normalizeDateInput(value) {
    const text = String(value || "").trim();
    const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) return text;

    const ro = text.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})$/);
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
    return String(value || "").slice(0, 7);
  }

  function isSameOrBeforeMonth(value, month) {
    const itemMonth = getMonth(value);
    return Boolean(itemMonth) && itemMonth <= month;
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
    return isOutgoingPayment(payment) ? -amount : amount;
  }

  function formatPaymentAmount(payment) {
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

  function sumOutgoingPayments(rows, currency) {
    return rows
      .filter((payment) => paymentCurrency(payment) === currency)
      .filter(isOutgoingPayment)
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  }

  function formatDualAmount(rows, method) {
    return formatMoney(sumPayments(rows, "lei", method), "lei") + " / " + formatMoney(sumPayments(rows, "euro", method), "euro");
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
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

  function fuzzyWordMatch(first, second) {
    if (!first || !second) return false;
    return first === second || first.startsWith(second) || second.startsWith(first);
  }

  function actionKey(action) {
    return [
      actionMatchText(action),
      action.category || "toate",
      action.currency || "lei",
      action.startDate || ""
    ].join("|");
  }

  function getUniqueActions(actions = []) {
    const byKey = new Map();

    actions.forEach((action) => {
      const key = actionKey(action);
      const existing = byKey.get(key);

      if (!existing) {
        byKey.set(key, { ...action, participantIds: actionParticipantIds(action), aliasIds: action.id ? [action.id] : [] });
        return;
      }

      existing.participantIds = [...new Set([...actionParticipantIds(existing), ...actionParticipantIds(action)])];
      existing.aliasIds = [...new Set([...(existing.aliasIds || []), action.id].filter(Boolean))];
      existing.amountDue = existing.amountDue || action.amountDue;
      existing.notes = existing.notes || action.notes;
    });

    return [...byKey.values()].sort((first, second) => compareText(first.name, second.name));
  }

  function paymentMatchesAction(payment, action) {
    if (!payment || !action) return false;
    if (action.startDate && (!payment.date || String(payment.date) < String(action.startDate))) return false;
    if (action.id && payment.actionId === action.id) return true;
    if (Array.isArray(action.aliasIds) && action.aliasIds.includes(payment.actionId)) return true;
    if (action.currency && paymentCurrency(payment) !== action.currency) return false;

    const needle = actionMatchText(action);
    if (!needle) return false;

    const haystack = normalizeText([payment.notes, payment.actionName, payment.category].join(" "));
    if (haystack.includes(needle)) return true;

    const paymentWords = actionKeywords(haystack);
    return actionKeywords(needle).some((word) => paymentWords.some((paymentWord) => fuzzyWordMatch(word, paymentWord)));
  }

  function getActionPayments(otherPayments, action, athleteId) {
    return (otherPayments || [])
      .filter((payment) => payment.athleteId === athleteId)
      .filter((payment) => paymentMatchesAction(payment, action));
  }

  function getActionRows(athletes, otherPayments, action) {
    if (!action) return [];

    const amountDue = Number(action.amountDue || 0);
    const currency = action.currency || "lei";

    return actionParticipantIds(action)
      .map((athleteId) => {
        const athlete = findAthlete(athletes, athleteId);
        if (!athlete) return null;

        const payments = getActionPayments(otherPayments, action, athleteId).filter((payment) => paymentCurrency(payment) === currency);
        const received = payments
          .filter((payment) => paymentType(payment) === "incasare")
          .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
        const returned = payments
          .filter((payment) => paymentType(payment) === "retur")
          .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
        const netReceived = received - returned;
        const outstanding = Math.max(amountDue - netReceived, 0);
        const extra = Math.max(netReceived - amountDue, 0);

        return { athlete, received, returned, netReceived, outstanding, extra, payments };
      })
      .filter(Boolean)
      .sort((first, second) => compareAthletesByName(first.athlete, second.athlete));
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
                  h("td", { "data-label": "Operat de" }, payment.updatedByEmail || "-"),
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
      actionId: "",
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
    const [month, setMonth] = React.useState(currentMonth());
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
    const actionAthletes = (actionGroup === "toate" ? activeAthletes : activeAthletes.filter((athlete) => athlete.group === actionGroup)).sort(compareAthletesByName);
    const selectedAction = uniqueActions.find((action) => action.id === selectedActionId) || uniqueActions[0] || null;
    const selectedActionRows = getActionRows(athletes, otherPayments, selectedAction);
    const visibleActionRows = showOnlyDebtors ? selectedActionRows.filter((row) => row.outstanding > 0) : selectedActionRows;
    const selectedActionCurrency = selectedAction?.currency || "lei";
    const actionTotalDue = selectedActionRows.reduce((sum, row) => sum + Number(selectedAction?.amountDue || 0), 0);
    const actionTotalReceived = selectedActionRows.reduce((sum, row) => sum + row.netReceived, 0);
    const actionTotalOutstanding = selectedActionRows.reduce((sum, row) => sum + row.outstanding, 0);

    React.useEffect(() => {
      if (!uniqueActions.length && selectedActionId) {
        setSelectedActionId("");
        return;
      }

      if (uniqueActions.length && !uniqueActions.some((action) => action.id === selectedActionId)) {
        setSelectedActionId(uniqueActions[0].id);
      }
    }, [uniqueActions, selectedActionId]);

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
      .filter((payment) => isSameOrBeforeMonth(payment.date, month))
      .filter((payment) => category === "toate" || payment.category === category)
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

    function updatePaymentAction(actionId) {
      const action = uniqueActions.find((item) => item.id === actionId);

      setForm((current) => ({
        ...current,
        actionId,
        category: action?.category || current.category,
        currency: action?.currency || current.currency,
        notes: action && !String(current.notes || "").trim() ? action.name : current.notes
      }));
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

      if ((isSportiv && !form.athleteId) || (!isSportiv && !payerName) || !form.date || !form.category || Number(form.amount || 0) <= 0) return;

      onSavePayment({
        ...form,
        athleteId: isSportiv ? form.athleteId : "",
        payerName: isSportiv ? "" : payerName,
        actionName: form.actionId ? uniqueActions.find((action) => action.id === form.actionId)?.name || "" : "",
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
        actionId: payment.actionId || "",
        paymentType: paymentType(payment),
        amount: payment.amount || "",
        method: payment.method || "cash",
        currency: paymentCurrency(payment),
        notes: payment.notes || ""
      });
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
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
        h(Field, { label: isFormPayment ? "Data platii" : "Data incasarii" }, h("input", { type: "date", value: form.date, onChange: (event) => update("date", event.target.value), required: true })),
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
            { value: form.actionId, onChange: (event) => updatePaymentAction(event.target.value) },
            h("option", { value: "" }, "Fara actiune"),
            uniqueActions.map((action) => h("option", { key: action.id, value: action.id }, action.name))
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
      h(
        "form",
        { className: "panel form-grid", onSubmit: submitAction },
        h(
          "div",
          { style: { gridColumn: "1 / -1", display: "grid", gap: "4px" } },
          h("h2", { style: { marginBottom: 0 } }, "Situatie actiuni"),
          h("p", { style: { margin: 0, color: "#66727a" } }, "Pentru turnee, cantonamente sau echipamente: setezi suma de achitat si vezi rapid cine mai are rest.")
        ),
        h(Field, { label: "Nume actiune" }, h("input", { value: actionForm.name, onChange: (event) => updateAction("name", event.target.value), placeholder: "Ex: Costinesti 2026", required: true })),
        h(
          Field,
          { label: "Categorie" },
          h(
            "select",
            { value: actionForm.category, onChange: (event) => updateAction("category", event.target.value) },
            categories.map((item) => h("option", { key: item, value: item }, item))
          )
        ),
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
            actionAthletes.map((athlete) =>
              h(
                "label",
                { key: athlete.id, style: { display: "flex", alignItems: "center", gap: "8px", fontWeight: 800 } },
                h("input", { type: "checkbox", checked: actionParticipantIds(actionForm).includes(athlete.id), onChange: () => toggleActionParticipant(athlete.id), style: { width: "auto", minHeight: "auto" } }),
                athleteName(athlete),
                h("small", { style: { color: "#66727a", fontWeight: 700 } }, athlete.group || "-")
              )
            )
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
              uniqueActions.map((action) => h("option", { key: action.id, value: action.id }, action.name))
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
      selectedAction &&
        h(
          "div",
          { className: "metrics" },
          h("div", null, h("span", null, "De achitat total"), h("strong", null, formatMoney(actionTotalDue, selectedActionCurrency)), h("small", null, selectedActionRows.length + " participanti")),
          h("div", null, h("span", null, "Incasat total"), h("strong", null, formatMoney(actionTotalReceived, selectedActionCurrency)), h("small", null, "De la " + formatDate(selectedAction.startDate))),
          h("div", null, h("span", null, "Rest de incasat"), h("strong", { className: actionTotalOutstanding > 0 ? "arrears" : "" }, formatMoney(actionTotalOutstanding, selectedActionCurrency)), h("small", null, selectedAction.name))
        ),
      selectedAction &&
        h(
          "div",
          { className: "table-wrap wide" },
          h(
            "table",
            null,
            h("thead", null, h("tr", null, ["Sportiv", "De achitat", "Incasat", "Rest", "Detalii"].map((head) => h("th", { key: head }, head)))),
            h(
              "tbody",
              null,
              visibleActionRows.map((row) =>
                h(
                  "tr",
                  { key: row.athlete.id, className: row.outstanding > 0 ? "row-unpaid" : "" },
                  h("td", { "data-label": "Sportiv" }, h("strong", null, athleteName(row.athlete)), h("small", null, row.athlete.group || "-")),
                  h("td", { "data-label": "De achitat" }, formatMoney(selectedAction.amountDue, selectedActionCurrency)),
                  h("td", { "data-label": "Incasat" }, h("strong", null, formatMoney(row.netReceived, selectedActionCurrency)), row.returned > 0 && h("small", null, "Retur: " + formatMoney(row.returned, selectedActionCurrency))),
                  h(
                    "td",
                    { "data-label": "Rest" },
                    h("strong", { className: row.outstanding > 0 ? "arrears" : "" }, formatMoney(row.outstanding, selectedActionCurrency)),
                    row.extra > 0 && h("small", null, "Avans: " + formatMoney(row.extra, selectedActionCurrency))
                  ),
                  h("td", { "data-label": "Detalii" }, row.payments.length ? row.payments.map((payment) => h("small", { key: payment.id || payment.date + payment.amount }, formatDate(payment.date) + " - " + formatPaymentAmount(payment))) : h("small", null, "Fara incasari gasite"))
                )
              )
            )
          )
        ),
      selectedAction && !visibleActionRows.length && h(EmptyState, { title: "Nu exista sportivi in filtrul actiunii.", text: showOnlyDebtors ? "Debifeaza filtrul cu rest sau verifica participantii." : "Adauga participanti la actiune." }),
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
        h(Field, { label: "Cauta" }, h("input", { value: query, onChange: (event) => setQuery(event.target.value), placeholder: "Nume, categorie, observatii" }))
      ),
      h(
        "div",
        { className: "metrics" },
        h("div", null, h("span", null, "Total lei"), h("strong", null, "Incasat = " + formatMoney(receivedLei, "lei")), h("strong", null, "Platit = " + formatMoney(paidLei, "lei"))),
        h("div", null, h("span", null, "Total euro"), h("strong", null, "Incasat = " + formatMoney(receivedEuro, "euro")), h("strong", null, "Platit = " + formatMoney(paidEuro, "euro"))),
        h("div", null, h("span", null, "Cash / Transfer"), h("strong", null, "Cash: " + formatDualAmount(filteredPayments, "cash")), h("strong", null, "Transfer: " + formatDualAmount(filteredPayments, "transfer")))
      ),
      h(
        "div",
        { className: "metrics" },
        h("div", null, h("span", null, "Sold lei pana la luna"), h("strong", null, formatMoney(balanceLei, "lei")), h("small", null, "Incasat total = " + formatMoney(balanceReceivedLei, "lei") + " / Platit total = " + formatMoney(balancePaidLei, "lei"))),
        h("div", null, h("span", null, "Sold euro pana la luna"), h("strong", null, formatMoney(balanceEuro, "euro")), h("small", null, "Incasat total = " + formatMoney(balanceReceivedEuro, "euro") + " / Platit total = " + formatMoney(balancePaidEuro, "euro"))),
        h("div", null, h("span", null, "Perioada sold"), h("strong", null, "Pana in " + month), h("small", null, "Respecta filtrele de grupa, categorie, moneda si cautare. Tipul nu limiteaza soldul."))
      ),
      h(
        "div",
        { className: "table-wrap wide" },
        h(
          "table",
          null,
          h("thead", null, h("tr", null, ["Data", "De la / Catre", "Categorie", "Tip", "Suma", "Moneda", "Metoda", "Observatii", "Operat de", ""].map((head) => h("th", { key: head }, head)))),
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
                h("td", { "data-label": "Tip" }, paymentTypeLabel(payment)),
                h("td", { "data-label": "Suma" }, h("strong", { className: isOutgoingPayment(payment) ? "arrears" : "" }, formatPaymentAmount(payment))),
                h("td", { "data-label": "Moneda" }, paymentCurrency(payment)),
                h("td", { "data-label": "Metoda" }, payment.method || "-"),
                h("td", { "data-label": "Observatii" }, payment.notes || "-"),
                h("td", { "data-label": "Operat de" }, payment.updatedByEmail || "-"),
                h(
                  "td",
                  { className: "row-actions" },
                  h("button", { onClick: () => edit(payment) }, "Editeaza"),
                  paymentType(payment) !== "cheltuiala" && h("button", { onClick: () => printPreview(payment) }, Number(payment.printCount || 0) > 0 || payment.printedAt ? "Reimprima" : "Imprima"),
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
    const selectedAction = uniqueActions.find((action) => action.id === selectedActionId) || uniqueActions[0] || null;
    const selectedActionRows = getActionRows(athletes, otherPayments, selectedAction);
    const visibleActionRows = showOnlyDebtors ? selectedActionRows.filter((row) => row.outstanding > 0) : selectedActionRows;
    const selectedActionCurrency = selectedAction?.currency || "lei";
    const actionTotalDue = selectedActionRows.reduce((sum, row) => sum + Number(selectedAction?.amountDue || 0), 0);
    const actionTotalReceived = selectedActionRows.reduce((sum, row) => sum + row.netReceived, 0);
    const actionTotalOutstanding = selectedActionRows.reduce((sum, row) => sum + row.outstanding, 0);
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
    const balanceRows = otherPayments
      .filter((payment) => isSameOrBeforeMonth(payment.date, month))
      .filter((payment) => category === "toate" || payment.category === category)
      .filter((payment) => currencyFilter === "toate" || paymentCurrency(payment) === currencyFilter)
      .filter((payment) => {
        const athlete = findAthlete(athletes, payment.athleteId);
        return group === "toate" || athlete?.group === group;
      });
    const receivedLei = sumPaymentsByType(rows, "lei", "incasare");
    const paidLei = sumOutgoingPayments(rows, "lei");
    const receivedEuro = sumPaymentsByType(rows, "euro", "incasare");
    const paidEuro = sumOutgoingPayments(rows, "euro");
    const balanceReceivedLei = sumPaymentsByType(balanceRows, "lei", "incasare");
    const balancePaidLei = sumOutgoingPayments(balanceRows, "lei");
    const balanceReceivedEuro = sumPaymentsByType(balanceRows, "euro", "incasare");
    const balancePaidEuro = sumOutgoingPayments(balanceRows, "euro");
    const balanceLei = balanceReceivedLei - balancePaidLei;
    const balanceEuro = balanceReceivedEuro - balancePaidEuro;
    const categoryTotals = categories
      .map((item) => ({
        category: item,
        totalLei: sumPayments(rows.filter((payment) => payment.category === item), "lei"),
        totalEuro: sumPayments(rows.filter((payment) => payment.category === item), "euro")
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
            categories.map((item) => h("option", { key: item, value: item }, item))
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
              uniqueActions.map((action) => h("option", { key: action.id, value: action.id }, action.name))
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
          h(SummaryCard, { label: "Incasat", value: formatMoney(actionTotalReceived, selectedActionCurrency), hint: "Toate lunile de la data de inceput", tone: "tone-green" }),
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
                      subtitle: (row.athlete.group || "-") + " / incasat " + formatMoney(row.netReceived, selectedActionCurrency),
                      amount: "Rest " + formatMoney(row.outstanding, selectedActionCurrency),
                      negative: row.outstanding > 0
                    })
                  )
                )
              : h(EmptyReportLine, { text: showOnlyDebtors ? "Nu exista restanti la actiunea aleasa." : "Nu exista participanti la actiunea aleasa." })
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
                    subtitle: formatDate(payment.date) + " / " + payerType(payment) + " / " + (payment.category || "-") + " / " + paymentTypeLabel(payment) + " / " + (payment.method || "-"),
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
    const taxIncome = monthlyFees.reduce((sum, fee) => sum + Number(fee.amountPaid || 0), 0);
    const taxPaymentsTotal = monthlyTaxPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const otherIncomeLei = sumPaymentsByType(monthlyOtherPayments, "lei", "incasare");
    const otherIncomeEuro = sumPaymentsByType(monthlyOtherPayments, "euro", "incasare");
    const otherOutgoingLei = sumOutgoingPayments(monthlyOtherPayments, "lei");
    const otherOutgoingEuro = sumOutgoingPayments(monthlyOtherPayments, "euro");
    const totalIncomeLei = taxIncome + otherIncomeLei;
    const totalPaymentsLei = taxPaymentsTotal + otherOutgoingLei;
    const finalBalanceLei = totalIncomeLei - totalPaymentsLei;
    const finalBalanceEuro = otherIncomeEuro - otherOutgoingEuro;
    const groupTotals = [...monthlyFees.reduce((map, fee) => {
      const athlete = findAthlete(athletes, fee.athleteId);
      const group = athlete?.group || "Fara grupa";
      const current = map.get(group) || { group, count: 0, total: 0 };

      current.count += 1;
      current.total += Number(fee.amountPaid || 0);
      map.set(group, current);
      return map;
    }, new Map()).values()].sort((first, second) => compareText(first.group, second.group));
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
        h(SummaryCard, { label: "Incasari taxe", value: formatMoney(taxIncome), hint: `${monthlyFees.length} plati`, tone: "tone-green" }),
        h(SummaryCard, { label: "Alte incasari", value: formatMoney(otherIncomeLei, "lei"), hint: otherIncomeEuro ? formatMoney(otherIncomeEuro, "euro") : "Doar incasari, fara plati", tone: "tone-blue" }),
        h(SummaryCard, { label: "Plati", value: formatMoney(totalPaymentsLei), hint: "Salarii/chirii + plati/retururi din alte incasari", tone: "tone-red" }),
        h(SummaryCard, { label: "Sold sfarsit luna", value: formatMoney(finalBalanceLei), hint: finalBalanceEuro ? "Euro: " + formatMoney(finalBalanceEuro, "euro") : "Incasari - plati", tone: finalBalanceLei < 0 ? "tone-red" : "tone-purple" })
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
                  h(ReportItem, {
                    key: row.group,
                    title: row.group,
                    subtitle: `${row.count} plati`,
                    amount: formatMoney(row.total)
                  })
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

  function ReportsView(props) {
    const [section, setSection] = React.useState("balanta");

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
            h("option", { value: "tot" }, "Tot")
          )
        )
      ),
      (section === "balanta" || section === "tot") && h(MonthlyBalanceReport, props),
      (section === "taxe" || section === "tot") && h(TaxReportsView, props),
      (section === "prezenta" || section === "tot") && h(AttendanceReportsView, props),
      (section === "vizeMedicale" || section === "tot") && h(MedicalVisaReportsView, props),
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
