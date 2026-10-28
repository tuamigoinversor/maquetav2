/* COMBINAR ESTRATEGIAS · mezcla de estrategias con pesos ajustables y rebalanceo mensual (datos mensuales de las fichas)
   + simulación del interés compuesto con la mezcla elegida (antes, página Simulador) */
(function () {
'use strict';
const T = window.TAI, S = window.TAI_SERIES, { $, $$ } = T;
const IDS = ['ROCA', 'IMPULSO', 'HORIZONTE', 'GEDA', 'GEN-Z', 'CRYPTO'];
const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const meta = id => T.STRATEGIES.find(s => s.id === id);
const fmt = (v, d = 1) => v.toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−');
const pc = (v, d = 1) => fmt(v, d) + '%';
const maps = {};
IDS.forEach(id => { const [y0] = S[id].start.split('-').map(Number); maps[id] = new Map(S[id].r.map((r, i) => [(y0 * 12 + i), r])); });
const label = k => `${MES[k % 12]} ${Math.floor(k / 12)}`;
const nm = id => id === 'HORIZONTE' ? 'HORIZONTE <span class="pp">plan de pensiones</span>' : id;
const dot = id => `<span class="sw" style="background:${meta(id).color}" aria-hidden="true"></span>`;

function common(ids) {
  let ks = [...maps[ids[0]].keys()];
  ids.slice(1).forEach(id => { ks = ks.filter(k => maps[id].has(k)); });
  return ks.sort((a, b) => a - b);
}
function stats(r) {
  const n = r.length; let v = 1, pk = 1, dd = 0;
  r.forEach(x => { v *= 1 + x / 100; pk = Math.max(pk, v); dd = Math.min(dd, v / pk - 1); });
  const m = r.reduce((a, b) => a + b, 0) / n, sd = Math.sqrt(r.reduce((a, b) => a + (b - m) ** 2, 0) / (n - 1));
  return { n, cagr: (Math.pow(v, 12 / n) - 1) * 100, vol: sd * Math.sqrt(12), dd: dd * 100, sh: (m * 12) / (sd * Math.sqrt(12)) };
}
function corr(a, b) {
  const n = a.length, ma = a.reduce((x, y) => x + y, 0) / n, mb = b.reduce((x, y) => x + y, 0) / n;
  let c = 0, va = 0, vb = 0;
  for (let i = 0; i < n; i++) { c += (a[i] - ma) * (b[i] - mb); va += (a[i] - ma) ** 2; vb += (b[i] - mb) ** 2; }
  return c / Math.sqrt(va * vb);
}
/* w: pesos que suman 1 (mismo orden que ids). Mezcla = media ponderada de los rendimientos mensuales (rebalanceo mensual). */
function analyse(ids, w) {
  w = w || ids.map(() => 1 / ids.length);
  const ks = common(ids);
  const rets = ids.map(id => ks.map(k => maps[id].get(k)));
  const mixR = ks.map((k, i) => rets.reduce((s, r, j) => s + w[j] * r[i], 0));
  const parts = ids.map((id, j) => ({ id, ...stats(rets[j]) }));
  const mix = stats(mixR), avg = k => parts.reduce((s, p, j) => s + w[j] * p[k], 0);
  const cm = ids.map((a, i) => ids.map((b, j) => i === j ? 1 : corr(rets[i], rets[j])));
  return { ids, w, ks, parts, mix, avg: { cagr: avg('cagr'), vol: avg('vol'), dd: avg('dd'), sh: avg('sh') }, cm, from: label(ks[0]), to: label(ks[ks.length - 1]) };
}
const wTxt = (ids, w) => ids.map((id, j) => `${Math.round(w[j] * 100)}% ${id}`).join(' / ');
function tableHTML(a) {
  const row = (name, o, cls = '') => `<tr class="${cls}"><th scope="row">${name}</th><td class="mono">${pc(o.cagr)}</td><td class="mono">${pc(o.vol)}</td><td class="mono neg">${pc(o.dd)}</td><td class="mono">${fmt(o.sh, 2)}</td></tr>`;
  return `<div class="guide-table-wrap"><table class="guide-table cmb-table">
    <caption class="sr-only">Rentabilidad, volatilidad, caída máxima y ratio de Sharpe de cada estrategia y de su mezcla en el periodo común</caption>
    <thead><tr><th scope="col">En el periodo común</th><th scope="col">Rent. anualizada</th><th scope="col">Volatilidad</th><th scope="col">Caída máxima</th><th scope="col">Sharpe</th></tr></thead>
    <tbody>${a.parts.map((p, j) => row(dot(p.id) + nm(p.id) + ` <span class="pp">peso ${Math.round(a.w[j] * 100)}%</span>`, p)).join('')}
    ${row('Media ponderada de las partes', a.avg, 'cmb-avg')}
    ${row('<strong>Mezcla (' + wTxt(a.ids, a.w) + ')</strong>', a.mix, 'cmb-mix')}</tbody></table></div>`;
}
function corrHTML(a) {
  const head = a.ids.map(id => `<th scope="col">${id}</th>`).join('');
  const body = a.ids.map((id, i) => `<tr><th scope="row">${dot(id)}${nm(id)}</th>${a.cm[i].map((c, j) => {
    const al = i === j ? 0 : Math.min(.55, Math.abs(c) * .55);
    return `<td class="mono" style="background:color-mix(in srgb,var(--accent) ${Math.round(al * 100)}%,transparent)">${i === j ? '—' : fmt(c, 2)}</td>`;
  }).join('')}</tr>`).join('');
  return `<div class="guide-table-wrap"><table class="guide-table cmb-corr"><caption class="sr-only">Correlación entre los rendimientos mensuales de las estrategias</caption><thead><tr><th></th>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}
function phrase(a) {
  const dd = a.mix.dd, ds = a.parts.map(p => p.dd), best = Math.max(...ds), worst = Math.min(...ds);
  let t;
  if (dd > best + .05) t = `la caída máxima de la mezcla (${pc(dd)}) es <strong>menor que la de cualquiera de sus partes</strong>`;
  else if (dd < worst - .05) t = `la caída máxima de la mezcla (${pc(dd)}) es <strong>mayor que la de cualquiera de sus partes</strong>`;
  else if (dd < a.avg.dd - .25) t = `la caída máxima de la mezcla (${pc(dd)}) es <strong>peor que la media ponderada</strong> de las caídas de sus partes (${pc(a.avg.dd)})`;
  else if (dd > a.avg.dd + .25) t = `la caída máxima de la mezcla (${pc(dd)}) es <strong>mejor que la media ponderada</strong> de las caídas de sus partes (${pc(a.avg.dd)})`;
  else t = `la caída máxima de la mezcla (${pc(dd)}) es <strong>prácticamente igual que la media ponderada</strong> de las caídas de sus partes (${pc(a.avg.dd)}): casi no hay compensación`;
  return `En este periodo, ${t}. Su volatilidad es ${pc(a.mix.vol)}, frente a ${pc(a.avg.vol)} de media ponderada.`;
}
function corrLine(a) {
  const out = [];
  for (let i = 0; i < a.ids.length; i++) for (let j = i + 1; j < a.ids.length; j++) out.push(`${a.ids[i]}–${a.ids[j]} <strong class="mono">${fmt(a.cm[i][j], 2)}</strong>`);
  return out.join(' · ');
}

/* ---- Ejemplos fijos (con pesos) ---- */
const EX = [
  { ids: ['IMPULSO', 'GEDA'], w: [.5, .5], tit: 'Dos estrategias poco relacionadas: una mezcla que cae menos que la media de sus partes' },
  { ids: ['IMPULSO', 'GEDA', 'GEN-Z'], w: [.3, .4, .3], tit: 'Tres estrategias: una mezcla que cae mucho menos que su parte más volátil' },
  { ids: ['GEDA', 'GEN-Z', 'CRYPTO'], w: [.6, .3, .1], tit: 'Tres estrategias de alto riesgo: una mezcla con menos caída que la media de sus partes' },
  { ids: ['ROCA', 'IMPULSO'], w: [.5, .5], tit: 'Dos estrategias que se mueven casi igual' }
];
const exEl = $('#cmbExamples');
if (exEl) {
  exEl.innerHTML = EX.map((e, n) => { const a = analyse(e.ids, e.w);
    return `<article class="cmb-ex"><h3>${e.tit}</h3><p class="cmb-meta">${e.ids.map(i => dot(i) + i).join(' + ')} · pesos ${wTxt(e.ids, e.w)} · ${a.from} – ${a.to} (${a.ks.length} meses)</p><p class="cmb-meta">Correlación: ${corrLine(a)}</p>${tableHTML(a)}<p>${phrase(a)}</p><p><button type="button" class="btn btn-ghost btn-sm" data-ex="${n}">Probar esta mezcla en la herramienta</button></p></article>`; }).join('');
}
/* ---- Matriz completa ---- */
const mEl = $('#cmbMatrix');
if (mEl) {
  const cm = IDS.map(a => IDS.map(b => { if (a === b) return 1; const ks = common([a, b]); return corr(ks.map(k => maps[a].get(k)), ks.map(k => maps[b].get(k))); }));
  mEl.innerHTML = corrHTML({ ids: IDS, cm });
}

/* ---- Herramienta: selección + pesos ---- */
const sel = new Set(['IMPULSO', 'GEDA']);
const wt = {}; IDS.forEach(id => { wt[id] = 50; });
const box = $('#cmbChips'), wBox = $('#cmbWeights'), out = $('#cmbOut');
const selIds = () => IDS.filter(id => sel.has(id));
const norm = ids => { const tot = ids.reduce((s, id) => s + wt[id], 0) || 1; return ids.map(id => wt[id] / tot); };
function renderWeights() {
  const ids = selIds();
  wBox.innerHTML = ids.map(id => `<div class="cmb-w"><label for="w-${id}">${dot(id)}${nm(id)}</label><input type="range" id="w-${id}" data-id="${id}" min="5" max="100" step="5" value="${wt[id]}" aria-describedby="wo-${id}"><output id="wo-${id}" class="mono"></output></div>`).join('');
}
function updateOutputs() {
  const ids = selIds(), w = norm(ids);
  ids.forEach((id, j) => { const o = $('#wo-' + id); if (o) o.textContent = Math.round(w[j] * 100) + '%'; });
}
function run() {
  const ids = selIds();
  if (ids.length < 2) { out.innerHTML = '<p class="small-note">Selecciona al menos dos estrategias.</p>'; sim(); return; }
  const w = norm(ids), a = analyse(ids, w);
  updateOutputs();
  out.innerHTML = `<p class="cmb-meta">Periodo común: <strong>${a.from} – ${a.to}</strong> (${a.ks.length} meses) · pesos ${wTxt(ids, w)} · rebalanceo mensual</p>${tableHTML(a)}<p>${phrase(a)}</p><h4>Correlación entre las estrategias elegidas</h4>${corrHTML(a)}`;
  sim();
}
if (box) {
  box.innerHTML = IDS.map(id => `<button type="button" class="cmb-chip" data-id="${id}" aria-pressed="${sel.has(id)}">${dot(id)}${nm(id)}</button>`).join('');
  box.addEventListener('click', e => { const b = e.target.closest('.cmb-chip'); if (!b) return; const id = b.dataset.id;
    if (sel.has(id)) { if (sel.size > 2) sel.delete(id); } else sel.add(id);
    $$('.cmb-chip', box).forEach(x => x.setAttribute('aria-pressed', sel.has(x.dataset.id))); renderWeights(); run(); });
  wBox.addEventListener('input', e => { const r = e.target.closest('input[type=range]'); if (!r) return; wt[r.dataset.id] = +r.value; run(); });
  const eq = $('#cmbEqual'); if (eq) eq.addEventListener('click', () => { IDS.forEach(id => { wt[id] = 50; }); renderWeights(); run(); });
  if (exEl) exEl.addEventListener('click', e => { const b = e.target.closest('[data-ex]'); if (!b) return; const ex = EX[+b.dataset.ex];
    sel.clear(); ex.ids.forEach((id, j) => { sel.add(id); wt[id] = Math.round(ex.w[j] * 100); });
    $$('.cmb-chip', box).forEach(x => x.setAttribute('aria-pressed', sel.has(x.dataset.id))); renderWeights(); run();
    const tgt = $('#c5'); if (tgt && tgt.scrollIntoView) tgt.scrollIntoView({ behavior: T.reduced ? 'auto' : 'smooth' }); });
  renderWeights();
}

/* ---- Interés compuesto con la mezcla elegida ---- */
let scenario = .75, lastSim = [];
const sCap = $('#sCap'), sMon = $('#sMon'), sYrs = $('#sYrs');
function sim() {
  if (!sCap) return;
  const ids = selIds(); if (ids.length < 2) return;
  const w = norm(ids), cap = +sCap.value, mon = +sMon.value, yrs = +sYrs.value;
  $('#oCap').textContent = T.eur(cap); $('#oMon').textContent = T.eur(mon); $('#oYrs').textContent = yrs + (yrs > 1 ? ' años' : ' año');
  $('#simMix').textContent = wTxt(ids, w);
  const shortIds = ids.filter(id => meta(id).short), note = $('#simShort'), out = $('.cmb-sim-out'), chartBox = $('.cmb-chart');
  if (note) {
    note.hidden = !shortIds.length;
    if (out) out.hidden = !!shortIds.length; if (chartBox) chartBox.hidden = !!shortIds.length;
    if (shortIds.length) { note.textContent = `La proyección necesita una rentabilidad anual media, y ${shortIds.join(' y ')} ${shortIds.length > 1 ? 'llevan' : 'lleva'} menos de cinco años con dinero real: una media de tan pocos años dependería de uno o dos años excepcionales. Quita ${shortIds.length > 1 ? 'esas estrategias' : 'esa estrategia'} de la mezcla para ver la proyección.`; lastSim = []; $('#simTable').innerHTML = ''; return; }
  }
  const base = ids.reduce((s, id, j) => s + w[j] * meta(id).avg, 0), annual = base * scenario;
  const r = Math.pow(1 + annual / 100, 1 / 12) - 1;
  let v = cap, inv = cap; lastSim = [{ y: 0, inv, val: v }];
  for (let m = 1; m <= yrs * 12; m++) { v = v * (1 + r) + mon; inv += mon; if (m % 12 === 0) lastSim.push({ y: m / 12, inv, val: v }); }
  $('#rIn').textContent = T.eur(inv); $('#rOut').textContent = T.eur(v);
  const g = $('#rGain'); g.textContent = T.eur(v - inv); g.className = 'mono ' + T.cls(v - inv);
  $('#rRate').textContent = T.pct(+annual.toFixed(1));
  $('#simMix').textContent = wTxt(ids, w);
  $('#simTable').innerHTML = '<caption class="sr-only">Evolución año a año</caption><thead><tr><th scope="col">Año</th><th scope="col">Aportado</th><th scope="col">Rendimiento</th><th scope="col">Valor</th></tr></thead><tbody>' +
    lastSim.map(x => `<tr><th scope="row">${x.y}</th><td class="mono">${T.eur(x.inv)}</td><td class="mono ${T.cls(x.val - x.inv)}">${T.eur(x.val - x.inv)}</td><td class="mono">${T.eur(x.val)}</td></tr>`).join('') + '</tbody>';
  if (!T.hasChart || !window.Chart) return;
  const color = meta(ids[0]).color, labels = lastSim.map(x => 'Año ' + x.y), dInv = lastSim.map(x => Math.round(x.inv)), dGain = lastSim.map(x => Math.round(x.val - x.inv));
  const ch = T.charts.cmbSim;
  if (ch) { ch.data.labels = labels; ch.data.datasets[0].data = dInv; ch.data.datasets[1].data = dGain; ch.data.datasets[1].borderColor = color; ch.data.datasets[1].backgroundColor = T.alpha(color, .35); ch.update(); return; }
  T.charts.cmbSim = new Chart($('#simChart'), { type: 'line',
    data: { labels, datasets: [
      { label: 'Capital aportado', data: dInv, fill: 'origin', borderColor: T.css('--accent'), backgroundColor: T.alpha(T.css('--accent'), .3), pointRadius: 0, tension: .3, borderWidth: 2 },
      { label: 'Rendimiento acumulado', data: dGain, fill: '-1', borderColor: color, backgroundColor: T.alpha(color, .35), pointRadius: 0, tension: .3, borderWidth: 2 }
    ] },
    options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
      scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } }, y: { stacked: true, grid: { color: T.alpha('#8899bb', .12) }, ticks: { callback: v => new Intl.NumberFormat('es-ES', { notation: 'compact' }).format(v) + ' €' } } },
      plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 10 } },
        tooltip: { ...T.tooltipStyle(), callbacks: { label: c => ` ${c.dataset.label}: ${T.eur(c.parsed.y)}`, footer: it => 'Valor total: ' + T.eur(it.reduce((a, b) => a + b.parsed.y, 0)) } } } } });
}
if (sCap) {
  ['sCap', 'sMon', 'sYrs'].forEach(id => $('#' + id).addEventListener('input', sim));
  $$('#scSeg .chip').forEach(b => b.addEventListener('click', () => { scenario = +b.dataset.sc; $$('#scSeg .chip').forEach(x => x.setAttribute('aria-checked', x === b)); sim(); }));
  $('#scSeg').addEventListener('keydown', e => { if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return; e.preventDefault();
    const bs = $$('#scSeg .chip'), i = bs.findIndex(b => b.getAttribute('aria-checked') === 'true'), n = bs[(i + (e.key === 'ArrowRight' ? 1 : -1) + 3) % 3]; n.click(); n.focus(); });
  $('#csvBtn').addEventListener('click', () => {
    const ids = selIds(), w = norm(ids);
    const head = `# Simulación ilustrativa Tu Amigo Inversor;${ids.map((id, j) => id + ' ' + Math.round(w[j] * 100) + '%').join(' / ')};escenario ${scenario * 100}%\nAño;Aportado (EUR);Rendimiento (EUR);Valor (EUR)\n`;
    const body = lastSim.map(r => [r.y, r.inv.toFixed(2), (r.val - r.inv).toFixed(2), r.val.toFixed(2)].join(';')).join('\n');
    const blob = new Blob(['\ufeff' + head + body], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob), l = document.createElement('a'); l.href = url; l.download = 'simulacion_tu_amigo_inversor.csv'; document.body.appendChild(l); l.click(); l.remove(); URL.revokeObjectURL(url); });
}
if (box) run();
})();
