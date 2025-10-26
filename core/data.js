
// data.js
import { parseCSV, nrmU, nkey, weekNum } from './utils.js';
import { Store } from './store.js';

async function fetchCSV(url){
  if(!url) return [];
  const res = await fetch(url, {cache:'no-store'});
  const txt = await res.text();
  return parseCSV(txt);
}

export async function loadCalendario(){
  const url = Store.state.config.sheets.calendario;
  const rows = await fetchCSV(url);
  Store.state.calendario = rows;
  return rows;
}

export async function loadLlamadas(){
  const url = Store.state.config.sheets.llamadas;
  const rows = await fetchCSV(url);
  Store.state.llamadas = rows;
  return rows;
}

// Canonicaliza filas del Calendario para resumen
export function canonPlan(rows){
  return rows.map(r => ({
    semana: weekNum(r['SEMANA'] ?? r['N Semana'] ?? r['N° Semana'] ?? r['N_Semana'] ?? ''),
    dia: nrmU(r['DIA'] ?? r['Día'] ?? r['day'] ?? ''),
    vendedor: nrmU(r['vendedor'] ?? r['Vendedor'] ?? ''),
    gestor: nrmU(r['gestor_servicio'] ?? r['Gestor Servicio'] ?? r['gestor'] ?? 'NO ASIGNADO'),
    cod: nrmU(r['Cod Empresa'] ?? r['Código'] ?? r['Cod'] ?? r['ID'] ?? ''),
    nombre: r['RazonSocial'] ?? r['Cliente'] ?? r['Nombre'] ?? ''
  })).filter(x => x.semana);
}

// Canonicaliza llamadas (si hay)
export function canonCalls(rows){
  // intenta mapear semana si existe, de lo contrario calcula por fecha si estuviera disponible
  return rows.map(r => ({
    semana: weekNum(r['Semana'] ?? r['SEMANA'] ?? r['semana'] ?? ''),
    gestor: nrmU(r['gestor_servicio'] ?? r['Gestor Servicio'] ?? r['gestor'] ?? r['Gestor'] ?? ''),
    fecha: r['fecha'] ?? r['Fecha'] ?? ''
  }));
}
