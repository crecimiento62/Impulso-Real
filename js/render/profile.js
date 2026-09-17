// ============================================================
// Mi perfil — editar nombre, reiniciar progreso y cerrar sesión.
// El nombre se guarda directamente en Netlify Identity (user_metadata).
// ============================================================
import { getState, saveProgress } from '../state.js';
import { getSession, signOut } from '../auth.js';
import { showView, updateProgressUI } from '../router.js';

const state = getState();
const IDENTITY_URL = `${window.location.origin}/.netlify/identity`;

function renderProfile(){
  return `
    <div class="card panel-section" style="padding:24px;max-width:440px;">
      <h4 style="margin-bottom:16px;">Datos de tu cuenta</h4>
      <div class="field"><label>Nombre</label><input id="profName" value="${state.profile.name}"></div>
      <div class="field"><label>Correo</label><input id="profEmail" value="${state.profile.email||''}" disabled style="opacity:.6;"></div>
      <p style="font-size:11.5px;color:var(--text-soft);margin:-6px 0 14px;">El correo no se puede editar aquí porque es tu usuario de acceso.</p>
      <button class="btn btn-primary btn-sm" onclick="saveProfile()">Guardar cambios</button>
      <p id="profileSavedFlag" style="font-size:12px;color:var(--primary-dark);margin-top:10px;height:14px;"></p>
    </div>
    <div class="card panel-section" style="padding:24px;max-width:440px;">
      <h4 style="margin-bottom:10px;">Reiniciar progreso</h4>
      <p style="font-size:13px;color:var(--text-soft);margin-bottom:14px;">Esto borra las lecciones marcadas como completadas. No se puede deshacer.</p>
      <button class="btn btn-ghost btn-sm" onclick="resetProgress()">Reiniciar progreso</button>
    </div>
    <div class="card panel-section" style="padding:24px;max-width:440px;">
      <h4 style="margin-bottom:10px;">Cerrar sesión</h4>
      <p style="font-size:13px;color:var(--text-soft);margin-bottom:14px;">Vuelve a iniciar sesión con tu correo y contraseña cuando quieras.</p>
      <button class="btn btn-ghost btn-sm" onclick="signOutAndRedirect()">Cerrar sesión</button>
    </div>
  `;
}

async function saveProfile(){
  const newName = document.getElementById('profName').value.trim() || state.profile.name;
  state.profile.name = newName;

  const session = await getSession();
  if (session) {
    await fetch(`${IDENTITY_URL}/user`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_metadata: { full_name: newName } }),
    });
  }

  document.getElementById('avatarName').textContent = newName.split(' ')[0];
  document.getElementById('avatarInitials').textContent = newName.slice(0,2).toUpperCase();
  const flag = document.getElementById('profileSavedFlag');
  if (flag) flag.textContent = 'Cambios guardados ✓';
}

function resetProgress(){
  if(confirm('¿Seguro que quieres reiniciar todo tu progreso?')){
    state.completedLessons = {};
    state.checklistItems = {};
    saveProgress();
    updateProgressUI();
    showView('dashboard');
  }
}

async function signOutAndRedirect(){
  await signOut();
  window.location.href = 'login.html';
}

export { renderProfile, saveProfile, resetProgress, signOutAndRedirect };
