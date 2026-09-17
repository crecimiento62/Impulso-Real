// ============================================================
// Guarda el progreso del usuario autenticado. Se llama con un pequeño
// retraso desde el navegador (no en cada tecla), igual que antes.
// ============================================================
const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  const user = context.clientContext && context.clientContext.user;
  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Sesión no válida' }) };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método no permitido' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'JSON inválido' }) };
  }

  const progressStore = getStore('progress');
  await progressStore.setJSON(user.sub, {
    completedLessons: body.completedLessons || {},
    checklistItems: body.checklistItems || {},
    planDays: body.planDays || {},
    notes: body.notes || {},
    achievementsSeen: body.achievementsSeen || [],
    dark: !!body.dark,
    updatedAt: new Date().toISOString(),
  });

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
