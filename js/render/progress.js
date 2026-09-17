// ============================================================
// Vista de "Mi progreso" — resumen visual por módulo y del plan de 90 días.
// ============================================================
import { getState } from '../state.js';
import { MODULES } from '../data/modules.js';
import { completedCount, totalLessons, progressPct } from '../router.js';
import { plan90CompletedCount } from './plan90.js';

const state = getState();

function renderProgress(){
  const pct = progressPct();
  const planDone = plan90CompletedCount();
  const planPct = Math.round((planDone/90)*100);
  return `
    <div class="section-head" style="text-align:left;margin:0 0 20px;">
      <span class="pill"><svg width="12" height="12" style="vertical-align:-1px;margin-right:4px;"><use href="#i-chart"/></svg>Tu avance</span>
      <h2 style="font-size:20px;">Mi progreso</h2>
    </div>

    <div class="progress-summary-grid">
      <div class="card progress-summary-card">
        <div class="psc-ring" style="background:conic-gradient(var(--primary) ${pct*3.6}deg, var(--bg-sunken) 0deg);"><span>${pct}%</span></div>
        <div><h4>Módulos</h4><p>${completedCount()} de ${totalLessons()} completados</p></div>
      </div>
      <div class="card progress-summary-card">
        <div class="psc-ring" style="background:conic-gradient(var(--cta) ${planPct*3.6}deg, var(--bg-sunken) 0deg);"><span>${planPct}%</span></div>
        <div><h4>Plan de 90 días</h4><p>${planDone} de 90 días marcados</p></div>
      </div>
    </div>

    <div class="card panel-section" style="padding:22px;margin-top:20px;">
      <h4 style="margin-bottom:14px;">Detalle por módulo</h4>
      ${MODULES.map(m=>`
        <div class="prog-row">
          <span class="prog-dot" style="background:${m.color};"></span>
          <span class="name">${String(m.id).padStart(2,'0')}. ${m.title}</span>
          <div class="progress-track"><div class="progress-fill" style="width:${state.completedLessons[m.id]?100:0}%;background:${m.color};"></div></div>
          <span class="pct">${state.completedLessons[m.id]?'100%':'0%'}</span>
        </div>
      `).join('')}
    </div>
  `;
}

export { renderProgress };
