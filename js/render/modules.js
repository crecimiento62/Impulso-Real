// ============================================================
// Módulos — cuadrícula con buscador, vista de lección completa,
// cuestionarios, notas personales y marcar como completado.
// ============================================================
import { getState, saveProgress } from '../state.js';
import { MODULES } from '../data/modules.js';
import { showToast, checkAchievements } from '../gamification.js';
import { setActiveNav, setCurrentModuleId, updateProgressUI } from '../router.js';
import { toggleSidebar, renderSidebarModules } from '../sidebar.js';
import { renderPlan90 } from './plan90.js';

const state = getState();
let noteSaveTimer = null;

// Un módulo está bloqueado si el anterior en la lista todavía no está
// marcado como completado. El módulo 1 nunca está bloqueado.
function isModuleLocked(id){
  const idx = MODULES.findIndex(m => m.id === id);
  if (idx <= 0) return false;
  const prevModule = MODULES[idx - 1];
  return !state.completedLessons[prevModule.id];
}


function renderModulesGrid(){
  return `
    <div class="field" style="max-width:340px;margin-bottom:20px;">
      <label for="moduleSearch">Buscar un módulo</label>
      <input id="moduleSearch" type="text" placeholder="Ej. presupuesto, freelance, IA..." oninput="filterModules(this.value)" autocomplete="off">
    </div>
    <div class="mgrid" id="modulesGridInner">${modulesGridHTML(MODULES)}</div>
    <p id="noModulesMsg" class="hidden" style="text-align:center;color:var(--text-soft);font-size:13.5px;margin-top:20px;">No encontramos módulos con ese término. Intenta con otra palabra.</p>
  `;
}

function modulesGridHTML(list){
  return list.map(m=>{
    const locked = isModuleLocked(m.id);
    const clickAttr = locked
      ? `onclick="showToastLocked(${m.id})"`
      : `onclick="openModule(${m.id})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openModule(${m.id});}"`;
    return `
    <div class="mcard card ${locked?'locked':''}" ${clickAttr} tabindex="0" role="button" aria-label="${locked ? 'Módulo bloqueado: '+m.title : 'Abrir módulo '+m.id+': '+m.title}">
      <div class="mband" style="background:${locked?'var(--border)':m.color};"></div>
      <div class="minner" style="background:${locked?'var(--bg-sunken)':`linear-gradient(160deg, ${m.color}10, transparent 65%)`};">
        <div class="top">
          <div class="micon" style="background:${locked?'var(--border)':`color-mix(in srgb, ${m.color} 18%, transparent)`};color:${locked?'var(--text-soft)':m.color};">
            ${locked ? '<svg width="17" height="17"><use href="#i-lock"/></svg>' : `<svg width="19" height="19"><use href="#${m.icon}"/></svg>`}
          </div>
          <div class="check ${state.completedLessons[m.id]?'done':''}" aria-hidden="true"></div>
        </div>
        <span class="midx" style="color:${locked?'var(--text-soft)':m.color};">MÓDULO ${String(m.id).padStart(2,'0')}</span>
        <h4 style="margin-top:4px;${locked?'color:var(--text-soft);':''}">${m.title}</h4>
        <p>${locked ? 'Completa el módulo anterior para desbloquear este.' : m.summary}</p>
        <span class="pill" style="background:${locked?'var(--border)':m.color+'18'};color:${locked?'var(--text-soft)':m.color};">${locked ? '🔒 Bloqueado' : 'Abrir módulo →'}</span>
      </div>
    </div>
  `;}).join('');
}

function showToastLocked(id){
  const m = MODULES.find(x=>x.id===id);
  const idx = MODULES.findIndex(x=>x.id===id);
  const prevModule = MODULES[idx-1];
  showToast('Módulo bloqueado', `Completa "${prevModule.title}" antes de continuar con este.`, 'award');
}

function filterModules(query){
  const q = query.trim().toLowerCase();
  const filtered = !q ? MODULES : MODULES.filter(m => m.title.toLowerCase().includes(q) || m.summary.toLowerCase().includes(q) || m.explicacion.toLowerCase().includes(q));
  document.getElementById('modulesGridInner').innerHTML = modulesGridHTML(filtered);
  document.getElementById('noModulesMsg').classList.toggle('hidden', filtered.length>0);
}

