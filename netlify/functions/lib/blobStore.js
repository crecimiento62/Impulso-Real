// ============================================================
// Ayudante compartido para conectar con Netlify Blobs.
// ============================================================
// Por qué existe este archivo: Netlify normalmente conecta Blobs
// automáticamente dentro de una función, sin que tengas que hacer
// nada. Pero hay casos (documentados por el propio equipo de Netlify)
// donde esa conexión automática falla con el error
// "MissingBlobsEnvironmentError", incluso con todo bien configurado.
//
// La solución oficial de Netlify para ese caso es indicar las
// credenciales de forma explícita, usando dos variables de entorno
// que tú mismo creas (igual que hiciste con HOTMART_HOTTOK):
//   - NETLIFY_BLOBS_SITE_ID  → el "Project ID" de tu sitio
//   - NETLIFY_BLOBS_TOKEN    → un "Personal access token" tuyo
// ============================================================
const { getStore } = require('@netlify/blobs');

function getBlobStore(name) {
  const siteID = process.env.NETLIFY_BLOBS_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;

  if (siteID && token) {
    // Modo explícito — evita el error de inyección automática.
    return getStore({ name, siteID, token });
  }

  // Si todavía no configuraste esas dos variables, intenta el modo
  // automático (puede funcionar en algunos sitios sin problema).
  return getStore(name);
}

module.exports = { getBlobStore };
