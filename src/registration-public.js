const form = document.querySelector("#registration-form");
const formCard = document.querySelector(".form-card");
const successCard = document.querySelector("#success-card");
const steps = [...document.querySelectorAll(".form-step")];
const nextButton = document.querySelector("#next-button");
const backButton = document.querySelector("#back-button");
const submitButton = document.querySelector("#submit-button");
const restartButton = document.querySelector("#restart-button");
const progressBar = document.querySelector("#progress-bar");
const progressValue = document.querySelector("#progress-value");
const stepKicker = document.querySelector("#step-kicker");
const formTitle = document.querySelector("#form-title");
const cnpInput = document.querySelector("#athlete-cnp");
const birthResult = document.querySelector("#birth-result");
const birthResultText = document.querySelector("#birth-result-text");
const documentModal = document.querySelector("#document-modal");
const documentTitle = document.querySelector("#document-title");
const documentContent = document.querySelector("#document-content");
const requestReference = document.querySelector("#request-reference");

const searchParams = new URLSearchParams(window.location.search);
const requestType = searchParams.get("tip") === "actualizare" ? "update" : "new";
const isPreview = searchParams.get("previzualizare") === "1";
const startedAt = Date.now();
const documentVersions = {
  rules: "2026-08-21",
  fees: "2026-09-03-r2",
  privacy: "2026-08-21"
};

const documents = {
  rules: {
    title: "Regulile de participare",
    content: `
      <p>Sportivul participă la antrenamente conform programului și indicațiilor antrenorului. Părintele anunță clubul atunci când sportivul nu poate participa sau când există o problemă medicală relevantă.</p>
      <p>Încadrarea în grupă și recomandarea privind activitatea de mișcare sau de performanță sunt stabilite de club după evaluarea sportivului și se pot modifica în funcție de evoluție și de organizarea antrenamentelor.</p>
      <p>Părintele confirmă că datele furnizate sunt corecte și va comunica eventualele schimbări importante.</p>
    `
  },
  fees: {
    title: "Condițiile cotizației",
    content: `
      <ul>
        <li>Primul antrenament se achită cu 50 lei.</li>
        <li>Al doilea antrenament se achită cu 50 lei.</li>
        <li>Dacă sportivul continuă activitatea, cei 100 lei achitați se scad din cotizația lunară.</li>
        <li>Începând cu data de 01.10.2026, cotizația lunară va fi de 250 de lei și se achită până la data de 15 a lunii, pentru luna în curs.</li>
      </ul>
      <p>Cotizația poate fi achitată în numerar (cash) sau prin transfer bancar. Pentru o evidență mai clară a plăților, clubul preferă plata prin transfer bancar.</p>
      <div class="payment-details">
        <p><strong>Beneficiar:</strong> Clubul Sportiv C.S. HEART</p>
        <p><strong>Banca:</strong> Banca Transilvania</p>
        <p><strong>IBAN:</strong> <span class="payment-iban">RO86 BTRL RONC RT02 5053 3201</span></p>
      </div>
      <p>La detaliile transferului, vă rugăm să menționați numele sportivului și luna pentru care achitați cotizația.</p>
      <ul>
        <li>Pentru frații activi în aceeași lună, cotizația este de 250 lei pentru primul sportiv și 200 lei pentru al doilea.</li>
      </ul>
      <p><strong>Exemplu:</strong> după primele două antrenamente, pentru continuarea activității mai rămân 150 lei din cotizația lunară. Pentru al doilea frate mai rămân 100 lei din cotizația redusă.</p>
    `
  },
  privacy: {
    title: "Informarea despre date",
    content: `
      <p>Datele din această cerere sunt folosite de CS HEART pentru analizarea înscrierii, comunicarea cu familia și administrarea activității sportive.</p>
      <p>CNP-ul este verificat numai în browser pentru a determina corect data nașterii. CNP-ul complet nu este transmis și nu este salvat în cerere.</p>
      <p>Cererea nu oferă părintelui acces la aplicația clubului și nu creează sau modifică automat fișa unui sportiv. Numai administratorul CS HEART poate face această asociere.</p>
      <p>Cererea și acordurile acceptate rămân în evidența clubului, împreună cu data transmiterii și versiunile documentelor citite.</p>
    `
  }
};

const objectiveLabels = {
  movement: "Mișcare și dezvoltare generală",
  performance: "Pregătire pentru performanță",
  recommendation: "Doresc recomandarea antrenorului"
};

const titles = ["Datele sportivului", "Datele părintelui", "Verificare și acorduri"];
let currentStep = 1;
let parsedBirth = null;
let submitting = false;

if (requestType === "update") {
  document.title = "CS HEART · Actualizare date";
  document.querySelector("#page-title").textContent = "Actualizare date și condiții";
  document.querySelector(".brand-card span").textContent = "Pentru sportivii aflați deja în evidența CS HEART.";
  document.querySelector(".two-fields").hidden = true;
}

const digitsOnly = (value) => String(value || "").replace(/\D/g, "");
const cleanText = (value, limit = 120) => String(value || "").trim().replace(/\s+/g, " ").slice(0, limit);
const normalizePersonName = window.CSHeartAthleteNormalization?.normalizePersonName
  || ((value) => cleanText(value).toLocaleUpperCase("ro-RO"));

