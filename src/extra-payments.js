(function () {
  const h = React.createElement;

  const categories = ["echipament", "cantonament", "turneu", "legitimatie", "transport", "altele"];
  const paymentMethods = ["cash", "transfer"];

  function athleteName(athlete) {
    return `${athlete.lastName} ${athlete.firstName}`;
  }

  function formatMoney(value) {
    return `${Number(value || 0).toLocaleString("ro-RO")} lei`;
  }

  function formatDate(value) {
    if (!value) return "-";
    const parts = String(value).split("-");
    return parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : value;
  }

  function getGroups(athletes) {
    return [...new Set(athletes.map((athlete) => athlete.group).filter(Boolean))].sort();
  }

  function getMonth(value) {
    return String(value || "").slice(0, 7);
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function currentMonth() {
    return new Date().toISOString().slice(0, 7);
  }

  function findAthlete(athletes, athleteId) {
    return athletes.find((athlete) => athlete.id === athleteId);
  }

  function sortByDateDesc(first, second) {
    return String(second.date || "").localeCompare(String(first.date || ""));
  }

  function Field({ label, children }) {
    return h("label", { className: "field" }, h("span", null, label), children);
  }

  function EmptyState({ title, text }) {
    return h("div", { className: "empty-state" }, h("strong", null, title), h("p", null, text));
  }

  function emptyForm() {
    return {
      id: "",
      athleteId: "",
      date: today(),
      category: categories[0],
      amount: "",
      method: "cash",
      notes: ""
    };
  }

  function OtherPaymentsView({ athletes, otherPayments = [], onSavePayment, onDeletePayment }) {
    const [month, setMonth] = React.useState(currentMonth());
    const [group, setGroup] = React.useState("toate");
    const [category, setCategory] = React.useState("toate");
    const [query, setQuery] = React.useState("");
    const [form, setForm] = React.useState(emptyForm);

    const groups = getGroups(athletes);
    const activeAthletes = [...athletes]
      .filter((athlete) => athlete.active)
      .sort((first, second) => athleteName(first).localeCompare(athleteName(second)));

    const filteredPayments = otherPayments
      .filter((payment) => getMonth(payment.date) === month)
      .filter((payment) => category === "toate" || payment.category === category)
      .filter((payment) => {
        const athlete = findAthlete(athletes, payment.athleteId);
        return group === "toate" || athlete?.group === group;
      })
      .filter((payment) => {
        const athlete = findAthlete(athletes, payment.athleteId);
        const text = [
          athlete ? athleteName(athlete) : "sportiv necunoscut",
          payment.category,
          payment.method,
          payment.notes
        ]
          .join(" ")
          .toLowerCase();
        return text.includes(query.toLowerCase());
      })
      .sort(sortByDateDesc);

    const total = filteredPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const totalCash = filteredPayments
      .filter((payment) => payment.method === "cash")
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const totalTransfer = filteredPayments
      .filter((payment) => payment.method === "transfer")
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    function update(field, value) {
      setForm((current) => ({ ...current, [field]: value }));
    }

    function submit(event) {
      event.preventDefault();

      if (!form.athleteId || !form.date || !form.category || Number(form.amount || 0) <= 0) return;

      onSavePayment({
        ...form,
        amount: Number(form.amount || 0),
        notes: String(form.notes || "").trim()
      });
      setForm(emptyForm());
    }

    function edit(payment) {
      setForm({
        id: payment.id || "",
        athleteId: payment.athleteId || "",
        date: payment.date || today(),
        category: payment.category || categories[0],
        amount: payment.amount || "",
        method: payment.method || "cash",
        notes: payment.notes || ""
      });
    }

    return h(
      "section",
      { className: "stack" },
      h(
        "form",
        { className: "panel form-grid", onSubmit: submit },
        h(
          Field,
          { label: "Sportiv" },
          h(
            "select",
            { value: form.athleteId, onChange: (event) => update("athleteId", event.target.value), required: true },
            h("option", { value: "" }, "Alege sportiv"),
            activeAthletes.map((athlete) => h("option", { key: athlete.id, value: athlete.id }, athleteName(athlete) + " - " + athlete.group))
          )
        ),
        h(Field, { label: "Data incasarii" }, h("input", { type: "date", value: form.date, onChange: (event) => update("date", event.target.value), required: true })),
        h(
          Field,
          { label: "Categorie" },
          h(
            "select",
            { value: form.category, onChange: (event) => update("category", event.target.value) },
            categories.map((item) => h("option", { key: item, value: item }, item))
          )
        ),
        h(Field, { label: "Suma" }, h("input", { type: "number", min: "0", value: form.amount, onChange: (event) => update("amount", event.target.value), required: true })),
        h(
          Field,
          { label: "Metoda" },
          h(
            "select",
            { value: form.method, onChange: (event) => update("method", event.target.value) },
            paymentMethods.map((method) => h("option", { key: method, value: method }, method))
          )
        ),
        h(Field, { label: "Observatii" }, h("input", { value: form.notes, onChange: (event) => update("notes", event.target.value), placeholder: "Optional" })),
        h(
          "div",
          { className: "form-actions" },
          h("button", { className: "primary", type: "submit" }, form.id ? "Actualizeaza incasarea" : "Adauga incasarea"),
          form.id && h("button", { type: "button", onClick: () => setForm(emptyForm()) }, "Renunta")
        )
      ),
      h(
        "div",
        { className: "panel compact-grid" },
        h(Field, { label: "Luna" }, h("input", { type: "month", value: month, onChange: (event) => setMonth(event.target.value) })),
        h(
          Field,
          { label: "Grupa" },
          h(
            "select",
            { value: group, onChange: (event) => setGroup(event.target.value) },
            h("option", { value: "toate" }, "Toate grupele"),
            groups.map((item) => h("option", { key: item, value: item }, item))
          )
        ),
        h(
          Field,
          { label: "Categorie" },
          h(
            "select",
            { value: category, onChange: (event) => setCategory(event.target.value) },
            h("option", { value: "toate" }, "Toate categoriile"),
            categories.map((item) => h("option", { key: item, value: item }, item))
          )
        ),
        h(Field, { label: "Cauta" }, h("input", { value: query, onChange: (event) => setQuery(event.target.value), placeholder: "Nume, categorie, observatii" }))
      ),
      h(
        "div",
        { className: "metrics" },
        h("div", null, h("span", null, "Total alte incasari"), h("strong", null, formatMoney(total))),
        h("div", null, h("span", null, "Cash"), h("strong", null, formatMoney(totalCash))),
        h("div", null, h("span", null, "Transfer"), h("strong", null, formatMoney(totalTransfer)))
      ),
      h(
        "div",
        { className: "table-wrap wide" },
        h(
          "table",
          null,
          h("thead", null, h("tr", null, ["Data", "Sportiv", "Categorie", "Suma", "Metoda", "Observatii", "Operat de", ""].map((head) => h("th", { key: head }, head)))),
          h(
            "tbody",
            null,
            filteredPayments.map((payment) => {
              const athlete = findAthlete(athletes, payment.athleteId);

              return h(
                "tr",
                { key: payment.id },
                h("td", { "data-label": "Data" }, formatDate(payment.date)),
                h("td", { "data-label": "Sportiv" }, athlete ? h("strong", null, athleteName(athlete)) : "Sportiv necunoscut", athlete && h("small", null, athlete.group)),
                h("td", { "data-label": "Categorie" }, payment.category || "-"),
                h("td", { "data-label": "Suma" }, h("strong", null, formatMoney(payment.amount))),
                h("td", { "data-label": "Metoda" }, payment.method || "-"),
                h("td", { "data-label": "Observatii" }, payment.notes || "-"),
                h("td", { "data-label": "Operat de" }, payment.updatedByEmail || "-"),
                h(
                  "td",
                  { className: "row-actions" },
                  h("button", { onClick: () => edit(payment) }, "Editeaza"),
                  h("button", { className: "danger", onClick: () => onDeletePayment(payment.id) }, "Sterge")
                )
              );
            })
          )
        )
      ),
      !filteredPayments.length && h(EmptyState, { title: "Nu exista alte incasari in filtrul curent.", text: "Adauga o incasare sau schimba luna, grupa ori categoria." })
    );
  }

  function ExtraPaymentsReport({ athletes, otherPayments = [] }) {
    const [month, setMonth] = React.useState(currentMonth());
    const [group, setGroup] = React.useState("toate");
    const [category, setCategory] = React.useState("toate");
    const groups = getGroups(athletes);
    const rows = otherPayments
      .filter((payment) => getMonth(payment.date) === month)
      .filter((payment) => category === "toate" || payment.category === category)
      .filter((payment) => {
        const athlete = findAthlete(athletes, payment.athleteId);
        return group === "toate" || athlete?.group === group;
      })
      .sort(sortByDateDesc);
    const total = rows.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const totalCash = rows.filter((payment) => payment.method === "cash").reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const totalTransfer = rows.filter((payment) => payment.method === "transfer").reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const categoryTotals = categories
      .map((item) => ({
        category: item,
        total: rows.filter((payment) => payment.category === item).reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
      }))
      .filter((item) => item.total > 0);

    return h(
      "section",
      { className: "stack" },
      h("h2", null, "Alte incasari"),
      h(
        "div",
        { className: "panel compact-grid" },
        h(Field, { label: "Luna" }, h("input", { type: "month", value: month, onChange: (event) => setMonth(event.target.value) })),
        h(
          Field,
          { label: "Grupa" },
          h(
            "select",
            { value: group, onChange: (event) => setGroup(event.target.value) },
            h("option", { value: "toate" }, "Toate grupele"),
            groups.map((item) => h("option", { key: item, value: item }, item))
          )
        ),
        h(
          Field,
          { label: "Categorie" },
          h(
            "select",
            { value: category, onChange: (event) => setCategory(event.target.value) },
            h("option", { value: "toate" }, "Toate categoriile"),
            categories.map((item) => h("option", { key: item, value: item }, item))
          )
        )
      ),
      h(
        "div",
        { className: "metrics" },
        h("div", null, h("span", null, "Total alte incasari"), h("strong", null, formatMoney(total))),
        h("div", null, h("span", null, "Cash"), h("strong", null, formatMoney(totalCash))),
        h("div", null, h("span", null, "Transfer"), h("strong", null, formatMoney(totalTransfer)))
      ),
      h(
        "div",
        { className: "report-grid" },
        h(
          "div",
          { className: "report-block" },
          h("h2", null, "Pe categorii"),
          categoryTotals.length
            ? h("ul", { className: "clean-list" }, categoryTotals.map((item) => h("li", { key: item.category }, h("span", null, item.category), h("strong", null, formatMoney(item.total)))))
            : h("p", null, "Nu exista incasari in filtrul ales.")
        ),
        h(
          "div",
          { className: "report-block" },
          h("h2", null, "Lista incasari"),
          rows.length
            ? h(
                "ul",
                { className: "clean-list" },
                rows.map((payment) => {
                  const athlete = findAthlete(athletes, payment.athleteId);

                  return h(
                    "li",
                    { key: payment.id },
                    h("span", null, athlete ? athleteName(athlete) : "Sportiv necunoscut", h("small", null, formatDate(payment.date) + " / " + (payment.category || "-") + " / " + (payment.method || "-"))),
                    h("strong", null, formatMoney(payment.amount))
                  );
                })
              )
            : h("p", null, "Nu exista incasari in filtrul ales.")
        )
      )
    );
  }

  const BaseReportsView = window.CSHeartComponents?.ReportsView || window.ReportsView;

  function ReportsView(props) {
    return h(
      "div",
      { className: "stack" },
      BaseReportsView ? h(BaseReportsView, props) : null,
      h(ExtraPaymentsReport, props)
    );
  }

  window.OtherPaymentsView = OtherPaymentsView;
  window.ReportsView = ReportsView;
  window.CSHeartComponents = {
    ...window.CSHeartComponents,
    OtherPaymentsView,
    ReportsView
  };
})();
