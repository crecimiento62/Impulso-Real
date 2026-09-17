// ============================================================
// IMPULSO REAL — Webhook de Hotmart (Netlify Function)
// ============================================================
// Qué hace:
// 1. Hotmart llama a esta función cada vez que pasa algo con una venta
//    o una suscripción (pago aprobado, cobro recurrente, cancelación,
//    cobro atrasado, chargeback, etc.)
// 2. Verificamos que la llamada sea realmente de Hotmart comparando el
//    campo "hottok" contra el secreto que guardaste en Netlify.
// 3. Si el pago está aprobado: creamos (o reactivamos) la cuenta del
//    comprador en Netlify Identity y guardamos su licencia como activa
//    en Netlify Blobs. Netlify le manda un correo de invitación para
//    que cree su contraseña.
// 4. Si la suscripción se cancela, falla un cobro, o hay un reembolso/
//    chargeback: marcamos su licencia como inactiva. La próxima vez
//    que intente entrar, se le niega el acceso.
//
// Dónde se configura en Hotmart: Herramientas → Webhook → Nueva
// configuración → pega la URL de esta función (termina en
// /.netlify/functions/hotmart-webhook) → marca los eventos de compra
// aprobada, suscripción cancelada, cobro atrasado, reembolso y chargeback.
// ============================================================

const { getStore } = require('@netlify/blobs');

const APPROVED_STATUSES = new Set(['approved', 'completed', 'complete']);
const REVOKED_STATUSES = new Set(['refunded', 'chargeback', 'canceled', 'cancelled', 'expired', 'dispute', 'blocked', 'delayed']);
// PURCHASE_APPROVED cubre tanto la compra inicial como cada renovación
// recurrente exitosa (Hotmart manda este mismo evento en cada cobro de
// la suscripción que sí se completa) — por eso no hace falta un evento
// aparte para "renovación": ya queda cubierto aquí.
const APPROVED_EVENTS = new Set(['PURCHASE_APPROVED', 'PURCHASE_COMPLETE', 'SUBSCRIPTION_REACTIVATED']);
const REVOKED_EVENTS = new Set(['SUBSCRIPTION_CANCELLATION', 'PURCHASE_REFUNDED', 'PURCHASE_CHARGEBACK', 'PURCHASE_DELAYED', 'PURCHASE_EXPIRED', 'PURCHASE_CANCELED']);

