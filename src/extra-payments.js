(function () {
  const h = React.createElement;

  const categories = ["echipament", "cantonament", "turneu", "legitimatie", "transport", "sponsorizare", "parteneriat", "altele"];
  const payerTypes = ["sportiv", "partener", "altul"];
  const paymentTypes = ["incasare", "avans"];
  const paymentMethods = ["cash", "transfer"];
  const currencies = ["lei", "euro"];

  function athleteName(athlete) {
    return `${athlete.lastName} ${athlete.firstName}`;
  }

  function formatMoney(value, currency = "lei") {
    return `${Number(value || 0).toLocaleString("ro-RO")} ${currency === "euro" ? "euro" : "lei"}`;
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

  function paymentType(payment) {
    return !payment.paymentType || payment.paymentType === "plata" ? "incasare" : payment.paymentType;
  }

  function paymentCurrency(payment) {
    return payment.currency || "lei";
  }

  function signedAmount(payment) {
    const amount = Number(payment.amount || 0);
    return paymentType(payment) === "avans" ? -amount : amount;
  }

  function formatPaymentAmount(payment) {
    const prefix = paymentType(payment) === "avans" ? "- " : "";
    return prefix + formatMoney(payment.amount, paymentCurrency(payment));
  }

  function payerType(payment) {
    if (payment.payerType) return payment.payerType;
    return payment.athleteId ? "sportiv" : "partener";
  }

  function payerLabel(athletes, payment) {
    const athlete = findAthlete(athletes, payment.athleteId);
    if (athlete) return athleteName(athlete);
    if (payment.payerName) return payment.payerName;
    return payerType(payment) === "partener" ? "Partener fara nume" : "Sursa necunoscuta";
  }

  function sumPayments(rows, currency, method) {
    return rows
      .filter((payment) => paymentCurrency(payment) === currency)
      .filter((payment) => !method || payment.method === method)
      .reduce((sum, payment) => sum + signedAmount(payment), 0);
  }

  function formatDualAmount(rows, method) {
    return formatMoney(sumPayments(rows, "lei", method), "lei") + " / " + formatMoney(sumPayments(rows, "euro", method), "euro");
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
      payerType: "sportiv",
      athleteId: "",
      payerName: "",
      date: today(),
      category: categories[0],
      paymentType: "incasare",
      amount: "",
      method: "cash",
      currency: "lei",
      notes: ""
    };
  }

  function OtherPaymentsView({ athletes, otherPayments = [], onSavePayment, onDeletePayment }) {
    const [month, setMonth] = React.useState(currentMonth());
    const [group, setGroup] = React.useState("toate");
    const [category, setCategory] = React.useState("toate");
    const [typeFilter, setTypeFilter] = React.useState("toate");
    const [currencyFilter, setCurrencyFilter] = React.useState("toate");
    const [query, setQuery] = React.useState("");
    const [form, setForm] = React.useState(emptyForm);

    const groups = getGroups(athletes);
    const activeAthletes = [...athletes]
      .filter((athlete) => athlete.active)
      .sort((first, second) => athleteName(first).localeCompare(athleteName(second)));

    const filteredPayments = otherPayments
      .filter((payment) => getMonth(payment.date) === month)
      .filter((payment) => category === "toate" || payment.category === category)
      .filter((payment) => typeFilter === "toate" || paymentType(payment) === typeFilter)
      .filter((payment) => currencyFilter === "toate" || paymentCurrency(payment) === currencyFilter)
      .filter((payment) => {
        const athlete = findAthlete(athletes, payment.athleteId);
        return group === "toate" || athlete?.group === group;
      })
      .filter((payment) => {
        const text = [
          payerLabel(athletes, payment),
          payerType(payment),
          payment.category,
          paymentType(payment),
          payment.method,
          paymentCurrency(payment),
          payment.notes
        ]
          .join(" ")
          .toLowerCase();
        return text.includes(query.toLowerCase());
      })
      .sort(sortByDateDesc);

    const totalLei = sumPayments(filteredPayments, "lei");
    const totalEuro = sumPayments(filteredPayments, "euro");

    function update(field, value) {
      setForm((current) => ({ ...current, [field]: value }));
    }

    function submit(event) {
      event.preventDefault();

      const isSportiv = form.payerType === "sportiv";
      const payerName = String(form.payerName || "").trim();

      if ((isSportiv && !form.athleteId) || (!isSportiv && !payerName) || !form.date || !form.category || Number(form.amount || 0) <= 0) return;

      onSavePayment({
        ...form,
        athleteId: isSportiv ? form.athleteId : "",
        payerName: isSportiv ? "" : payerName,
        amount: Number(form.amount || 0),
        notes: String(form.notes || "").trim()
      });
      setForm(emptyForm());
    }

    function edit(payment) {
      setForm({
        id: payment.id || "",
        payerType: payerType(payment),
        athleteId: payment.athleteId || "",
        payerName: payment.payerName || "",
        date: payment.date || today(),
        category: payment.category || categories[0],
        paymentType: paymentType(payment),
        amount: payment.amount || "",
        method: payment.method || "cash",
        currency: paymentCurrency(payment),
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
          { label: "De la" },
          h(
            "select",
            { value: form.payerType, onChange: (event) => update("payerType", event.target.value) },
            payerTypes.map((item) => h("option", { key: item, value: item }, item))
          )
        ),
        form.payerType === "sportiv"
          ? h(
              Field,
              { label: "Sportiv" },
              h(
                "select",
                { value: form.athleteId, onChange: (event) => update("athleteId", event.target.value), required: true },
                h("option", { value: "" }, "Alege sportiv"),
                activeAthletes.map((athlete) => h("option", { key: athlete.id, value: athlete.id }, athleteName(athlete) + " - " + athlete.group))
              )
            )
          : h(
              Field,
              { label: form.payerType === "partener" ? "Nume partener" : "Sursa banilor" },
              h("input", { value: form.payerName, onChange: (event) => update("payerName", event.target.value), placeholder: form.payerType === "partener" ? "Nume partener" : "Ex: donatie, sponsor, alta sursa", required: true })
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
        h(
          Field,
          { label: "Tip" },
          h(
            "select",
            { value: form.paymentType, onChange: (event) => update("paymentType", event.target.value) },
            paymentTypes.map((item) => h("option", { key: item, value: item }, item))
          )
        ),
        h(Field, { label: "Suma" }, h("input", { type: "number", min: "0", value: form.amount, onChange: (event) => update("amount", event.target.value), required: true })),
        h(
          Field,
          { label: "Moneda" },
          h(
            "select",
            { value: form.currency, onChange: (event) => update("currency", event.target.value) },
            currencies.map((item) => h("option", { key: item, value: item }, item))
          )
        ),
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
        h(
          Field,
          { label: "Tip" },
          h(
            "select",
            { value: typeFilter, onChange: (event) => setTypeFilter(event.target.value) },
            h("option", { value: "toate" }, "Plati si avansuri"),
            paymentTypes.map((item) => h("option", { key: item, value: item }, item))
          )
        ),
        h(
          Field,
          { label: "Moneda" },
          h(
            "select",
            { value: currencyFilter, onChange: (event) => setCurrencyFilter(event.target.value) },
            h("option", { value: "toate" }, "Lei si euro"),
            currencies.map((item) => h("option", { key: item, value: item }, item))
          )
        ),
        h(Field, { label: "Cauta" }, h("input", { value: query, onChange: (event) => setQuery(event.target.value), placeholder: "Nume, categorie, observatii" }))
      ),
      h(
        "div",
        { className: "metrics" },
        h("div", null, h("span", null, "Total lei"), h("strong", null, formatMoney(totalLei, "lei"))),
        h("div", null, h("span", null, "Total euro"), h("strong", null, formatMoney(totalEuro, "euro"))),
        h("div", null, h("span", null, "Cash / Transfer"), h("strong", null, "Cash: " + formatDualAmount(filteredPayments, "cash")), h("strong", null, "Transfer: " + formatDualAmount(filteredPayments, "transfer")))
      ),
      h(
        "div",
        { className: "table-wrap wide" },
        h(
          "table",
          null,
          h("thead", null, h("tr", null, ["Data", "De la", "Categorie", "Tip", "Suma", "Moneda", "Metoda", "Observatii", "Operat de", ""].map((head) => h("th", { key: head }, head)))),
          h(
            "tbody",
            null,
            filteredPayments.map((payment) => {
              const athlete = findAthlete(athletes, payment.athleteId);

              return h(
                "tr",
                { key: payment.id },
                h("td", { "data-label": "Data" }, formatDate(payment.date)),
                h("td", { "data-label": "De la" }, h("strong", null, payerLabel(athletes, payment)), h("small", null, athlete ? athlete.group : payerType(payment))),
                h("td", { "data-label": "Categorie" }, payment.category || "-"),
                h("td", { "data-label": "Tip" }, paymentType(payment)),
                h("td", { "data-label": "Suma" }, h("strong", { className: paymentType(payment) === "avans" ? "arrears" : "" }, formatPaymentAmount(payment))),
                h("td", { "data-label": "Moneda" }, paymentCurrency(payment)),
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
    const [typeFilter, setTypeFilter] = React.useState("toate");
    const [currencyFilter, setCurrencyFilter] = React.useState("toate");
    const groups = getGroups(athletes);
    const rows = otherPayments
      .filter((payment) => getMonth(payment.date) === month)
      .filter((payment) => category === "toate" || payment.category === category)
      .filter((payment) => typeFilter === "toate" || paymentType(payment) === typeFilter)
      .filter((payment) => currencyFilter === "toate" || paymentCurrency(payment) === currencyFilter)
      .filter((payment) => {
        const athlete = findAthlete(athletes, payment.athleteId);
        return group === "toate" || athlete?.group === group;
      })
      .sort(sortByDateDesc);
    const totalLei = sumPayments(rows, "lei");
    const totalEuro = sumPayments(rows, "euro");
    const categoryTotals = categories
      .map((item) => ({
        category: item,
        totalLei: sumPayments(rows.filter((payment) => payment.category === item), "lei"),
        totalEuro: sumPayments(rows.filter((payment) => payment.category === item), "euro")
      }))
      .filter((item) => item.totalLei !== 0 || item.totalEuro !== 0);

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
        ),
        h(
          Field,
          { label: "Tip" },
          h(
            "select",
            { value: typeFilter, onChange: (event) => setTypeFilter(event.target.value) },
            h("option", { value: "toate" }, "Plati si avansuri"),
            paymentTypes.map((item) => h("option", { key: item, value: item }, item))
          )
        ),
        h(
          Field,
          { label: "Moneda" },
          h(
            "select",
            { value: currencyFilter, onChange: (event) => setCurrencyFilter(event.target.value) },
            h("option", { value: "toate" }, "Lei si euro"),
            currencies.map((item) => h("option", { key: item, value: item }, item))
          )
        )
      ),
      h(
        "div",
        { className: "metrics" },
        h("div", null, h("span", null, "Total lei"), h("strong", null, formatMoney(totalLei, "lei"))),
        h("div", null, h("span", null, "Total euro"), h("strong", null, formatMoney(totalEuro, "euro"))),
        h("div", null, h("span", null, "Cash / Transfer"), h("strong", null, "Cash: " + formatDualAmount(rows, "cash")), h("strong", null, "Transfer: " + formatDualAmount(rows, "transfer")))
      ),
      h(
        "div",
        { className: "report-grid" },
        h(
          "div",
          { className: "report-block" },
          h("h2", null, "Pe categorii"),
          categoryTotals.length
            ? h("ul", { className: "clean-list" }, categoryTotals.map((item) => h("li", { key: item.category }, h("span", null, item.category), h("strong", null, formatMoney(item.totalLei, "lei") + " / " + formatMoney(item.totalEuro, "euro")))))
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
                  return h(
                    "li",
                    { key: payment.id },
                    h("span", null, payerLabel(athletes, payment), h("small", null, formatDate(payment.date) + " / " + payerType(payment) + " / " + (payment.category || "-") + " / " + paymentType(payment) + " / " + (payment.method || "-"))),
                    h("strong", { className: paymentType(payment) === "avans" ? "arrears" : "" }, formatPaymentAmount(payment))
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
