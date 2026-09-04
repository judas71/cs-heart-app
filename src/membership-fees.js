(function () {
  const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

  function normalizeMonth(value) {
    const month = String(value || "").slice(0, 7);
    return MONTH_PATTERN.test(month) ? month : "";
  }

  function monthFromDate(value) {
    return normalizeMonth(value);
  }

  function currentMonth(value = new Date().toISOString()) {
    return monthFromDate(value);
  }

  function normalizePeriods(periods) {
    return (Array.isArray(periods) ? periods : [])
      .map((period) => ({
        startMonth: normalizeMonth(period?.startMonth),
        endMonth: normalizeMonth(period?.endMonth) || ""
      }))
      .filter((period) => period.startMonth && (!period.endMonth || period.endMonth >= period.startMonth))
      .sort((first, second) => first.startMonth.localeCompare(second.startMonth));
  }

  function getPeriods(athlete) {
    const stored = normalizePeriods(athlete?.membershipPeriods);
    if (stored.length) return stored;

    const startMonth = normalizeMonth(athlete?.joinMonth);
    if (!startMonth) return [];

    const endMonth = athlete?.active === false ? normalizeMonth(athlete?.inactiveMonth) : "";
    return [{ startMonth, endMonth }];
  }

  function isFeeDueForMonth(athlete, month) {
    const normalizedMonth = normalizeMonth(month);
    if (!normalizedMonth) return false;

    const periods = getPeriods(athlete);
    if (!periods.length) return athlete?.active !== false;

    return periods.some((period) =>
      period.startMonth <= normalizedMonth && (!period.endMonth || normalizedMonth <= period.endMonth)
    );
  }

  function latestInactiveTransitionMonth(athlete, revisions) {
    const history = (Array.isArray(revisions) ? revisions : [])
      .filter((revision) => revision?.id === athlete?.id)
      .sort((first, second) => String(first.revisionSavedAt || "").localeCompare(String(second.revisionSavedAt || "")));
    const timeline = [...history, athlete];
    let result = "";

    for (let index = 0; index < history.length; index += 1) {
      if (history[index].active !== false && timeline[index + 1]?.active === false) {
        result = monthFromDate(history[index].revisionSavedAt);
      }
    }

    return result;
  }

  function inferInactiveMonth(athlete, state) {
    const transitionMonth = latestInactiveTransitionMonth(athlete, state?.athleteRevisions);
    if (transitionMonth) return { month: transitionMonth, source: "status-history" };

    const feeMonths = (Array.isArray(state?.fees) ? state.fees : [])
      .filter((fee) => fee?.athleteId === athlete?.id)
      .map((fee) => normalizeMonth(fee.month))
      .filter(Boolean);
    const attendanceMonths = (Array.isArray(state?.trainings) ? state.trainings : [])
      .filter((training) => training?.attendance && training.attendance[athlete?.id])
      .map((training) => monthFromDate(training.date))
      .filter(Boolean);
    const candidates = [normalizeMonth(athlete?.joinMonth), ...feeMonths, ...attendanceMonths].filter(Boolean).sort();

    return {
      month: candidates[candidates.length - 1] || "",
      source: candidates.length ? "last-recorded-activity" : "unknown"
    };
  }

  function migrateInactiveAthletes(state, options = {}) {
    const migratedAt = options.migratedAt || new Date().toISOString();
    const fallbackMonth = normalizeMonth(options.currentMonth) || currentMonth(migratedAt);
    const changes = [];
    const athletes = (Array.isArray(state?.athletes) ? state.athletes : []).map((athlete) => {
      if (athlete?.active !== false || normalizePeriods(athlete.membershipPeriods).length) return athlete;

      const inferred = inferInactiveMonth(athlete, state);
      const startMonth = normalizeMonth(athlete.joinMonth) || inferred.month || fallbackMonth;
      const inactiveMonth = inferred.month || startMonth;
      const migrated = {
        ...athlete,
        inactiveMonth,
        membershipPeriods: [{ startMonth, endMonth: inactiveMonth }],
        inactiveMonthSource: inferred.source,
        inactiveMonthRecordedAt: migratedAt
      };

      changes.push({ athleteId: athlete.id, inactiveMonth, source: inferred.source });
      return migrated;
    });

    return {
      changed: changes.length > 0,
      changes,
      state: changes.length ? { ...state, athletes } : state
    };
  }

  function applyStatusChange(previous, requested, changedAt = new Date().toISOString()) {
    const next = { ...requested };
    const changeMonth = currentMonth(changedAt);
    const wasActive = previous?.active !== false;
    const isActive = next.active !== false;
    let periods = normalizePeriods(previous?.membershipPeriods);

    if (!periods.length && previous?.joinMonth) {
      periods = [{
        startMonth: normalizeMonth(previous.joinMonth),
        endMonth: previous.active === false ? normalizeMonth(previous.inactiveMonth) : ""
      }].filter((period) => period.startMonth);
    }

    if (wasActive && !isActive) {
      const inactiveMonth = normalizeMonth(next.inactiveMonth) || changeMonth;
      let openIndex = -1;
      for (let index = periods.length - 1; index >= 0; index -= 1) {
        if (!periods[index].endMonth) {
          openIndex = index;
          break;
        }
      }
      if (openIndex >= 0) periods[openIndex] = { ...periods[openIndex], endMonth: inactiveMonth };
      else if (normalizeMonth(next.joinMonth)) periods.push({ startMonth: normalizeMonth(next.joinMonth), endMonth: inactiveMonth });
      next.inactiveMonth = inactiveMonth;
      next.inactiveMonthSource = "status-change";
      next.inactiveMonthRecordedAt = changedAt;
    } else if (!wasActive && isActive) {
      if (!periods.some((period) => !period.endMonth)) periods.push({ startMonth: changeMonth, endMonth: "" });
      next.reactivatedMonth = changeMonth;
    } else if (!isActive) {
      const inactiveMonth = normalizeMonth(next.inactiveMonth) || normalizeMonth(previous?.inactiveMonth) || changeMonth;
      const lastIndex = periods.length - 1;
      if (lastIndex >= 0) periods[lastIndex] = { ...periods[lastIndex], endMonth: inactiveMonth };
      next.inactiveMonth = inactiveMonth;
    }

    if (periods.length) next.membershipPeriods = normalizePeriods(periods);
    return next;
  }

  window.CSHeartMembershipFees = {
    normalizeMonth,
    getPeriods,
    isFeeDueForMonth,
    inferInactiveMonth,
    migrateInactiveAthletes,
    applyStatusChange
  };
})();
