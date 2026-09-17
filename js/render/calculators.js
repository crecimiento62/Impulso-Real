// ============================================================
// Calculadoras — presupuesto 50/30/20, tarifa freelance, fondo de
// emergencia. Cálculos 100% en el navegador, sin guardar en la base
// de datos (igual que en la versión original).
// ============================================================

function renderCalculators(){
  return `
    <div class="section-head" style="text-align:left;margin:0 0 22px;">
      <span class="pill"><svg width="12" height="12" style="vertical-align:-1px;margin-right:4px;"><use href="#i-calc"/></svg>Herramientas de cálculo</span>
      <h2 style="font-size:20px;">Tus números, no suposiciones</h2>
    </div>

    <div class="calc-card card" style="--calc-c:#0B5D50;--calc-focus:#0B5D5030;--calc-out-bg:#0B5D500D;--calc-out-border:#0B5D5030;">
      <div class="mband" style="background:#0B5D50;"></div>
      <div class="calc-card-inner">
        <div class="calc-head" style="background:#0B5D5018;color:#0B5D50;"><svg width="20" height="20"><use href="#i-calc"/></svg></div>
        <h3>Presupuesto 50/30/20</h3>
        <p class="hint">Divide tus ingresos mensuales en necesidades, gustos y ahorro.</p>
        <div class="calc-field"><label>Ingreso mensual total</label><input type="number" id="c1_income" placeholder="Ej. 10000" oninput="calcBudget()"></div>
        <div class="calc-out" id="c1_out">
          <div class="row"><span>Necesidades (50%)</span><span id="c1_need" style="color:#0B5D50;font-weight:700;">—</span></div>
          <div class="row"><span>Gustos (30%)</span><span id="c1_want" style="color:#0B5D50;font-weight:700;">—</span></div>
          <div class="row"><span>Ahorro / deudas (20%)</span><span id="c1_save" style="color:#0B5D50;font-weight:700;">—</span></div>
        </div>
      </div>
    </div>

    <div class="calc-card card" style="--calc-c:#0E7C7B;--calc-focus:#0E7C7B30;--calc-out-bg:#0E7C7B0D;--calc-out-border:#0E7C7B30;">
      <div class="mband" style="background:#0E7C7B;"></div>
      <div class="calc-card-inner">
        <div class="calc-head" style="background:#0E7C7B18;color:#0E7C7B;"><svg width="20" height="20"><use href="#i-laptop"/></svg></div>
        <h3>Tarifa freelance por hora</h3>
        <p class="hint">Calcula cuánto necesitas cobrar por hora para cubrir tus gastos y tener ganancia.</p>
        <div class="calc-row">
          <div class="calc-field"><label>Gastos mensuales (personales + trabajo)</label><input type="number" id="c2_expenses" placeholder="Ej. 8000" oninput="calcFreelance()"></div>
          <div class="calc-field"><label>Horas de trabajo facturables al mes</label><input type="number" id="c2_hours" placeholder="Ej. 80" oninput="calcFreelance()"></div>
        </div>
        <div class="calc-field"><label>Ganancia deseada además de gastos (%)</label><input type="number" id="c2_margin" placeholder="Ej. 25" oninput="calcFreelance()"></div>
        <div class="calc-out" id="c2_out">
          <div class="row total"><span>Tarifa mínima por hora</span><span id="c2_rate" style="color:#0E7C7B;">—</span></div>
        </div>
      </div>
    </div>

    <div class="calc-card card" style="--calc-c:#1B4F72;--calc-focus:#1B4F7230;--calc-out-bg:#1B4F720D;--calc-out-border:#1B4F7230;">
      <div class="mband" style="background:#1B4F72;"></div>
      <div class="calc-card-inner">
        <div class="calc-head" style="background:#1B4F7218;color:#1B4F72;"><svg width="20" height="20"><use href="#i-shield"/></svg></div>
        <h3>Fondo de emergencia</h3>
        <p class="hint">Calcula cuánto necesitas para cubrir tus gastos básicos por varios meses.</p>
        <div class="calc-row">
          <div class="calc-field"><label>Gastos básicos mensuales</label><input type="number" id="c3_expenses" placeholder="Ej. 6000" oninput="calcEmergency()"></div>
          <div class="calc-field"><label>Meses de cobertura deseados</label><input type="number" id="c3_months" placeholder="Ej. 3" oninput="calcEmergency()"></div>
        </div>
      <div class="calc-out" id="c3_out">
          <div class="row total"><span>Monto total del fondo</span><span id="c3_total" style="color:#1B4F72;">—</span></div>
        </div>
      </div>
    </div>
  `;
}

function fmt(n){ return isFinite(n) ? n.toLocaleString('es-HN',{maximumFractionDigits:2}) : '—'; }

function calcBudget(){
  const inc = parseFloat(document.getElementById('c1_income').value)||0;
  document.getElementById('c1_need').textContent = fmt(inc*0.5);
  document.getElementById('c1_want').textContent = fmt(inc*0.3);
  document.getElementById('c1_save').textContent = fmt(inc*0.2);
}

function calcFreelance(){
  const exp = parseFloat(document.getElementById('c2_expenses').value)||0;
  const hrs = parseFloat(document.getElementById('c2_hours').value)||0;
  const margin = parseFloat(document.getElementById('c2_margin').value)||0;
  if(hrs>0){
    const rate = (exp*(1+margin/100))/hrs;
    document.getElementById('c2_rate').textContent = fmt(rate);
  } else {
    document.getElementById('c2_rate').textContent = '—';
  }
}

function calcEmergency(){
  const exp = parseFloat(document.getElementById('c3_expenses').value)||0;
  const months = parseFloat(document.getElementById('c3_months').value)||0;
  document.getElementById('c3_total').textContent = fmt(exp*months);
}

function initCalculators(){ calcBudget(); calcFreelance(); calcEmergency(); }

export { renderCalculators, fmt, calcBudget, calcFreelance, calcEmergency, initCalculators };
