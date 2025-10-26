
// modules/reportes.resumen.js
import { Store } from '../core/store.js';
import { loadCalendario, loadLlamadas, canonPlan, canonCalls } from '../core/data.js';
import { nrmU, weekNum, sum } from '../core/utils.js';

function key(g, w){ return nrmU(g) + '|' + String(weekNum(w)); }

function groupResumen(planRows, callRows){
  const planMap = new Map();
  planRows.forEach(p => {
    const k = key(p.gestor, p.semana);
    planMap.set(k, (planMap.get(k)||0) + 1);
  });
  const doneMap = new Map();
  callRows.forEach(d => {
    const k = key(d.gestor, d.semana);
    doneMap.set(k, (doneMap.get(k)||0) + 1);
  });
  const keys = new Set([...planMap.keys(), ...doneMap.keys()]);
  const rows = [];
  keys.forEach(k => {
    const [gestor, semana] = k.split('|');
    const plan = planMap.get(k)||0;
    const done = doneMap.get(k)||0;
    rows.push({gestor, semana, plan, done, cov: plan ? (done/plan*100): (done>0?100:0)});
  });
  rows.sort((a,b)=> nrmU(a.gestor).localeCompare(nrmU(b.gestor)) || (+a.semana - +b.semana));
  return { rows, totalPlan: sum(rows.map(r=>r.plan)), totalDone: sum(rows.map(r=>r.done)) };
}

function kpiCard(title, value, id){ 
  return `<div class="card"><div class="muted">${title}</div><div style="font-size:28px;font-weight:700" id="${id||''}">${value}</div></div>`;
}

export default async function mountResumen(root){
  root.innerHTML = `<div class="header"><h1>Reporte • Resumen (Semanal)</h1>
    <span class="badge">LLAMADAS v2.0.0</span></div>
    <div class="controls">
      <label>Semana: <select id="fltSemana">
        <option value="">Todas</option>
        <option>1</option><option>2</option><option>3</option><option>4</option>
      </select></label>
      <label>Gestor: <input id="fltGestor" placeholder="Nombre gestor"/></label>
    </div>
    <div class="kpis">${kpiCard('A realizar (Itinerarios)',0,'kpiPlan')}${kpiCard('Realizadas (Llamadas)',0,'kpiDone')}${kpiCard('Llamadas (Total)',0,'kpiTotal')}</div>
    <table class="table" id="tbl"><thead><tr>
      <th>Gestor</th><th>Semana</th><th>A realizar</th><th>Realizadas</th><th>% Cobertura</th>
    </tr></thead><tbody></tbody></table>
    <div class="footer">Fuente: Calendario CSV y (opcional) Llamadas CSV configurables en Config.</div>`;

  // Load data
  const cal = canonPlan(await loadCalendario());
  const calls = canonCalls(await loadLlamadas()); // puede estar vacío y está bien

  const state = { base: groupResumen(cal, calls), filtered: [] };

  function render(){
    const sem = document.getElementById('fltSemana').value;
    const gest = nrmU(document.getElementById('fltGestor').value);
    state.filtered = state.base.rows.filter(r => 
      (!sem || String(r.semana)===String(sem)) && (!gest || nrmU(r.gestor).includes(gest))
    );
    const tb = root.querySelector('#tbl tbody');
    tb.innerHTML = state.filtered.map(r => `<tr>
      <td>${r.gestor}</td>
      <td>${r.semana}</td>
      <td>${r.plan}</td>
      <td>${r.done}</td>
      <td>${(r.cov).toFixed(1)}%</td>
    </tr>`).join('');
    const plan = state.filtered.reduce((a,b)=>a+b.plan,0);
    const done = state.filtered.reduce((a,b)=>a+b.done,0);
    root.querySelector('#kpiPlan').textContent = plan;
    root.querySelector('#kpiDone').textContent = done;
    root.querySelector('#kpiTotal').textContent = done; // total llamadas = realizadas en el filtro
  }

  document.getElementById('fltSemana').addEventListener('change', render);
  document.getElementById('fltGestor').addEventListener('input', render);
  render();
}
