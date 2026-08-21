(function () {
  function fixPresenceTab() {
    const presenceButton = document.querySelector('.tabs button[data-view="prezenta"]');

    if (presenceButton && presenceButton.textContent !== "Prezență") {
      presenceButton.textContent = "Prezență";
    }
  }

  fixPresenceTab();
  setInterval(fixPresenceTab, 700);
})();
