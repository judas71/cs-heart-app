(function () {
  const h = React.createElement;

  const feeStatuses = ["neplătită", "plătită", "parțial plătită"];
  const paymentMethods = ["cash", "transfer"];

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
    return getMonthRange(athlete.joinMonth, month).reduce((balance, itemMonth) => {
      const fee = getFeeForMonth(fees, athlete.id, itemMonth);
      const due = getMonthlyDue(athlete, fee);
      const paid = Number(fee?.amountPaid || 0);

      return balance + due - paid;
    }, 0);
  }

  function getTotalToPay(fee, previousBalance, fallbackDue) {
    const amountDue = Number(fee?.amountDue ?? fallbackDue ?? 0);
    return Math.max(amountDue + previousBalance, 0);
  }

  function getBalanceAfterMonth(fee, previousBalance, fallbackDue) {
    const amountDue = Number(fee?.amountDue ?? fallbackDue ?? 0);
    const amountPaid = Number(fee?.amountPaid || 0);

    return previousBalance + amountDue - amountPaid;
  }

  function getOutstandingAmount(fee, previousBalance, fallbackDue) {
    const amountPaid = Number(fee?.amountPaid || 0);
    return Math.max(getTotalToPay(fee, previousBalance, fallbackDue) - amountPaid, 0);
  }

  function Field({ label, children }) {
    return h("label", { className: "field" }, h("span", null, label), children);
  }

  function EmptyState({ title, text }) {
    return h("div", { className: "empty-state" }, h("strong", null, title), h("p", null, text));
  }

  function BalanceCell({ previousBalance }) {
    const previousDebt = Math.max(previousBalance, 0);
    const previousCredit = Math.max(-previousBalance, 0);

    if (previousDebt > 0) {
      return h("strong", { className: "arrears" }, formatMoney(previousDebt));
    }

    if (previousCredit > 0) {
      return h("span", { className: "pill ok" }, "Avans " + formatMoney(previousCredit));
    }

    return "-";
  }

  function FeesView({ athletes, fees, onSaveFee, onResetMonth }) {
    const monthNow = new Date().toISOString().slice(0, 7);
    const [month, setMonth] = React.useState(monthNow);
    const [group, setGroup] = React.useState("toate");
    const groups = getGroups(athletes);
    const listedAthletes = athletes.filter((athlete) => {
      if (!athlete.active) return false;
      if (group !== "toate" && athlete.group !== group) return false;
      if (!athlete.joinMonth) return false;

      const athleteDate = new Date(athlete.joinMonth + "-01");
      const selectedDate = new Date(month + "-01");

      return athleteDate <= selectedDate;
    });
    const listedAthleteIds = listedAthletes.map((athlete) => athlete.id);
    const monthlyCollected = fees
      .filter((fee) => fee.month === month && listedAthleteIds.includes(fee.athleteId))
      .reduce((sum, fee) => sum + Number(fee.amountPaid || 0), 0);

    function getFee(athleteId) {
      const athlete = athletes.find((item) => item.id === athleteId);

      return getFeeForMonth(fees, athleteId, month) || {
        athleteId,
        month,
        status: "neplătită",
        amountDue: Number(athlete?.feeDue ?? 200),
        amountPaid: 0,
        paymentDate: "",
        method: "cash",
        notes: ""
      };
    }

    function updateFee(athleteId, field, value) {
      const fee = getFee(athleteId);
      onSaveFee({ ...fee, athleteId, month, [field]: value });
    }

    const monthlyOutstanding = listedAthletes.reduce((sum, athlete) => {
      const fee = getFee(athlete.id);
      const previousBalance = getPreviousBalance(fees, athlete, month);

      return sum + getOutstandingAmount(fee, previousBalance, athlete.feeDue ?? 200);
    }, 0);

    return h(
      "section",
      { className: "stack" },
      h(
        "div",
        { className: "panel compact-grid" },
        h(Field, { label: "Luna" }, h("input", { type: "month", value: month, onChange: (e) => setMonth(e.target.value) })),
        h(Field, { label: "Grupa" }, h("select", { value: group, onChange: (e) => setGroup(e.target.value) }, h("option", { value: "toate" }, "Toate grupele"), groups.map((item) => h("option", { key: item, value: item }, item)))),
        h("button", { className: "danger align-end", onClick: () => onResetMonth(month, listedAthleteIds), disabled: !listedAthletes.length }, "Reset luna")
      ),
      h(
        "div",
        { className: "metrics" },
        h("div", null, h("span", null, "Total incasari luna"), h("strong", null, formatMoney(monthlyCollected))),
        h("div", null, h("span", null, "De incasat total"), h("strong", null, formatMoney(monthlyOutstanding))),
        h(
          "div",
          null,
          h("span", null, "Impartire incasari"),
          h("strong", null, "60% = " + formatMoney(monthlyCollected * 0.6)),
          h("strong", null, "40% = " + formatMoney(monthlyCollected * 0.4))
        )
      ),
      h(
        "div",
        { className: "table-wrap wide" },
        h(
          "table",
          null,
          h("thead", null, h("tr", null, ["Sportiv", "Status", "Datorat", "Restanta / Avans", "Total", "Platit", "Data platii", "Metoda", "Observatii"].map((head) => h("th", { key: head }, head)))),
          h(
            "tbody",
            null,
            listedAthletes.map((athlete) => {
              const fee = getFee(athlete.id);
              const previousBalance = getPreviousBalance(fees, athlete, month);
              const totalToPay = getTotalToPay(fee, previousBalance, athlete.feeDue ?? 200);
              const outstanding = getOutstandingAmount(fee, previousBalance, athlete.feeDue ?? 200);
              const balanceAfterMonth = getBalanceAfterMonth(fee, previousBalance, athlete.feeDue ?? 200);
              const creditAfterMonth = Math.max(-balanceAfterMonth, 0);

              return h(
                "tr",
                { key: athlete.id, className: outstanding > 0 ? "row-unpaid" : "" },
                h(
                  "td",
                  { "data-label": "Sportiv" },
                  h("strong", null, athleteName(athlete)),
                  h("small", null, athlete.group + " / inscris: " + (athlete.joinMonth || "FARA LUNA"))
                ),
                h("td", { "data-label": "Status" }, h("select", { value: fee.status, onChange: (e) => updateFee(athlete.id, "status", e.target.value) }, feeStatuses.map((status) => h("option", { key: status, value: status }, status)))),
                h("td", { "data-label": "Datorat" }, h("input", { type: "number", min: "0", value: fee.amountDue, onChange: (e) => updateFee(athlete.id, "amountDue", Number(e.target.value)) })),
                h("td", { "data-label": "Restanta / Avans" }, h(BalanceCell, { previousBalance })),
                h("td", { "data-label": "Total" }, h("strong", null, formatMoney(totalToPay)), creditAfterMonth > 0 && h("small", null, "Avans ramas: " + formatMoney(creditAfterMonth))),
                h("td", { "data-label": "Platit" }, h("input", { type: "number", min: "0", value: Number(fee.amountPaid || 0) === 0 ? "" : fee.amountPaid, onChange: (e) => updateFee(athlete.id, "amountPaid", e.target.value === "" ? 0 : Number(e.target.value)) })),
                h("td", { "data-label": "Data platii" }, h("input", { type: "date", value: fee.paymentDate, onChange: (e) => updateFee(athlete.id, "paymentDate", e.target.value) })),
                h("td", { "data-label": "Metoda" }, h("select", { value: fee.method, onChange: (e) => updateFee(athlete.id, "method", e.target.value) }, paymentMethods.map((method) => h("option", { key: method, value: method }, method)))),
                h("td", { "data-label": "Observatii" }, h("input", { value: fee.notes, onChange: (e) => updateFee(athlete.id, "notes", e.target.value), placeholder: "Optional" }))
              );
            })
          )
        )
      )
    );
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

    const creditRows = athletesInFilter
      .map((athlete) => {
        const fee = getFeeForMonth(fees, athlete.id, month);
        const previousBalance = getPreviousBalance(fees, athlete, month);
        const balanceAfterMonth = getBalanceAfterMonth(fee, previousBalance, athlete.feeDue ?? 200);
        const credit = Math.max(-balanceAfterMonth, 0);

        return { athlete, credit };
      })
      .filter((row) => row.credit > 0);

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
          h("option", { value: "avansuri" }, "Avansuri"),
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
        h("div", null, h("span", null, "Avansuri"), h("strong", null, creditRows.length)),
        h(
          "div",
          null,
          h("span", null, "Incasari luna"),
          h("strong", null, formatMoney(totalCollected)),
          h("div", { style: { fontSize: "14px", marginTop: "6px", color: "#111" } }, "Cash: " + formatMoney(totalCash) + " / Transfer: " + formatMoney(totalTransfer))
        )
      ),
      h(
        "div",
        { className: "report-grid" },
        (reportType === "restantieri" || reportType === "toate") &&
          h(
            "div",
            { className: "report-block" },
            h("h2", null, reportType === "restantieri" ? "Restantieri" : "Sportivi restantieri"),
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
        (reportType === "avansuri" || reportType === "toate") &&
          h(
            "div",
            { className: "report-block" },
            h("h2", null, "Avansuri"),
            creditRows.length
              ? h(
                  "ul",
                  { className: "clean-list" },
                  creditRows.map(({ athlete, credit }) =>
                    h("li", { key: athlete.id }, h("span", null, athleteName(athlete)), h("strong", null, formatMoney(credit)))
                  )
                )
              : h("p", null, "Nu exista avansuri.")
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

  window.FeesView = FeesView;
  window.ReportsView = ReportsView;
  window.CSHeartComponents = {
    ...window.CSHeartComponents,
    FeesView,
    ReportsView
  };
})();
