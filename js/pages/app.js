// ============================================================
// Punto de entrada de app.html — la plataforma protegida.
// 1. Verifica que haya sesión Y licencia activa (si no, expulsa a login.html)
// 2. Carga el progreso del usuario desde Netlify Blobs
// 3. Conecta todas las funciones a "window" para que los atributos
//    onclick="..." del HTML (heredados de la versión original) sigan
//    funcionando exactamente igual.
// 4. Pinta el panel principal.
// ============================================================
import { requireActiveLicense } from '../auth.js';
import { loadProgress, getState } from '../state.js';
import { showView } from '../router.js';
import { toggleSidebar, checkMobile } from '../sidebar.js';
import { toggleDark, applyStoredTheme } from '../theme.js';
import { openModuleView, toggleAction, saveNote, toggleLessonComplete, answerQuiz, filterModules, showToastLocked } from '../render/modules.js';
import { togglePlanDay } from '../render/plan90.js';
import { toggleObjective } from '../render/dashboard.js';
import { downloadTemplate } from '../render/templates.js';
import { filterGlossary } from '../render/glossary.js';
import { downloadCertificatePNG } from '../render/certificate.js';
import { toggleFaq } from '../render/help.js';
import { saveProfile, resetProgress, signOutAndRedirect } from '../render/profile.js';
import { calcBudget, calcFreelance, calcEmergency } from '../render/calculators.js';

async function bootstrap() {
  const session = await requireActiveLicense();
  if (!session) return; // requireActiveLicense ya redirigió a login.html

  const state = await loadProgress(session);
  applyStoredTheme();

  document.getElementById('avatarName').textContent = state.profile.name.split(' ')[0];
  document.getElementById('avatarInitials').textContent = state.profile.name.slice(0, 2).toUpperCase();

  // -------- Conectar funciones a window (para los onclick del HTML) --------
  Object.assign(window, {
    showView, toggleSidebar, toggleDark,
    openModule: openModuleView,
    toggleAction, saveNote, toggleLessonComplete, answerQuiz, filterModules, showToastLocked,
    togglePlanDay,
    toggleObjective,
    downloadTemplate,
    filterGlossary,
    downloadCertificatePNG,
    toggleFaq,
    saveProfile, resetProgress, signOutAndRedirect,
    calcBudget, calcFreelance, calcEmergency,
  });

  checkMobile();
  window.addEventListener('resize', checkMobile);

  showView('dashboard');
}

bootstrap();
