  const h = React.createElement;
  const { AttendanceView, FeesView, ReportsView, OtherPaymentsView } = window.CSHeartComponents;
  const { loadState, saveState, resetState, createId } = window.CSHeartStorage;
  import { db, doc, getDoc, setDoc, auth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "./firebase.js";
  function Field({ label, children }) {
    return h("label", { className: "field" }, h("span", null, label), children);
  }
  function LoginView() {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");
    const [busy, setBusy] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);

    async function submit(event) {
      event.preventDefault();
      setError("");
      setBusy(true);

      try {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } catch (error) {
        setError("Eroare Firebase: " + (error.code || error.message || "necunoscuta"));
      } finally {
        setBusy(false);
      }
    }

    return h(
      "main",
      { className: "auth-shell" },
      h(
        "form",
        { className: "auth-card", onSubmit: submit },
        h("p", { className: "eyebrow" }, "CS HEART"),
        h("h1", null, "Autentificare"),
        h(Field, { label: "Email" }, h("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), autoComplete: "username", required: true })),
        h(Field, { label: "Parola" }, h("div", { className: "password-row" }, h("input", { type: showPassword ? "text" : "password", value: password, onChange: (e) => setPassword(e.target.value), autoComplete: "current-password", required: true }), h("button", { type: "button", onClick: () => setShowPassword((current) => !current) }, showPassword ? "Ascunde" : "Arata"))),
        error && h("p", { className: "auth-error" }, error),
        h("button", { className: "primary", type: "submit", disabled: busy }, busy ? "Se verifica..." : "Intra in aplicatie")
      )
    );
  }
  function App() {
    const [state, setState] = React.useState(loadState);
    const [activeView, setActiveView] = React.useState("sportivi");
    const [user, setUser] = React.useState(null);
    const [authReady, setAuthReady] = React.useState(false);

   const loadedRef = React.useRef(false);

  React.useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);

      if (!currentUser) {
        loadedRef.current = false;
      }
    });
  }, []);

  React.useEffect(() => {
  if (!authReady || !user) return;
  loadedRef.current = false;

  async function loadFromFirestore() {
    try {
      const appRef = doc(db, "app", "state");
      const snapshot = await getDoc(appRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        setState({
          athletes: Array.isArray(data.athletes) ? data.athletes : [],
          trainings: Array.isArray(data.trainings) ? data.trainings : [],
          fees: Array.isArray(data.fees) ? data.fees : [],
          otherPayments: Array.isArray(data.otherPayments) ? data.otherPayments : [],
          taxPayments: Array.isArray(data.taxPayments) ? data.taxPayments : []
        });
      } else {
        await setDoc(appRef, state);
      }

      loadedRef.current = true;
    } catch (error) {
      console.error("Eroare la citirea din Firebase:", error);
      loadedRef.current = true;
    }
  }

  loadFromFirestore();
}, [authReady, user?.uid]);

