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
    return Number(athlete?.feeDue ?? 200);
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
    const canceledAmount = Math.max(previousAmountDue - amountPaid, 0);
    if (canceledAmount <= 0) return { changed: false, fee, adjustment: null };

    const canceledAt = options.canceledAt || new Date().toISOString();
    const adjustment = {
      id: options.id || `fee-adjustment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: "anulare-taxa",
      month: normalizeMonth(fee?.month),
      previousAmountDue,
      amountDue: previousAmountDue - canceledAmount,
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

  window.CSHeartFeeLedger = {
    getPreviousBalanceBreakdown,
    getFeeAdjustments,
    cancelOutstandingFee
  };
})();
