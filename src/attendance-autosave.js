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
    const selectedTraining = trainings.find((training) => training.date === date && training.group === group);
    const groupAthletes = athletes.filter((athlete) => athlete.group === group && athlete.active);
    const [attendance, setAttendance] = React.useState({});

    React.useEffect(() => {
      const next = {};

      groupAthletes.forEach((athlete) => {
        next[athlete.id] = selectedTraining?.attendance?.[athlete.id] || "prezent";
      });

      setAttendance(next);
    }, [date, group, selectedTraining?.id, athletes.length]);

    function updateAttendance(athleteId, status) {
      const nextAttendance = { ...attendance, [athleteId]: status };

      setAttendance(nextAttendance);
      onSaveTraining({
        id: selectedTraining?.id,
        date,
        group,
        attendance: nextAttendance
      });
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
        { className: "table-wrap" },
        h(
          "table",
          null,
          h("thead", null, h("tr", null, h("th", null, "Sportiv"), h("th", null, "Status prezen\u021b\u0103"))),
          h(
            "tbody",
            null,
            groupAthletes.map((athlete) =>
              h(
                "tr",
                { key: athlete.id, className: attendance[athlete.id] === "prezent" ? "row-present" : "" },
                h("td", { "data-label": "Sportiv" }, h("strong", null, athleteName(athlete))),
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
              )
            )
          )
        )
      ),
      !groupAthletes.length &&
        h(EmptyState, {
          title: "Nu sunt sportivi activi \u00een aceast\u0103 grup\u0103.",
          text: "Alege alt\u0103 grup\u0103 sau activeaz\u0103 sportivi din lista de administrare."
        })
    );
  }

  window.AttendanceView = AttendanceView;
  window.CSHeartComponents = {
    ...window.CSHeartComponents,
    AttendanceView
  };
})();
