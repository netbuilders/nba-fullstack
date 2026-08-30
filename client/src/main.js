document.addEventListener('DOMContentLoaded', () => {
  // Año dinámico en los pies de página
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

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