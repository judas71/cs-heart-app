  import { EquipmentApp } from "./equipment-store.js?v=20260928e";
  import "./safe-state.js?v=20261007a";
  const safeState = window.CSHeartSafeState;
  const h = React.createElement;
  const { AttendanceView, FeesView, ReportsView, OtherPaymentsView } = window.CSHeartComponents;
  const { loadState, saveState, resetState, createId } = window.CSHeartStorage;
  const { migrateInactiveAthletes, applyStatusChange } = window.CSHeartMembershipFees;
  const { normalizeAthleteRecord, athleteIdentityKey, migrateAthleteIdentities } = window.CSHeartAthleteNormalization;
  const appVersion = window.CSHeartReleaseHistory?.currentVersion || "17-9-26";
  import {
    db,
    doc,
    getDoc,
    getDocFromServer,
    runTransaction,
    setDoc,
    collection,
    query,
    orderBy,
    onSnapshot,
    updateDoc,
    writeBatch,
    serverTimestamp,
    auth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
  } from "./firebase.js?v=20261007a";
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
    const [attendanceDirty, setAttendanceDirty] = React.useState(false);
    const [equipmentDirty, setEquipmentDirty] = React.useState(false);
    const [user, setUser] = React.useState(null);
    const [authReady, setAuthReady] = React.useState(false);
    const [registrationRequests, setRegistrationRequests] = React.useState([]);
    const [registrationsLoading, setRegistrationsLoading] = React.useState(false);
    const [registrationsError, setRegistrationsError] = React.useState("");

   const loadedRef = React.useRef(false);
   const serverRef = React.useRef(null);
   const savingRef = React.useRef(false);
   const [saveStatus, setSaveStatus] = React.useState('loading');
   const [saveError, setSaveError] = React.useState('');
   const [retry, setRetry] = React.useState(0);
   const dirty = loadedRef.current && !safeState.equal(safeState.payload(state), safeState.payload(serverRef.current));
   const blocked = !loadedRef.current || dirty || saveStatus === 'saving' || saveStatus === 'error';

   async function commitState(nextState) {
     if (!loadedRef.current || savingRef.current) throw new Error('Așteaptă încărcarea/salvarea datelor.');
     savingRef.current = true;
     setState(nextState);
     setSaveStatus('saving');
     setSaveError('');
     const base = serverRef.current;
     const slowNotice = setTimeout(() => setSaveError('Salvarea durează mai mult decât de obicei. Nu închide pagina și nu reintroduce plata; așteptăm răspunsul serverului.'), 12000);
     safeState.cache(saveState, nextState);
     try {
       const saved = await runTransaction(db, async transaction => {
         const ref = doc(db, 'app', 'state');
         const snapshot = await transaction.get(ref);
         const updated = safeState.prepare(base, nextState, snapshot.exists() ? snapshot.data() : null);
         transaction.set(ref, updated);
         return updated;
       });
       serverRef.current = saved;
       safeState.cache(saveState, saved);
       setSaveStatus('saved');
       setSaveError('');
       return saved;
     } catch (error) {
       setSaveError(error.code === 'state-conflict' ? error.message : 'Nu s-a salvat pe server. Nu trimite confirmarea și nu reintroduce plata. Verifică internetul, apoi apasă Reîncearcă salvarea. (' + (error.code || 'eroare') + ')');
       setSaveStatus('error');
       throw error;
     } finally { clearTimeout(slowNotice); savingRef.current = false; }
   }

   React.useEffect(() => {
     const warn = event => { if (blocked && loadedRef.current) { event.preventDefault(); event.returnValue = ''; } };
     window.addEventListener('beforeunload', warn);
     return () => window.removeEventListener('beforeunload', warn);
   }, [blocked]);

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
      const snapshot = await getDocFromServer(appRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        const loadedState = {
          athletes: Array.isArray(data.athletes) ? data.athletes : [],
          trainings: Array.isArray(data.trainings) ? data.trainings : [],
          fees: Array.isArray(data.fees) ? data.fees : [],
          otherPayments: Array.isArray(data.otherPayments) ? data.otherPayments : [],
          taxPayments: Array.isArray(data.taxPayments) ? data.taxPayments : [],
          otherActions: Array.isArray(data.otherActions) ? data.otherActions : [],
          athleteRevisions: Array.isArray(data.athleteRevisions) ? data.athleteRevisions : []
        };
        const feeMigration = migrateInactiveAthletes(loadedState);
        const identityMigration = migrateAthleteIdentities(feeMigration.state);
        const migratedState = identityMigration.state;

        serverRef.current = data;
        loadedRef.current = true;
        setState(migratedState);
        setSaveStatus('saved');
        safeState.cache(saveState, migratedState);
      } else {
        throw new Error('Registrul clubului nu a fost găsit. Nu am încărcat și nu am salvat date demonstrative.');
      }

      loadedRef.current = true;
    } catch (error) {
      console.error("Eroare la citirea din Firebase:", error);
      loadedRef.current = false;
      setSaveStatus('error');
      setSaveError('Nu pot încărca datele actuale de pe server. Reîncarcă pagina când conexiunea funcționează.');
    }
  }

  loadFromFirestore();
}, [authReady, user?.uid]);

  React.useEffect(() => {
    if (!authReady || !user) {
      setRegistrationRequests([]);
      return;
    }

    setRegistrationsLoading(true);
    setRegistrationsError("");
    const registrationsQuery = query(collection(db, "registrationRequests"), orderBy("submittedAt", "desc"));
    return onSnapshot(
      registrationsQuery,
      (snapshot) => {
        setRegistrationRequests(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
        setRegistrationsLoading(false);
      },
      (error) => {
        console.error("Eroare la citirea cererilor de inscriere:", error);
        setRegistrationsError("Cererile nu pot fi citite încă. Verifică publicarea regulilor Firebase.");
        setRegistrationsLoading(false);
      }
    );
  }, [authReady, user?.uid]);

React.useEffect(() => {
  if (!authReady || !user || !loadedRef.current || savingRef.current || !dirty) return;
  commitState(state).catch(error => console.error('Salvarea a fost oprită:', error));
}, [state, authReady, user?.uid, retry]);

    async function addAthlete(athlete) {
  try {
    const docRef = { id: Date.now().toString() };
    const changedAt = new Date().toISOString();
    const normalizedAthlete = normalizeAthleteRecord(athlete);
    const newAthlete = applyStatusChange(
      { active: true, joinMonth: normalizedAthlete.joinMonth },
      { ...normalizedAthlete, id: docRef.id },
      changedAt
    );

    setState((current) => ({
      ...current,
      athletes: [newAthlete, ...current.athletes]
    }));
  } catch (error) {
    console.error("Eroare la salvarea sportivului:", error);
    alert("Nu s-a salvat sportivul Ã®n Firebase.");
  }
}

    function registrationDocumentRef(request) {
      return {
        requestId: request.id,
        requestType: request.requestType,
        submittedAtClient: request.submittedAtClient || "",
        documentVersions: request.documentVersions || {}
      };
    }

    async function persistStateImmediately(nextState) {
      await commitState(nextState);
      setState(nextState);
    }

    async function finishRegistration(request, linkedAthleteId, adminDecision) {
      await updateDoc(doc(db, "registrationRequests", request.id), {
        status: adminDecision === "rejected" ? "rejected" : "accepted",
        linkedAthleteId: linkedAthleteId || "",
        processedAt: serverTimestamp(),
        processedBy: user?.email || user?.uid || "administrator",
        adminDecision
      });
    }

    async function deleteRegistrationRequest(request) {
      const nextAthletes = state.athletes.map((athlete) => {
        const documentRefs = Array.isArray(athlete.documentRefs) ? athlete.documentRefs : [];
        if (!documentRefs.some((reference) => reference.requestId === request.id)) return athlete;
        return {
          ...athlete,
          documentRefs: documentRefs.filter((reference) => reference.requestId !== request.id)
        };
      });
      const stateChanged = nextAthletes.some((athlete, index) => athlete !== state.athletes[index]);
      const nextState = stateChanged ? { ...state, athletes: nextAthletes } : state;
      const batch = writeBatch(db);

      if (stateChanged) await persistStateImmediately(nextState);
      batch.delete(doc(db, "registrationRequests", request.id));
      await batch.commit();

      if (stateChanged) {
        setState(nextState);
        safeState.cache(saveState, nextState);
      }
    }

    async function createAthleteFromRegistration(request, form) {
      const existing = state.athletes.find((athlete) =>
        (athlete.documentRefs || []).some((reference) => reference.requestId === request.id)
      );

      if (existing) {
        await finishRegistration(request, existing.id, "created");
        return;
      }

      const id = createId("athlete");
      const now = new Date().toISOString();
      const athlete = normalizeAthleteRecord({
        id,
        lastName: form.lastName,
        firstName: form.firstName,
        group: form.group,
        parentPhone: request.parentPhone || "",
        secondaryPhone: request.secondaryPhone || "",
        parentName: request.parentName || "",
        active: form.active !== false,
        feeDue: Number(form.feeDue ?? 250),
        birthYear: String(request.birthYear || ""),
        birthDate: request.birthDate || "",
        school: request.school || "",
        schoolClass: request.schoolClass || "",
        activityObjective: request.objective || "recommendation",
        frbLicense: "",
        notes: "",
        joinMonth: now.slice(0, 7),
        medicalVisaFrom: "",
        medicalVisaTo: "",
        documentRefs: [registrationDocumentRef(request)],
        createdAt: now,
        createdByEmail: user?.email || "necunoscut",
        createdById: user?.uid || ""
      });
      const duplicate = state.athletes.find((item) =>
        athleteIdentityKey(item) === athleteIdentityKey(athlete)
        && String(item.birthYear || "") === String(athlete.birthYear || "")
      );
      if (duplicate) {
        throw new Error(`Există deja sportivul ${duplicate.lastName} ${duplicate.firstName}. Folosește „Leagă de sportiv existent”.`);
      }
      const nextState = { ...state, athletes: [athlete, ...state.athletes] };
      await persistStateImmediately(nextState);
      await finishRegistration(request, id, "created");
    }

    async function linkRegistrationToAthlete(request, athlete, options) {
      const alreadyLinked = (athlete.documentRefs || []).some((reference) => reference.requestId === request.id);
      const updatedAthlete = {
        ...athlete,
        ...(options.applyPhone ? { parentPhone: request.parentPhone || athlete.parentPhone || "", secondaryPhone: request.secondaryPhone || athlete.secondaryPhone || "", parentName: request.parentName || athlete.parentName || "" } : {}),
        ...(options.applyBirthYear ? { birthYear: String(request.birthYear || athlete.birthYear || ""), birthDate: request.birthDate || athlete.birthDate || "" } : {}),
        activityObjective: request.objective || athlete.activityObjective || "recommendation",
        documentRefs: alreadyLinked ? (athlete.documentRefs || []) : [registrationDocumentRef(request), ...(athlete.documentRefs || [])],
        updatedAt: new Date().toISOString(),
        updatedByEmail: user?.email || "necunoscut",
        updatedById: user?.uid || ""
      };
      const nextState = {
        ...state,
        athletes: state.athletes.map((item) => item.id === athlete.id ? updatedAthlete : item)
      };
      await persistStateImmediately(nextState);
      await finishRegistration(request, athlete.id, "linked");
    }

    async function rejectRegistration(request) {
      await finishRegistration(request, "", "rejected");
    }

    function updateAthlete(id, athlete) {
      const changedAt = new Date().toISOString();
      setState((current) => {
        const previous = current.athletes.find((item) => item.id === id);
        const revision = previous
          ? {
              ...previous,
              revisionSavedAt: changedAt,
              revisionSavedByEmail: user?.email || "necunoscut"
            }
          : null;

        return {
          ...current,
          athletes: current.athletes.map((item) =>
            item.id === id
              ? applyStatusChange(
                  item,
                  normalizeAthleteRecord({
                    ...item,
                    ...athlete,
                    id,
                    updatedAt: changedAt,
                    updatedByEmail: user?.email || "necunoscut",
                    updatedById: user?.uid || ""
                  }),
                  changedAt
                )
              : item
          ),
          athleteRevisions: revision
            ? [revision, ...(current.athleteRevisions || [])].slice(0, 120)
            : current.athleteRevisions || []
        };
      });
    }

    function deleteAthlete(id) {
      const ok = confirm("È˜tergi sportivul È™i datele lui asociate?");
      if (!ok) return;
      setState((current) => ({
        ...current,
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
          ...window.CSHeartOperatorReceipts.stampFee(fee, existing, user, new Date().toISOString()),
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
          ...window.CSHeartOperatorReceipts.stampReceipt(payment, existing, user, new Date().toISOString()),
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
    function saveOtherAction(action) {
      setState((current) => {
        const existing = (current.otherActions || []).find((item) => item.id === action.id);
        const normalized = {
          ...action,
          id: action.id || createId("otheraction"),
          updatedAt: new Date().toISOString(),
          updatedByEmail: user?.email || "necunoscut",
          updatedById: user?.uid || ""
        };

        return {
          ...current,
          otherActions: existing
            ? (current.otherActions || []).map((item) => (item.id === existing.id ? normalized : item))
            : [normalized, ...(current.otherActions || [])]
        };
      });
    }

    function deleteOtherAction(id) {
      const ok = confirm("Stergi aceasta actiune? Incasarile existente raman in registru.");
      if (!ok) return;

      setState((current) => ({
        ...current,
        otherActions: (current.otherActions || []).filter((action) => action.id !== id)
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
                payments: [],
                confirmationCount: 0,
                confirmationGeneratedAt: "",
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

    function confirmLeaveAttendance() {
      if (activeView === "echipamente" && equipmentDirty) return confirm("Ai un formular de echipamente nesalvat. Pleci fără să îl salvezi?");
      if (activeView !== "prezenta" || !attendanceDirty) return true;
      return confirm("Ai modificari nesalvate la prezenta. Sigur vrei sa pleci fara sa le salvezi?");
    }

    function changeView(nextView) {
      if (nextView === activeView) return;
      if (!confirmLeaveAttendance()) return;
      setAttendanceDirty(false);
      setEquipmentDirty(false);
      setActiveView(nextView);
    }

    function logout() {
      if (!confirmLeaveAttendance()) return;
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
      ["inscrieri", `Înscrieri${registrationRequests.filter((item) => item.status === "pending").length ? ` (${registrationRequests.filter((item) => item.status === "pending").length})` : ""}`],
      ["prezenta", "PrezenÈ›Äƒ"],
      ["taxe", "Taxe"],
      ["alteIncasari", "Alte incasari"],
      ["echipamente", "Echipamente"],
      ["rapoarte", "Rapoarte"]
    ];

    return h(
      "main",
      { className: "app-shell" },
      h('div', { role: saveStatus === 'error' ? 'alert' : 'status', style: { padding: '12px', background: saveStatus === 'error' ? '#fff0f0' : '#eef6fa', marginBottom: '12px' } },
        saveError || (blocked ? 'Se salvează / se verifică datele pe server. Așteaptă înainte de confirmare.' : 'Salvat pe server'),
        saveStatus === 'error' && loadedRef.current && h('button', { onClick: () => setRetry(value => value + 1) }, 'Reîncearcă salvarea'),
        saveStatus === 'error' && loadedRef.current && h('button', { onClick: () => {
          const url = URL.createObjectURL(new Blob([JSON.stringify({ app: 'CS HEART', reason: 'Modificări nesalvate — de verificat, nu restaura automat', data: state }, null, 2)], { type: 'application/json' }));
          const link = document.createElement('a'); link.href = url; link.download = 'cs-heart-modificari-nesalvate.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
        } }, 'Păstrează copia modificării')
      ),
      h('fieldset', { disabled: blocked, style: { border: 0, padding: 0, margin: 0, minWidth: 0 } },
      h(
        "header",
        { className: "topbar" },
        h("div", { className: "app-brand" }, h("p", { className: "eyebrow" }, "Administrare club"), h("h1", null, "CS HEART"), h("p", { className: "app-version" }, `Versiunea ${appVersion}`)),
        h("button", { onClick: logout }, "Iesire")
      ),
      h(
        "nav",
        { className: "tabs", "aria-label": "SecÈ›iuni aplicaÈ›ie" },
        views.map(([id, label]) => h("button", { key: id, "data-view": id, className: activeView === id ? "active" : "", onClick: () => changeView(id) }, label))
      ),
      activeView === "sportivi" && h(AthletesView, { athletes: state.athletes, trainings: state.trainings, fees: state.fees, otherPayments: state.otherPayments || [], taxPayments: state.taxPayments || [], registrationRequests, onAdd: addAthlete, onUpdate: updateAthlete, onDelete: deleteAthlete, onNavigate: changeView }),
      activeView === "inscrieri" && h(window.RegistrationsAdminView, { requests: registrationRequests, athletes: state.athletes, loading: registrationsLoading, error: registrationsError, onCreate: createAthleteFromRegistration, onLink: linkRegistrationToAthlete, onReject: rejectRegistration, onDelete: deleteRegistrationRequest }),
      activeView === "prezenta" && h(AttendanceView, { athletes: state.athletes, trainings: state.trainings, onSaveTraining: saveTraining, onDeleteTraining: deleteTraining, onDirtyChange: setAttendanceDirty }),
      activeView === "taxe" && h(FeesView, { athletes: state.athletes, fees: state.fees, taxPayments: state.taxPayments || [], operatorEmail: user?.email || "", onSaveFee: saveFee, onSaveTaxPayment: saveTaxPayment, onDeleteTaxPayment: deleteTaxPayment }),
      activeView === "alteIncasari" && h(OtherPaymentsView, { athletes: state.athletes, otherPayments: state.otherPayments || [], otherActions: state.otherActions || [], onSavePayment: saveOtherPayment, onDeletePayment: deleteOtherPayment, onSaveAction: saveOtherAction, onDeleteAction: deleteOtherAction }),
      activeView === "rapoarte" && h(ReportsView, { athletes: state.athletes, trainings: state.trainings, fees: state.fees, otherPayments: state.otherPayments || [], otherActions: state.otherActions || [], taxPayments: state.taxPayments || [] }),
      activeView === "echipamente" && h(EquipmentApp, { athletes:state.athletes, user, onDirtyChange:setEquipmentDirty })
      )
    );
  }

  ReactDOM.createRoot(document.getElementById("root")).render(h(App));
