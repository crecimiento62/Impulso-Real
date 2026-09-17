// ============================================================
// Certificado — vista en pantalla y descarga como imagen PNG (canvas).
// ============================================================
import { getState } from '../state.js';
import { completedCount, progressPct } from '../router.js';

const state = getState();

function certificateId(){
  const base = (state.profile.name||'IR') + (state.profile.email||'');
  let hash = 0;
  for(let i=0;i<base.length;i++){ hash = (hash*31 + base.charCodeAt(i)) >>> 0; }
  return 'IR-' + hash.toString(16).toUpperCase().slice(0,6) + '-' + String(completedCount()).padStart(2,'0');
}

function renderCertificate(){
  const pct = progressPct();
  const eligible = pct===100;
  const today = new Date().toLocaleDateString('es-HN',{year:'numeric',month:'long',day:'numeric'});
  return `
    ${!eligible ? `<div class="card" style="padding:18px 20px;margin-bottom:20px;"><p style="margin:0;">Llevas <strong>${pct}%</strong> del programa completado. Termina los 17 módulos para desbloquear tu certificado final. Aquí tienes una vista previa.</p></div>` : ''}
    <div class="cert-wrap">
      <div class="cert">
        <span class="cert-corner tl"></span><span class="cert-corner tr"></span><span class="cert-corner bl"></span><span class="cert-corner br"></span>
        <div class="cert-seal"><svg width="26" height="26"><use href="#i-award"/></svg></div>
        <span class="eyebrow">Impulso Real</span>
        <h2>Certificado oficial de finalización</h2>
        <div class="name">${state.profile.name}</div>
        <div class="divider"></div>
        <p class="desc">Ha completado el programa "Cómo ganar más dinero de forma real, ética y sostenible" — 17 módulos de educación financiera, freelance y emprendimiento digital, más el plan de acción de 90 días.</p>
        <div class="cert-footer">
          <div class="brandsign">Impulso Real<small>Plataforma educativa</small></div>
          <div class="certid">N.° ${certificateId()}<br>${today}</div>
        </div>
      </div>
    </div>
    <div style="text-align:center;margin-top:22px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
      <button class="btn btn-primary" onclick="downloadCertificatePNG()"><svg width="14" height="14"><use href="#i-download"/></svg>Descargar como imagen</button>
      <button class="btn btn-ghost" onclick="window.print()">Imprimir / Guardar como PDF</button>
    </div>
  `;
}

function downloadCertificatePNG(){
  const today = new Date().toLocaleDateString('es-HN',{year:'numeric',month:'long',day:'numeric'});
  const isDark = document.body.classList.contains('dark');
  const bg = isDark ? '#131E1B' : '#FFFFFF';
  const border = isDark ? '#2FB49B' : '#0B5D50';
  const accent = isDark ? '#F0A24E' : '#C9932E';
  const textSoft = isDark ? '#8DA39B' : '#5B6E67';
  const textMain = isDark ? '#EAF3EF' : '#101B18';
  const primaryDark = isDark ? '#2FB49B' : '#0B4F45';

  const canvas = document.createElement('canvas');
  canvas.width = 1500; canvas.height = 1050;
  const ctx = canvas.getContext('2d');

  // fondo con degradado suave (radial simulado con 2 capas)
  const grad = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
  grad.addColorStop(0, bg);
  grad.addColorStop(1, isDark ? '#0E1917' : '#FBF8F1');
  ctx.fillStyle = grad; ctx.fillRect(0,0,canvas.width,canvas.height);

  // marco doble
  ctx.strokeStyle = accent; ctx.lineWidth = 2.5; ctx.strokeRect(38,38,canvas.width-76,canvas.height-76);
  ctx.strokeStyle = isDark ? '#2A3B36' : '#DCE5DF'; ctx.lineWidth = 1; ctx.strokeRect(56,56,canvas.width-112,canvas.height-112);

  // esquinas decorativas
  ctx.strokeStyle = border; ctx.lineWidth = 4;
  const cs = 46, m = 46;
  [[m,m,1,1],[canvas.width-m,m,-1,1],[m,canvas.height-m,1,-1],[canvas.width-m,canvas.height-m,-1,-1]].forEach(([x,y,dx,dy])=>{
    ctx.beginPath();
    ctx.moveTo(x, y+cs*dy);
    ctx.lineTo(x,y);
    ctx.lineTo(x+cs*dx,y);
    ctx.stroke();
  });

  // sello circular
  ctx.beginPath();
  ctx.arc(canvas.width/2, 150, 34, 0, Math.PI*2);
  ctx.fillStyle = accent;
  ctx.fill();
  ctx.fillStyle = bg;
  ctx.font = '600 30px Arial';
  ctx.textAlign = 'center'; ctx.textBaseline='middle';
  ctx.fillText('★', canvas.width/2, 152);
  ctx.textBaseline = 'alphabetic';

  ctx.textAlign = 'center';
  ctx.fillStyle = accent;
  ctx.font = '600 22px Arial';
  ctx.fillText('IMPULSO REAL', canvas.width/2, 232);

  ctx.fillStyle = textSoft;
  ctx.font = '600 17px Arial';
  ctx.fillText('C E R T I F I C A D O   O F I C I A L   D E   F I N A L I Z A C I Ó N', canvas.width/2, 268);

  ctx.fillStyle = primaryDark;
  ctx.font = '700 58px Georgia';
  ctx.fillText(state.profile.name, canvas.width/2, 400);

  // divisor
  ctx.strokeStyle = accent; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(canvas.width/2-45, 430); ctx.lineTo(canvas.width/2+45, 430); ctx.stroke();

  ctx.fillStyle = textMain;
  ctx.font = '400 19px Arial';
  wrapCanvasText(ctx, 'Ha completado el programa "Cómo ganar más dinero de forma real, ética y sostenible" — 17 módulos de educación financiera, freelance y emprendimiento digital, más el plan de acción de 90 días.', canvas.width/2, 480, 860, 29);

  // pie: firma de marca (izq) e ID de certificado (der)
  const footY = 900;
  ctx.textAlign = 'left';
  ctx.strokeStyle = isDark ? '#2A3B36' : '#DCE5DF'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(390,footY); ctx.lineTo(620,footY); ctx.stroke();
  ctx.fillStyle = primaryDark; ctx.font = '700 19px Arial';
  ctx.fillText('Impulso Real', 390, footY-10);
  ctx.fillStyle = textSoft; ctx.font = '500 11px Arial';
  ctx.fillText('PLATAFORMA EDUCATIVA', 390, footY+16);

  ctx.textAlign = 'right';
  ctx.beginPath(); ctx.moveTo(canvas.width-390,footY); ctx.lineTo(canvas.width-620,footY); ctx.stroke();
  ctx.fillStyle = textSoft; ctx.font = '500 12px monospace';
  ctx.fillText('N.° '+certificateId(), canvas.width-390, footY-10);
  ctx.fillText(today, canvas.width-390, footY+16);

  const link = document.createElement('a');
  link.download = 'certificado-impulso-real.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight){
  const words = text.split(' ');
  let line = '';
  let lines = [];
  for(let n=0;n<words.length;n++){
    const testLine = line + words[n] + ' ';
    if(ctx.measureText(testLine).width > maxWidth && n > 0){
      lines.push(line);
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);
  lines.forEach((l,i)=> ctx.fillText(l.trim(), x, y + i*lineHeight));
}

export { certificateId, renderCertificate, downloadCertificatePNG, wrapCanvasText };
