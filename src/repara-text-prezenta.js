(function () {
  function fixPresenceTab() {
    const buttons = document.querySelectorAll(".tabs button");
    const presenceButton = buttons[1];

    if (presenceButton && presenceButton.textContent !== "Prezență") {
      presenceButton.textContent = "Prezență";
    }
  }

  fixPresenceTab();
  setInterval(fixPresenceTab, 700);
})();
