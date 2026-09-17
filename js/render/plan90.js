// ============================================================
// Plan de 90 días (Módulo 17) — línea de tiempo con checklist diario.
// ============================================================
import { getState, saveProgress } from '../state.js';
import { PLAN_90 } from '../data/plan90.js';
import { MODULES } from '../data/modules.js';
import { showToast, checkAchievements } from '../gamification.js';

const state = getState();

function planDayGlobalIndex(blockIdx, dayIdx){
  let n = 0;
  for(let i=0;i<blockIdx;i++) n += PLAN_90.blocks[i].days.length;
  return n + dayIdx + 1;
}

function plan90CompletedCount(){
  return Object.values(state.planDays||{}).filter(Boolean).length;
}

function togglePlanDay(dayNum){
  if(!state.planDays) state.planDays = {};
  state.planDays[dayNum] = !state.planDays[dayNum];
  saveProgress();
  if(plan90CompletedCount()>=90 && !state.completedLessons[17]){
    state.completedLessons[17] = true;
    saveProgress();
    showToast('¡Plan de 90 días completado!', 'Marcaste el día 90. Revisa tu certificado.', 'award');
    checkAchievements();
  }
  const panel = document.getElementById('mainPanel');
  panel.innerHTML = renderPlan90();
}

function renderPlan90(){
  const m17 = MODULES.find(x=>x.id===17);
  const done = plan90CompletedCount();
  const pct = Math.round((done/90)*100);
  return `
    <div class="lesson-banner" style="background:linear-gradient(135deg, ${m17.color}, color-mix(in srgb, ${m17.color} 55%, #000));">
      <span class="lb-pill"><svg width="13" height="13"><use href="#i-rocket"/></svg> Módulo 17 de 17 · Plan de acción</span>
      <h2>Tu plan de 90 días</h2>
      <p>90 tareas distintas, un día a la vez, para convertir el programa en resultados reales.</p>
      <div class="progress-track" style="background:rgba(255,255,255,.25);margin-top:16px;max-width:400px;"><div class="progress-fill" style="width:${pct}%;background:#fff;"></div></div>
      <p style="margin-top:8px;font-weight:600;">${done} de 90 días completados (${pct}%)</p>
    </div>

    <div class="phase-row">
      ${PLAN_90.phases.map((p,i)=>`
        <div class="phase-card">
          <span class="phase-n">Etapa ${i+1}</span>
          <h4>${p.name}</h4>
          <span class="phase-range">${p.range}</span>
          <p>${p.desc}</p>
        </div>
      `).join('')}
    </div>

    ${PLAN_90.blocks.map((b,bi)=>`
      <div class="plan-block">
        <div class="plan-block-head">
          <span class="plan-range">${b.range}</span>
          <h4>${b.theme}</h4>
        </div>
        <div class="plan-days">
          ${b.days.map((d,di)=>{
            const dayNum = planDayGlobalIndex(bi,di);
            const isDone = !!(state.planDays && state.planDays[dayNum]);
            return `<label class="plan-day ${isDone?'done':''}">
              <input type="checkbox" ${isDone?'checked':''} onchange="togglePlanDay(${dayNum})">
              <span class="plan-day-n">Día ${dayNum}</span>
              <span class="plan-day-text">${d}</span>
            </label>`;
          }).join('')}
        </div>
      </div>
    `).join('')}

    <div style="text-align:center;margin:30px 0;">
      <button class="btn btn-accent" onclick="showView('certificate')">Ver mi certificado →</button>
    </div>
  `;
}

export { planDayGlobalIndex, plan90CompletedCount, togglePlanDay, renderPlan90 };
