const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const publicSource = fs.readFileSync(path.join(root, "src/registration-public.js"), "utf8");

// A local DOM double and a fake Firebase import: these tests cannot reach the database.
function formHarness(search) {
  const elements = new Map();
  function element(selector) {
    if (!elements.has(selector)) elements.set(selector, {
      value: "", textContent: "", innerHTML: "", hidden: false, disabled: false,
      checked: false, style: {}, dataset: {}, listeners: {},
      classList: { add() {}, remove() {}, toggle() {} },
      addEventListener(event, callback) { this.listeners[event] = callback; }
    });
    return elements.get(selector);
  }
  const steps = [1, 2, 3].map((id) => element(`step-${id}`));
  const inputIds = ["athlete-name", "athlete-cnp", "school", "school-class", "parent-name", "parent-phone", "secondary-phone", "website", "correct-data", "accept-rules", "accept-data"];
  const inputs = inputIds.map((id) => element(`#${id}`));
  const documentButtons = ["rules", "fees", "privacy"].map((key) => {
    const button = element(`document-${key}`);
    button.dataset.document = key;
    return button;
  });
  const form = element("#registration-form");
  form.querySelectorAll = () => inputs;
  const writes = [];
  let imports = 0;
  let now = 10000;
  const context = vm.createContext({
    document: {
      body: element("body"),
      querySelector: element,
      querySelectorAll: (selector) => selector === ".form-step" ? steps : documentButtons,
      addEventListener() {}
    },
    window: { location: { search }, scrollTo() {} },
    URLSearchParams, Intl, console,
    Date: class extends Date { static now() { return now; } },
    loadFirebase: async () => {
      imports += 1;
      return {
        db: {}, collection: (_db, name) => name, serverTimestamp: () => "test-server-time",
        addDoc: async (collection, payload) => { writes.push({ collection, payload }); return { id: "local-test-only" }; }
      };
    }
  });
  const importExpression = 'await import("./firebase.js?v=20260821e")';
  assert.ok(publicSource.includes(importExpression));
  vm.runInContext(publicSource.replace(importExpression, "await loadFirebase()"), context);
  return {
    element, steps, inputs, writes, context, imports: () => imports,
    click: (id) => element(id).listeners.click(),
    submit: () => { now += 3000; return form.listeners.submit({ preventDefault() {} }); }
  };
}

for (const type of ["new", "update"]) {
  const query = type === "update" ? "?tip=actualizare" : "?";
  test(`${type}: preview reveals all steps and documents, and never imports Firebase`, async () => {
    const page = formHarness(`${query}&previzualizare=1`);
    assert.ok(page.steps.every((step) => !step.hidden));
    assert.ok(page.inputs.every((input) => input.disabled));
    assert.equal(page.element(".two-fields").hidden, type === "update");
    assert.equal(page.element("#submit-button").hidden, true);
    assert.equal(page.element("#submit-button").disabled, true);
    assert.equal(page.element(".form-actions").hidden, true);
    assert.equal(page.element("#preview-documents").hidden, false);
    const expectedDocuments = vm.runInContext("Object.values(documents).map((item) => item.content)", page.context);
    for (const content of expectedDocuments) assert.ok(page.element("#preview-document-list").innerHTML.includes(content));
    page.click("document-fees");
    assert.equal(page.element("#document-content").innerHTML, expectedDocuments[1]);
    // A dispatched submit event is blocked too, not just a hidden button.
    await page.submit();
    assert.equal(page.imports(), 0);
    assert.equal(page.writes.length, 0);
    assert.equal(page.element("#consent-error").textContent, "");
  });

  test(`${type}: normal form still validates, advances and builds the same request`, async () => {
    const page = formHarness(query);
    assert.equal(page.imports(), 0);
    assert.deepEqual(page.steps.map((step) => step.hidden), [false, true, true]);
    page.click("#next-button");
    assert.deepEqual(page.steps.map((step) => step.hidden), [false, true, true]);
    page.element("#athlete-name").value = "Sportiv Test";
    // Synthetic local-only identifier; it is never sent, even to the fake backend.
    const prefix = "514031501001";
    const checksum = [...prefix].reduce((sum, digit, i) => sum + Number(digit) * Number("279146358279"[i]), 0) % 11;
    page.element("#athlete-cnp").value = prefix + (checksum === 10 ? 1 : checksum);
    page.element('input[name="objective"]:checked').value = "movement";
    page.element("#school").value = "Școala Test";
    page.click("#next-button");
    assert.deepEqual(page.steps.map((step) => step.hidden), [true, false, true]);
    page.element("#parent-name").value = "Parinte Test";
    page.element("#parent-phone").value = "0700000000";
    page.click("#next-button");
    assert.deepEqual(page.steps.map((step) => step.hidden), [true, true, false]);
    await page.submit();
    assert.equal(page.imports(), 0, "missing consents must block submission");
    for (const id of ["correct-data", "accept-rules", "accept-data"]) page.element(`#${id}`).checked = true;
    await page.submit();
    assert.equal(page.imports(), 1);
    assert.equal(page.writes.length, 1);
    const { collection, payload } = page.writes[0];
    assert.equal(collection, "registrationRequests");
    assert.equal(payload.requestType, type);
    assert.equal(payload.athleteName, "Sportiv Test");
    assert.equal(payload.birthDate, "2014-03-15");
    assert.equal(payload.school, type === "new" ? "Școala Test" : "");
    assert.equal(payload.submittedAt, "test-server-time");
    assert.equal(payload.documentVersions.fees, "2026-09-03");
    assert.equal(payload.documentVersions.rules, "2026-08-21");
    assert.equal(payload.documentVersions.privacy, "2026-08-21");
    assert.equal(Object.keys(payload).some((key) => /cnp/i.test(key)), false);
    assert.equal(page.element("#success-card").hidden, false);
  });
}