function renderExtraContent(extra, color){
  let out = '';
  if(extra.tipos){
    out += `<div class="block"><h4><span class="dot" style="background:${color};"></span>Formas de empezar</h4>
      <div class="chip-grid">${extra.tipos.map(t=>`<div class="chip-card"><h5 style="color:${color};">${t.name}</h5><p>${t.desc}</p></div>`).join('')}</div></div>`;
  }
  if(extra.pasos){
    out += `<div class="block"><h4><span class="dot" style="background:${color};"></span>Paso a paso simple</h4>
      <ol class="step-list">${extra.pasos.map(p=>`<li>${p}</li>`).join('')}</ol></div>`;
  }
  if(extra.herramientas){
    out += `<div class="block"><h4><span class="dot" style="background:${color};"></span>Herramientas recomendadas</h4>
      <div class="chip-grid">${extra.herramientas.map(h=>`<div class="chip-card"><h5 style="color:${color};">${h.name}</h5><p>${h.desc}</p></div>`).join('')}</div></div>`;
  }
  if(extra.prompts){
    out += `<div class="block"><h4><span class="dot" style="background:${color};"></span>Prompts que puedes copiar</h4>
      <div class="prompt-list">${extra.prompts.map(p=>`<div class="prompt-item"><code>${p}</code></div>`).join('')}</div></div>`;
  }
  if(extra.errores){
    out += `<div class="block"><h4><span class="dot" style="background:var(--danger);"></span>Errores comunes que evitar</h4>
      <ul class="warn-list">${extra.errores.map(e=>`<li>${e}</li>`).join('')}</ul></div>`;
  }
  if(extra.tips){
    out += `<div class="block"><h4><span class="dot" style="background:${color};"></span>Consejos extra</h4>
      <ul class="tip-list">${extra.tips.map(t=>`<li>${t}</li>`).join('')}</ul></div>`;
  }
  return out;
}

function renderQuiz(questions, moduleId){
  return questions.map((q,qi)=>`
    <div class="quiz-q">
      <p class="qtext">${qi+1}. ${q.q}</p>
      ${q.options.map((opt,oi)=>`<button class="quiz-opt" id="qopt-${moduleId}-${qi}-${oi}" onclick="answerQuiz(${moduleId},${qi},${oi},${q.correct})">${opt}</button>`).join('')}
      <div class="quiz-result" id="qres-${moduleId}-${qi}"></div>
    </div>
  `).join('');
}

function answerQuiz(moduleId, qi, oi, correct){
  const opts = document.querySelectorAll(`[id^="qopt-${moduleId}-${qi}-"]`);
  opts.forEach(o=>o.style.pointerEvents='none');
  const chosen = document.getElementById(`qopt-${moduleId}-${qi}-${oi}`);
  const correctEl = document.getElementById(`qopt-${moduleId}-${qi}-${correct}`);
  correctEl.classList.add('correct');
  const resEl = document.getElementById(`qres-${moduleId}-${qi}`);
  if(oi===correct){
    resEl.textContent = '✓ Correcto';
    resEl.style.color = 'var(--primary-dark)';
  }else{
    chosen.classList.add('wrong');
    resEl.textContent = '✗ La respuesta correcta está marcada arriba';
    resEl.style.color = 'var(--danger)';
  }
}

