// ============================================================
// Menú lateral y comportamiento responsive (abrir/cerrar en móvil).
// ============================================================
import { getState } from './state.js';
import { MODULES } from './data/modules.js';
import { getCurrentModuleId } from './router.js';
import { isModuleLocked } from './render/modules.js';

const state = getState();

function renderSidebarModules(){
  const currentModuleId = getCurrentModuleId();
  const wrap = document.getElementById('sidebarModuleList');
  wrap.innerHTML = MODULES.map(m => {
    const locked = isModuleLocked(m.id);
    return `
    <div class="nav-item ${currentModuleId===m.id?'active':''} ${locked?'locked':''}" onclick="${locked?`showToastLocked(${m.id})`:`openModule(${m.id})`}" tabindex="0" role="button" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();${locked?`showToastLocked(${m.id})`:`openModule(${m.id})`};}" aria-current="${currentModuleId===m.id?'true':'false'}">
      ${locked
        ? '<svg width="12" height="12" style="flex-shrink:0;opacity:.6;"><use href="#i-lock"/></svg>'
        : `<span style="width:8px;height:8px;border-radius:50%;background:${m.color};flex-shrink:0;"></span>`}
      <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;${locked?'opacity:.55;':''}">${m.title}</span>
      ${state.completedLessons[m.id] ? '<span class="badge" aria-label="completado">✓</span>' : ''}
    </div>
  `;}).join('');
}

function toggleSidebar(open){
  document.getElementById('sidebar').classList.toggle('open', open);
  document.getElementById('overlay').classList.toggle('show', open);
}

function checkMobile(){
  document.getElementById('menuBtn').classList.toggle('hidden', window.innerWidth > 900);
}

export { renderSidebarModules, toggleSidebar, checkMobile };
