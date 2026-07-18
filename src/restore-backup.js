import { db, doc, setDoc, auth } from "./firebase.js";

const STORAGE_KEY = "cs-heart-admin-v1";
const BUTTON_ID = "cs-heart-restore-button";

function pad(value) {
  return String(value).padStart(2, "0");
}

function timestamp() {
  const now = new Date();
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()) + pad(now.getMinutes())
  ].join("-");
}

function normalizeState(value) {
  if (!value || !Array.isArray(value.athletes) || !Array.isArray(value.trainings) || !Array.isArray(value.fees)) {
    throw new Error("Fisierul ales nu este un backup CS HEART valid.");
  }

  return {
    athletes: value.athletes,
    trainings: value.trainings,
    fees: value.fees,
    otherPayments: Array.isArray(value.otherPayments) ? value.otherPayments : [],
    taxPayments: Array.isArray(value.taxPayments) ? value.taxPayments : [],
    otherActions: Array.isArray(value.otherActions) ? value.otherActions : []
  };
}

function downloadCurrentSafetyCopy() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  const current = normalizeState(JSON.parse(saved));
  const backup = {
    app: "CS HEART",
    exportedAt: new Date().toISOString(),
    reason: "Copie automata inainte de restaurare",
    data: current
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "cs-heart-inainte-restaurare-" + timestamp() + ".json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function restoreFromFile(file) {
  if (!auth.currentUser) {
    alert("Trebuie sa fii autentificat pentru restaurare.");
    return;
  }

  let state;

  try {
    const parsed = JSON.parse(await file.text());
    state = normalizeState(parsed.data || parsed);
  } catch (error) {
    alert(error.message || "Nu am putut citi fisierul de backup.");
    return;
  }

  const firstConfirm = confirm(
    "Restaurarea va inlocui datele din aplicatie cu backup-ul ales:\n\n" +
      state.athletes.length + " sportivi\n" +
      state.trainings.length + " antrenamente/prezente\n" +
      state.fees.length + " inregistrari de taxe\n\n" +
      state.otherPayments.length + " alte incasari\n\n" +
      state.taxPayments.length + " plati din taxe\n\n" +
      state.otherActions.length + " actiuni din alte incasari\n\n" +
      "Continui?"
  );

  if (!firstConfirm) return;

  const finalConfirm = confirm(
    "Confirmare finala: datele curente vor fi inlocuite.\n\n" +
      "Inainte de inlocuire, descarc automat o copie de siguranta a datelor actuale."
  );

  if (!finalConfirm) return;

  try {
    downloadCurrentSafetyCopy();
    await setDoc(doc(db, "app", "state"), state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    alert("Restaurarea s-a terminat cu succes. Aplicatia se va reincarca acum.");
    window.location.reload();
  } catch (error) {
    console.error("Eroare la restaurarea backup-ului:", error);
    alert("Nu am putut restaura datele. Copia actuala nu a fost stearsa.");
  }
}

function chooseBackupFile() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,application/json";
  input.addEventListener("change", () => {
    const file = input.files && input.files[0];
    if (file) restoreFromFile(file);
  });
  input.click();
}

function addRestoreButton() {
  const topbar = document.querySelector(".topbar");
  const buttons = topbar?.querySelectorAll("button");
  const logoutButton = buttons?.[buttons.length - 1];

  if (!topbar || !logoutButton || document.getElementById(BUTTON_ID)) return;

  const button = document.createElement("button");
  button.id = BUTTON_ID;
  button.type = "button";
  button.textContent = "Restaurare backup";
  button.addEventListener("click", chooseBackupFile);
  topbar.insertBefore(button, logoutButton);
}

setInterval(addRestoreButton, 1200);