function ageAt(date) {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const birthdayPassed = today.getMonth() > date.getMonth()
    || (today.getMonth() === date.getMonth() && today.getDate() >= date.getDate());
  if (!birthdayPassed) age -= 1;
  return age;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("ro-RO", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function parseCnp(value) {
  if (!/^\d{13}$/.test(value)) return null;
  const centuryBySex = { "1": 1900, "2": 1900, "3": 1800, "4": 1800, "5": 2000, "6": 2000 };
  const century = centuryBySex[value[0]];
  if (!century) return null;

  const year = century + Number(value.slice(1, 3));
  const month = Number(value.slice(3, 5));
  const day = Number(value.slice(5, 7));
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day || date > new Date()) return null;

  const control = "279146358279";
  const sum = control.split("").reduce((total, digit, index) => total + Number(digit) * Number(value[index]), 0);
  const expected = sum % 11 === 10 ? 1 : sum % 11;
  if (expected !== Number(value[12])) return null;

  return {
    date,
    year,
    age: ageAt(date),
    iso: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  };
}

function clearError(inputId) {
  if (!inputId) return;
  document.querySelector(`#${inputId}`)?.classList.remove("is-invalid");
  const error = document.querySelector(`[data-error-for="${inputId}"]`);
  if (error) error.textContent = "";
}

function showError(inputId, message) {
  document.querySelector(`#${inputId}`)?.classList.add("is-invalid");
  const error = document.querySelector(`[data-error-for="${inputId}"]`);
  if (error) error.textContent = message;
}

function validateName(inputId, label) {
  clearError(inputId);
  const input = document.querySelector(`#${inputId}`);
  const value = inputId === "athlete-name"
    ? normalizePersonName(input.value)
    : cleanText(input.value);
  input.value = value;
  if (value.length < 5 || !value.includes(" ")) {
    showError(inputId, `Completează numele și prenumele ${label}.`);
    return false;
  }
  return true;
}

function validateStepOne() {
  const validName = validateName("athlete-name", "sportivului");
  clearError("athlete-cnp");
  parsedBirth = parseCnp(cnpInput.value);
  if (!parsedBirth) showError("athlete-cnp", "Verifică CNP-ul. Trebuie să conțină 13 cifre corecte.");
  const selectedObjective = document.querySelector('input[name="objective"]:checked');
  document.querySelector("#objective-error").textContent = selectedObjective ? "" : "Alege o variantă sau solicită recomandarea antrenorului.";
  return validName && Boolean(parsedBirth) && Boolean(selectedObjective);
}

function validateStepTwo() {
  const validName = validateName("parent-name", "părintelui");
  clearError("parent-phone");
  const phone = digitsOnly(document.querySelector("#parent-phone").value);
  const validPhone = phone.length >= 10 && phone.length <= 15;
  if (!validPhone) showError("parent-phone", "Completează un număr de telefon valid.");
  return validName && validPhone;
}

function validateStepThree() {
  const checks = ["correct-data", "accept-rules", "accept-data"];
  const valid = checks.every((id) => document.querySelector(`#${id}`).checked);
  document.querySelector("#consent-error").textContent = valid ? "" : "Pentru trimitere, confirmă toate cele trei acorduri.";
  return valid;
}

function populateSummary() {
  document.querySelector("#summary-athlete").textContent = normalizePersonName(document.querySelector("#athlete-name").value);
  document.querySelector("#summary-birth").textContent = parsedBirth ? `${formatDate(parsedBirth.date)} · ${parsedBirth.age} ani` : "—";
  document.querySelector("#summary-parent").textContent = cleanText(document.querySelector("#parent-name").value);
  document.querySelector("#summary-phone").textContent = cleanText(document.querySelector("#parent-phone").value);
  const selectedObjective = document.querySelector('input[name="objective"]:checked');
  document.querySelector("#summary-objective").textContent = selectedObjective ? objectiveLabels[selectedObjective.value] : "—";
}

function updateStep() {
  if (isPreview) {
    document.body.classList.add("registration-preview");
    document.querySelector("#preview-notice").hidden = false;
    document.querySelector("#preview-documents").hidden = false;
    document.querySelector(".progress-track").hidden = true;
    progressValue.hidden = true;
    stepKicker.textContent = requestType === "update" ? "Sportiv existent · Actualizare" : "Sportiv nou · Înscriere";
    formTitle.textContent = "Formularul complet";
    steps.forEach((step) => {
      step.hidden = false;
      step.classList.add("is-active");
    });
    form.querySelectorAll("input").forEach((input) => { input.disabled = true; });
    document.querySelector(".summary-card").hidden = true;
    document.querySelector(".form-actions").hidden = true;
    nextButton.hidden = true;
    backButton.hidden = true;
    submitButton.hidden = true;
    submitButton.disabled = true;
    document.querySelector("#preview-document-list").innerHTML = Object.values(documents)
      .map((item) => `<article class="preview-document"><h3>${item.title}</h3>${item.content}</article>`).join("");
    return;
  }
  steps.forEach((step, index) => {
    const isActive = index + 1 === currentStep;
    step.hidden = !isActive;
    step.classList.toggle("is-active", isActive);
  });
  const progress = Math.round((currentStep / steps.length) * 100);
  progressBar.style.width = `${progress}%`;
  progressValue.textContent = `${progress}%`;
  stepKicker.textContent = `Pasul ${currentStep} din ${steps.length}`;
  formTitle.textContent = titles[currentStep - 1];
  backButton.hidden = currentStep === 1;
  nextButton.hidden = currentStep === steps.length;
  submitButton.hidden = currentStep !== steps.length;
  if (currentStep === 3) populateSummary();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openDocument(documentKey) {
  const selected = documents[documentKey];
  if (!selected) return;
  documentTitle.textContent = selected.title;
  documentContent.innerHTML = selected.content;
  documentContent.scrollTop = 0;
  documentModal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeDocument() {
  documentModal.hidden = true;
  document.body.style.overflow = "";
}

function buildPayload(submittedAt) {
  const selectedObjective = document.querySelector('input[name="objective"]:checked');
  return {
    schemaVersion: 1,
    requestType,
    athleteName: normalizePersonName(cleanText(document.querySelector("#athlete-name").value, 100)),
    birthDate: parsedBirth.iso,
    birthYear: parsedBirth.year,
    school: requestType === "new" ? cleanText(document.querySelector("#school").value, 100) : "",
    schoolClass: requestType === "new" ? cleanText(document.querySelector("#school-class").value, 30) : "",
    objective: selectedObjective.value,
    parentName: cleanText(document.querySelector("#parent-name").value, 100),
    parentPhone: cleanText(document.querySelector("#parent-phone").value, 30),
    secondaryPhone: cleanText(document.querySelector("#secondary-phone").value, 30),
    consents: { correctData: true, rules: true, privacy: true },
    documentVersions,
    status: "pending",
    source: "public-form",
    submittedAt,
    submittedAtClient: new Date().toISOString()
  };
}

cnpInput.addEventListener("input", () => {
  cnpInput.value = digitsOnly(cnpInput.value).slice(0, 13);
  clearError("athlete-cnp");
  parsedBirth = parseCnp(cnpInput.value);
  birthResult.hidden = !parsedBirth;
  if (parsedBirth) birthResultText.textContent = `${formatDate(parsedBirth.date)} · ${parsedBirth.age} ani`;
});

document.querySelector("#athlete-name").addEventListener("blur", (event) => {
  event.currentTarget.value = normalizePersonName(event.currentTarget.value);
});

form.querySelectorAll("input").forEach((input) => {
  input.addEventListener("input", () => clearError(input.id));
  input.addEventListener("change", () => {
    if (input.type === "checkbox") document.querySelector("#consent-error").textContent = "";
    if (input.name === "objective") document.querySelector("#objective-error").textContent = "";
  });
});

document.querySelectorAll("[data-document]").forEach((button) => button.addEventListener("click", () => openDocument(button.dataset.document)));
document.querySelector("#modal-close-x").addEventListener("click", closeDocument);
document.querySelector("#modal-close-button").addEventListener("click", closeDocument);
document.querySelector(".modal-backdrop").addEventListener("click", closeDocument);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !documentModal.hidden) closeDocument();
});

