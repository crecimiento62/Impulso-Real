// ============================================================
// Modo oscuro — la preferencia se guarda a través de las funciones de
// Netlify (Netlify Blobs), así que viaja con el usuario
// entre dispositivos, a diferencia de la versión anterior con
// localStorage.
// ============================================================
import { getState, saveProgress } from './state.js';

const state = getState();

export function toggleDark(){
  state.dark = !state.dark;
  document.body.classList.toggle('dark', state.dark);
  saveProgress();
}

export function applyStoredTheme(){
  document.body.classList.toggle('dark', !!state.dark);
}
