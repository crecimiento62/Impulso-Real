// ============================================================
// Ayuda / Preguntas frecuentes.
// ============================================================
import { FAQ } from '../data/faq.js';

function renderFaqList(items){
  return items.map((f,i)=>`
    <div class="faq-item">
      <button class="faq-q" onclick="toggleFaq(this)" aria-expanded="false">
        <span>${f.q}</span><span class="plus" aria-hidden="true">+</span>
      </button>
      <div class="faq-a"><p>${f.a}</p></div>
    </div>
  `).join('');
}

function toggleFaq(btn){
  const item = btn.parentElement;
  const open = item.classList.toggle('open');
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  const a = btn.nextElementSibling;
  a.style.maxHeight = open ? a.scrollHeight+'px' : null;
}

function renderHelp(){
  return `
    <div class="help-cats panel-section">
      <div class="card" style="padding:18px;"><h4 style="font-size:14px;margin-bottom:4px;">¿Necesitas ayuda con tu cuenta?</h4><p style="font-size:12.5px;color:var(--text-soft);margin:0;">Revisa la sección "Mi perfil" para editar tus datos o reiniciar tu progreso.</p></div>
      <div class="card" style="padding:18px;"><h4 style="font-size:14px;margin-bottom:4px;">¿Se ve mal en tu dispositivo?</h4><p style="font-size:12.5px;color:var(--text-soft);margin:0;">La app es responsive; si algo se ve mal, recarga la página o prueba con otro navegador actualizado.</p></div>
    </div>
    <div class="faq-sales">${renderFaqList(FAQ)}</div>
  `;
}

export { renderFaqList, toggleFaq, renderHelp };
