document.addEventListener('DOMContentLoaded', () => {
  // Año dinámico en los pies de página
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  // Conmutador de tema (sol/luna)
  const themeToggle = document.getElementById('theme-toggle');

  if (themeToggle) {
    // Persistencia robusta: localStorage con fallback a cookie.
    const saveTheme = (theme) => {
      try {
        localStorage.setItem('nb-theme', theme);
      } catch (err) { /* localStorage bloqueado */ }
      try {
        document.cookie = `nb-theme=${theme};max-age=31536000;path=/;SameSite=Lax`;
      } catch (err) { /* cookies bloqueadas */ }
    };

    const setAria = (theme) => {
      themeToggle.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'
      );
    };

    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      saveTheme(next);
      setAria(next);
    });

    setAria(document.documentElement.getAttribute('data-theme') || 'dark');
  }

  // Menú móvil
  const navToggle = document.getElementById('nav-toggle');
  const header = document.querySelector('.site-header');

  if (navToggle && header) {
    navToggle.addEventListener('click', () => {
      const isOpen = header.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // Marcar enlace activo según la ruta actual
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  document.querySelectorAll('.nav-link[data-path]').forEach((link) => {
    if (link.dataset.path === path) {
      link.classList.add('active');
    }
  });
});