import { db, doc, getDoc } from "./firebase.js?v=20260821e";
(function () {
  const STORAGE_KEY = "cs-heart-admin-v1";
  const BUTTON_ID = "cs-heart-backup-button";

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function backupFileName() {
    const now = new Date();
    return [
      "cs-heart-backup",
      now.getFullYear(),
      pad(now.getMonth() + 1),
      pad(now.getDate()),
      pad(now.getHours()) + pad(now.getMinutes())
    ].join("-") + ".json";
  }

  function loadCurrentState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    const state = JSON.parse(saved);
    return {
      athletes: Array.isArray(state.athletes) ? state.athletes : [],
      trainings: Array.isArray(state.trainings) ? state.trainings : [],
      fees: Array.isArray(state.fees) ? state.fees : [],
      otherPayments: Array.isArray(state.otherPayments) ? state.otherPayments : [],
      taxPayments: Array.isArray(state.taxPayments) ? state.taxPayments : [],
      otherActions: Array.isArray(state.otherActions) ? state.otherActions : [],
      athleteRevisions: Array.isArray(state.athleteRevisions) ? state.athleteRevisions : []
    };
  }

  async function downloadBackup() {
    let state;

    try {
      state = loadCurrentState();
      if (state) {
        const equipment = await getDoc(doc(db, "equipment", "state"));
        state.equipment = equipment.exists() ? window.CSHeartEquipment.validateState(equipment.data()) : window.CSHeartEquipment.empty();
      }
    } catch (error) {
      alert("Nu am putut citi toate datele pentru backup, inclusiv stocul. Verifică internetul și încearcă din nou; nu am creat o copie incompletă.");
      return;
    }

    if (!state) {
      alert("Nu am gasit date pentru backup. Intra in aplicatie si incearca din nou.");
      return;
    }

    const backup = {
      app: "CS HEART",
      exportedAt: new Date().toISOString(),
      data: state
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = backupFileName();
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function addBackupButton() {
    const topbar = document.querySelector(".topbar");
    const logoutButton = topbar?.querySelector("button");

    if (!topbar || !logoutButton || document.getElementById(BUTTON_ID)) return;

    const button = document.createElement("button");
    button.id = BUTTON_ID;
    button.type = "button";
    button.textContent = "Backup";
    button.addEventListener("click", downloadBackup);

    topbar.insertBefore(button, logoutButton);
  }

  setInterval(addBackupButton, 1200);
})();
