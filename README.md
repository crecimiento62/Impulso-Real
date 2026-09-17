# Impulso Real — Plataforma (Netlify + Hotmart)

Aplicación con inicio de sesión real, control de acceso por suscripción,
y creación automática de cuentas al comprar en Hotmart — **todo dentro
de una sola plataforma (Netlify)**, sin necesidad de otra cuenta ni de
usar la terminal.

**El contenido del curso (17 módulos, calculadoras, plantillas,
glosario, plan de 90 días, certificado) es exactamente el mismo de
siempre.** Lo único que cambió es cómo se protege el acceso.

---

## 1. Cómo funciona, en simple

1. Alguien compra en Hotmart (pago único o suscripción — ya quedó
   configurado como pago único, según lo que hablamos).
2. Hotmart avisa automáticamente a una función dentro de tu propio
   proyecto.
3. Esa función crea la cuenta del comprador y le manda un correo para
   que cree su contraseña.
4. La persona entra a `login.html` con su correo y esa contraseña.
5. Si más adelante hay un reembolso o (en el caso de una suscripción) se
   cancela o falla un cobro, Hotmart avisa de nuevo y el acceso se
   bloquea automáticamente — aunque la persona siga con la sesión
   abierta en su navegador.

Todo esto sin que tú tengas que instalar nada ni usar la terminal.

---

## 2. Publicar el sitio en Netlify (primero esto)

1. Ve a **netlify.com** → crea tu cuenta (con Google es lo más rápido).
2. Una vez dentro, arrastra la carpeta completa de este proyecto al
   panel de Netlify (o conéctalo desde GitHub si prefieres).
3. Espera a que termine de publicarse — Netlify te da un enlace
   temporal como `algo-al-azar.netlify.app`. Pruébalo: ya debe
   mostrarte la página de ventas.

## 3. Activar Netlify Identity (el inicio de sesión)

1. Dentro de tu sitio en Netlify, ve a la pestaña **"Identity"** (menú
   de arriba).
2. Haz clic en **"Enable Identity"**.
3. Baja a **"Registration"** y elige **"Invite only"** — así nadie
   puede crear una cuenta por su cuenta, solo quien compre a través del
   webhook.
4. En **"Emails"**, puedes personalizar el correo de invitación (el que
   recibe alguien recién comprado) — es opcional, los textos por
   defecto ya funcionan bien.

## 4. Conectar el webhook de Hotmart

1. Dentro de tu sitio en Netlify, ve a **"Site configuration" →
   "Environment variables"**.
2. Agrega una variable nueva:
   - **Key**: `HOTMART_HOTTOK`
   - **Value**: (lo copias de Hotmart en el siguiente paso)
3. Ve a tu cuenta de Hotmart → **Herramientas → Webhook → Nueva
   configuración** (dentro de tu producto).
4. Pega esta URL (cambia `tu-sitio` por el dominio real de tu sitio en
   Netlify):
   ```
   https://tu-sitio.netlify.app/.netlify/functions/hotmart-webhook
   ```
5. Marca estos eventos: **Compra aprobada**, **Compra completa**,
   **Compra reembolsada**, **Chargeback**, **Compra cancelada** (y si
   más adelante vendes por suscripción, agrega también **Suscripción
   cancelada** y **Cobro atrasado**).
6. Hotmart te muestra el token de verificación (`hottok`) — cópialo y
   pégalo como el valor de la variable `HOTMART_HOTTOK` que creaste en
   el paso 2. Guarda los cambios en Netlify (puede pedirte volver a
   publicar el sitio — dale "Trigger deploy" si lo pide).

## 5. Conectar el botón de compra

Abre `js/config.js` y pega tu enlace real de pago de Hotmart:
```js
export const HOTMART_CHECKOUT_URL = "https://pay.hotmart.com/XXXXXXXX";
```
Vuelve a subir el proyecto a Netlify con este cambio (o si lo conectaste
por GitHub, simplemente sube el cambio ahí).

## 6. Tu dominio propio (opcional, cuando estés lista)

1. En Netlify, ve a **"Domain management"** → **"Add a domain"**.
2. Escribe `impulsoreal.com` (el dominio que compraste en Namecheap,
   GoDaddy, etc.).
3. Netlify te da 2-3 registros DNS para pegar en el panel de tu
   proveedor de dominio. En unas horas queda activo.

---

## 7. Probar todo el flujo antes de anunciar el lanzamiento

1. Ve a **Identity** en tu panel de Netlify → **"Invite users"** →
   escribe tu propio correo, para simular una compra sin tener que
   pagar de verdad.
2. Revisa tu correo, haz clic en el enlace, crea tu contraseña.
3. Ve a **check-license** — para que tu cuenta de prueba tenga acceso,
   necesitas que exista una licencia activa a tu nombre. La forma más
   simple de probarlo: haz una compra de prueba real en Hotmart (o pide
   a Hotmart un evento de prueba desde el panel del webhook), que es lo
   que realmente va a activar tu licencia a través de la función.
4. Confirma que entras a `app.html` y ves tu progreso guardado.
5. Pide un reembolso de esa compra de prueba y confirma que ya no
   puedes entrar.

---

## Preguntas frecuentes

**¿Por qué ya no se usa Supabase?** Porque esto es más simple: todo vive
en una sola cuenta (Netlify), sin terminal, sin llaves que copiar y
pegar en varios lugares.

**¿Sigo pudiendo usar la mini app (un solo archivo HTML) mientras
configuro esto?** Sí, son independientes.

**¿Cuánto cuesta Netlify Identity y Netlify Blobs?** Ambos están
incluidos en el plan gratuito de Netlify para el volumen con el que vas
a empezar.

**¿Qué pasa si más adelante quiero vender por suscripción en vez de
pago único?** El webhook (`netlify/functions/hotmart-webhook.js`) ya
tiene lógica preparada para eventos de suscripción (cancelación, cobro
atrasado) — solo hay que cambiar el tipo de producto en Hotmart a
"Suscripción" y activar esos eventos en el paso 4.
