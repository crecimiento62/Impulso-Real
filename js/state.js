// ============================================================
// Estado de progreso — misma forma de datos que antes, pero ahora se
// guarda a través de las funciones de Netlify (get-progress /
// save-progress), que a su vez usan Netlify Blobs como base de datos.
// ============================================================
import { getSession, getCurrentUser } from './auth.js';

let state = {
  profile: { name: '', email: '' },
  completedLessons: {},
  checklistItems: {},
  planDays: {},
  notes: {},
  achievementsSeen: [],
  dark: false,
};
let saveTimer = null;

export function getState() {
  return state;
}

export async function loadProgress(session) {
  const user = await getCurrentUser();
  state.profile = {
    name: (user && user.user_metadata && user.user_metadata.full_name) || (session.access_token ? '' : ''),
    email: (user && user.email) || '',
  };
  if (!state.profile.name) state.profile.name = state.profile.email.split('@')[0];

  const res = await fetch('/.netlify/functions/get-progress', {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (res.ok) {
    const data = await res.json();
    Object.assign(state, {
      completedLessons: data.completedLessons || {},
      checklistItems: data.checklistItems || {},
      planDays: data.planDays || {},
      notes: data.notes || {},
      achievementsSeen: data.achievementsSeen || [],
      dark: !!data.dark,
    });
  }
  return state;
}

export function saveProgress() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    const session = await getSession();
    if (!session) return;
    await fetch('/.netlify/functions/save-progress', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        completedLessons: state.completedLessons,
        checklistItems: state.checklistItems,
        planDays: state.planDays,
        notes: state.notes,
        achievementsSeen: state.achievementsSeen,
        dark: state.dark,
      }),
    });
  }, 500);
}

export async function flushProgress() {
  clearTimeout(saveTimer);
  const session = await getSession();
  if (!session) return;
  await fetch('/.netlify/functions/save-progress', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      completedLessons: state.completedLessons,
      checklistItems: state.checklistItems,
      planDays: state.planDays,
      notes: state.notes,
      achievementsSeen: state.achievementsSeen,
      dark: state.dark,
    }),
  });
}
