// ============================================================
// Punto de entrada de login.html
// ============================================================
import { signIn, sendPasswordReset, getSession, hasActiveLicense } from '../auth.js';

// Si ya hay una sesión activa con licencia válida, saltar directo a la app.
(async () => {
  const session = await getSession();
  if (session && (await hasActiveLicense())) {
    window.location.href = 'app.html';
  }
})();

// Mensaje según por qué llegó a login.html (ej. licencia revocada)
const params = new URLSearchParams(window.location.search);
if (params.get('motivo') === 'sin-licencia') {
  const el = document.getElementById('loginNotice');
  if (el) {
    el.textContent = 'Tu acceso no está activo. Si crees que es un error, contáctanos con tu correo de compra.';
    el.classList.remove('hidden');
  }
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  const btn = document.getElementById('loginBtn');

  errorEl.textContent = '';
  btn.disabled = true;
  btn.textContent = 'Entrando...';

  const result = await signIn(email, password);

  if (!result.ok) {
    errorEl.textContent = result.error;
    btn.disabled = false;
    btn.textContent = 'Iniciar sesión →';
    return;
  }

  const active = await hasActiveLicense();
  if (!active) {
    errorEl.textContent = 'Tu cuenta existe, pero no tiene un acceso activo. Revisa tu correo de compra o contáctanos.';
    btn.disabled = false;
    btn.textContent = 'Iniciar sesión →';
    return;
  }

  window.location.href = 'app.html';
});

document.getElementById('forgotPasswordLink').addEventListener('click', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const msgEl = document.getElementById('loginError');
  if (!email) {
    msgEl.textContent = 'Escribe tu correo arriba primero, y luego haz clic en "Olvidé mi contraseña".';
    return;
  }
  const result = await sendPasswordReset(email);
  msgEl.style.color = 'var(--primary-dark)';
  msgEl.textContent = result.ok
    ? 'Te enviamos un correo para crear una nueva contraseña.'
    : result.error;
});