function renderLesson(id){
  const m = MODULES.find(x=>x.id===id);
  const idx = MODULES.findIndex(x=>x.id===id);
  const prev = MODULES[idx-1];
  const next = MODULES[idx+1];
  const done = !!state.completedLessons[id];
  const actionsKey = 'actions_'+id;
  const savedActions = state.checklistItems[actionsKey] || [];
  return `
    <div class="lesson-banner" style="background:linear-gradient(135deg, ${m.color}, color-mix(in srgb, ${m.color} 60%, #000));">
      <span class="lb-pill"><svg width="13" height="13"><use href="#${m.icon}"/></svg> Módulo ${String(id).padStart(2,'0')} de ${MODULES.length}</span>
      <h2>${m.title}</h2>
      <p>${m.summary}</p>
    </div>

    <div class="block card" style="padding:20px 22px;border-left:4px solid ${m.color};">
      <h4 style="color:${m.color};"><span class="dot" style="background:${m.color};"></span>Explicación</h4>
      <p style="margin:0;">${m.explicacion}</p>
    </div>

    <div class="two-col-block">
      <div class="mini-card">
        <div class="mini-card-icon" style="background:color-mix(in srgb, ${m.color} 16%, transparent);color:${m.color};"><svg width="16" height="16"><use href="#i-lightbulb"/></svg></div>
        <h5>Ejemplo</h5>
        <p>${m.ejemplo}</p>
      </div>
      <div class="mini-card">
        <div class="mini-card-icon" style="background:color-mix(in srgb, ${m.color} 16%, transparent);color:${m.color};"><svg width="16" height="16"><use href="#i-compass"/></svg></div>
        <h5>Caso ilustrativo</h5>
        <p>${m.caso}</p>
      </div>
    </div>

    <div class="block"><h4><span class="dot" style="background:${m.color};"></span>Ejercicio práctico</h4><div class="exercise-box">${m.ejercicio}</div></div>

    ${m.video ? `
    <div class="block">
      <h4><span class="dot" style="background:${m.color};"></span>Video complementario</h4>
      <div class="video-embed"><iframe src="${m.video}" title="Video del módulo ${id}" frameborder="0" allowfullscreen loading="lazy"></iframe></div>
    </div>` : ''}

    ${m.extra ? renderExtraContent(m.extra, m.color) : ''}

    <div class="block card" style="padding:20px;">
      <h4><span class="dot" style="background:${m.color};"></span>Cuestionario rápido</h4>
      <div id="quizArea">${renderQuiz(m.quiz, id)}</div>
    </div>

    <div class="block card" style="padding:18px 22px;background:${m.color}0F;border:1px dashed color-mix(in srgb, ${m.color} 45%, transparent);">
      <h4 style="color:${m.color};"><span class="dot" style="background:${m.color};"></span>En resumen</h4>
      <p style="margin:0;">${m.resumen}</p>
    </div>

    <div class="block">
      <h4><span class="dot" style="background:${m.color};"></span>Lista de acciones</h4>
      <div class="actions-list">
        ${m.acciones.map((a,i)=>`<label><input type="checkbox" ${savedActions[i]?'checked':''} onchange="toggleAction(${id},${i})"><span class="step-num" style="background:color-mix(in srgb, ${m.color} 18%, transparent);color:${m.color};">${i+1}</span><span>${a}</span></label>`).join('')}
      </div>
    </div>

    <div class="block card" style="padding:18px 20px;background:color-mix(in srgb, ${m.color} 10%, var(--bg-elev));border-color:color-mix(in srgb, ${m.color} 35%, var(--border));">
      <h4 style="color:${m.color};"><svg width="14" height="14" style="vertical-align:-2px;margin-right:4px;"><use href="#i-flag"/></svg>Reto semanal</h4>
      <p style="margin:0;">${m.reto}</p>
    </div>

    <div class="block">
      <h4><span class="dot" style="background:${m.color};"></span>Mis notas</h4>
      <p style="font-size:13px;color:var(--text-soft);margin-top:-4px;margin-bottom:10px;">Escribe aquí cómo aplicarías esto a tu situación. Se guarda automáticamente.</p>
      <textarea id="noteArea" oninput="saveNote(${id}, this.value)" placeholder="Ej. Mi presupuesto real sería..." style="width:100%;min-height:100px;padding:12px 14px;border-radius:var(--radius-sm);border:1.5px solid var(--border);background:var(--bg);color:var(--text);font-family:inherit;font-size:14px;resize:vertical;">${(state.notes && state.notes[id]) || ''}</textarea>
      <div id="noteSavedFlag" style="font-size:11.5px;color:var(--primary-dark);margin-top:6px;height:14px;"></div>
    </div>

    <div style="text-align:center;margin-top:20px;">
      <button class="btn ${done?'btn-primary':'btn-ghost'}" onclick="toggleLessonComplete(${id}); openModule(${id});" style="${done?'':'background:'+m.color+';color:#fff;'}">
        ${done ? '✓ Módulo completado' : 'Marcar módulo como completado'}
      </button>
    </div>

    <div class="lesson-nav">
      ${prev ? `<button class="btn btn-ghost btn-sm" onclick="openModule(${prev.id})">← ${prev.title}</button>` : `<span></span>`}
      ${next ? `<button class="btn btn-ghost btn-sm" onclick="openModule(${next.id})">${next.title} →</button>` : `<button class="btn btn-accent btn-sm" onclick="showView('certificate')">Ver certificado →</button>`}
    </div>
  `;
}

function toggleAction(moduleId, i){
  const key = 'actions_'+moduleId;
  if(!state.checklistItems[key]) state.checklistItems[key] = [];
  state.checklistItems[key][i] = !state.checklistItems[key][i];
  saveProgress();
}

function saveNote(moduleId, value){
  if(!state.notes) state.notes = {};
  state.notes[moduleId] = value;
  clearTimeout(noteSaveTimer);
  noteSaveTimer = setTimeout(()=>{
    saveProgress();
    const flag = document.getElementById('noteSavedFlag');
    if(flag){ flag.textContent = 'Nota guardada ✓'; setTimeout(()=>{ if(flag) flag.textContent=''; }, 1800); }
  }, 500);
}

function toggleLessonComplete(id){
  const wasComplete = !!state.completedLessons[id];
  state.completedLessons[id] = !wasComplete;
  saveProgress();
  updateProgressUI();
  if(!wasComplete){
    const m = MODULES.find(x=>x.id===id);
    showToast('¡Módulo completado!', `Terminaste "${m.title}". Sigue así.`, 'award');
    checkAchievements();
  }
}

function openModuleView(id){
  if (isModuleLocked(id)) {
    showToastLocked(id);
    return;
  }
  setCurrentModuleId(id);
  setActiveNav('modules');
  document.getElementById('topbarTitle').textContent = id===17 ? 'Plan de 90 días' : 'Módulo '+String(id).padStart(2,'0');
  const panel = document.getElementById('mainPanel');
  panel.innerHTML = id===17 ? renderPlan90() : renderLesson(id);
  panel.classList.remove('fade-in'); void panel.offsetWidth; panel.classList.add('fade-in');
  window.scrollTo(0,0);
  toggleSidebar(false);
  renderSidebarModules();
}


export { renderModulesGrid, modulesGridHTML, filterModules, renderLesson, renderExtraContent, renderQuiz, answerQuiz, toggleAction, saveNote, toggleLessonComplete, openModuleView, isModuleLocked, showToastLocked };
