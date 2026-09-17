// ============================================================
// Devuelve el progreso guardado del usuario autenticado (módulos
// completados, notas, plan de 90 días, logros, modo oscuro).
// ============================================================
const { getStore } = require('@netlify/blobs');

const EMPTY_PROGRESS = {
  completedLessons: {},
  checklistItems: {},
  planDays: {},
  notes: {},
  achievementsSeen: [],
  dark: false,
};

exports.handler = async (event, context) => {
  const user = context.clientContext && context.clientContext.user;
  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Sesión no válida' }) };
  }

  const progressStore = getStore('progress');
  const data = await progressStore.get(user.sub, { type: 'json' });

  return {
    statusCode: 200,
    body: JSON.stringify(data || EMPTY_PROGRESS),
  };
};
