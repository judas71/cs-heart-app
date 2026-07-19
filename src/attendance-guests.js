(function () {
  const h = React.createElement;
  const attendanceStatuses = ["prezent", "absent", "\u00eenvoit", "accidentat"];
  const trainingModes = [
    ["grupa", "Grupa"],
    ["mixt", "Mixt"],
    ["individual", "Individual"]
  ];

  function getGroups(athletes) {
    return [...new Set(athletes.map((athlete) => athlete.group).filter(Boolean))].sort((first, second) =>
      String(first).localeCompare(String(second), "ro", { numeric: true })
    );
  }

  function athleteName(athlete) {
    return `${athlete.lastName || ""} ${athlete.firstName || ""}`.replace(/\s+/g, " ").trim();
  }

  function compareAthletes(first, second) {
    return athleteName(first).localeCompare(athleteName(second), "ro");
  }

  function Field({ label, children }) {
    return h("label", { className: "field" }, h("span", null, label), children);
  }

  function formatDate(value) {
    if (!value) return "-";

    return new Date(value + "T00:00:00").toLocaleDateString("ro-RO", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  }

  function formatMonth(value) {
    if (!value) return "Fara data";

    const label = new Date(`${value}-01T00:00:00`).toLocaleDateString("ro-RO", {
      month: "long",
      year: "numeric"
    });

    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  function countStatuses(attendance) {
    return Object.values(attendance || {}).reduce(
      (counts, status) => {
        if (status === "prezent") counts.present += 1;
        if (status === "absent") counts.absent += 1;
        if (status === "\u00eenvoit") counts.excused += 1;
        if (status === "accidentat") counts.injured += 1;
        return counts;
      },
      { present: 0, absent: 0, excused: 0, injured: 0 }
    );
  }

  function attendanceSignature(attendance, mode) {
    return Object.keys(attendance || {})
      .filter((athleteId) => mode !== "grupa" || attendanceStatuses.includes(attendance[athleteId]))
      .sort()
      .map((athleteId) => `${athleteId}:${attendance[athleteId] || ""}`)
      .join("|");
  }

  function listSignature(values) {
    return [...(values || [])]
      .sort((first, second) => String(first).localeCompare(String(second), "ro", { numeric: true }))
      .join("|");
  }

  function EmptyState({ title, text }) {
    return h("div", { className: "empty-state" }, h("strong", null, title), h("p", null, text));
  }

  function trainingRecordType(mode) {
    if (mode === "individual") return "individual";
    if (mode === "mixt") return "mixt";
    return "grupa";
  }

  function savedTrainingType(training) {
    return training?.type || "grupa";
  }

  function trainingHasGuests(training, athletes) {
    if (savedTrainingType(training) !== "grupa") return false;

    return Object.keys(training.attendance || {}).some((athleteId) => {
      const athlete = athletes.find((item) => item.id === athleteId);
      return athlete && athlete.group !== training.group;
    });
  }

  function displayTrainingType(training, athletes) {
    if (savedTrainingType(training) === "individual") return "Individual";
    if (savedTrainingType(training) === "mixt" || trainingHasGuests(training, athletes)) return "Mixt";
    return "Grupa";
  }

  function trainingGroups(training, athletes) {
    const savedGroups = Array.isArray(training?.groups) ? training.groups.filter(Boolean) : [];

    if (savedGroups.length) {
      return getGroups(savedGroups.map((group) => ({ group })));
    }

    const attendanceIds = new Set(Object.keys(training?.attendance || {}));
    return getGroups(athletes.filter((athlete) => attendanceIds.has(athlete.id)));
  }

  function displayTrainingLabel(training, athletes) {
    const type = displayTrainingType(training, athletes);

    if (type === "Grupa") return `Grupa ${training.group || "-"}`;
    if (type === "Individual") return "Individual";

    const mixedGroups = trainingGroups(training, athletes);
    return mixedGroups.length ? `Mixt - grupele ${mixedGroups.join(" + ")}` : "Mixt";
  }

  function findTraining(trainings, date, mode, group, athletes) {
    const recordType = trainingRecordType(mode);

    if (recordType === "individual") {
      return trainings.find(
        (training) =>
          training.date === date &&
          savedTrainingType(training) === "individual" &&
          (training.group === "Individual" || !training.group)
      );
    }

    if (recordType === "mixt") {
      return (
        trainings.find((training) => training.date === date && savedTrainingType(training) === "mixt") ||
        trainings.find((training) => training.date === date && trainingHasGuests(training, athletes))
      );
    }

    return trainings.find(
      (training) =>
        training.date === date &&
        savedTrainingType(training) === "grupa" &&
        !trainingHasGuests(training, athletes) &&
        training.group === group
    );
  }

  function AttendanceView({ athletes, trainings, onSaveTraining, onDeleteTraining, onDirtyChange = () => {} }) {
    const groups = getGroups(athletes);
    const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
    const [mode, setMode] = React.useState("grupa");
    const [group, setGroup] = React.useState(groups[0] || "");
    const [screen, setScreen] = React.useState("marcare");
    const [openHistoryMonth, setOpenHistoryMonth] = React.useState(null);
    const [selectedMixedGroups, setSelectedMixedGroups] = React.useState([]);
    const [baselineMixedGroups, setBaselineMixedGroups] = React.useState([]);
    const [selectedAthleteIds, setSelectedAthleteIds] = React.useState([]);
    const [attendance, setAttendance] = React.useState({});
    const [baselineAttendance, setBaselineAttendance] = React.useState({});
    const [savedNotice, setSavedNotice] = React.useState(false);
    const activeAthletes = athletes.filter((athlete) => athlete.active !== false).sort(compareAthletes);
    const groupAthletes = activeAthletes.filter((athlete) => athlete.group === group);
    const selectedTraining = findTraining(trainings, date, mode, group, activeAthletes);
    const attendanceIds = new Set(Object.keys(attendance));
    const shownAthletes =
      mode === "grupa"
        ? activeAthletes.filter((athlete) => athlete.group === group || attendanceIds.has(athlete.id))
        : activeAthletes.filter((athlete) => attendanceIds.has(athlete.id));
    const shownIds = new Set(shownAthletes.map((athlete) => athlete.id));
    const canPickAthletes = mode !== "grupa";
    const availableAthletes = activeAthletes.filter((athlete) => !shownIds.has(athlete.id));
    const selectedAvailableIds = selectedAthleteIds.filter((athleteId) =>
      availableAthletes.some((athlete) => athlete.id === athleteId)
    );
    const counts = countStatuses(attendance);
    const markedCount = shownAthletes.filter((athlete) => attendanceStatuses.includes(attendance[athlete.id])).length;
    const unmarkedCount = Math.max(shownAthletes.length - markedCount, 0);
    const draftDirty =
      attendanceSignature(attendance, mode) !== attendanceSignature(baselineAttendance, mode) ||
      (mode === "mixt" && listSignature(selectedMixedGroups) !== listSignature(baselineMixedGroups));
    const historyRows = [...trainings]
      .filter((training) => Object.keys(training.attendance || {}).length > 0)
      .sort((first, second) => {
        const byDate = String(second.date || "").localeCompare(String(first.date || ""));
        if (byDate !== 0) return byDate;
        return String(first.group || "").localeCompare(String(second.group || ""), "ro");
      });
    const historyMonths = historyRows.reduce((months, training) => {
      const monthKey = String(training.date || "").slice(0, 7) || "fara-data";
      const currentMonth = months.find((month) => month.key === monthKey);

      if (currentMonth) {
        currentMonth.rows.push(training);
      } else {
        months.push({
          key: monthKey,
          label: monthKey === "fara-data" ? "Fara data" : formatMonth(monthKey),
          rows: [training]
        });
      }

      return months;
    }, []);
    const activeHistoryMonth = openHistoryMonth === null ? historyMonths[0]?.key || "" : openHistoryMonth;

    React.useEffect(() => {
      const savedAttendance = selectedTraining?.attendance || {};
      const next = {};

      Object.keys(savedAttendance).forEach((athleteId) => {
        if (activeAthletes.some((athlete) => athlete.id === athleteId)) {
          next[athleteId] = savedAttendance[athleteId];
        }
      });

      setAttendance(next);
      setBaselineAttendance(next);
      const nextMixedGroups = mode === "mixt" && selectedTraining ? trainingGroups(selectedTraining, activeAthletes) : [];
      setSelectedMixedGroups(nextMixedGroups);
      setBaselineMixedGroups(nextMixedGroups);
      setSelectedAthleteIds([]);
      setSavedNotice(false);
    }, [date, group, mode, selectedTraining?.id, athletes.length]);

    React.useEffect(() => {
      onDirtyChange(draftDirty);

      if (!draftDirty) return undefined;

      function warnBeforeUnload(event) {
        event.preventDefault();
        event.returnValue = "";
      }

      window.addEventListener("beforeunload", warnBeforeUnload);
      return () => window.removeEventListener("beforeunload", warnBeforeUnload);
    }, [draftDirty, onDirtyChange]);

    React.useEffect(() => () => onDirtyChange(false), [onDirtyChange]);

    function confirmDiscardDraft() {
      if (!draftDirty) return true;

      const ok = confirm("Ai modificari nesalvate la prezenta. Sigur vrei sa pleci fara sa le salvezi?");
      if (!ok) return false;

      setAttendance({ ...baselineAttendance });
      setSelectedMixedGroups([...baselineMixedGroups]);
      setSelectedAthleteIds([]);
      setSavedNotice(false);
      return true;
    }

    function changeDate(nextDate) {
      if (nextDate === date || !confirmDiscardDraft()) return;
      setDate(nextDate);
    }

    function changeMode(nextMode) {
      if (nextMode === mode || !confirmDiscardDraft()) return;
      setMode(nextMode);
    }

    function changeGroup(nextGroup) {
      if (nextGroup === group || !confirmDiscardDraft()) return;
      setGroup(nextGroup);
    }

    function changeScreen(nextScreen) {
      if (nextScreen === screen) return;
      if (screen === "marcare" && !confirmDiscardDraft()) return;
      setScreen(nextScreen);
    }

    function updateAttendance(athleteId, status) {
      setAttendance((current) => ({
        ...current,
        [athleteId]: current[athleteId] === status ? "" : status
      }));
      setSavedNotice(false);
    }

    function markAllPresent() {
      if (!shownAthletes.length) return;
      const next = { ...attendance };
      shownAthletes.forEach((athlete) => {
        next[athlete.id] = "prezent";
      });
      setAttendance(next);
      setSavedNotice(false);
    }

    function clearAllMarks() {
      const next = { ...attendance };
      shownAthletes.forEach((athlete) => {
        next[athlete.id] = "";
      });
      setAttendance(next);
      setSavedNotice(false);
    }

    function saveTraining() {
      if (!shownAthletes.length || unmarkedCount > 0) return;

      const cleanedAttendance = Object.fromEntries(
        Object.entries(attendance).filter(([, status]) => attendanceStatuses.includes(status))
      );

      const nextTraining = {
        id: selectedTraining?.id,
        date,
        group: mode === "individual" ? "Individual" : mode === "mixt" ? "Mixt" : group,
        type: trainingRecordType(mode),
        attendance: cleanedAttendance
      };

      if (mode === "mixt") {
        nextTraining.groups = [...selectedMixedGroups];
      }

      onSaveTraining(nextTraining);
      setAttendance(cleanedAttendance);
      setBaselineAttendance(cleanedAttendance);
      setBaselineMixedGroups([...selectedMixedGroups]);
      setSavedNotice(true);
    }

    function toggleMixedGroup(groupName) {
      const isSelected = selectedMixedGroups.includes(groupName);
      const athleteIds = activeAthletes.filter((athlete) => athlete.group === groupName).map((athlete) => athlete.id);

      if (isSelected) {
        const hasMarkedAthletes = athleteIds.some((athleteId) => attendanceStatuses.includes(attendance[athleteId]));
        if (hasMarkedAthletes) {
          const ok = confirm(`Grupa ${groupName} are deja marcaje. O scoti din acest antrenament mixt?`);
          if (!ok) return;
        }

        const nextAttendance = { ...attendance };
        athleteIds.forEach((athleteId) => delete nextAttendance[athleteId]);
        setAttendance(nextAttendance);
        setSelectedMixedGroups((current) => current.filter((item) => item !== groupName));
      } else {
        const nextAttendance = { ...attendance };
        athleteIds.forEach((athleteId) => {
          nextAttendance[athleteId] = nextAttendance[athleteId] || "";
        });
        setAttendance(nextAttendance);
        setSelectedMixedGroups((current) =>
          [...current, groupName].sort((first, second) => String(first).localeCompare(String(second), "ro", { numeric: true }))
        );
      }

      setSelectedAthleteIds([]);
      setSavedNotice(false);
    }

    function toggleSelectedAthlete(athleteId) {
      setSelectedAthleteIds((current) =>
        current.includes(athleteId) ? current.filter((id) => id !== athleteId) : [...current, athleteId]
      );
    }

    function selectAllAvailable() {
      setSelectedAthleteIds(availableAthletes.map((athlete) => athlete.id));
    }

    function clearSelectedAthletes() {
      setSelectedAthleteIds([]);
    }

    function addSelectedAthletes() {
      if (!selectedAvailableIds.length) return;

      const nextAttendance = { ...attendance };
      selectedAvailableIds.forEach((athleteId) => {
        nextAttendance[athleteId] = nextAttendance[athleteId] || "";
      });
      setAttendance(nextAttendance);
      setSelectedAthleteIds([]);
      setSavedNotice(false);
    }

    function removeAthlete(athleteId) {
      const nextAttendance = { ...attendance };
      delete nextAttendance[athleteId];
      setAttendance(nextAttendance);
      setSavedNotice(false);
    }

    function openHistory(training) {
      const type = displayTrainingType(training, activeAthletes);

      setDate(training.date);
      setScreen("marcare");

      if (type === "Individual") {
        setMode("individual");
        return;
      }

      if (type === "Mixt") {
        setMode("mixt");
        return;
      }

      setMode("grupa");
      setGroup(training.group || groups[0] || "");
    }

    function deleteHistory(training) {
      if (!onDeleteTraining) return;

      const ok = confirm("Stergi aceasta prezenta/antrenament?");
      if (!ok) return;
      onDeleteTraining(training);
    }

    return h(
      "section",
      { className: "stack attendance-v2" },
      h(
        "div",
        { className: "attendance-v2-hero" },
        h(
          "div",
          { className: "attendance-v2-hero-copy" },
          h("p", { className: "eyebrow" }, "Prezenta"),
          h("h2", null, screen === "marcare" ? "Antrenamentul de azi" : "Istoric antrenamente"),
          h(
            "p",
            null,
            screen === "marcare"
              ? "Verifica fiecare sportiv. Nimeni nu este marcat automat si nimic nu se salveaza fara confirmarea ta."
              : "Vezi antrenamentele salvate si deschide rapid o prezenta pentru verificare."
          )
        ),
        h(
          "div",
          { className: "attendance-v2-tabs", "aria-label": "Mod prezenta" },
          h(
            "button",
            {
              type: "button",
              className: screen === "marcare" ? "selected" : "",
              "aria-pressed": screen === "marcare",
              onClick: () => changeScreen("marcare")
            },
            "Marcheaza prezenta"
          ),
          h(
            "button",
            {
              type: "button",
              className: screen === "istoric" ? "selected" : "",
              "aria-pressed": screen === "istoric",
              onClick: () => changeScreen("istoric")
            },
            "Istoric",
            h("span", null, historyRows.length)
          )
        )
      ),
      screen === "marcare" &&
        h(
          React.Fragment,
          null,
          h(
            "div",
            { className: "panel compact-grid attendance-v2-controls" },
            h(Field, { label: "Data antrenamentului" }, h("input", { type: "date", value: date, onChange: (event) => changeDate(event.target.value) })),
            h(
              Field,
              { label: "Tip antrenament" },
              h(
                "select",
                { value: mode, onChange: (event) => changeMode(event.target.value) },
                trainingModes.map(([value, label]) => h("option", { key: value, value }, label))
              )
            ),
            mode === "grupa" &&
              h(
                Field,
                { label: "Grupa" },
                h(
                  "select",
                  { value: group, onChange: (event) => changeGroup(event.target.value) },
                  groups.map((item) => h("option", { key: item, value: item }, item))
                )
              )
          ),
          mode === "mixt" &&
            h(
              "div",
              { className: "panel attendance-v2-mixed-groups" },
              h(
                "div",
                { className: "attendance-v2-mixed-groups-copy" },
                h("strong", null, "Ce grupe se antreneaza impreuna?"),
                h("p", null, "Alege grupele participante. Copiii lor vor intra automat intr-o singura prezenta.")
              ),
              h(
                "div",
                { className: "attendance-v2-mixed-group-buttons", "aria-label": "Grupe participante" },
                groups.map((item) => {
                  const isSelected = selectedMixedGroups.includes(item);

                  return h(
                    "button",
                    {
                      key: item,
                      type: "button",
                      className: isSelected ? "selected" : "",
                      "aria-pressed": isSelected,
                      onClick: () => toggleMixedGroup(item)
                    },
                    item,
                    h("span", null, activeAthletes.filter((athlete) => athlete.group === item).length)
                  );
                })
              ),
              h(
                "small",
                { className: selectedMixedGroups.length ? "attendance-v2-mixed-selection ready" : "attendance-v2-mixed-selection" },
                selectedMixedGroups.length
                  ? `Grupe selectate: ${selectedMixedGroups.join(" + ")}`
                  : "Nu ai selectat inca nicio grupa."
              )
            ),
          h(
            "div",
            { className: "attendance-v2-summary" },
            h("article", { className: "present" }, h("span", null, "Prezenti"), h("strong", null, counts.present)),
            h("article", { className: "absent" }, h("span", null, "Absenti"), h("strong", null, counts.absent)),
            h("article", { className: "excused" }, h("span", null, "Invoiti"), h("strong", null, counts.excused)),
            h("article", { className: "injured" }, h("span", null, "Accidentati"), h("strong", null, counts.injured)),
            h("article", { className: unmarkedCount ? "unmarked attention" : "unmarked" }, h("span", null, "Nemarcati"), h("strong", null, unmarkedCount))
          ),
          h(
            "div",
            { className: "panel attendance-v2-bulk" },
            h(
              "div",
              null,
              h("strong", null, "Scurtaturi optionale"),
              h("p", null, "„Toti prezenti” completeaza doar marcajele de pe ecran. Verifica sala si salveaza separat.")
            ),
            h(
              "div",
              { className: "row-actions" },
              h("button", { type: "button", className: "secondary", onClick: markAllPresent, disabled: !shownAthletes.length }, "Marcheaza toti prezenti"),
              h("button", { type: "button", onClick: clearAllMarks, disabled: !markedCount }, "Sterge marcajele")
            )
          ),
          canPickAthletes &&
            h(
              "div",
              { className: "panel stack attendance-v2-picker" },
              h(
                "div",
                { className: "toolbar" },
                h(
                  "div",
                  { className: "attendance-v2-picker-copy" },
                  h("strong", null, mode === "mixt" ? "Exceptii la grupele selectate" : "Alege sportivii pentru antrenamentul individual"),
                  mode === "mixt" && h("small", null, "Daca este nevoie, poti adauga separat un copil din alta grupa.")
                ),
                h(
                  "div",
                  { className: "row-actions" },
                  h("button", { type: "button", onClick: selectAllAvailable, disabled: !availableAthletes.length }, "Selecteaza toti"),
                  h("button", { type: "button", onClick: clearSelectedAthletes, disabled: !selectedAvailableIds.length }, "Goleste"),
                  h(
                    "button",
                    { type: "button", className: "primary", onClick: addSelectedAthletes, disabled: !selectedAvailableIds.length },
                    "Adauga selectatii" + (selectedAvailableIds.length ? ` (${selectedAvailableIds.length})` : "")
                  )
                )
              ),
              availableAthletes.length
                ? h(
                    "ul",
                    { className: "clean-list", style: { maxHeight: "280px", overflow: "auto" } },
                    availableAthletes.map((athlete) =>
                      h(
                        "li",
                        { key: athlete.id },
                        h(
                          "label",
                          { style: { display: "flex", alignItems: "center", gap: "10px", width: "100%", cursor: "pointer" } },
                          h("input", {
                            type: "checkbox",
                            checked: selectedAthleteIds.includes(athlete.id),
                            onChange: () => toggleSelectedAthlete(athlete.id),
                            style: { width: "auto", minHeight: "auto" }
                          }),
                          h("span", null, h("strong", null, athleteName(athlete)), h("small", null, athlete.group || "Fara grupa"))
                        )
                      )
                    )
                  )
                : h(EmptyState, { title: "Nu mai sunt sportivi de adaugat.", text: "Toti sportivii disponibili sunt deja in antrenament." })
            ),
          shownAthletes.length
            ? h(
                "div",
                { className: "attendance-v2-athletes" },
                shownAthletes.map((athlete) => {
                  const canRemove = mode !== "grupa" || athlete.group !== group;
                  const currentStatus = attendance[athlete.id] || "";

                  return h(
                    "article",
                    { key: athlete.id, className: `attendance-v2-athlete ${currentStatus ? "marked " + currentStatus : "not-marked"}` },
                    h(
                      "header",
                      null,
                      h("div", null, h("strong", null, athleteName(athlete)), h("small", null, athlete.group || "Fara grupa")),
                      currentStatus
                        ? h("span", { className: "attendance-v2-current" }, currentStatus)
                        : h("span", { className: "attendance-v2-current empty" }, "Nemarcat"),
                      canRemove && h("button", { type: "button", className: "attendance-v2-remove", onClick: () => removeAthlete(athlete.id) }, "Scoate")
                    ),
                    h(
                      "div",
                      { className: "attendance-v2-statuses" },
                      attendanceStatuses.map((status) =>
                        h(
                          "button",
                          {
                            key: status,
                            type: "button",
                            className: currentStatus === status ? `selected ${status}` : status,
                            onClick: () => updateAttendance(athlete.id, status)
                          },
                          status
                        )
                      )
                    )
                  );
                })
              )
            : h(EmptyState, {
                title: mode === "grupa" ? "Nu sunt sportivi pentru acest antrenament." : "Nu ai ales sportivi pentru acest antrenament.",
                text: mode === "grupa" ? "Alege alta grupa sau foloseste antrenament mixt." : "Bifeaza sportivii si apasa Adauga selectatii."
              }),
          h(
            "div",
            { className: `attendance-v2-save ${unmarkedCount ? "has-unmarked" : "ready"}` },
            h(
              "div",
              null,
              savedNotice
                ? h("strong", { className: "attendance-v2-saved" }, "Prezenta a fost salvata.")
                : h(
                    "strong",
                    null,
                    unmarkedCount
                      ? `${unmarkedCount} ${unmarkedCount === 1 ? "sportiv este" : "sportivi sunt"} inca ${unmarkedCount === 1 ? "nemarcat" : "nemarcati"}.`
                      : "Toti sportivii au fost verificati."
                  ),
              h("small", null, selectedTraining ? "Editezi o prezenta salvata. Modificarile se aplica doar dupa salvare." : "Este un antrenament nou. Nimic nu este salvat inca.")
            ),
            h(
              "button",
              { type: "button", className: "primary", onClick: saveTraining, disabled: !shownAthletes.length || unmarkedCount > 0 },
              selectedTraining ? "Salveaza modificarile" : `Salveaza prezenta (${markedCount}/${shownAthletes.length})`
            )
          )
        ),
      screen === "istoric" &&
        (historyMonths.length
          ? h(
              "div",
              { className: "attendance-v2-history-months" },
              historyMonths.map((month) => {
                const isOpen = activeHistoryMonth === month.key;

                return h(
                  "section",
                  { key: month.key, className: `attendance-v2-history-month ${isOpen ? "open" : ""}` },
                  h(
                    "button",
                    {
                      type: "button",
                      className: "attendance-v2-history-month-toggle",
                      "aria-expanded": isOpen,
                      onClick: () =>
                        setOpenHistoryMonth((current) => {
                          const effectiveCurrent = current === null ? historyMonths[0]?.key || "" : current;
                          return effectiveCurrent === month.key ? "" : month.key;
                        })
                    },
                    h("span", null, h("strong", null, month.label), h("small", null, `${month.rows.length} ${month.rows.length === 1 ? "antrenament" : "antrenamente"}`)),
                    h("span", { className: "attendance-v2-history-month-action" }, isOpen ? "Ascunde" : "Deschide")
                  ),
                  isOpen &&
                    h(
                      "div",
                      { className: "attendance-v2-history" },
                      month.rows.map((training) => {
                        const historyCounts = countStatuses(training.attendance);
                        const label = displayTrainingLabel(training, activeAthletes);

                        return h(
                          "article",
                          { key: training.id || `${training.date}-${training.group || "antrenament"}`, className: "attendance-v2-history-card" },
                          h(
                            "header",
                            null,
                            h("div", null, h("strong", null, formatDate(training.date)), h("small", null, label)),
                            h(
                              "div",
                              { className: "row-actions" },
                              h("button", { type: "button", onClick: () => openHistory(training) }, "Deschide"),
                              h("button", { type: "button", className: "danger", onClick: () => deleteHistory(training) }, "Sterge")
                            )
                          ),
                          h(
                            "div",
                            { className: "attendance-v2-history-counts" },
                            h("span", null, "Prezenti ", h("strong", null, historyCounts.present)),
                            h("span", null, "Absenti ", h("strong", null, historyCounts.absent)),
                            h("span", null, "Invoiti ", h("strong", null, historyCounts.excused)),
                            h("span", null, "Accidentati ", h("strong", null, historyCounts.injured))
                          )
                        );
                      })
                    )
                );
              })
            )
          : h(EmptyState, { title: "Nu exista prezente salvate.", text: "Dupa prima salvare, antrenamentul va aparea aici." }))
    );
  }

  window.AttendanceView = AttendanceView;
  window.CSHeartComponents = {
    ...window.CSHeartComponents,
    AttendanceView
  };
})();
