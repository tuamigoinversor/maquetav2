/* =========================================================
   COMPARADOR · tabla única con las seis estrategias
   Si se llega con ?s=ROCA,GEDA (desde el test o las tarjetas), esas columnas salen resaltadas.
   ========================================================= */
(function () {
'use strict';
const T = window.TAI, { $, STRATEGIES, pct, cls } = T;

/* Datos del informe mensual a 30-sep-2026 (rentabilidades en EUR) */
const R = {
  'ROCA':      { mes: -1.06,  ytd: 4.72,   m3: -0.56,  m6: 1.23,  a1: 9.36,   desde: 2017 },
  'IMPULSO':   { mes: -2.88,  ytd: 8.20,   m3: 0.95,   m6: 2.75,  a1: 18.63,  desde: 2018 },
  'HORIZONTE': { mes: 2.60,   ytd: 17.61,  m3: 3.23,   m6: 22.71, a1: 23.36,  desde: 2020 },
  'GEDA':      { mes: 7.65,   ytd: 100.25, m3: -3.80,  m6: 40.39, a1: 100.86, desde: 2021 },
  'GEN-Z':     { mes: 29.38,  ytd: 16.22,  m3: -14.20, m6: 20.33, a1: -2.68,  desde: 2024 },
  'CRYPTO':    { mes: 20.52,  ytd: 20.84,  m3: 75.47,  m6: 61.79, a1: -10.11, desde: 2023 }
};
const TIPO = { permanente: 'Cartera permanente (se revisa 2 veces al año)', tactica: 'Asignación táctica (rota cada mes)' };
const f2 = v => (v > 0 ? '+' : '') + v.toFixed(2).replace('.', ',') + '%';
const f1 = v => (v > 0 ? '+' : '') + v.toFixed(1).replace('.', ',') + '%';

let hl = [];
try { const q = new URLSearchParams(location.search).get('s'); if (q) hl = q.split(',').map(x => x.trim().toUpperCase()); } catch (e) {}

/* [etiqueta, función de valor, modo de "mejor" (max|null), función numérica, tipo de celda] */
const SECTIONS = [
  ['Perfil', [
    ['Perfil', s => s.profile],
    ['Tipo', s => TIPO[s.type] + (s.note ? ' · ' + s.note.toLowerCase() : '')],
    ['Nivel de riesgo', s => s.risk + ' / 5'],
    ['Revisión', s => s.review],
    ['Con dinero real desde', s => s.realFrom]
  ]],
  ['Rentabilidad', [
    ['Rent. anualizada con dinero real', s => s.short ? '—<br><small>historial corto</small>' : f1(s.realAvg) + '<br><small>desde ' + s.realFrom + '</small>', 'max', s => s.short ? -Infinity : s.realAvg],
    ['Acumulado con dinero real', s => f1(s.realCum) + '<br><small>desde ' + s.realFrom + '</small>'],
    ['Rentabilidad 2025', s => f1(s.y25), 'max', s => s.y25],
    ['Rentabilidad 2026 (ene–sep)', s => f2(R[s.id].ytd), 'max', s => R[s.id].ytd],
    ['Último mes (sep-26)', s => f2(R[s.id].mes), 'max', s => R[s.id].mes],
    ['Últimos 3 meses', s => f2(R[s.id].m3), 'max', s => R[s.id].m3],
    ['Últimos 6 meses', s => f2(R[s.id].m6), 'max', s => R[s.id].m6],
    ['Últimos 12 meses', s => f2(R[s.id].a1), 'max', s => R[s.id].a1]
  ]],
  ['Riesgo', [
    ['Peor caída con dinero real', s => f1(s.realDd) + '<br><small>desde ' + s.realFrom + '</small>', 'max', s => s.realDd],
    ['Ratio rent. / caída', s => s.short ? '—<br><small>historial corto</small>' : (s.realAvg / Math.abs(s.realDd)).toFixed(2).replace('.', ',') + 'x', 'max', s => s.short ? -Infinity : s.realAvg / Math.abs(s.realDd)]
  ]],
  ['Descripción', [
    ['Qué es', s => s.desc, null, null, 'txt'],
    ['Principal inconveniente', s => s.con, null, null, 'txt'],
    ['Características', s => s.feats.join(' · '), null, null, 'txt']
  ]]
];

const cols = STRATEGIES;
const head = `<thead><tr><th scope="col">Métrica</th>${cols.map(s => `<th scope="col" class="${hl.includes(s.id) ? 'hl' : ''}" style="--c:${s.color}"><span class="sw" style="background:${s.color}"></span>${s.id}${s.note ? `<br><span class="pp">${s.note.toLowerCase()}</span>` : ''}</th>`).join('')}</tr></thead>`;
let body = '';
SECTIONS.forEach(([title, rows]) => {
  body += `<tbody><tr class="grp"><th scope="colgroup" colspan="${cols.length + 1}">${title}</th></tr>`;
  rows.forEach(([lab, f, mode, num, kind]) => {
    const best = mode ? Math.max(...cols.map(num)) : null;
    body += `<tr><th scope="row">${lab}</th>${cols.map(s => {
      const v = f(s), isBest = mode && num(s) === best;
      const c = (typeof v === 'string' && /^[+-]\d/.test(v)) ? cls(parseFloat(v.replace(',', '.'))) : '';
      const k = kind === 'txt' ? 'txt' : (mode ? 'mono' : '');
      return `<td class="${k} ${c} ${isBest ? 'best' : ''} ${hl.includes(s.id) ? 'hl' : ''}">${v}${isBest ? ' <span class="sr-only">(mejor)</span>' : ''}</td>`;
    }).join('')}</tr>`;
  });
  body += '</tbody>';
});
body += `<tbody><tr class="grp"><th scope="colgroup" colspan="${cols.length + 1}">Ficha completa</th></tr><tr><th scope="row">Ver estrategia</th>${cols.map(s => `<td class="${hl.includes(s.id) ? 'hl' : ''}"><a class="more" href="${s.url}">${s.id} <svg class="icon"><use href="#i-arrow"/></svg></a></td>`).join('')}</tr></tbody>`;
$('#cmpTable').innerHTML = `<caption class="sr-only">Comparación de las seis estrategias</caption>${head}${body}`;
})();
