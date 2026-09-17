// ============================================================
// Punto de entrada de index.html — la página de ventas pública.
// ============================================================
import { MODULES } from '../data/modules.js';
import { FAQ } from '../data/faq.js';
import { DEMO_TESTIMONIALS, OBJECTIONS } from '../data/sales-content.js';
import { renderFaqList, toggleFaq } from '../render/help.js';
import { HOTMART_CHECKOUT_URL } from '../config.js';

const SHOWCASE_IMAGES = {
  0: 'assets/screenshots/dashboard.jpg',
  1: 'assets/screenshots/lesson.jpg',
  2: 'assets/screenshots/calculators.jpg',
  3: 'assets/screenshots/certificate.jpg',
};

function renderSalesContent(){
  document.getElementById('salesModGrid').innerHTML = MODULES.map(m=>`
    <div class="mod-preview card" style="border-left:4px solid ${m.color};">
      <div class="mod-preview-icon" style="background:${m.color}18;color:${m.color};"><svg width="16" height="16"><use href="#${m.icon}"/></svg></div>
      <div><span class="idx" style="color:${m.color};">${String(m.id).padStart(2,'0')}</span><h4>${m.title}</h4><p>${m.summary}</p></div>
    </div>
  `).join('');

  document.getElementById('salesWhoGrid').innerHTML = `
    <div class="card who-yes">
      <span class="who-tag">SÍ ES PARA TI</span>
      <h4 style="font-size:15px;margin:10px 0 12px;color:#fff;">✓ Este programa es para ti si...</h4>
      <ul style="margin:0;padding-left:20px;font-size:14px;color:rgba(255,255,255,.9);">
        <li>Quieres aumentar tus ingresos con pasos concretos, no solo motivación</li>
        <li>Estás dispuesto/a a dedicar unas horas por semana a aplicar lo aprendido</li>
        <li>No tienes experiencia previa en freelance o negocios digitales</li>
      </ul>
    </div>
    <div class="card who-no">
      <span class="who-tag">NO ES PARA TI</span>
      <h4 style="font-size:15px;margin:10px 0 12px;color:#fff;">✗ Este programa no es para ti si...</h4>
      <ul style="margin:0;padding-left:20px;font-size:14px;color:rgba(255,255,255,.9);">
        <li>Buscas una fórmula para ganar dinero sin esfuerzo ni tiempo</li>
        <li>No estás dispuesto/a a revisar tus propios números y hábitos</li>
        <li>Esperas resultados garantizados en un plazo fijo</li>
      </ul>
    </div>
  `;

  const testiColors = ['#0B5D50','#1B4F72','#8C6A3F'];
  document.getElementById('salesTestimonials').innerHTML = DEMO_TESTIMONIALS.map((t,i)=>`
    <div class="testi-card card" style="padding:22px;border-top:3px solid ${testiColors[i%testiColors.length]};">
      <span class="demo-flag">Ejemplo ilustrativo</span>
      <p style="font-size:14.5px;font-style:italic;margin:0;">"${t.quote}"</p>
      <p style="font-size:12px;color:var(--text-soft);margin-top:12px;">${t.role}</p>
    </div>
  `).join('');

  const objColors = ['#6B4C9A','#D9552C','#0E7C7B'];
  document.getElementById('salesObjections').innerHTML = OBJECTIONS.map((o,i)=>`
    <div class="card" style="padding:18px 20px;margin-bottom:12px;border-left:4px solid ${objColors[i%objColors.length]};">
      <p style="font-weight:600;font-size:14px;margin:0 0 6px;color:${objColors[i%objColors.length]};">${o.q}</p>
      <p style="font-size:13.5px;color:var(--text-soft);margin:0;">${o.a}</p>
    </div>
  `).join('');

  document.getElementById('salesFaq').innerHTML = renderFaqList(FAQ);
}

function showShowcase(i, btn){
  document.getElementById('showcaseMain').src = SHOWCASE_IMAGES[i];
  document.querySelectorAll('.showcase-tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
}

function initStickyBar(){
  const bar = document.getElementById('salesSticky');
  if(!bar) return;
  window.addEventListener('scroll', ()=>{
    bar.classList.toggle('show', window.scrollY > 700);
  });
}

function goCheckout(){
  if (HOTMART_CHECKOUT_URL) {
    window.location.href = HOTMART_CHECKOUT_URL;
  } else {
    alert('Todavía no se configuró el enlace de compra de Hotmart. Ve a js/config.js y define HOTMART_CHECKOUT_URL.');
  }
}

function goLogin(){
  window.location.href = 'login.html';
}

Object.assign(window, { showShowcase, toggleFaq, goCheckout, goLogin });

renderSalesContent();
initStickyBar();