// Comparación en tiempo constante para no filtrar el token por timing attacks.
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método no permitido' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'JSON inválido' }) };
  }

  // -------- 1. Verificar que la llamada es realmente de Hotmart --------
  // Hotmart manda el token de verificación en el encabezado
  // X-HOTMART-HOTTOK; como respaldo también revisamos si viene dentro
  // del cuerpo (algunas versiones del webhook lo incluyen ahí).
  const headerToken = event.headers?.['x-hotmart-hottok'] ?? event.headers?.['X-HOTMART-HOTTOK'] ?? '';
  const receivedToken = headerToken || payload?.hottok || payload?.data?.hottok || '';
  const expectedToken = process.env.HOTMART_HOTTOK || '';

  // -------- DIAGNÓSTICO TEMPORAL (quitar una vez resuelto el 401) --------
  // Nunca imprime el valor real de ningún token — solo dice SÍ/NO llegó
  // algo, y SÍ/NO coincide, para saber cuál de las dos cosas está fallando.
  console.log('[diagnóstico webhook] ¿Llegó algún token?:', receivedToken ? 'SÍ' : 'NO');
  console.log('[diagnóstico webhook] ¿Existe HOTMART_HOTTOK configurada en Netlify?:', expectedToken ? 'SÍ' : 'NO');
  if (receivedToken && expectedToken) {
    console.log('[diagnóstico webhook] ¿Coinciden ambos tokens?:', safeEqual(String(receivedToken), expectedToken) ? 'SÍ' : 'NO');
    console.log('[diagnóstico webhook] Longitud del token recibido vs esperado:', String(receivedToken).length, 'vs', expectedToken.length);
  }
  // -------- FIN DIAGNÓSTICO TEMPORAL --------

  if (!expectedToken || !safeEqual(String(receivedToken), expectedToken)) {
    console.error('Webhook rechazado: hottok inválido o ausente.');
    return { statusCode: 401, body: JSON.stringify({ error: 'No autorizado' }) };
  }

  // -------- 2. Extraer los datos relevantes (compra o suscripción) --------
  const eventType = (payload?.event || '').toString().toUpperCase();
  const status = (
    payload?.status ??
    payload?.data?.purchase?.status ??
    payload?.data?.status ??
    ''
  ).toString().toLowerCase();

  const email = (
    payload?.email ??
    payload?.data?.buyer?.email ??
    payload?.data?.purchase?.buyer?.email ??
    payload?.data?.subscriber?.email ??
    ''
  ).toLowerCase().trim();

  const fullName = (
    payload?.name ??
    payload?.data?.buyer?.name ??
    payload?.data?.purchase?.buyer?.name ??
    payload?.data?.subscriber?.name ??
    ''
  ).trim();

  const subscriberCode = payload?.data?.subscriber?.code ?? payload?.subscriber_code ?? null;

  if (!email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'El evento no trae un correo de comprador' }) };
  }

  const licenses = getStore('licenses');
  const isApproved = APPROVED_EVENTS.has(eventType) || APPROVED_STATUSES.has(status);
  const isRevoked = REVOKED_EVENTS.has(eventType) || REVOKED_STATUSES.has(status);

  // -------- 3. Acceso aprobado → crear/activar cuenta --------
  if (isApproved) {
    const { identity } = context.clientContext || {};
    if (!identity) {
      console.error('No hay contexto de Identity disponible (¿Identity está activado en el sitio?).');
      return { statusCode: 500, body: JSON.stringify({ error: 'Identity no configurado' }) };
    }

    // ¿Ya existe un usuario con este correo? Buscamos antes de crear.
    const listRes = await fetch(`${identity.url}/admin/users?email=${encodeURIComponent(email)}`, {
      headers: { Authorization: `Bearer ${identity.token}` },
    });
    const listData = await listRes.json().catch(() => ({ users: [] }));
    let user = (listData.users || [])[0];

    if (!user) {
      const createRes = await fetch(`${identity.url}/admin/users`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${identity.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          user_metadata: { full_name: fullName },
          app_metadata: { roles: ['comprador'] },
        }),
      });
      user = await createRes.json();
      if (!createRes.ok) {
        console.error('Error creando usuario:', JSON.stringify(user));
        return { statusCode: 500, body: JSON.stringify({ error: 'No se pudo crear el usuario' }) };
      }
    }

    await licenses.setJSON(email, {
      status: 'active',
      fullName,
      subscriberCode,
      lastEvent: eventType || status,
      updatedAt: new Date().toISOString(),
    });

    return { statusCode: 200, body: JSON.stringify({ ok: true, action: 'access_granted', email }) };
  }

  // -------- 4. Cancelación / cobro fallido / reembolso → quitar acceso --------
  if (isRevoked) {
    const existing = (await licenses.get(email, { type: 'json' })) || {};
    await licenses.setJSON(email, {
      ...existing,
      status: 'revoked',
      subscriberCode: subscriberCode || existing.subscriberCode,
      revokedReason: eventType || status,
      updatedAt: new Date().toISOString(),
    });
    return { statusCode: 200, body: JSON.stringify({ ok: true, action: 'access_revoked', email, reason: eventType || status }) };
  }

  // -------- 5. Cualquier otro evento: lo recibimos pero no actuamos --------
  return { statusCode: 200, body: JSON.stringify({ ok: true, action: 'ignored', event: eventType, status }) };
};
