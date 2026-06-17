(function () {
  const h = React.createElement;
  const attendanceStatuses = ["prezent", "absent", "\u00eenvoit", "accidentat"];
  const trainingModes = [
    ["grupa", "Grupa"],
    ["mixt", "Mixt"],
    ["individual", "Individual"]
  ];

  function getGroups(athletes) {
    return [...new Set(athletes.map((athlete) => athlete.group).filter(Boolean))].sort();
  }

  function athleteName(athlete) {
    return `${athlete.lastName} ${athlete.firstName}`;
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

  function AttendanceView({ athletes, trainings, onSaveTraining, onDeleteTraining }) {
    const groups = getGroups(athletes);
    const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
    const [mode, setMode] = React.useState("grupa");
    const [group, setGroup] = React.useState(groups[0] || "");
    const [selectedAthleteIds, setSelectedAthleteIds] = React.useState([]);
    const activeAthletes = athletes.filter((athlete) => athlete.active).sort(compareAthletes);
    const groupAthletes = activeAthletes.filter((athlete) => athlete.group === group);
    const selectedTraining = findTraining(trainings, date, mode, group, activeAthletes);
    const [attendance, setAttendance] = React.useState({});
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

    React.useEffect(() => {
      const savedAttendance = selectedTraining?.attendance || {};
      const next = {};

      if (mode === "grupa") {
        groupAthletes.forEach((athlete) => {
          next[athlete.id] = savedAttendance[athlete.id] || "prezent";
        });

        Object.keys(savedAttendance).forEach((athleteId) => {
          const athlete = activeAthletes.find((item) => item.id === athleteId);

          if (athlete && athlete.group !== group) {
            next[athleteId] = savedAttendance[athleteId] || "prezent";
          }
        });
      } else {
        Object.keys(savedAttendance).forEach((athleteId) => {
          if (activeAthletes.some((athlete) => athlete.id === athleteId)) {
            next[athleteId] = savedAttendance[athleteId] || "prezent";
          }
        });
      }

      setAttendance(next);
      setSelectedAthleteIds([]);
    }, [date, group, mode, selectedTraining?.id, athletes.length]);

    const historyRows = [...trainings]
      .filter((training) => training.date === date && Object.keys(training.attendance || {}).length > 0)
      .sort((first, second) => String(second.date || "").localeCompare(String(first.date || "")));

    function save(nextAttendance) {
      const cleanedAttendance = Object.fromEntries(
        Object.entries(nextAttendance).filter(([, status]) => attendanceStatuses.includes(status))
      );

      setAttendance(cleanedAttendance);
      onSaveTraining({
        id: selectedTraining?.id,
        date,
        group: mode === "individual" ? "Individual" : mode === "mixt" ? "Mixt" : group,
        type: trainingRecordType(mode),
        attendance: cleanedAttendance
      });
    }

    function confirmTraining() {
      if (!shownAthletes.length) return;
      save(attendance);
    }

    function updateAttendance(athleteId, status) {
      save({ ...attendance, [athleteId]: status });
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
        nextAttendance[athleteId] = nextAttendance[athleteId] || "prezent";
      });

      save(nextAttendance);
      setSelectedAthleteIds([]);
    }

    function removeAthlete(athleteId) {
      const nextAttendance = { ...attendance };

      delete nextAttendance[athleteId];
      save(nextAttendance);
    }

    function openHistory(training) {
      const type = displayTrainingType(training, activeAthletes);

      setDate(training.date);

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
      { className: "stack" },
      h(
        "div",
        { className: "panel compact-grid" },
        h(Field, { label: "Data antrenamentului" }, h("input", { type: "date", value: date, onChange: (event) => setDate(event.target.value) })),
        h(
          Field,
          { label: "Tip antrenament" },
          h(
            "select",
            { value: mode, onChange: (event) => setMode(event.target.value) },
            trainingModes.map(([value, label]) => h("option", { key: value, value }, label))
          )
        ),
        mode === "grupa" &&
          h(
            Field,
            { label: "Grupa" },
            h(
              "select",
              { value: group, onChange: (event) => setGroup(event.target.value) },
              groups.map((item) => h("option", { key: item, value: item }, item))
            )
          ),
        h("button", { type: "button", className: "primary align-end", onClick: confirmTraining, disabled: !shownAthletes.length }, "Confirma prezenta")
      ),
      canPickAthletes &&
        h(
          "div",
          { className: "panel stack" },
          h(
            "div",
            { className: "toolbar" },
            h("strong", null, mode === "mixt" ? "Alege sportivii pentru antrenamentul mixt" : "Alege sportivii pentru antrenamentul individual"),
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
      h(
        "div",
        { className: "table-wrap" },
        h(
          "table",
          null,
          h("thead", null, h("tr", null, h("th", null, "Sportiv"), h("th", null, "Status prezenta"))),
          h(
            "tbody",
            null,
            shownAthletes.map((athlete) => {
              const canRemove = mode !== "grupa" || athlete.group !== group;

              return h(
                "tr",
                { key: athlete.id, className: attendance[athlete.id] === "prezent" ? "row-present" : "" },
                h(
                  "td",
                  { "data-label": "Sportiv" },
                  h("strong", null, athleteName(athlete)),
                  h("small", null, athlete.group || "Fara grupa"),
                  canRemove &&
                    h(
                      "button",
                      { type: "button", onClick: () => removeAthlete(athlete.id), style: { marginTop: "8px", minHeight: "34px", padding: "6px 10px" } },
                      "Scoate din antrenament"
                    )
                ),
                h(
                  "td",
                  { "data-label": "Status prezenta" },
                  h(
                    "div",
                    { className: "segmented" },
                    attendanceStatuses.map((status) =>
                      h(
                        "button",
                        {
                          key: status,
                          type: "button",
                          className: attendance[athlete.id] === status ? "selected" : "",
                          onClick: () => updateAttendance(athlete.id, status)
                        },
                        status
                      )
                    )
                  )
                )
              );
            })
          )
        )
      ),
      h(
        "div",
        { className: "panel" },
        h("button", { type: "button", className: "primary", onClick: confirmTraining, disabled: !shownAthletes.length }, "Confirma prezenta")
      ),
      !shownAthletes.length &&
        h(EmptyState, {
          title: mode === "grupa" ? "Nu sunt sportivi pentru acest antrenament." : "Nu ai ales sportivi pentru acest antrenament.",
          text: mode === "grupa" ? "Alege alta grupa sau foloseste antrenament mixt." : "Bifeaza sportivii si apasa Adauga selectatii."
        }),
      h(
        "div",
        { className: "table-wrap" },
        h(
          "table",
          null,
          h("thead", null, h("tr", null, ["Istoric data aleasa", "Prezenti", "Absenti", "Invoiti", "Accidentati", ""].map((head) => h("th", { key: head }, head)))),
          h(
            "tbody",
            null,
            historyRows.map((training) => {
              const counts = countStatuses(training.attendance);
              const type = displayTrainingType(training, activeAthletes);
              const label = type === "Grupa" ? `Grupa ${training.group || "-"}` : type;

              return h(
                "tr",
                { key: training.id || `${training.date}-${training.group || "antrenament"}` },
                h("td", { "data-label": "Istoric data aleasa" }, h("strong", null, formatDate(training.date)), h("small", null, label)),
                h("td", { "data-label": "Prezenti" }, counts.present),
                h("td", { "data-label": "Absenti" }, counts.absent),
                h("td", { "data-label": "Invoiti" }, counts.excused),
                h("td", { "data-label": "Accidentati" }, counts.injured),
                h(
                  "td",
                  { className: "row-actions" },
                  h("button", { type: "button", onClick: () => openHistory(training) }, "Deschide"),
                  h("button", { type: "button", className: "danger", onClick: () => deleteHistory(training) }, "Sterge")
                )
              );
            })
          )
        ),
        !historyRows.length &&
          h(EmptyState, {
            title: "Nu exista antrenamente salvate in data aleasa.",
            text: "Alege alta data sau confirma prezenta ca sa apara aici."
          })
      )
    );
  }

  window.AttendanceView = AttendanceView;
  window.CSHeartComponents = {
    ...window.CSHeartComponents,
    AttendanceView
  };
})();
