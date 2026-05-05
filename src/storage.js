(function () {
  const STORAGE_KEY = "cs-heart-admin-v1";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return clone(window.CSHeartDemoData);

    try {
      const parsed = JSON.parse(saved);
      return {
        athletes: Array.isArray(parsed.athletes) ? parsed.athletes : [],
        trainings: Array.isArray(parsed.trainings) ? parsed.trainings : [],
        fees: Array.isArray(parsed.fees) ? parsed.fees : []
      };
    } catch (error) {
      return clone(window.CSHeartDemoData);
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function resetState() {
    const fresh = clone(window.CSHeartDemoData);
    saveState(fresh);
    return fresh;
  }

  function createId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  window.CSHeartStorage = {
    loadState,
    saveState,
    resetState,
    createId
  };
})();
