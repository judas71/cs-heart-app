(function () {
  const h = React.createElement;
  const attendanceStatuses = ["prezent", "absent", "\u00eenvoit", "accidentat"];

  function getGroups(athletes) {
    return [...new Set(athletes.map((athlete) => athlete.group).filter(Boolean))].sort();
  }

  function athleteName(athlete) {
    return `${athlete.lastName} ${athlete.firstName}`;
  }

  function Field({ label, children }) {
    return h("label", { className: "field" }, h("span", null, label), children);
  }

  function EmptyState({ title, text }) {
    return h("div", { className: "empty-state" }, h("strong", null, title), h("p", null, text));
  }

  function AttendanceView({ athletes, trainings, onSaveTraining }) {
    const groups = getGroups(athletes);
    const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
    const [group, setGroup] = React.useState(groups[0] || "");
    const [guestId, setGuestId] = React.useState("");
    const selectedTraining = trainings.find((training) => training.date === date && training.group === group);
    const groupAthletes = athletes.filter((athlete) => athlete.group === group && athlete.active);
    const guestAthletes = athletes.filter(
      (athlete) =>
        athlete.group !== group &&
        Object.prototype.hasOwnProperty.call(selectedTraining?.attendance || {}, athlete.id)
    );
    const shownAthletes = [...groupAthletes, ...guestAthletes];
    const shownIds = new Set(shownAthletes.map((athlete) => athlete.id));
    const availableGuests = athletes
      .filter((athlete) => athlete.active && athlete.group !== group && !shownIds.has(athlete.id))
      .sort((first, second) => athleteName(first).localeCompare(athleteName(second), "ro"));
    const [attendance, setAttendance] = React.useState({});

    React.useEffect(() => {
      const next = {};

      groupAthletes.forEach((athlete) => {
        next[athlete.id] = selectedTraining?.attendance?.[athlete.id] || "prezent";
      });

      guestAthletes.forEach((athlete) => {
        next[athlete.id] = selectedTraining.attendance[athlete.id] || "prezent";
      });

      setAttendance(next);
      setGuestId("");
    }, [date, group, selectedTraining?.id, athletes.length]);

    function save(nextAttendance) {
      setAttendance(nextAttendance);
      onSaveTraining({
        id: selectedTraining?.id,
        date,
        group,
        attendance: nextAttendance
      });
    }

    function updateAttendance(athleteId, status) {
      save({ ...attendance, [athleteId]: status });
    }

    function addGuest() {
      if (!guestId) return;
      save({ ...attendance, [guestId]: "prezent" });
      setGuestId("");
    }

    function removeGuest(athleteId) {
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
        h(Field, { label: "Data antrenamentului" }, h("input", { type: "date", value: date, onChange: (e) => setDate(e.target.value) })),
        h(
          Field,
          { label: "Grupa" },
          h(
            "select",
            { value: group, onChange: (e) => setGroup(e.target.value) },
            groups.map((item) => h("option", { key: item, value: item }, item))
          )
        )
      ),
      h(
        "div",
        { className: "panel compact-grid" },
        h(
          Field,
          { label: "Sportiv din alta grupa" },
          h(
            "select",
            { value: guestId, onChange: (e) => setGuestId(e.target.value), disabled: !availableGuests.length },
            h("option", { value: "" }, availableGuests.length ? "Alege sportivul" : "Nu sunt sportivi disponibili"),
            availableGuests.map((athlete) =>
              h("option", { key: athlete.id, value: athlete.id }, athleteName(athlete) + " / " + athlete.group)
            )
          )
        ),
        h("button", { type: "button", className: "primary align-end", onClick: addGuest, disabled: !guestId }, "Adauga la antrenament")
      ),
      h(
        "div",
        { className: "table-wrap" },
        h(
          "table",
          null,
          h("thead", null, h("tr", null, h("th", null, "Sportiv"), h("th", null, "Status prezen\u021b\u0103"))),
          h(
            "tbody",
            null,
            shownAthletes.map((athlete) => {
              const isGuest = athlete.group !== group;

              return h(
                "tr",
                { key: athlete.id, className: attendance[athlete.id] === "prezent" ? "row-present" : "" },
                h(
                  "td",
                  { "data-label": "Sportiv" },
                  h("strong", null, athleteName(athlete)),
                  isGuest && h("small", null, "Invitat din grupa " + athlete.group),
                  isGuest &&
                    h(
                      "button",
                      { type: "button", onClick: () => removeGuest(athlete.id), style: { marginTop: "8px", minHeight: "34px", padding: "6px 10px" } },
                      "Elimina din antrenament"
                    )
                ),
                h(
                  "td",
                  { "data-label": "Status prezen\u021b\u0103" },
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
          title: "Nu sunt sportivi pentru acest antrenament.",
          text: "Alege alt\u0103 grup\u0103 sau adaug\u0103 un sportiv din alt\u0103 grup\u0103."
        })
    );
  }

  window.AttendanceView = AttendanceView;
  window.CSHeartComponents = {
    ...window.CSHeartComponents,
    AttendanceView
  };
})();
