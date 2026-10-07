(function () {
  const keys = ['athletes', 'trainings', 'fees', 'otherPayments', 'taxPayments', 'otherActions', 'athleteRevisions'];
  function payload(value) {
    return Object.fromEntries(keys.map(key => [key, Array.isArray(value?.[key]) ? value[key] : []]));
  }
  function canonical(value) {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
    return value;
  }
  function equal(a, b) { return JSON.stringify(canonical(a)) === JSON.stringify(canonical(b)); }
  function prepare(base, next, remote) {
    if (!remote || !equal(payload(base), payload(remote)) || Number(base?.syncRevision || 0) !== Number(remote.syncRevision || 0)) {
      throw Object.assign(new Error('Datele au fost modificate din altă pagină. Nu am suprascris nimic. Păstrează copia modificării și reîncarcă pagina înainte de a continua.'), { code: 'state-conflict' });
    }
    return { ...remote, ...payload(next), syncRevision: Number(remote.syncRevision || 0) + 1 };
  }
  // A full/disabled local store must never prevent the server write.
  function cache(save, state) {
    try { save(state); return true; } catch (error) { console.warn('Copia locală nu poate fi salvată.', error); return false; }
  }
  window.CSHeartSafeState = { payload, equal, prepare, cache };
})();
