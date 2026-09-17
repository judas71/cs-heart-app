(function () {
  const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

  function normalizeMonth(value) {
    const month = String(value || "").slice(0, 7);
    return MONTH_PATTERN.test(month) ? month : "";
  }

  function monthRange(startMonth, endMonth) {
    const start = normalizeMonth(startMonth);
    const end = normalizeMonth(endMonth);
    if (!start || !end || start >= end) return [];

    const months = [];
    const cursor = new Date(start + "-01T00:00:00");
    const limit = new Date(end + "-01T00:00:00");

    while (cursor < limit) {
      months.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`);
      cursor.setMonth(cursor.getMonth() + 1);
    }

    return months;
  }

  function getFeeForMonth(fees, athleteId, month) {
    return (Array.isArray(fees) ? fees : []).find(
      (fee) => fee?.athleteId === athleteId && normalizeMonth(fee.month) === normalizeMonth(month)
    );
  }

  function hasAmountDue(fee) {
    return fee && fee.amountDue !== undefined && fee.amountDue !== null && fee.amountDue !== "";
  }

  function getDefaultAmountDue(athlete, month) {
    if (!window.CSHeartMembershipFees?.isFeeDueForMonth(athlete, month)) return 0;
    return athlete?.feeDue === "" ? 200 : Number(athlete?.feeDue ?? 200);
  }

  function getAmountDue(athlete, fee, month) {
    return hasAmountDue(fee) ? Number(fee.amountDue) : getDefaultAmountDue(athlete, month);
  }

  function getFirstKnownFeeMonthBefore(fees, athleteId, month) {
    return (Array.isArray(fees) ? fees : [])
      .filter((fee) => fee?.athleteId === athleteId && normalizeMonth(fee.month) && fee.month < month)
      .map((fee) => normalizeMonth(fee.month))
      .sort()[0] || "";
  }

  function getBalanceStartMonth(fees, athlete, month) {
    return normalizeMonth(athlete?.joinMonth) || getFirstKnownFeeMonthBefore(fees, athlete?.id, month) || normalizeMonth(month);
  }

  function getPreviousBalanceBreakdown(fees, athlete, month) {
    const months = monthRange(getBalanceStartMonth(fees, athlete, month), month).map((itemMonth) => {
      const fee = getFeeForMonth(fees, athlete?.id, itemMonth);
      const amountDue = getAmountDue(athlete, fee, itemMonth);
      const amountPaid = Number(fee?.amountPaid || 0);

      return {
        month: itemMonth,
        amountDue,
        amountPaid,
        balance: amountDue - amountPaid
      };
    });
    const balance = months.reduce((total, item) => total + item.balance, 0);

    return {
      balance,
      debts: months.filter((item) => item.balance > 0),
      credits: months.filter((item) => item.balance < 0),
      months
    };
  }

  // Derived allocation only: original receipts, dates and confirmations are never rewritten.
  function getSettlement(fees, athlete, selectedMonth, nowMonth = new Date().toISOString().slice(0, 7)) {
    const ownFees = (fees || []).filter((fee) => fee.athleteId === athlete.id);
    const horizon = [normalizeMonth(selectedMonth), normalizeMonth(nowMonth), ...ownFees.map((fee) => normalizeMonth(fee.month))].filter(Boolean).sort().pop();
    const start = [normalizeMonth(athlete.joinMonth), ...ownFees.map((fee) => normalizeMonth(fee.month))].filter(Boolean).sort()[0] || horizon;
    const months = [...monthRange(start, horizon), horizon].map((month) => {
      const fee = getFeeForMonth(ownFees, athlete.id, month);
      const amountDue = Math.max(0, Math.round(getAmountDue(athlete, fee, month) * 100));
      return { month, dueCents: amountDue, remainingCents: amountDue, allocations: [] };
    });
    const payments = ownFees.flatMap((fee) => {
      const rows = Array.isArray(fee.payments) ? fee.payments : [{
        id: `legacy-${fee.id || `${fee.athleteId}-${fee.month}`}`,
        amount: Number(fee.amountPaid || 0), date: fee.paymentDate || "", method: fee.method || "cash"
      }];
      return rows.filter((payment) => Number(payment.amount) > 0).map((payment, index) => ({
        ...payment, id: payment.id || `${fee.month}-${index}`, sourceMonth: fee.month,
        allocations: [], credit: 0
      }));
    }).sort((a, b) => String(a.date || a.sourceMonth).localeCompare(String(b.date || b.sourceMonth)) || String(a.createdAt || "").localeCompare(String(b.createdAt || "")) || String(a.id).localeCompare(String(b.id)));
    let creditCents = 0;
    for (const payment of payments) {
      let available = Math.round(Number(payment.amount) * 100);
      for (const row of months) {
        if (!available) break;
        const used = Math.min(available, row.remainingCents);
        if (!used) continue;
        row.remainingCents -= used;
        available -= used;
        payment.allocations.push({ month: row.month, amount: used / 100 });
        row.allocations.push({ paymentId: payment.id, sourceMonth: payment.sourceMonth, date: payment.date, amount: used / 100 });
      }
      payment.credit = available / 100;
      creditCents += available;
    }
    const resultMonths = months.map((row) => ({ month: row.month, amountDue: row.dueCents / 100, amountPaid: (row.dueCents - row.remainingCents) / 100, balance: row.remainingCents / 100, allocations: row.allocations }));
    return {
      horizon, months: resultMonths, payments, credit: creditCents / 100,
      outstanding: resultMonths.filter((row) => row.month <= selectedMonth).reduce((sum, row) => sum + Math.round(row.balance * 100), 0) / 100,
      previousDebt: resultMonths.filter((row) => row.month < selectedMonth).reduce((sum, row) => sum + Math.round(row.balance * 100), 0) / 100
    };
  }

  function getFeeAdjustments(fees, athleteId) {
    return (Array.isArray(fees) ? fees : [])
      .filter((fee) => fee?.athleteId === athleteId)
      .flatMap((fee) =>
        (Array.isArray(fee.feeAdjustments) ? fee.feeAdjustments : []).map((adjustment) => ({
          ...adjustment,
          month: normalizeMonth(adjustment.month) || normalizeMonth(fee.month)
        }))
      )
      .sort((first, second) => String(second.canceledAt || "").localeCompare(String(first.canceledAt || "")));
  }

  function cancelOutstandingFee(fee, options = {}) {
    const previousAmountDue = Number(fee?.amountDue ?? options.fallbackDue ?? 0);
    const amountPaid = Number(fee?.amountPaid || 0);
    const allocatedPaid = Number(options.allocatedPaid ?? amountPaid);
    const canceledAmount = Math.max(Math.round((previousAmountDue - allocatedPaid) * 100), 0) / 100;
    if (canceledAmount <= 0) return { changed: false, fee, adjustment: null };

    const canceledAt = options.canceledAt || new Date().toISOString();
    const adjustment = {
      id: options.id || `fee-adjustment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: "anulare-taxa",
      month: normalizeMonth(fee?.month),
      previousAmountDue,
      amountDue: Math.round((previousAmountDue - canceledAmount) * 100) / 100,
      amount: canceledAmount,
      reason: String(options.reason || "").trim(),
      canceledAt,
      canceledByEmail: String(options.canceledByEmail || "").trim()
    };

    return {
      changed: true,
      adjustment,
      fee: {
        ...fee,
        amountDue: adjustment.amountDue,
        feeAdjustments: [...(Array.isArray(fee?.feeAdjustments) ? fee.feeAdjustments : []), adjustment]
      }
    };
  }

  function allocationLabel(settlement, sourceMonth, paymentId) {
    const payment = settlement.payments.find((item) => item.sourceMonth === sourceMonth && item.id === paymentId);
    if (!payment) return "";
    return payment.allocations.map((item) => `${item.month}: ${item.amount.toLocaleString("ro-RO")} lei`).concat(payment.credit > 0 ? [`Avans: ${payment.credit.toLocaleString("ro-RO")} lei`] : []).join(" / ");
  }

  function SettlementHistory({ settlement }) {
    const h = React.createElement;
    const money = (value) => `${value.toLocaleString("ro-RO")} lei`;
    return h("details", { className: "panel" },
      h("summary", null, "Situația taxelor pe luni — plățile acoperă întâi restanțele vechi"),
      h("p", null, "Situație recalculată folosind toate încasările înregistrate. O lună poate fi achitată printr-o plată făcută mai târziu."),
      h("div", { className: "table-wrap" }, h("table", null,
        h("thead", null, h("tr", null, ["Luna", "Taxă", "Acoperit prin plăți", "Rămas", "Încasările care au acoperit taxa"].map((label) => h("th", { key: label }, label)))),
        h("tbody", null, settlement.months.map((row) => h("tr", { key: row.month },
          h("td", { "data-label": "Luna" }, row.month),
          h("td", { "data-label": "Taxă" }, money(row.amountDue)),
          h("td", { "data-label": "Acoperit prin plăți" }, money(row.amountPaid)),
          h("td", { "data-label": "Rămas" }, money(row.balance)),
          h("td", { "data-label": "Încasări" }, row.allocations.map((item) => `${item.date || item.sourceMonth}: ${money(item.amount)}`).join(" / ") || "—")
        )))
      )), settlement.credit > 0 && h("p", null, "Avans disponibil: " + money(settlement.credit)));
  }

  window.CSHeartFeeLedger = {
    getSettlement,
    allocationLabel,
    SettlementHistory,
    getPreviousBalanceBreakdown,
    getFeeAdjustments,
    cancelOutstandingFee
  };
})();
