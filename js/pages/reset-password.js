// ============================================================
// Punto de entrada de reset-password.html
// Netlify Identity manda un enlace con un token en la URL, así:
//   reset-password.html#invite_token=XXXX   (cuenta nueva, tras comprar)
//   reset-password.html#recovery_token=XXXX (olvidé mi contraseña)
// Primero canjeamos ese token por una sesión, y luego dejamos que la
// persona escriba su contraseña nueva.
// ============================================================
import { verifyRecoveryToken, setPassword } from '../auth.js';

const params = new URLSearchParams(window.location.hash.replace('#', '?'));
const inviteToken = params.get('invite_token');
const recoveryToken = params.get('recovery_token');
const errorEl = document.getElementById('resetError');

(async () => {
  if (inviteToken) {
    const result = await verifyRecoveryToken(inviteToken, 'signup');
    if (!result.ok) errorEl.textContent = 'Tu enlace de invitación ya expiró. Escríbenos con tu correo de compra.';
  } else if (recoveryToken) {
    const result = await verifyRecoveryToken(recoveryToken, 'recovery');
    if (!result.ok) errorEl.textContent = 'Tu enlace de recuperación ya expiró. Pide uno nuevo desde la página de inicio de sesión.';
  } else {
    errorEl.textContent = 'Este enlace no es válido. Ábrelo desde el correo que te enviamos.';
  }
})();

document.getElementById('resetForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = document.getElementById('newPassword').value;
  const confirm = document.getElementById('confirmPassword').value;
  const btn = document.getElementById('resetBtn');

  errorEl.textContent = '';

  if (password.length < 8) {
    errorEl.textContent = 'Tu contraseña debe tener al menos 8 caracteres.';
    return;
  }
  if (password !== confirm) {
    errorEl.textContent = 'Las dos contraseñas no coinciden.';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Guardando...';

  const result = await setPassword(password);

  if (!result.ok) {
    errorEl.textContent = result.error;
    btn.disabled = false;
    btn.textContent = 'Guardar contraseña →';
    return;
  }

  document.getElementById('resetForm').classList.add('hidden');
  document.getElementById('resetSuccess').classList.remove('hidden');
  setTimeout(() => { window.location.href = 'app.html'; }, 1800);
});
