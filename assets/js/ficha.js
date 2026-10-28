/* =========================================================
   FICHAS DE ESTRATEGIA · gráfico, mapa de calor mensual y línea de tiempo de posiciones
   Lee los datos de la variable global FICHA (definida en cada página).
   ========================================================= */
(function () {
'use strict';
const T = window.TAI, F = window.FICHA, { $, $$, css, alpha, hasChart, charts } = T;
const MES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const fmt = (v, d = 1) => v.toLocaleString('es-ES', {minimumFractionDigits: d, maximumFractionDigits: d});
const pc = (v, d = 1) => (v > 0 ? '+' : '') + fmt(v, d) + '%';
const COLOR = F.color;

/* ---- Gráfico: evolución acumulada, escala logarítmica ---- */
function series() {   // todas las estrategias empiezan en enero
  const first = +Object.keys(F.months)[0];
  const labels = ['dic ' + (first - 1)], values = [100], rets = [null]; let v = 100;
  Object.keys(F.months).forEach(y => F.months[y].forEach((r, i) => { v *= 1 + r / 100; labels.push(MES[i] + ' ' + y); values.push(+v.toFixed(2)); rets.push(r); }));
  let p = -Infinity; const peaks = values.map(x => p = Math.max(p, x));
  return {labels, values, peaks, rets};
}
function gradient(c) { const a = c.chart.chartArea; if (!a) return alpha(COLOR, .15); const g = c.chart.ctx.createLinearGradient(0, a.top, 0, a.bottom); g.addColorStop(0, alpha(COLOR, .35)); g.addColorStop(1, alpha(COLOR, 0)); return g; }
if (hasChart && $('#fichaChart')) {
  const d = series(), neg = al => `rgba(${css('--neg-rgb')},${al})`, n = d.labels.length, step = n > 100 ? 2 : 1;
  charts.ficha = new Chart($('#fichaChart'), {type: 'line',
    data: {labels: d.labels, datasets: [
      {label: 'Máximo previo', data: d.peaks, borderWidth: 0, pointRadius: 0, fill: false, borderColor: 'transparent'},
      {label: 'Zona de caída', data: d.values, borderWidth: 0, pointRadius: 0, borderColor: 'transparent', backgroundColor: neg(.45), fill: {target: 0, above: 'rgba(0,0,0,0)', below: neg(.28)}},
      {label: 'Evolución acumulada (base 100)', data: d.values, borderColor: COLOR, borderWidth: 2.25, tension: 0, pointHoverRadius: 5,
        pointRadius: c => c.dataIndex === c.dataset.data.length - 1 ? 4 : 0, pointBackgroundColor: COLOR, fill: 'start', backgroundColor: gradient}]},
    options: {responsive: true, maintainAspectRatio: false, layout: {padding: {right: 8}}, interaction: {mode: 'index', intersect: false},
      scales: {
        x: {display: true, grid: {display: false}, ticks: {autoSkip: false, maxRotation: 0, font: {size: 11},
          callback: function (v) { const l = this.getLabelForValue(v); if (!l.startsWith('ene')) return ''; const yr = +l.slice(-4); return yr % step === 0 ? String(yr) : ''; }}},
        y: {type: 'logarithmic', grid: {color: alpha('#8899bb', .12)},
          afterBuildTicks: ax => { const nice = [10,20,30,50,70,100,150,200,300,500,700,1000,2000,3000,5000,10000]; ax.ticks = ax.ticks.filter(t => nice.includes(Math.round(t.value))); },
          ticks: {callback: v => fmt(v, 0)}}},
      plugins: {legend: {display: true, position: 'bottom', labels: {boxWidth: 10, boxHeight: 10, usePointStyle: true, filter: i => i.datasetIndex !== 0}},
        tooltip: {...T.tooltipStyle(), filter: i => i.datasetIndex === 2, callbacks: {title: c => c[0].label, label: c => ' Valor: ' + fmt(c.parsed.y),
          afterLabel: c => { const i = c.dataIndex, r = d.rets[i], pk = d.peaks[i], o = []; if (r !== null) o.push(' Mes: ' + pc(r, 2)); const cur = c.parsed.y / pk - 1; if (cur < -0.0005) o.push(' Desde máximo: ' + fmt(cur * 100) + '%'); return o; }}}}}});
}

/* ---- Mapa de calor mensual ---- */
function renderHeat() {
  const t = $('#heat'); if (!t) return;
  let h = '<thead><tr><th scope="col" style="text-align:left;padding-left:.8rem">Año</th>' + MES.map(m => `<th scope="col">${m}</th>`).join('') + '<th scope="col">Año</th></tr></thead><tbody>';
  const pr = css('--pos-rgb'), nr = css('--neg-rgb'), sc = F.scale || 25, sn = F.scaleNeg || 12;
  const color = v => v >= 0 ? `rgba(${pr},${Math.min(.6, .08 + v / sc * .52).toFixed(2)})` : `rgba(${nr},${Math.min(.65, .1 + Math.abs(v) / sn * .55).toFixed(2)})`;
  Object.keys(F.months).forEach(y => {
    const r = F.months[y], start = 0;
    const yr = (r.reduce((a, x) => a * (1 + x / 100), 1) - 1) * 100;
    const tag = F.realFrom ? (+y >= F.realFrom ? '<span class="tag-s real">Real</span>' : '<span class="tag-s sim">Simulado</span>') : '';
    h += `<tr><th scope="row">${y}${y === '2026' ? '*' : ''}${tag}</th>` + MES.map((m, i) => (i >= start && i - start < r.length) ? `<td class="mono" style="background:${color(r[i - start])}">${fmt(Math.abs(r[i - start]) < 0.05 ? 0 : r[i - start], 1)}</td>` : '<td></td>').join('') + `<td class="mono yr" style="background:${color(yr / 4)}">${pc(yr)}</td></tr>`;
  });
  t.innerHTML = h + '</tbody>';
}
renderHeat();

/* ---- Línea de tiempo de posiciones ---- */
(function () {
  const root = $('#timeline'), POS = F.pos; if (!root || !POS) return;
  const n = POS.labels.length; root.style.setProperty('--n', n);
  const fit = Math.floor((root.parentElement.clientWidth - 34) / n * 10) / 10; root.style.setProperty('--pm', (fit >= 8 ? fit : 9) + 'px');
  const mname = i => { const [y, m] = POS.labels[i].split('-'); return MES[m - 1] + ' ' + y; };
  const h0 = +css('--tl-h0'), hr = +css('--tl-hr'), ts = css('--tl-s'), tlum = css('--tl-l');
  const color = t => { let h = 0; for (const c of t) h = (h * 31 + c.charCodeAt(0)) % 360; return `hsl(${h0 + h % hr} ${ts}% ${tlum}%)`; };
  let html = '<div class="tl-axis">';
  POS.labels.forEach((l, i) => { const [y, m] = l.split('-'); if (+m === 1) html += `<span style="left:calc(${i} * var(--pm))">${y}</span>`; });
  html += '</div>';
  POS.blocks.forEach((name, k) => {
    const st = POS.stints.filter(s => s[0] === k).sort((x, y) => x[2] - y[2]);
    const lanes = [], place = [];
    st.forEach(s => { let L = lanes.findIndex(e => e < s[2]); if (L < 0) { L = lanes.length; lanes.push(-1); } lanes[L] = s[3]; place.push([s, L]); });
    const nl = Math.max(1, lanes.length);
    html += `<div class="tl-row"><h4>${name}</h4><div class="tl-track" style="--lanes:${nl}">`;
    place.forEach(([s, L]) => { const len = s[3] - s[2] + 1, lab = len >= 3 ? s[1] : '';
      html += `<div class="tl-bar" style="left:calc(${s[2]} * var(--pm));width:calc(${len} * var(--pm) - 1px);top:${L * 26}px;background:${color(s[1])}" title="${s[1]} · ${mname(s[2])} – ${mname(s[3])} (${len} ${len === 1 ? 'mes' : 'meses'})">${lab}</div>`; });
    html += '</div></div>';
  });
  root.innerHTML = html;
  const w = root.parentElement; requestAnimationFrame(() => { if (innerWidth < 760) w.scrollLeft = w.scrollWidth; });
})();

/* ---- Tema: repintar mapa de calor y gráfico ---- */
$('#themeToggle').addEventListener('click', () => {
  renderHeat();
  if (charts.ficha) { const ds = charts.ficha.data.datasets, neg = al => `rgba(${css('--neg-rgb')},${al})`; ds[1].backgroundColor = neg(.45); ds[1].fill = {target: 0, above: 'rgba(0,0,0,0)', below: neg(.28)}; charts.ficha.update('none'); }
});

/* ---- FAQ ---- */
if (F.faq && $('#faqList')) T.renderFaq($('#faqList'), F.faq);
})();
