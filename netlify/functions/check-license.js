// ============================================================
// Verifica si el usuario que hace la petición (identificado por su
// token de Netlify Identity) tiene una licencia activa. La app llama
// esto justo después de iniciar sesión, antes de mostrar cualquier
// contenido del curso.
// ============================================================
const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  const user = context.clientContext && context.clientContext.user;
  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Sesión no válida' }) };
  }

  const licenses = getStore('licenses');
  const license = await licenses.get(user.email, { type: 'json' });

  const active = !!license && license.status === 'active';

  return {
    statusCode: 200,
    body: JSON.stringify({ active, fullName: license?.fullName || '' }),
  };
};
