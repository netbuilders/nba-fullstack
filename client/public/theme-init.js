// Inicialización del tema antes de que pinte el CSS (anti-FOUC).
// Archivo externo para cumplir la CSP de helmet (script-src 'self') sin inline.
(function () {
  try {
    var stored = localStorage.getItem('nb-theme');
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.setAttribute('data-theme', stored);
      return;
    }
  } catch (e) {}

  try {
    var match = document.cookie.match(/(?:^|;\s*)nb-theme=(light|dark)/);
    if (match) {
      document.documentElement.setAttribute('data-theme', match[1]);
      return;
    }
  } catch (e) {}

  document.documentElement.setAttribute(
    'data-theme',
    window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  );
})();