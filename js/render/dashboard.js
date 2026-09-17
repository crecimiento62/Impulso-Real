// ============================================================
// Panel principal — resumen de progreso, objetivos y logros.
// ============================================================
import { getState, saveProgress } from '../state.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { TEMPLATES } from '../data/templates.js';
import { MODULES } from '../data/modules.js';
import { completedCount, totalLessons, progressPct, showView } from '../router.js';

const state = getState();

function renderDashboard(){
  const pct = progressPct();
  const nextModule = MODULES.find(m=>!state.completedLessons[m.id]) || MODULES[0];
  return `
    <div class="dash-hero">
      <span class="pill" style="background:rgba(255,255,255,.18);color:#fff;">Hola, ${state.profile.name.split(' ')[0]}</span>
      <h3 style="margin-top:10px;">Sigue construyendo tu ingreso extra</h3>
      <p>Llevas ${completedCount()} de ${totalLessons()} módulos completados.</p>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="pct-label">${pct}% completado</div>
      <button class="btn btn-accent" style="margin-top:16px;" onclick="openModule(${nextModule.id})">Continuar: ${nextModule.title} →</button>
    </div>
    <div class="dash-grid panel-section">
      <div class="dash-card card dc1"><div class="n">${completedCount()}/${totalLessons()}</div><div class="l">Módulos completados</div></div>
      <div class="dash-card card dc2"><div class="n">17</div><div class="l">Retos semanales disponibles</div></div>
      <div class="dash-card card dc3"><div class="n">${TEMPLATES.length}</div><div class="l">Plantillas descargables</div></div>
    </div>
    <div class="card panel-section obj-card">
      <h4 style="font-size:15px;margin-bottom:4px;"><svg width="16" height="16" style="vertical-align:-3px;margin-right:6px;color:var(--cta);"><use href="#i-target"/></svg>Objetivos de este programa</h4>
      <p style="font-size:13px;color:var(--text-soft);margin-bottom:8px;">Marca los que ya apliquen a ti.</p>
      <div class="obj-row obj-c1"><input type="checkbox" ${state.checklistItems.o1?'checked':''} onchange="toggleObjective('o1')"><span class="obj-ico" style="background:#0B5D5020;color:#0B5D50;"><svg width="13" height="13"><use href="#i-shield"/></svg></span><span>Tener un diagnóstico claro de mis finanzas actuales</span></div>
      <div class="obj-row obj-c2"><input type="checkbox" ${state.checklistItems.o2?'checked':''} onchange="toggleObjective('o2')"><span class="obj-ico" style="background:#B4530920;color:#B45309;"><svg width="13" height="13"><use href="#i-lightbulb"/></svg></span><span>Identificar al menos una habilidad vendible propia</span></div>
      <div class="obj-row obj-c3"><input type="checkbox" ${state.checklistItems.o3?'checked':''} onchange="toggleObjective('o3')"><span class="obj-ico" style="background:#4A785620;color:#4A7856;"><svg width="13" height="13"><use href="#i-puzzle"/></svg></span><span>Definir un servicio o producto digital concreto</span></div>
      <div class="obj-row obj-c4"><input type="checkbox" ${state.checklistItems.o4?'checked':''} onchange="toggleObjective('o4')"><span class="obj-ico" style="background:#D63D1C20;color:#D63D1C;"><svg width="13" height="13"><use href="#i-rocket"/></svg></span><span>Tener un plan de acción de 90 días escrito</span></div>
    </div>
    <div class="card panel-section" style="padding:20px 22px;">
      <h4 style="font-size:15px;margin-bottom:4px;"><svg width="16" height="16" style="vertical-align:-3px;margin-right:6px;color:var(--accent);"><use href="#i-award"/></svg>Tus logros</h4>
      <p style="font-size:13px;color:var(--text-soft);margin-bottom:14px;">Se desbloquean automáticamente según tu avance.</p>
      <div class="badge-grid">
        ${ACHIEVEMENTS.map(a=>{
          const unlocked = a.test(pct, completedCount());
          return `<div class="badge-card card ${unlocked?'unlocked pop-in':''}" style="${unlocked?`border-color:${a.color};background:linear-gradient(160deg, ${a.color}14, transparent 60%);`:''}">
            <div class="bicon" style="${unlocked?`background:${a.color};color:#fff;`:''}"><svg width="18" height="18"><use href="#${a.icon}"/></svg></div>
            <h5 style="${unlocked?`color:${a.color};`:''}">${a.name}</h5><p>${a.desc}</p>
          </div>`;
        }).join('')}
      </div>
    </div>
  `;
}

function toggleObjective(key){
  state.checklistItems[key] = !state.checklistItems[key];
  saveProgress();
  showView('dashboard');
}

export { renderDashboard, toggleObjective };
