// ============================================================
// Plantillas descargables.
// ============================================================
import { TEMPLATES } from '../data/templates.js';

function renderTemplates(){
  const tplIcons = ['i-calc','i-laptop','i-handshake','i-trending','i-rocket','i-clock'];
  const tplColors = ['#0B5D50','#0E7C7B','#A63446','#147D6F','#D63D1C','#4A5A8C'];
  return `
    <div class="section-head" style="text-align:left;margin:0 0 22px;">
      <span class="pill"><svg width="12" height="12" style="vertical-align:-1px;margin-right:4px;"><use href="#i-file"/></svg>Listas para usar</span>
      <h2 style="font-size:20px;">Plantillas descargables</h2>
    </div>
    <div class="tpl-grid">` + TEMPLATES.map((t,i)=>`
    <div class="tpl-card card" style="border-top:3px solid ${tplColors[i%tplColors.length]};background:linear-gradient(160deg, ${tplColors[i%tplColors.length]}12, transparent 55%);">
      <div class="tpl-icon" style="background:${tplColors[i%tplColors.length]}20;color:${tplColors[i%tplColors.length]};"><svg width="18" height="18"><use href="#${tplIcons[i%tplIcons.length]}"/></svg></div>
      <h4>${t.name}</h4>
      <p>${t.desc}</p>
      <button class="btn btn-ghost btn-sm" onclick="downloadTemplate(${i})" style="background:${tplColors[i%tplColors.length]}18;color:${tplColors[i%tplColors.length]};"><svg width="14" height="14"><use href="#i-download"/></svg>Descargar</button>
    </div>
  `).join('') + `</div>`;
}

function downloadTemplate(i){
  const t = TEMPLATES[i];
  const blob = new Blob([t.content], {type:'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = t.filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export { renderTemplates, downloadTemplate };