nextButton.addEventListener("click", () => {
  if (isPreview) return;
  const valid = currentStep === 1 ? validateStepOne() : validateStepTwo();
  if (!valid) return;
  currentStep += 1;
  updateStep();
});

backButton.addEventListener("click", () => {
  if (isPreview) return;
  currentStep -= 1;
  updateStep();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (isPreview || submitting || !validateStepThree()) return;
  if (document.querySelector("#website").value || Date.now() - startedAt < 2500) {
    document.querySelector("#consent-error").textContent = "Cererea nu a putut fi trimisă. Reîncearcă peste câteva secunde.";
    return;
  }

  submitting = true;
  submitButton.disabled = true;
  submitButton.textContent = "Se trimite…";
  try {
    // Reading the form must never initialise a connection to the club database.
    const { db, collection, addDoc, serverTimestamp } = await import("./firebase.js?v=20260821e");
    const payload = buildPayload(serverTimestamp());
    const result = await addDoc(collection(db, "registrationRequests"), payload);
    cnpInput.value = "";
    parsedBirth = null;
    requestReference.textContent = `Număr de referință: ${result.id.slice(0, 8).toUpperCase()}`;
    formCard.hidden = true;
    successCard.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    console.error("Nu am putut trimite cererea:", error);
    document.querySelector("#consent-error").textContent = "Cererea nu a fost trimisă. Verifică internetul și încearcă din nou.";
  } finally {
    submitting = false;
    submitButton.disabled = false;
    submitButton.textContent = "Trimite cererea";
  }
});

restartButton.addEventListener("click", () => {
  form.reset();
  parsedBirth = null;
  birthResult.hidden = true;
  currentStep = 1;
  successCard.hidden = true;
  formCard.hidden = false;
  updateStep();
});

updateStep();
