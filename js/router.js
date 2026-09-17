// ============================================================
// Router — cambia entre las vistas del panel (equivalente a las
// funciones showView()/openModule() de la versión original).
// ============================================================
import { getState, saveProgress } from './state.js';
import { MODULES } from './data/modules.js';
import { renderDashboard } from './render/dashboard.js';
import { renderModulesGrid } from './render/modules.js';
import { renderCalculators, initCalculators } from './render/calculators.js';
import { renderTemplates } from './render/templates.js';
import { renderGlossary } from './render/glossary.js';
import { renderProgress } from './render/progress.js';
import { renderCertificate } from './render/certificate.js';
import { renderHelp } from './render/help.js';
import { renderProfile } from './render/profile.js';
import { renderSidebarModules, toggleSidebar } from './sidebar.js';

const state = getState();
let currentModuleId = null;
export function getCurrentModuleId(){ return currentModuleId; }
export function setCurrentModuleId(id){ currentModuleId = id; }

function totalLessons(){ return MODULES.length; }

function completedCount(){ return Object.values(state.completedLessons).filter(Boolean).length; }

function progressPct(){ return Math.round((completedCount()/totalLessons())*100); }

function updateProgressUI(){
  const pct = progressPct();
  document.getElementById('sidebarPct').textContent = pct+'%';
  document.getElementById('sidebarFill').style.width = pct+'%';
  renderSidebarModules();
}

function setActiveNav(name){
  document.querySelectorAll('.nav-item[data-nav]').forEach(el=>{
    const active = el.dataset.nav===name;
    el.classList.toggle('active', active);
    el.setAttribute('aria-current', active ? 'true' : 'false');
  });
}

function showView(name){
  currentModuleId = null;
  setActiveNav(name);
  toggleSidebar(false);
  const titles = {dashboard:'Panel principal',modules:'Módulos',calculators:'Calculadoras',templates:'Plantillas descargables',glossary:'Glosario',progress:'Mi progreso',certificate:'Certificado',help:'Ayuda / Preguntas frecuentes',profile:'Mi perfil'};
  document.getElementById('topbarTitle').textContent = titles[name] || '';
  const panel = document.getElementById('mainPanel');
  if(name==='dashboard') panel.innerHTML = renderDashboard();
  if(name==='modules') panel.innerHTML = renderModulesGrid();
  if(name==='calculators') panel.innerHTML = renderCalculators();
  if(name==='templates') panel.innerHTML = renderTemplates();
  if(name==='glossary') panel.innerHTML = renderGlossary();
  if(name==='progress') panel.innerHTML = renderProgress();
  if(name==='certificate') panel.innerHTML = renderCertificate();
  if(name==='help') panel.innerHTML = renderHelp();
  if(name==='profile') panel.innerHTML = renderProfile();
  panel.classList.remove('fade-in'); void panel.offsetWidth; panel.classList.add('fade-in');
  window.scrollTo(0,0);
  if(name==='calculators') initCalculators();
  renderSidebarModules();
}

export { totalLessons, completedCount, progressPct, updateProgressUI, setActiveNav, showView };
