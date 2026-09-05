(function () {
  function cleanText(value) {
    return String(value || "")
      .normalize("NFC")
      .trim()
      .replace(/\s+/g, " ");
  }

  function normalizePersonName(value) {
    return cleanText(value).toLocaleUpperCase("ro-RO");
  }

  function normalizeGroupLabel(value) {
    return cleanText(value).toLocaleUpperCase("ro-RO");
  }

  function normalizeAthleteRecord(athlete) {
    return {
      ...athlete,
      lastName: normalizePersonName(athlete?.lastName),
      firstName: normalizePersonName(athlete?.firstName),
      group: normalizeGroupLabel(athlete?.group)
    };
  }

  function athleteIdentityKey(athlete) {
    return [normalizePersonName(athlete?.lastName), normalizePersonName(athlete?.firstName)].filter(Boolean).join(" ");
  }

  function migrateAthleteIdentities(state) {
    const changes = [];
    const athletes = (state.athletes || []).map((athlete) => {
      const normalized = normalizeAthleteRecord(athlete);
      if (normalized.lastName === athlete.lastName && normalized.firstName === athlete.firstName && normalized.group === athlete.group) return athlete;

      changes.push({
        athleteId: athlete.id,
        from: { lastName: athlete.lastName, firstName: athlete.firstName, group: athlete.group },
        to: { lastName: normalized.lastName, firstName: normalized.firstName, group: normalized.group }
      });
      return normalized;
    });

    return {
      changed: changes.length > 0,
      changes,
      state: changes.length ? { ...state, athletes } : state
    };
  }

  window.CSHeartAthleteNormalization = {
    cleanText,
    normalizePersonName,
    normalizeGroupLabel,
    normalizeAthleteRecord,
    athleteIdentityKey,
    migrateAthleteIdentities
  };
})();
