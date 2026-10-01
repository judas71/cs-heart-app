(function () {
  // Cash-flow reporting is independent of the fee month and FIFO allocations.
  function collect({ athletes = [], fees = [], month, group = "toate" }) {
    const ids = new Set(athletes.filter(a => group === "toate" || a.group === group).map(a => a.id));
    const rows = [];
    const undated = [];
    fees.forEach(fee => {
      if (group !== "toate" && !ids.has(fee.athleteId)) return;
      const payments = Array.isArray(fee.payments) ? fee.payments : [{
        id: "legacy-" + (fee.id || fee.athleteId + "-" + fee.month),
        amount: fee.amountPaid, date: fee.paymentDate, method: fee.method || "cash"
      }];
      payments.forEach(payment => {
        const cents = Math.round(Number(payment.amount || 0) * 100);
        if (!Number.isFinite(cents) || cents <= 0) return;
        let date = String(payment.date || "").trim();
        const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(date);
        if (match) date = match[3] + "-" + match[2] + "-" + match[1];
        const row = { fee, payment: { ...payment, date, amount: cents / 100 }, cents };
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) undated.push(row);
        else if (date.slice(0, 7) === month) rows.push(row);
      });
    });
    rows.sort((a, b) => a.payment.date.localeCompare(b.payment.date));
    const total = rows.reduce((sum, row) => sum + row.cents, 0) / 100;
    return { rows, undated, total };
  }
  window.CSHeartMonthlyFeeReceipts = { collect };
})();
