document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const statusEl = document.getElementById('form-status');

  if (!form) return;

  const setStatus = (message, type) => {
    statusEl.textContent = message;
    statusEl.className = `form-status form-status--${type}`;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setStatus('', '');

    const nombre = form.nombre.value.trim();
    const email = form.email.value.trim();
    const mensaje = form.mensaje.value.trim();
    const website_url = form.website_url.value;

    if (!nombre || !email || !mensaje) {
      setStatus('Por favor, completa todos los campos.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('El formato del correo no es válido.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, mensaje, website_url }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setStatus(data.message || 'Mensaje enviado correctamente.', 'success');
        form.reset();
      } else {
        setStatus(data.message || 'No se pudo enviar el mensaje. Inténtalo más tarde.', 'error');
      }
    } catch (err) {
      setStatus('Error de conexión. Inténtalo de nuevo más tarde.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar mensaje';
    }
  });
});