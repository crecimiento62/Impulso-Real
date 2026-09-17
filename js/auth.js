// ============================================================
// Autenticación con Netlify Identity — hablamos directamente con la
// API (GoTrue) en vez de usar la ventana emergente genérica de
// Netlify, para poder mantener tu propio diseño en login.html.
// ============================================================
const IDENTITY_URL = `${window.location.origin}/.netlify/identity`;
const STORAGE_KEY = 'ir_identity_session';

function saveSession(tokenResponse) {
  const session = {
    access_token: tokenResponse.access_token,
    refresh_token: tokenResponse.refresh_token,
    expires_at: Date.now() + (tokenResponse.expires_in || 3600) * 1000,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

export async function signIn(email, password) {
  const body = new URLSearchParams({ grant_type: 'password', username: email, password });
  const res = await fetch(`${IDENTITY_URL}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await res.json();
  if (!res.ok) {
    return { ok: false, error: translateAuthError(data.error_description || data.msg || '') };
  }
  const session = saveSession(data);
  return { ok: true, session };
}

export async function signOut() {
  localStorage.removeItem(STORAGE_KEY);
}

async function refreshIfNeeded(session) {
  if (!session) return null;
  if (Date.now() < session.expires_at - 30000) return session;

  const body = new URLSearchParams({ grant_type: 'refresh_token', refresh_token: session.refresh_token });
  const res = await fetch(`${IDENTITY_URL}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
  const data = await res.json();
  return saveSession(data);
}

export async function getSession() {
  const session = readSession();
  return refreshIfNeeded(session);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  const res = await fetch(`${IDENTITY_URL}/user`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function hasActiveLicense() {
  const session = await getSession();
  if (!session) return false;
  const res = await fetch('/.netlify/functions/check-license', {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (!res.ok) return false;
  const data = await res.json();
  return !!data.active;
}

export async function requireActiveLicense() {
  const session = await getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  const active = await hasActiveLicense();
  if (!active) {
    await signOut();
    window.location.href = 'login.html?motivo=sin-licencia';
    return null;
  }
  return session;
}

export async function sendPasswordReset(email) {
  const res = await fetch(`${IDENTITY_URL}/recover`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: translateAuthError(data.error_description || data.msg || '') };
  }
  return { ok: true };
}

// Usado por reset-password.html: intercambia el token que viene en el
// enlace del correo (de invitación o de recuperación) por una sesión.
export async function verifyRecoveryToken(token, type) {
  const res = await fetch(`${IDENTITY_URL}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, token }),
  });
  const data = await res.json();
  if (!res.ok) {
    return { ok: false, error: translateAuthError(data.error_description || data.msg || '') };
  }
  const session = saveSession(data);
  return { ok: true, session };
}

export async function setPassword(newPassword) {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Tu sesión de recuperación expiró. Pide un nuevo enlace.' };
  const res = await fetch(`${IDENTITY_URL}/user`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password: newPassword }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: translateAuthError(data.error_description || data.msg || '') };
  }
  return { ok: true };
}

function translateAuthError(message) {
  const map = {
    'Invalid login credentials': 'Correo o contraseña incorrectos.',
    'User not found': 'No encontramos una cuenta con ese correo.',
  };
  return map[message] || (message || 'Ocurrió un error. Intenta de nuevo.');
}
