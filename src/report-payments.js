(function () {
  const h = React.createElement;

  function athleteName(athlete) {
    return `${athlete.lastName} ${athlete.firstName}`;
  }

  function formatMoney(value) {
    return `${Number(value || 0).toLocaleString("ro-RO")} lei`;
  }

  function getGroups(athletes) {
    return [...new Set(athletes.map((athlete) => athlete.group).filter(Boolean))].sort();
  }

  function getMonthRange(startMonth, endMonth) {
    if (!startMonth || !endMonth || startMonth >= endMonth) return [];

    const months = [];
    const date = new Date(startMonth + "-01");
    const endDate = new Date(endMonth + "-01");

    while (date < endDate) {
      months.push(date.toISOString().slice(0, 7));
      date.setMonth(date.getMonth() + 1);
    }

    return months;
  }

  function getFeeForMonth(fees, athleteId, month) {
    return fees.find((fee) => fee.athleteId === athleteId && fee.month === month);
  }

  function getMonthlyDue(athlete, fee) {
    return Number(fee?.amountDue ?? athlete.feeDue ?? 200);
  }

  function getPreviousBalance(fees, athlete, month) {
    return getMonthRange(athlete.joinMonth, month).reduce((sum, itemMonth) => {
      const fee = getFeeForMonth(fees, athlete.id, itemMonth);
      const due = getMonthlyDue(athlete, fee);
      const paid = Number(fee?.amountPaid || 0);

      return sum + Math.max(due - paid, 0);
    }, 0);
  }

  function getOutstandingAmount(fee, previousBalance, fallbackDue) {
    const amountDue = Number(fee?.amountDue ?? fallbackDue ?? 0);
    const amountPaid = Number(fee?.amountPaid || 0);

    return Math.max(amountDue + previousBalance - amountPaid, 0);
  }

  function Field({ label, children }) {
    return h("label", { className: "field" }, h("span", null, label), children);
  }

  function EmptyState({ title, text }) {
    return h("div", { className: "empty-state" }, h("strong", null, title), h("p", null, text));
  }

  function ReportsView({ athletes, trainings, fees }) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const groups = getGroups(athletes);
    const [group, setGroup] = React.useState("toate");
    const [month, setMonth] = React.useState(currentMonth);
    const [reportType, setReportType] = React.useState("toate");

    const athletesInFilter = athletes.filter(
      (athlete) =>
        (group === "toate" || athlete.group === group) &&
        (!athlete.joinMonth || athlete.joinMonth <= month)
    );

    const debtorRows = athletesInFilter
      .map((athlete) => {
        const fee = getFeeForMonth(fees, athlete.id, month);
        const previousBalance = getPreviousBalance(fees, athlete, month);
        const outstanding = getOutstandingAmount(fee, previousBalance, athlete.feeDue ?? 200);

        return { athlete, outstanding };
      })
      .filter((row) => row.outstanding > 0);

    const collectedFees = fees.filter(
      (fee) =>
        fee.month === month &&
        Number(fee.amountPaid || 0) > 0 &&
        athletesInFilter.some((athlete) => athlete.id === fee.athleteId)
    );

    const cashRows = collectedFees.filter((fee) => fee.method === "cash");
    const transferRows = collectedFees.filter((fee) => fee.method === "transfer");
    const totalCollected = collectedFees.reduce((sum, fee) => sum + Number(fee.amountPaid || 0), 0);
    const totalCash = cashRows.reduce((sum, fee) => sum + Number(fee.amountPaid || 0), 0);
    const totalTransfer = transferRows.reduce((sum, fee) => sum + Number(fee.amountPaid || 0), 0);

    const attendanceRows = athletesInFilter.map((athlete) => {
      const entries = trainings.filter((training) => training.attendance?.[athlete.id] && training.date.startsWith(month));
      const present = entries.filter((training) => training.attendance[athlete.id] === "prezent").length;
      return { athlete, total: entries.length, present };
    });

    const lowAttendanceRows = attendanceRows.filter((row) => row.total > 0 && row.present / row.total < 0.5);
    const observationRows = athletesInFilter.filter((athlete) => athlete.notes && athlete.notes.trim());

    function feeAthleteName(fee) {
      const athlete = athletes.find((item) => item.id === fee.athleteId);
      return athlete ? athleteName(athlete) : "Sportiv necunoscut";
    }

    function feeKey(fee) {
      return fee.id || `${fee.athleteId}-${fee.month}-${fee.method}-${fee.amountPaid}`;
    }

    function PaymentRows({ title, rows, emptyText }) {
      const subtotal = rows.reduce((sum, fee) => sum + Number(fee.amountPaid || 0), 0);

      return h(
        "div",
        { style: { display: "grid", gap: "8px" } },
        h(
          "h3",
          { style: { margin: "4px 0 0", color: "#66727a", fontSize: "0.86rem", textTransform: "uppercase" } },
          `${title}: ${formatMoney(subtotal)}`
        ),
        rows.length
          ? h(
              "ul",
              { className: "clean-list" },
              rows.map((fee) =>
                h(
                  "li",
                  { key: feeKey(fee) },
                  h(
                    "span",
                    null,
                    feeAthleteName(fee),
                    h(
                      "small",
                      { style: { display: "block", marginTop: "3px", color: "#66727a", fontSize: "0.78rem" } },
                      fee.paymentDate ? `Data platii: ${fee.paymentDate}` : "Fara data de plata"
                    )
                  ),
                  h("strong", null, formatMoney(fee.amountPaid))
                )
              )
            )
          : h("p", { style: { margin: 0, color: "#66727a" } }, emptyText)
      );
    }

    function PaymentsSummary() {
      return h(
        "div",
        { style: { display: "grid", gap: "12px" } },
        h(
          "div",
          { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", borderBottom: "1px solid #d9e0e5", paddingBottom: "10px" } },
          h("span", { style: { color: "#66727a", fontWeight: 800, textTransform: "uppercase", fontSize: "0.86rem" } }, "Total luna"),
          h("strong", null, formatMoney(totalCollected))
        ),
        h(PaymentRows, { title: "Cash", rows: cashRows, emptyText: "Nu exista incasari cash." }),
        h(PaymentRows, { title: "Transfer", rows: transferRows, emptyText: "Nu exista incasari prin transfer." })
      );
    }

    return h(
      "section",
      { className: "stack" },
      h(
        "div",
        { className: "panel compact-grid" },
        h(
          Field,
          { label: "Grupa" },
          h(
            "select",
            { value: group, onChange: (e) => setGroup(e.target.value) },
            h("option", { value: "toate" }, "Toate grupele"),
            groups.map((item) => h("option", { key: item, value: item }, item))
          )
        ),
        h(Field, { label: "Luna" }, h("input", { type: "month", value: month, onChange: (e) => setMonth(e.target.value) }))
      ),
      h(
        Field,
        { label: "Tip raport" },
        h(
          "select",
          { value: reportType, onChange: (e) => setReportType(e.target.value) },
          h("option", { value: "toate" }, "Toate"),
          h("option", { value: "restantieri" }, "Restantieri"),
          h("option", { value: "prezentaSlaba" }, "Prezenta sub 50%"),
          h("option", { value: "observatii" }, "Cu observatii"),
          h("option", { value: "cash" }, "Doar cash"),
          h("option", { value: "transfer" }, "Doar transfer")
        )
      ),
      h(
        "div",
        { className: "metrics" },
        h("div", null, h("span", null, "Restantieri"), h("strong", null, debtorRows.length)),
        h(
          "div",
          null,
          h("span", null, "Incasari luna"),
          h("strong", null, formatMoney(totalCollected)),
          h("div", { style: { fontSize: "14px", marginTop: "6px", color: "#111" } }, "Cash: " + formatMoney(totalCash) + " / Transfer: " + formatMoney(totalTransfer))
        ),
        h(
          "div",
          null,
          h("span", null, "Antrenamente"),
          h(
            "strong",
            null,
            trainings.filter((training) => training.date.startsWith(month) && (group === "toate" || training.group === group)).length
          )
        )
      ),
      h(
        "div",
        { className: "report-grid" },
        reportType === "restantieri" &&
          h(
            "div",
            { className: "report-block" },
            h("h2", null, "Restantieri"),
            debtorRows.length === 0
              ? h("p", null, "Nu exista restantieri.")
              : h(
                  "table",
                  { className: "table" },
                  h("thead", null, h("tr", null, h("th", null, "Sportiv"), h("th", null, "Grupa"), h("th", null, "Restanta"))),
                  h(
                    "tbody",
                    null,
                    debtorRows.map((row) =>
                      h(
                        "tr",
                        { key: row.athlete.id },
                        h("td", null, athleteName(row.athlete)),
                        h("td", null, row.athlete.group),
                        h("td", null, formatMoney(row.outstanding))
                      )
                    )
                  )
                )
          ),
        reportType === "prezentaSlaba" &&
          h(
            "div",
            { className: "report-block" },
            h("h2", null, "Sportivi cu prezenta sub 50%"),
            lowAttendanceRows.length
              ? h(
                  "ul",
                  { className: "clean-list" },
                  lowAttendanceRows.map(({ athlete, total, present }) =>
                    h("li", { key: athlete.id }, h("span", null, athleteName(athlete)), h("strong", null, `${present}/${total}`))
                  )
                )
              : h(EmptyState, {
                  title: "Nu exista sportivi sub 50%.",
                  text: "Toti sportivii au prezenta buna."
                })
          ),
        reportType === "toate" &&
          h(
            "div",
            { className: "report-block" },
            h("h2", null, "Sportivi restantieri"),
            debtorRows.length
              ? h(
                  "ul",
                  { className: "clean-list" },
                  debtorRows.map(({ athlete, outstanding }) =>
                    h("li", { key: athlete.id }, h("span", null, athleteName(athlete)), h("strong", null, formatMoney(outstanding)))
                  )
                )
              : h("p", null, "Nu exista restantieri.")
          ),
        reportType === "observatii" &&
          h(
            "div",
            { className: "report-block" },
            h("h2", null, "Sportivi cu observatii"),
            observationRows.length
              ? h(
                  "ul",
                  { className: "clean-list" },
                  observationRows.map((athlete) =>
                    h("li", { key: athlete.id }, h("span", null, athleteName(athlete)), h("strong", null, athlete.notes))
                  )
                )
              : h("p", null, "Nu exista observatii.")
          ),
        reportType === "cash" &&
          h(
            "div",
            { className: "report-block" },
            h("h2", null, "Incasari cash"),
            h(PaymentRows, { title: "Cash", rows: cashRows, emptyText: "Nu exista incasari cash." })
          ),
        reportType === "transfer" &&
          h(
            "div",
            { className: "report-block" },
            h("h2", null, "Incasari transfer"),
            h(PaymentRows, { title: "Transfer", rows: transferRows, emptyText: "Nu exista incasari prin transfer." })
          ),
        reportType === "toate" &&
          h(
            "div",
            { className: "report-block" },
            h("h2", null, "Prezente pe sportiv"),
            h(
              "ul",
              { className: "clean-list" },
              attendanceRows.map(({ athlete, present, total }) =>
                h("li", { key: athlete.id }, h("span", null, athleteName(athlete)), h("strong", null, `${present}/${total}`))
              )
            )
          ),
        reportType === "toate" &&
          h(
            "div",
            { className: "report-block" },
            h("h2", null, "Incasari pe luna"),
            collectedFees.length ? h(PaymentsSummary) : h("p", null, "Nu exista incasari.")
          )
      )
    );
  }

  window.ReportsView = ReportsView;
  window.CSHeartComponents = {
    ...window.CSHeartComponents,
    ReportsView
  };
})();
