const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

function loadReleaseHistory() {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, "src", "release-history.js"), "utf8"), context);
  return context.window.CSHeartReleaseHistory;
}

test("the visible version matches the latest release date", () => {
  const history = loadReleaseHistory();

  assert.equal(history.currentVersion, "5-9-26");
  assert.equal(history.releases[0].version, history.currentVersion);
  assert.equal(history.releases[0].current, true);
});

test("the release history records the athlete identity correction and BEST Arad follow-up", () => {
  const history = loadReleaseHistory();
  const current = history.releases[0];

  assert.match(current.changes.map((item) => item.description).join(" "), /Alina.*alina.*ALINA/i);
  assert.match(current.bestArad, /De preluat/i);
});

test("the inactive-fee correction remains in the previous release", () => {
  const history = loadReleaseHistory();
  const release = history.releases.find((item) => item.version === "4-9-26");

  assert.ok(release);
  assert.match(release.changes.map((item) => item.description).join(" "), /lunile următoare nu mai generează cotizații/i);
});

test("release history loads before the application scripts", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const historyPosition = html.indexOf("release-history.js");

  assert.ok(historyPosition > -1);
  assert.ok(historyPosition < html.indexOf("extra-payments.js"));
  assert.ok(historyPosition < html.indexOf("app.js"));
});