test("payment instructions contain the supplied account, immediately after the monthly fee", () => {
  const page = formHarness("?previzualizare=1");
  page.click("document-fees");
  const content = page.element("#document-content").innerHTML;
  assert.ok(content.indexOf("250 lei și se achită") < content.indexOf("numerar (cash)"));
  assert.ok(content.indexOf("payment-details") < content.indexOf("Pentru frații"));
  assert.ok(content.includes("clubul preferă plata prin transfer bancar"));
  assert.ok(content.includes("Clubul Sportiv C.S. HEART"));
  assert.ok(content.includes("Banca Transilvania"));
  assert.ok(content.includes("numele sportivului și luna"));
  const iban = content.match(/class="payment-iban">([^<]+)</)[1].replace(/\s/g, "");
  assert.equal(iban, "RO86BTRLRONCRT0250533201");
  assert.equal(iban.length, 24);
  const digits = (iban.slice(4) + iban.slice(0, 4)).replace(/[A-Z]/g, (letter) => String(letter.charCodeAt(0) - 55));
  assert.equal(BigInt(digits) % 97n, 1n);
});

test("admin reading links are separate from the links copied and sent to parents", async () => {
  const copies = [];
  const opened = [];
  const context = vm.createContext({
    URL,
    React: {
      createElement: (tag, props, ...children) => ({ tag, props: props || {}, children: children.flat(Infinity) }),
      useState: (initial) => [initial, () => {}]
    },
    navigator: { clipboard: { writeText: async (text) => copies.push(text) } },
    window: {
      location: { href: "https://judas71.github.io/cs-heart-app/?v=cache&previzualizare=1" },
      setTimeout() {}, open: (url) => opened.push(url)
    }
  });
  vm.runInContext(fs.readFileSync(path.join(root, "src/registrations-admin.js"), "utf8"), context);
  const tree = context.window.RegistrationsAdminView({ requests: [], athletes: [] });
  const nodes = [];
  function walk(node) {
    if (!node || typeof node !== "object") return;
    nodes.push(node);
    node.children.forEach(walk);
  }
  walk(tree);
  const links = nodes.filter((node) => node.tag === "a");
  assert.equal(links.length, 2);
  assert.equal(new URL(links[0].props.href).search, "?previzualizare=1");
  assert.equal(new URL(links[1].props.href).search, "?tip=actualizare&previzualizare=1");
  for (const node of nodes.filter((item) => item.tag === "button" && /Copiază|WhatsApp/.test(item.children.join("")))) {
    await node.props.onClick();
  }
  assert.equal(copies.length, 2);
  assert.equal(opened.length, 2);
  assert.ok(copies.every((url) => !url.includes("previzualizare")));
  assert.ok(opened.every((url) => !decodeURIComponent(url).includes("previzualizare")));
});
