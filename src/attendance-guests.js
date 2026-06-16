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

  function EmptyState({ title, text }) {
    return h("div", { className: "empty-state" }, h("strong", null, title), h("p", null, text));
  }

  function trainingRecordType(mode) {
    return mode === "individual" ? "individual" : "grupa";
  }

  function savedTrainingType(training) {
    return training?.type || "grupa";
  }

  function findTraining(trainings, date, mode, group) {
    const recordType = trainingRecordType(mode);

    return trainings.find((training) => {
      if (training.date !== date || savedTrainingType(training) !== recordType) return false;
      if (recordType === "individual") return training.group === "Individual" || !training.group;
      return training.group === group;
    });
  }

  function AttendanceView({ athletes, trainings, onSaveTraining }) {
    const groups = getGroups(athletes);
    const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
    const [mode, setMode] = React.useState("grupa");
    const [group, setGroup] = React.useState(groups[0] || "");
    const [pickerId, setPickerId] = React.useState("");
    const selectedTraining = findTraining(trainings, date, mode, group);
    const activeAthletes = athletes.filter((athlete) => athlete.active).sort(compareAthletes);
    const groupAthletes = activeAthletes.filter((athlete) => athlete.group === group);
    const [attendance, setAttendance] = React.useState({});
    const attendanceIds = new Set(Object.keys(attendance));
    const shownAthletes =
      mode === "individual"
        ? activeAthletes.filter((athlete) => attendanceIds.has(athlete.id))
        : activeAthletes.filter((athlete) => athlete.group === group || attendanceIds.has(athlete.id));
    const shownIds = new Set(shownAthletes.map((athlete) => athlete.id));
    const canPickAthletes = mode !== "grupa";
    const availableAthletes = activeAthletes.filter((athlete) => {
      if (shownIds.has(athlete.id)) return false;
      if (mode === "mixt") return athlete.group !== group;
      return mode === "individual";
    });

    React.useEffect(() => {
      const savedAttendance = selectedTraining?.attendance || {};
      const next = {};

      if (mode === "individual") {
        Object.keys(savedAttendance).forEach((athleteId) => {
          if (activeAthletes.some((athlete) => athlete.id === athleteId)) {
            next[athleteId] = savedAttendance[athleteId] || "prezent";
          }
        });
      } else {
        groupAthletes.forEach((athlete) => {
          next[athlete.id] = savedAttendance[athlete.id] || "prezent";
        });

        Object.keys(savedAttendance).forEach((athleteId) => {
          const athlete = activeAthletes.find((item) => item.id === athleteId);

          if (athlete && athlete.group !== group) {
            next[athleteId] = savedAttendance[athleteId] || "prezent";
          }
        });
      }

      setAttendance(next);
      setPickerId("");
    }, [date, group, mode, selectedTraining?.id, athletes.length]);

    function save(nextAttendance) {
      const cleanedAttendance = Object.fromEntries(
        Object.entries(nextAttendance).filter(([, status]) => attendanceStatuses.includes(status))
      );

      setAttendance(cleanedAttendance);
      onSaveTraining({
        id: selectedTraining?.id,
        date,
        group: mode === "individual" ? "Individual" : group,
        type: trainingRecordType(mode),
        attendance: cleanedAttendance
      });
    }

    function updateAttendance(athleteId, status) {
      save({ ...attendance, [athleteId]: status });
    }

    function addAthlete() {
      if (!pickerId) return;
      save({ ...attendance, [pickerId]: "prezent" });
      setPickerId("");
    }

    function removeAthlete(athleteId) {
      const nextAttendance = { ...attendance };

      delete nextAttendance[athleteId];
      save(nextAttendance);
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
        mode !== "individual" &&
          h(
            Field,
            { label: "Grupa" },
            h(
              "select",
              { value: group, onChange: (event) => setGroup(event.target.value) },
              groups.map((item) => h("option", { key: item, value: item }, item))
            )
          )
      ),
      canPickAthletes &&
        h(
          "div",
          { className: "panel compact-grid" },
          h(
            Field,
            { label: mode === "mixt" ? "Sportiv din alta grupa" : "Sportiv" },
            h(
              "select",
              { value: pickerId, onChange: (event) => setPickerId(event.target.value), disabled: !availableAthletes.length },
              h("option", { value: "" }, availableAthletes.length ? "Alege sportivul" : "Nu sunt sportivi disponibili"),
              availableAthletes.map((athlete) =>
                h("option", { key: athlete.id, value: athlete.id }, athleteName(athlete) + " / " + athlete.group)
              )
            )
          ),
          h("button", { type: "button", className: "primary align-end", onClick: addAthlete, disabled: !pickerId }, "Adauga la antrenament")
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
              const canRemove = mode === "individual" || athlete.group !== group;

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
      !shownAthletes.length &&
        h(EmptyState, {
          title: mode === "individual" ? "Nu ai ales sportivi pentru acest antrenament." : "Nu sunt sportivi pentru acest antrenament.",
          text: mode === "individual" ? "Adauga sportivii care fac antrenament individual." : "Alege alta grupa sau foloseste antrenament mixt."
        })
    );
  }

  window.AttendanceView = AttendanceView;
  window.CSHeartComponents = {
    ...window.CSHeartComponents,
    AttendanceView
  };
})();
