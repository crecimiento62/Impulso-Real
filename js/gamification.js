// ============================================================
// Gamificación — logros, confeti de celebración y notificaciones tipo
// "toast". Misma lógica que la versión original.
// ============================================================
import { getState, saveProgress } from './state.js';
import { ACHIEVEMENTS } from './data/achievements.js';
import { progressPct, completedCount } from './router.js';

const state = getState();

function unlockedAchievements(){
  const pct = progressPct();
  const count = completedCount();
  return ACHIEVEMENTS.filter(a=>a.test(pct, count));
}

function checkAchievements(){
  const unlocked = unlockedAchievements().map(a=>a.id);
  const seen = state.achievementsSeen || [];
  const newOnes = unlocked.filter(id=>!seen.includes(id));
  if(newOnes.length){
    state.achievementsSeen = unlocked;
    saveProgress();
    newOnes.forEach((id,i)=>{
      const a = ACHIEVEMENTS.find(x=>x.id===id);
      setTimeout(()=>showToast('Nuevo logro desbloqueado', a.name, 'award'), i*350);
    });
    if(newOnes.includes('all')){
      setTimeout(()=>{
        showToast('¡Programa completado!', 'Descarga tu certificado en la sección Certificado.', 'award');
        launchConfetti();
      }, newOnes.length*350 + 200);
    }
  }
}

function launchConfetti(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#0F6B5C','#E08B2B','#2FB49B','#F0A24E'];
  for(let i=0;i<60;i++){
    const p = document.createElement('div');
    const size = 6 + Math.random()*6;
    p.style.cssText = `position:fixed;top:-20px;left:${Math.random()*100}vw;width:${size}px;height:${size*0.4}px;background:${colors[i%colors.length]};z-index:300;pointer-events:none;border-radius:2px;opacity:${0.7+Math.random()*0.3};transform:rotate(${Math.random()*360}deg);`;
    document.body.appendChild(p);
    const duration = 2200 + Math.random()*1400;
    const drift = (Math.random()-0.5)*160;
    p.animate([
      {transform:`translate(0,0) rotate(0deg)`, opacity:1},
      {transform:`translate(${drift}px, 100vh) rotate(${360+Math.random()*360}deg)`, opacity:0}
    ], {duration, easing:'ease-in'}).onfinish = ()=> p.remove();
  }
}

function showToast(title, desc, icon){
  const layer = document.getElementById('toastLayer');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<div class="ticon"><svg width="16" height="16"><use href="#${icon==='award'?'i-award':'i-check-circle'}"/></svg></div><div><div class="ttitle">${title}</div><div class="tdesc">${desc}</div></div>`;
  layer.appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; el.style.transform='translateY(8px)'; el.style.transition='opacity .25s,transform .25s'; setTimeout(()=>el.remove(),260); }, 3600);
}

export { unlockedAchievements, checkAchievements, launchConfetti, showToast };
