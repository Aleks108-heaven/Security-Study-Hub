/* ===== 90 boot ===== */
(function boot() {
  loadCatalog();
  setUiLang(pickLang('auto'));          // so that even a start-up failure is worded in the device language where a translation exists
  const bad = loadData();
  if (bad) { showFatal(bad); return; }
  initialTheme = document.documentElement.getAttribute('data-theme');
  S = loadLocal();
  applyLanguage();                      // the language setting is part of the progress, so it can only be applied now
  applyTheme();
  buildNav();
  refreshNotices();

  /* An exam whose clock ran out while the app was closed is submitted now, so history and the dashboard stay truthful. */
  if (S.exam && Date.now() >= S.exam.deadline) {
    finalizeExam(S.exam);
    expiredNotice = true;
  }

  const skip = $('#skip');
  if (skip) skip.addEventListener('click', () => { const t = $('#view h1'); if (t) t.focus(); });

  window.addEventListener('hashchange', () => route(location.hash.slice(1)));
  window.addEventListener('pagehide', flushNow);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushNow(); });
  window.addEventListener('beforeunload', flushNow);

  route(location.hash.slice(1), { initial: true, force: true });
  sync.notify = () => { applyLanguage(); buildNav(); applyTheme(); refreshNotices(); if (cur.id === 'home' || cur.id === 'modules') route(cur.tok, { force: true, initial: true }); };
  initSync();
}());
