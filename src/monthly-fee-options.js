(function () {
  function getStandardFee(athlete) {
    const value = Number(athlete?.feeDue ?? 200);
    return Number.isFinite(value) && value >= 0 ? value : 200;
  }

  function roundMoney(value) {
    return Math.round(Number(value || 0) * 100) / 100;
  }

  function getMonthlyFeePresets(athlete) {
    const standard = getStandardFee(athlete);
    return [
      { id: "trial-one", label: "Primul antrenament", shortLabel: "1 antrenament", amount: 50 },
      { id: "trial-two", label: "Primele două antrenamente", shortLabel: "2 antrenamente", amount: 100 },
      { id: "standard", label: "Continuă luna — taxă normală", shortLabel: "Continuă luna", amount: standard },
      { id: "half", label: "Jumătate de taxă", shortLabel: "Jumătate", amount: roundMoney(standard / 2) },
      { id: "free", label: "Fără taxă în această lună", shortLabel: "Fără taxă", amount: 0 }
    ];
  }

  function normalizeMonthlyFeeAmount(value) {
    if (String(value ?? "").trim() === "") return null;
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount < 0) return null;
    return roundMoney(amount);
  }

  window.CSHeartMonthlyFeeOptions = {
    getStandardFee,
    getMonthlyFeePresets,
    normalizeMonthlyFeeAmount
  };
})();