React.useEffect(() => {
  if (!authReady || !user || !loadedRef.current) return;

  saveState(state);

  const appRef = doc(db, "app", "state");
  setDoc(appRef, state).catch((error) => {
    console.error("Eroare la salvarea Ã®n Firebase:", error);
  });
}, [state, authReady, user?.uid]);

    async function addAthlete(athlete) {
  try {
    const docRef = { id: Date.now().toString() };

    setState((current) => ({
      ...current,
      athletes: [{ ...athlete, id: docRef.id }, ...current.athletes]
    }));
  } catch (error) {
    console.error("Eroare la salvarea sportivului:", error);
    alert("Nu s-a salvat sportivul Ã®n Firebase.");
  }
}

    function updateAthlete(id, athlete) {
      setState((current) => ({
        ...current,
        athletes: current.athletes.map((item) => (item.id === id ? { ...athlete, id } : item))
      }));
    }

    function deleteAthlete(id) {
      const ok = confirm("È˜tergi sportivul È™i datele lui asociate?");
      if (!ok) return;
      setState((current) => ({
        athletes: current.athletes.filter((athlete) => athlete.id !== id),
        trainings: current.trainings.map((training) => {
          const attendance = { ...training.attendance };
          delete attendance[id];
          return { ...training, attendance };
        }),
        fees: current.fees.filter((fee) => fee.athleteId !== id)
      }));
    }

    function saveTraining(training) {
      setState((current) => {
        const id = training.id || createId("tr");
        const nextTraining = { ...training, id };
        const exists = current.trainings.some((item) => item.id === id);
        return {
          ...current,
          trainings: exists ? current.trainings.map((item) => (item.id === id ? nextTraining : item)) : [nextTraining, ...current.trainings]
        };
      });
    }

    function saveFee(fee) {
      setState((current) => {
        const existing = current.fees.find((item) => item.athleteId === fee.athleteId && item.month === fee.month);
        const normalized = {
          ...fee,
          id: existing?.id || createId("fee"),
          updatedAt: new Date().toISOString(),
          updatedByEmail: user?.email || "necunoscut",
          updatedById: user?.uid || ""
        };
        return {
          ...current,
          fees: existing ? current.fees.map((item) => (item.id === existing.id ? normalized : item)) : [normalized, ...current.fees]
        };
      });
    }

    function saveOtherPayment(payment) {
      setState((current) => {
        const existing = (current.otherPayments || []).find((item) => item.id === payment.id);
        const normalized = {
          ...payment,
          id: payment.id || createId("other"),
          updatedAt: new Date().toISOString(),
          updatedByEmail: user?.email || "necunoscut",
          updatedById: user?.uid || ""
        };

        return {
          ...current,
          otherPayments: existing
            ? (current.otherPayments || []).map((item) => (item.id === existing.id ? normalized : item))
            : [normalized, ...(current.otherPayments || [])]
        };
      });
    }

    function deleteOtherPayment(id) {
      const ok = confirm("Stergi aceasta incasare?");
      if (!ok) return;

      setState((current) => ({
        ...current,
        otherPayments: (current.otherPayments || []).filter((payment) => payment.id !== id)
      }));
    }
    function saveTaxPayment(payment) {
      setState((current) => {
        const existing = (current.taxPayments || []).find((item) => item.id === payment.id);
        const normalized = {
          ...payment,
          id: payment.id || createId("taxpay"),
          updatedAt: new Date().toISOString(),
          updatedByEmail: user?.email || "necunoscut",
          updatedById: user?.uid || ""
        };

        return {
          ...current,
          taxPayments: existing
            ? (current.taxPayments || []).map((item) => (item.id === existing.id ? normalized : item))
            : [normalized, ...(current.taxPayments || [])]
        };
      });
    }

    function deleteTaxPayment(id) {
      const ok = confirm("Stergi aceasta plata din taxe?");
      if (!ok) return;

      setState((current) => ({
        ...current,
        taxPayments: (current.taxPayments || []).filter((payment) => payment.id !== id)
      }));
    }
    function deleteTraining(trainingToDelete) {
      setState((current) => ({
        ...current,
        trainings: current.trainings.filter((training) => {
          if (trainingToDelete.id) return training.id !== trainingToDelete.id;

          return !(
            training.date === trainingToDelete.date &&
            training.group === trainingToDelete.group &&
            (training.type || "grupa") === (trainingToDelete.type || "grupa")
          );
        })
      }));
    }
    function resetMonthFees(month, athleteIds) {
      const ok = confirm(`Resetezi taxele pentru luna ${month}?`);
      if (!ok) return;

      setState((current) => ({
        ...current,
        fees: current.fees.map((fee) =>
          fee.month === month && athleteIds.includes(fee.athleteId)
            ? {
                ...fee,
                status: "neplÄƒtitÄƒ",
                amountPaid: 0,
                paymentDate: "",
                notes: ""
              }
            : fee
        )
      }));
    }

    function restoreDemo() {
      const ok = confirm("Resetezi aplicaÈ›ia la datele demo?");
      if (ok) setState(resetState());
    }

    function logout() {
      signOut(auth).catch((error) => {
        console.error("Eroare la iesire:", error);
      });
    }

    if (!authReady) {
      return h(
        "main",
        { className: "auth-shell" },
        h("div", { className: "auth-card" }, h("p", { className: "eyebrow" }, "CS HEART"), h("h1", null, "Se verifica accesul..."))
      );
    }

    if (!user) {
      return h(LoginView);
    }
    const views = [
      ["sportivi", "Sportivi"],
      ["prezenta", "PrezenÈ›Äƒ"],
      ["taxe", "Taxe"],
      ["alteIncasari", "Alte incasari"],
      ["rapoarte", "Rapoarte"]
    ];

    return h(
      "main",
      { className: "app-shell" },
      h(
        "header",
        { className: "topbar" },
        h("div", null, h("p", { className: "eyebrow" }, "Administrare club"), h("h1", null, "CS HEART")),
        h("button", { onClick: logout }, "Iesire")
      ),
      h(
        "nav",
        { className: "tabs", "aria-label": "SecÈ›iuni aplicaÈ›ie" },
        views.map(([id, label]) => h("button", { key: id, className: activeView === id ? "active" : "", onClick: () => setActiveView(id) }, label))
      ),
      activeView === "sportivi" && h(AthletesView, { athletes: state.athletes, fees: state.fees, otherPayments: state.otherPayments || [], taxPayments: state.taxPayments || [], onAdd: addAthlete, onUpdate: updateAthlete, onDelete: deleteAthlete }),
      activeView === "prezenta" && h(AttendanceView, { athletes: state.athletes, trainings: state.trainings, onSaveTraining: saveTraining, onDeleteTraining: deleteTraining }),
      activeView === "taxe" && h(FeesView, { athletes: state.athletes, fees: state.fees, taxPayments: state.taxPayments || [], onSaveFee: saveFee, onSaveTaxPayment: saveTaxPayment, onDeleteTaxPayment: deleteTaxPayment }),
      activeView === "alteIncasari" && h(OtherPaymentsView, { athletes: state.athletes, otherPayments: state.otherPayments || [], onSavePayment: saveOtherPayment, onDeletePayment: deleteOtherPayment }),
      activeView === "rapoarte" && h(ReportsView, { athletes: state.athletes, trainings: state.trainings, fees: state.fees, otherPayments: state.otherPayments || [], taxPayments: state.taxPayments || [] })
    );
  }

  ReactDOM.createRoot(document.getElementById("root")).render(h(App));



