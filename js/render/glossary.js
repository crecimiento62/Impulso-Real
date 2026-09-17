// ============================================================
// Glosario con buscador.
// ============================================================
import { GLOSSARY } from '../data/glossary.js';

function renderGlossary(){
  return `
    <div class="section-head" style="text-align:left;margin:0 0 22px;">
      <span class="pill"><svg width="12" height="12" style="vertical-align:-1px;margin-right:4px;"><use href="#i-book"/></svg>Referencia rápida</span>
      <h2 style="font-size:20px;">Glosario</h2>
    </div>
    <div class="field" style="max-width:340px;margin-bottom:20px;">
      <label for="glossarySearch">Buscar un término</label>
      <input id="glossarySearch" type="text" placeholder="Ej. tarifa, portafolio, ingreso pasivo..." oninput="filterGlossary(this.value)" autocomplete="off">
    </div>
    <div id="glossaryList">${glossaryListHTML(GLOSSARY)}</div>
    <p id="noGlossaryMsg" class="hidden" style="text-align:center;color:var(--text-soft);font-size:13.5px;margin-top:20px;">No encontramos ese término. Intenta con otra palabra.</p>
  `;
}

function glossaryListHTML(list){
  const palette = ['#0B5D50','#1B4F72','#A63446','#8C6A3F','#D9552C','#6B4C9A','#0E7C7B','#4A5A8C'];
  return list.map((g,i)=>{
    const c = palette[i%palette.length];
    return `
    <div class="card glossary-item" style="border-left:4px solid ${c};background:linear-gradient(120deg, ${c}0F, transparent 55%);">
      <span class="glossary-letter" style="background:${c}20;color:${c};">${g.term.charAt(0).toUpperCase()}</span>
      <div>
        <h4 style="font-size:14.5px;font-family:'Space Grotesk';margin-bottom:4px;">${g.term}</h4>
        <p style="font-size:13.5px;color:var(--text-soft);margin:0;">${g.def}</p>
      </div>
    </div>
  `;}).join('');
}

function filterGlossary(query){
  const q = query.trim().toLowerCase();
  const filtered = !q ? GLOSSARY : GLOSSARY.filter(g => g.term.toLowerCase().includes(q) || g.def.toLowerCase().includes(q));
  document.getElementById('glossaryList').innerHTML = glossaryListHTML(filtered);
  document.getElementById('noGlossaryMsg').classList.toggle('hidden', filtered.length>0);
}

export { renderGlossary, glossaryListHTML, filterGlossary };
