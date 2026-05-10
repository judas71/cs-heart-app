  const h = React.createElement;
  const { AttendanceView, FeesView, ReportsView } = window.CSHeartComponents;
  const { loadState, saveState, resetState, createId } = window.CSHeartStorage;
  import { db, doc, getDoc, setDoc } from "./firebase.js";
  function App() {
    const [state, setState] = React.useState(loadState);
    const [activeView, setActiveView] = React.useState("sportivi");

   const loadedRef = React.useRef(false);

  React.useEffect(() => {
  async function loadFromFirestore() {
    try {
      const appRef = doc(db, "app", "state");
      const snapshot = await getDoc(appRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        setState({
          athletes: Array.isArray(data.athletes) ? data.athletes : [],
          trainings: Array.isArray(data.trainings) ? data.trainings : [],
          fees: Array.isArray(data.fees) ? data.fees : []
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
}, []);

React.useEffect(() => {
  if (!loadedRef.current) return;

  saveState(state);

  const appRef = doc(db, "app", "state");
  setDoc(appRef, state).catch((error) => {
    console.error("Eroare la salvarea în Firebase:", error);
  });
}, [state]);

    async function addAthlete(athlete) {
  try {
    const docRef = { id: Date.now().toString() };

    setState((current) => ({
      ...current,
      athletes: [{ ...athlete, id: docRef.id }, ...current.athletes]
    }));
  } catch (error) {
    console.error("Eroare la salvarea sportivului:", error);
    alert("Nu s-a salvat sportivul în Firebase.");
  }
}

    function updateAthlete(id, athlete) {
      setState((current) => ({
        ...current,
        athletes: current.athletes.map((item) => (item.id === id ? { ...athlete, id } : item))
      }));
    }

    function deleteAthlete(id) {
      const ok = confirm("Ștergi sportivul și datele lui asociate?");
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
        const normalized = { ...fee, id: existing?.id || createId("fee") };
        return {
          ...current,
          fees: existing ? current.fees.map((item) => (item.id === existing.id ? normalized : item)) : [normalized, ...current.fees]
        };
      });
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
                status: "neplătită",
                amountPaid: 0,
                paymentDate: "",
                notes: ""
              }
            : fee
        )
      }));
    }

    function restoreDemo() {
      const ok = confirm("Resetezi aplicația la datele demo?");
      if (ok) setState(resetState());
    }

    const views = [
      ["sportivi", "Sportivi"],
      ["prezenta", "Prezență"],
      ["taxe", "Taxe"],
      ["rapoarte", "Rapoarte"]
    ];

    return h(
      "main",
      { className: "app-shell" },
      h(
        "header",
        { className: "topbar" },
        h("div", null, h("p", { className: "eyebrow" }, "Administrare club"), h("h1", null, "CS HEART")),
        
      ),
      h(
        "nav",
        { className: "tabs", "aria-label": "Secțiuni aplicație" },
        views.map(([id, label]) => h("button", { key: id, className: activeView === id ? "active" : "", onClick: () => setActiveView(id) }, label))
      ),
      activeView === "sportivi" && h(AthletesView, { athletes: state.athletes, onAdd: addAthlete, onUpdate: updateAthlete, onDelete: deleteAthlete }),
      activeView === "prezenta" && h(AttendanceView, { athletes: state.athletes, trainings: state.trainings, onSaveTraining: saveTraining }),
      activeView === "taxe" && h(FeesView, { athletes: state.athletes, fees: state.fees, onSaveFee: saveFee, onResetMonth: resetMonthFees }),
      activeView === "rapoarte" && h(ReportsView, { athletes: state.athletes, trainings: state.trainings, fees: state.fees })
    );
  }

  ReactDOM.createRoot(document.getElementById("root")).render(h(App));


