/* =========================================================
   TAI · código común de todas las páginas
   Datos de las estrategias, utilidades, tema claro/oscuro, navegación,
   test de riesgo (ventana emergente), FAQ y formulario.
   Se carga con defer, después de Chart.js.
   ========================================================= */
(function () {
'use strict';
const T = window.TAI = {};
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const BASE = document.documentElement.dataset.base || '';   // '' en la home, '../' en subcarpetas
Object.assign(T, { $, $$, BASE });

/* ---------- 1. FUENTE DE VERDAD: ESTRATEGIAS (no modificar cifras) ---------- */
const IMG = id => ({ src: `${BASE}assets/img/estrategias/${id}-card.webp` });
T.STRATEGIES = [
  {id:'ROCA',     slug:'roca',     type:'permanente', profile:'Perfil conservador',  color:'#0ea5e9', risk:1, review:'Semestral',
   desc:'La más tranquila: seis fondos o ETF repartidos entre renta fija, oro y bolsa. Crece despacio y cae poco, aunque también puede caer.',
   con:'En años de bolsa muy alcista se queda bastante por detrás: está pensada para caer poco, no para subir mucho.',
   feats:['Baja volatilidad','Diversificación','Revisión semestral'], avg:7.1, dd:-9.2, group:'tranquila', realFrom:2017, realAvg:7.1, realDd:-9.2, realMonths:117, realCum:95.5, short:false, fullFrom:2017, y25:5.6, y26:4.7,
   img:IMG('roca'), alt:'Cima rocosa con montañas nevadas al amanecer, símbolo de solidez y calma',
   url:BASE+'cartera-permanente-conservadora-roca/index.html'},
  {id:'IMPULSO',  slug:'impulso',  type:'permanente', profile:'Perfil moderado',     color:'#10b981', risk:2, review:'Semestral',
   desc:'Un paso más que ROCA: oro y bolsa, sin renta fija. Más crecimiento a cambio de más altibajos.',
   con:'Depende mucho del oro (40% de la cartera): cuando el oro cae, la estrategia lo nota.',
   feats:['Riesgo medio','Sin renta fija','Revisión semestral'], avg:14.5, dd:-16.5, group:'equilibrada', realFrom:2018, realAvg:14.5, realDd:-16.5, realMonths:105, realCum:226.8, short:false, fullFrom:2018, y25:22.6, y26:8.2,
   img:IMG('impulso'), alt:'Carretera junto al mar al atardecer con estelas de luz, símbolo de avance constante',
   url:BASE+'cartera-inversion-crecimiento-impulso/index.html'},
  {id:'HORIZONTE',slug:'horizonte',type:'tactica',    profile:'Perfil moderado',     color:'#7c3aed', risk:2, review:'Mensual', note:'Plan de pensiones',
   desc:'Para tu plan de pensiones: cada mes una regla sencilla decide si estar en bolsa de EE. UU. o en renta fija.',
   con:'Solo funciona con planes de pensiones, cuyo dinero no está disponible salvo en supuestos concretos; y en mercados sin tendencia la señal puede cambiar sin ganancia.',
   feats:['Muy largo plazo','Baja rotación','Simplicidad operativa'], avg:13.4, dd:-19.3, group:'equilibrada', realFrom:2020, realAvg:13.4, realDd:-19.3, realMonths:81, realCum:133.9, short:false, fullFrom:2020, y25:17.4, y26:17.6,
   img:IMG('horizonte'), alt:'Piscina infinita frente al mar al amanecer, símbolo de largo plazo',
   url:BASE+'plan-pensiones-moderado-horizonte/index.html'},
  {id:'GEDA',     slug:'geda',     type:'tactica',    profile:'Perfil agresivo',     color:'#f59e00', risk:4, review:'Mensual',
   desc:'Cada mes rota hacia los 7 activos con más fuerza (índices, sectores y acciones). Es mi estrategia principal.',
   con:'No pasa a liquidez: en una caída general del mercado sigue invertida. Además lleva acciones sueltas.',
   feats:['Alta rotación','Señales cuantitativas','Enfoque dinámico'], avg:45.9, dd:-16.2, group:'atrevida', realFrom:2021, realAvg:45.9, realDd:-16.2, realMonths:69, realCum:776.7, short:false, fullFrom:2021, y25:53.9, y26:100.2,
   img:IMG('geda'), alt:'Pantallas con gráficos de cotización sobre un escritorio, símbolo del análisis de tendencias',
   url:BASE+'inversion-tactica-geda/index.html'},
  {id:'GEN-Z',    slug:'genz',     type:'tactica',    profile:'Perfil muy agresivo', color:'#ec4899', risk:5, review:'Mensual',
   desc:'Cuatro acciones de temáticas de futuro, elegidas cada mes por su fuerza. Subidas y bajadas muy bruscas.',
   con:'Solo cuatro acciones de pocas temáticas: subidas y bajadas muy bruscas y muy concentradas.',
   feats:['Alta volatilidad','Temáticas innovadoras','Largo plazo'], avg:106.7, dd:-44.9, group:'atrevida', realFrom:2024, realAvg:106.7, realDd:-44.9, realMonths:33, realCum:636.7, short:true, fullFrom:2024, y25:159.2, y26:16.2,
   img:IMG('genz'), alt:'Placa de circuitos electrónicos vista de cerca, símbolo de tecnología disruptiva',
   url:BASE+'inversion-tematica-gen-z/index.html'},
  {id:'CRYPTO',   slug:'crypto',   type:'tactica',    profile:'Perfil especulativo', color:'#ef4444', risk:5, review:'Mensual',
   desc:'Bitcoin, Ethereum y las tres criptomonedas con más fuerza. Sube y baja muchísimo: solo con dinero que puedas permitirte perder.',
   con:'Volatilidad extrema: con dinero real ha caído un 50%, y en el backtest previo, más de un 70%.',
   feats:['Volatilidad extrema','Ciclos de mercado','Alto riesgo'], avg:57.0, dd:-50.1, group:'atrevida', realFrom:2023, realAvg:57.0, realDd:-50.1, realMonths:45, realCum:442.8, short:true, fullFrom:2023, y25:-23.6, y26:20.8,
   img:IMG('crypto'), alt:'Moneda dorada de Bitcoin frente a gráficos de mercado, símbolo del mundo cripto',
   url:BASE+'inversion-criptomonedas-crypto/index.html'}
];
T.byId = id => T.STRATEGIES.find(s => s.id === id);
/* Nombre para mostrar: HORIZONTE siempre se identifica como plan de pensiones */
T.label = id => id === 'HORIZONTE' ? 'HORIZONTE (plan de pensiones)' : id;

/* ---------- 2. UTILIDADES ---------- */
T.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
T.pct = v => (v > 0 ? '+' : '') + String(v).replace('.', ',') + '%';
T.eur = v => new Intl.NumberFormat('es-ES', {style:'currency', currency:'EUR', maximumFractionDigits:0}).format(v);
T.cls = v => v < 0 ? 'neg' : 'pos';
T.css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
T.debounce = (fn, ms = 150) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
T.alpha = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
T.hasChart = typeof window.Chart !== 'undefined';
if (!T.hasChart) document.documentElement.classList.add('no-chart');
const reduced = T.reduced;

/* ---------- 3. GRÁFICOS: ajustes globales y tema ---------- */
T.charts = {};
T.chartDefaults = function () {
  if (!T.hasChart) return;
  Chart.defaults.font.family = "Inter, system-ui, sans-serif";
  Chart.defaults.color = T.css('--muted');
  Chart.defaults.borderColor = T.css('--line');
  Chart.defaults.animation.duration = reduced ? 0 : 900;
};
T.tooltipStyle = () => ({backgroundColor:T.css('--surface'), titleColor:T.css('--text'), bodyColor:T.css('--text'), borderColor:T.css('--line-2'), borderWidth:1, padding:10, cornerRadius:10, boxPadding:4});
T.refreshChartsTheme = function () {
  if (!T.hasChart) return; T.chartDefaults();
  Object.values(T.charts).forEach(c => {
    if (c.options.plugins.tooltip) Object.assign(c.options.plugins.tooltip, T.tooltipStyle());
    if (c.options.scales.r) c.options.scales.r.pointLabels.color = T.css('--muted');
    Object.values(c.options.scales).forEach(s => { if (s.ticks) s.ticks.color = T.css('--muted'); });
    if (c.options.plugins.legend && c.options.plugins.legend.labels) c.options.plugins.legend.labels.color = T.css('--muted');
    c.update('none');
  });
};
T.chartDefaults();
addEventListener('resize', T.debounce(() => Object.values(T.charts).forEach(c => c.resize()), 200));

/* ---------- 4. TEMA CLARO / OSCURO ---------- */
const themeBtn = $('#themeToggle');
function setThemeLabel() {
  const t = document.documentElement.dataset.theme;
  themeBtn.setAttribute('aria-label', t === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
}
setThemeLabel();
themeBtn.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('tai-theme-v3', next); } catch (e) {}
  setThemeLabel(); T.refreshChartsTheme();
});

/* ---------- 5. NAVEGACIÓN, PROGRESO, FLOTANTES ---------- */
const header = $('#header'), progress = $('#progress'), toTop = $('#toTop'), sticky = $('#stickyCta');
const subSection = $('#suscripcion');
const onScroll = () => {
  const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
  header.classList.toggle('scrolled', y > 10);
  progress.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
  toTop.classList.toggle('show', y > 900);
  let inSub = false;
  if (subSection) { const r = subSection.getBoundingClientRect(); inSub = r.top < innerHeight && r.bottom > 0; }
  sticky.classList.toggle('show', y > 600 && !inSub);
};
addEventListener('scroll', onScroll, {passive:true}); onScroll();
toTop.addEventListener('click', () => { scrollTo({top:0, behavior:reduced ? 'auto' : 'smooth'}); $('#main').focus({preventScroll:true}); });

/* Menú desplegable «Recursos» */
$$('.sub-toggle').forEach(b => { const li = b.closest('.has-sub');
  b.addEventListener('click', e => { e.stopPropagation(); const o = li.classList.toggle('open'); b.setAttribute('aria-expanded', o); });
  li.addEventListener('mouseenter', () => b.setAttribute('aria-expanded', 'true'));
  li.addEventListener('mouseleave', () => { if (!li.classList.contains('open')) b.setAttribute('aria-expanded', 'false'); }); });
document.addEventListener('click', e => { $$('.has-sub.open').forEach(li => { if (!li.contains(e.target)) { li.classList.remove('open'); li.querySelector('.sub-toggle').setAttribute('aria-expanded', 'false'); } }); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') $$('.has-sub.open').forEach(li => { li.classList.remove('open'); li.querySelector('.sub-toggle').setAttribute('aria-expanded', 'false'); }); });
const burger = $('#burger'), mm = $('#mobileMenu');
burger.addEventListener('click', () => { const o = mm.classList.toggle('open'); burger.setAttribute('aria-expanded', o); burger.setAttribute('aria-label', o ? 'Cerrar menú' : 'Abrir menú'); });
$$('#mobileMenu a').forEach(a => a.addEventListener('click', () => { mm.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && mm.classList.contains('open')) { mm.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); burger.focus(); } });

/* ---------- 6. MICROINTERACCIONES ---------- */
if (!reduced && matchMedia('(hover:hover)').matches) {
  $$('.magnetic').forEach(b => {
    b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); b.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * .18) + 'px'); b.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * .25) + 'px'); });
    b.addEventListener('mouseleave', () => { b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px'); });
  });
  document.addEventListener('pointermove', e => { const el = e.target.closest('.spot'); if (!el) return; const r = el.getBoundingClientRect(); el.style.setProperty('--x', (e.clientX - r.left) + 'px'); el.style.setProperty('--y', (e.clientY - r.top) + 'px'); }, {passive:true});
}

/* ---------- 7. REVEAL AL HACER SCROLL ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in'); io.unobserve(e.target);
}), {threshold:.12, rootMargin:'0px 0px -40px 0px'});
T.observeReveal = () => $$('.reveal:not(.in)').forEach(el => io.observe(el));

/* ---------- 8. VENTANAS EMERGENTES (accesibles: foco atrapado + ESC) ---------- */
T.openModal = function (m, trigger, focusEl) {
  m._last = trigger || document.activeElement;
  m.classList.add('open'); m.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden';
  (focusEl || $('.modal-close', m)).focus({preventScroll:true});
};
T.closeModal = function (m) {
  m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); document.body.style.overflow = '';
  if (m._last && m._last.focus) m._last.focus({preventScroll:true});
  if (m.id === 'quizModal' && location.hash === '#test') history.replaceState(null, '', location.pathname + location.search);
};
document.addEventListener('click', e => {
  const m = e.target.closest('.modal'); if (!m) return;
  if (e.target === m || e.target.closest('.modal-close') || e.target.closest('[data-close]')) T.closeModal(m);
});
document.addEventListener('keydown', e => {
  const m = $('.modal.open'); if (!m) return;
  if (e.key === 'Escape') { T.closeModal(m); return; }
  if (e.key === 'Tab') {
    const f = $$('a[href],button:not([disabled]),input,select,[tabindex]:not([tabindex="-1"])', $('.modal-box', m)).filter(x => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

/* ---------- 9. TEST DE TOLERANCIA AL RIESGO (ventana emergente) ----------
   V42: es educativo. Explica la tolerancia al riesgo de quien lo hace y muestra las seis estrategias ordenadas por riesgo,
   SIN filtrar ni decir cuáles «encajan». No debe convertirse en una selección de estrategias para cada persona
   (eso se parecería a una recomendación personalizada, que es asesoramiento y requiere autorización de la CNMV). */
const QUIZ = [
  {a:'A · Tu situación', q:'¿Cuándo prevés necesitar este dinero?', o:['En menos de 2 años','Entre 2 y 5 años','Entre 5 y 10 años','En más de 10 años'], p:[1,2,3,4]},
  {q:'¿Qué parte de tus ahorros totales representa el dinero que vas a invertir?', o:['Más del 75%','Entre el 50% y el 75%','Entre el 25% y el 50%','Menos del 25%'], p:[1,2,3,4]},
  {q:'Al margen de este dinero, ¿cuántos meses de gastos puedes cubrir con ahorros disponibles de inmediato?', o:['Ninguno','Entre 1 y 3 meses','Entre 3 y 6 meses','Más de 6 meses'], p:[1,2,3,4]},
  {a:'B · Conocimientos y experiencia', q:'¿Cuál es el producto más complejo que has contratado?', o:['Ninguno, o solo depósitos y cuentas remuneradas','Fondos monetarios o de renta fija','Fondos de renta variable o mixtos, ETF o planes de pensiones','Acciones individuales, derivados, criptomonedas u otros productos complejos'], p:[1,2,3,4]},
  {q:'¿Cuánto tiempo llevas invirtiendo?', o:['Nunca he invertido','Menos de 2 años','Entre 2 y 5 años','Más de 5 años'], p:[1,2,3,4]},
  {q:'Un fondo de renta variable mundial puede perder más del 30% de su valor en un año.', o:['Verdadero','Falso','No lo sé'], p:[4,2,1]},
  {a:'C · Riesgo y objetivos', q:'Tu cartera cae un 20% en tres meses. ¿Qué haces?', o:['Vendo todo para no perder más','Vendo una parte','Mantengo y espero','Aprovecho para invertir más'], p:[1,2,3,4]},
  {q:'¿Qué escenario a un año preferirías?', o:['Entre 0% y +3%, sin posibilidad de pérdida','Entre −5% y +8%','Entre −15% y +20%','Entre −30% y +40%'], p:[1,2,3,4]},
  {q:'¿Qué pérdida temporal máxima podrías aceptar sin cambiar tus planes?', o:['Un 5%','Un 10%','Un 20%','Un 30% o más'], p:[1,2,3,4]},
  {q:'¿Cuál es tu objetivo principal?', o:['Conservar el capital','Superar algo la inflación sin sobresaltos','Crecer de forma moderada aceptando altibajos','Maximizar el crecimiento aceptando pérdidas importantes'], p:[1,2,3,4]}
];
const answers = new Array(QUIZ.length).fill(null); let qi = 0;
const quizModal = $('#quizModal'), quizEl = $('#quiz');
function renderQuiz() {
  if (qi >= QUIZ.length) return renderResult();
  const q = QUIZ[qi];
  const area = q.a || [...QUIZ.slice(0, qi)].reverse().find(x => x.a).a;
  quizEl.innerHTML = `
    <div class="q-meta"><span>Pregunta ${qi + 1} de ${QUIZ.length} · ${area}</span><span>${Math.round(qi / QUIZ.length * 100)}%</span></div>
    <div class="q-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${QUIZ.length}" aria-valuenow="${qi}" aria-label="Progreso del test"><div style="width:${qi / QUIZ.length * 100}%"></div></div>
    <h3 class="q-title" id="qT">${q.q}</h3>
    <div class="q-opts" role="radiogroup" aria-labelledby="qT">
      ${q.o.map((t, i) => `<button type="button" class="q-opt" role="radio" aria-checked="${answers[qi] === i}" data-i="${i}"><span class="rd" aria-hidden="true"></span>${t}</button>`).join('')}
    </div>
    <div class="q-nav">
      <button type="button" class="btn btn-ghost btn-sm" id="qBack" ${qi === 0 ? 'disabled' : ''}><svg class="icon"><use href="#i-left"/></svg>Atrás</button>
      <button type="button" class="btn btn-primary btn-sm" id="qNext" ${answers[qi] === null ? 'disabled' : ''}>${qi === QUIZ.length - 1 ? 'Ver resultado' : 'Siguiente'}<svg class="icon"><use href="#i-arrow"/></svg></button>
    </div>`;
  $$('.q-opt', quizEl).forEach(b => b.addEventListener('click', () => { answers[qi] = +b.dataset.i; $$('.q-opt', quizEl).forEach(x => x.setAttribute('aria-checked', x === b)); $('#qNext').disabled = false; }));
  $('#qBack').addEventListener('click', () => { qi--; renderQuiz(); $('.q-opt', quizEl).focus(); });
  $('#qNext').addEventListener('click', () => { qi++; renderQuiz(); const f = $('.q-opt', quizEl) || $('h3', quizEl); if (f) f.focus(); });
}

/* ---- Resultado: perfil de riesgo + explicación + las seis estrategias ordenadas por riesgo (sin selección) ---- */
const PROFILES = ['Conservador', 'Moderado', 'Agresivo', 'Muy agresivo', 'Especulativo'];
const PROFILE_TXT = [
  'priorizas proteger tu dinero frente a hacerlo crecer. Aceptas rentabilidades más modestas a cambio de ver pocas caídas.',
  'buscas un equilibrio entre proteger tu dinero y hacerlo crecer. Aceptas algunas caídas temporales a cambio de una rentabilidad algo mayor.',
  'buscas hacer crecer tu dinero y aceptas caídas importantes por el camino, siempre que tengas tiempo para recuperarte.',
  'buscas un crecimiento alto y aceptas caídas muy profundas y periodos largos en pérdidas.',
  'priorizas el crecimiento por encima de todo y aceptas pérdidas muy elevadas, que en algún caso podrían ser de la mayor parte del dinero invertido.'
];
/* Nivel de riesgo de cada estrategia: coincide con el "Perfil" que se muestra en su ficha y en el informe mensual */
const LV = {'ROCA': 0, 'IMPULSO': 1, 'HORIZONTE': 1, 'GEDA': 2, 'GEN-Z': 3, 'CRYPTO': 4};
const STRAT_WHY = {
  'ROCA': 'Cartera permanente diversificada pensada para proteger el capital. Es la que menos ha caído en su historia.',
  'IMPULSO': 'Cartera permanente con más peso en bolsa y oro que ROCA: busca más crecimiento con caídas todavía contenidas.',
  'HORIZONTE': 'Plan de pensiones con una estrategia de tendencia. Sirve para dinero a largo plazo, porque un plan de pensiones no se puede rescatar libremente.',
  'GEDA': 'Estrategia táctica de momentum: rota entre activos y compañías buscando fortaleza. Puede crecer mucho, pero exige aguantar los malos meses.',
  'GEN-Z': 'Pocas posiciones en sectores disruptivos. Muy volátil: solo para quien acepta caídas muy grandes sin cambiar de plan.',
  'CRYPTO': 'Criptomonedas con reglas de momentum. Es la más especulativa: solo con dinero que puedas permitirte perder.'
};
function evaluate() {
  const L = 'abcd'.split('');
  const a = answers.map(i => L[i]);                         // letras a-d de cada pregunta
  const p = answers.map((i, k) => QUIZ[k].p[i]);            // puntos
  const sum = (x, y) => p.slice(x, y).reduce((u, v) => u + v, 0);
  const cap = sum(0, 3), con = sum(3, 6), tol = sum(6, 10), tot = cap + con + tol;
  const base = tot <= 18 ? 0 : tot <= 26 ? 1 : tot <= 31 ? 2 : tot <= 36 ? 3 : 4;
  // Reglas de prudencia: el perfil final no puede superar estos límites
  const caps = [
    [a[0] === 'a', 0, 'vas a necesitar este dinero en menos de 2 años y, en plazos tan cortos, una caída puede no dar tiempo a recuperarse'],
    [a[8] === 'a', 0, 'solo aceptarías una pérdida temporal muy pequeña (un 5%)'],
    [a[1] === 'a', 1, 'este dinero supone más del 75% de tus ahorros'],
    [a[2] === 'a', 1, 'no cuentas con un colchón de ahorros para imprevistos'],
    [a[6] === 'a', 1, 'ante una caída del 20% venderías todo, y eso convertiría una pérdida temporal en definitiva'],
    [con <= 4, 1, 'tus conocimientos sobre inversión son todavía básicos y conviene empezar por productos que se entiendan bien']
  ].filter(r => r[0]);
  const final = Math.min(base, ...caps.map(r => r[1]));
  const reasons = caps.filter(r => r[1] === final).map(r => r[2]);
  // Avisos de coherencia
  const warn = [];
  if (tol / 4 - cap / 3 > 1) warn.push('Tu disposición a asumir riesgo es mayor que lo que tu situación actual permite. Conviene que lo tengas presente antes de invertir.');
  if (cap / 3 - tol / 4 > 1) warn.push('Tu situación te permitiría asumir más riesgo del que te resulta cómodo. Prevalece lo que te resulta cómodo: invertir de forma que puedas dormir tranquilo es lo que te permitirá mantener el plan.');
  if (p[6] <= 2 && a[8] === 'd') warn.push('Has dicho que aceptarías perder un 30% o más, pero que ante una caída del 20% venderías. Piensa cuál de las dos reacciones sería la real: es lo que más importa cuando llegan las caídas.');
  return { cap, con, tol, tot, base, final, reasons, warn, a };
}
function renderResult() {
  const r = evaluate();
  const lv = (x, t, lo, hi) => t[x <= lo ? 0 : x <= hi ? 1 : 2];
  const capT = lv(r.cap, ['limitada: tu situación actual deja poco margen para asumir pérdidas', 'intermedia: tu situación permite asumir algo de riesgo', 'amplia: tu situación te permite asumir más riesgo'], 6, 9);
  const conT = lv(r.con, ['básicos', 'intermedios', 'avanzados'], 6, 9);
  const tolT = lv(r.tol, ['prefieres evitar las caídas aunque eso suponga renunciar a rentabilidad', 'aceptas algunas caídas a cambio de más rentabilidad', 'estás dispuesto a aceptar caídas importantes buscando crecimiento'], 8, 12);
  const lvl = (x, lo, hi) => x <= lo ? 'Baja' : x <= hi ? 'Media' : 'Alta';
  let porque = `Has sumado <strong>${r.tot} puntos de 40</strong>. Esa puntuación corresponde a un perfil <strong>${PROFILES[r.base]}</strong>: ${PROFILE_TXT[r.base]}`;
  porque += ` Por áreas, tu capacidad para asumir riesgo es ${capT}; tus conocimientos son ${conT}; y ${tolT}.`;
  let final = '';
  if (r.final < r.base) final = `Aun así, el resultado final es <strong>${PROFILES[r.final]}</strong> porque ${r.reasons.join(', y porque ')}. No es un juicio sobre ti: muchos test de riesgo aplican esta regla de prudencia, porque la capacidad de asumir pérdidas depende no solo de cuánto riesgo te resulta cómodo, sino también de tu situación. Si cambian tus circunstancias, puedes repetir el test.`;
  else final = `El resultado final coincide con esa puntuación: <strong>${PROFILES[r.final]}</strong>.`;
  const order = Object.keys(LV).sort((x, y) => LV[x] - LV[y] || Math.abs(T.byId(x).dd) - Math.abs(T.byId(y).dd));
  const card = id => { const s = T.byId(id);
    return `<li class="fit-card" style="--c:${s.color}"><div><strong><i style="background:${s.color}"></i>${T.label(id)}</strong> <span class="fit-tag">${s.profile}</span></div><p>${STRAT_WHY[id]}</p><p class="fit-dd">Mayor caída con dinero real: <b class="mono neg">${T.pct(s.dd)}</b> · <a href="${s.url}">Ver ficha</a></p></li>`; };
  quizEl.innerHTML = `<div class="q-result long">
    <div class="q-progress" aria-hidden="true"><div style="width:100%"></div></div>
    <span class="eyebrow">Tu tolerancia al riesgo</span>
    <h3 style="font-size:var(--fs-2xl);margin:.4rem 0 .2rem" id="qRes">Resultado: ${PROFILES[r.final]}</h3>
    <div class="q-areas">
      <div><span>Capacidad</span><b>${lvl(r.cap, 6, 9)}</b></div>
      <div><span>Conocimientos</span><b>${lvl(r.con, 6, 9)}</b></div>
      <div><span>Tolerancia</span><b>${lvl(r.tol, 8, 12)}</b></div>
    </div>
    <h4>Por qué sale este resultado</h4>
    <p>${porque}</p><p>${final}</p>
    ${r.warn.length ? `<div class="q-warn"><strong>A tener en cuenta</strong>${r.warn.map(w => `<p>${w}</p>`).join('')}</div>` : ''}
    <h4>Cómo se mide el riesgo de las seis estrategias</h4>
    <p>Para entender qué significa en la práctica cada nivel de riesgo, aquí tienes las seis estrategias que comparto, de menos a más riesgo, con la mayor caída que han tenido. <strong>No es una selección para ti</strong>: es la misma lista para todo el mundo, para que veas cómo se traduce el riesgo en caídas reales.</p>
    <ul class="fit-list">${order.map(card).join('')}</ul>
    <p class="q-hint">Qué hacer con tu dinero lo decides tú. Si tienes dudas sobre tu caso, lo adecuado es consultar a un asesor financiero autorizado. Para entender mejor el riesgo: <a href="${BASE}aprende/drawdowns-en-inversion-sin-saltarte-el-sistema/index.html">qué es una caída máxima</a> · <a href="${BASE}ejemplo-practico/index.html">ejemplo práctico</a>.</p>
    <div class="cta-row" style="margin-top:1.4rem">
      <a class="btn btn-primary" href="${BASE}comparador/index.html">Ver las seis frente a frente</a>
      <button type="button" class="btn btn-ghost" id="qRetry"><svg class="icon"><use href="#i-refresh"/></svg>Repetir test</button>
    </div>
    <p style="margin-top:1rem;font-size:var(--fs-sm)"><a class="more" href="${$('#suscripcion') ? '#suscripcion' : BASE + 'index.html#suscripcion'}" data-close>Quiero el informe gratis <svg class="icon"><use href="#i-arrow"/></svg></a></p>
    <p class="fineprint">Test educativo sobre tolerancia al riesgo, calculado en tu navegador (tus respuestas no se envían a ningún sitio). No evalúa si una estrategia o un producto es adecuado para ti: no es un test de idoneidad ni asesoramiento financiero. Las rentabilidades pasadas no garantizan rentabilidades futuras.</p>
  </div>`;
  $('#qRetry').addEventListener('click', () => { answers.fill(null); qi = 0; renderQuiz(); $('.q-opt', quizEl).focus(); });
  const h = $('h3', quizEl); h.setAttribute('tabindex', '-1'); h.focus();
}
T.openQuiz = function (trigger) {
  answers.fill(null); qi = 0; renderQuiz();
  T.openModal(quizModal, trigger, $('.q-opt', quizEl));
};
document.addEventListener('click', e => {
  const a = e.target.closest('[data-quiz]'); if (!a) return;
  e.preventDefault();
  const mm2 = $('#mobileMenu'); if (mm2) { mm2.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
  T.openQuiz(a);
});
/* Cierra la ventana al pulsar un enlace interno de la misma página (p. ej. #suscripcion) */
quizModal.addEventListener('click', e => {
  const a = e.target.closest('a[href]'); if (!a) return;
  const h = a.getAttribute('href');
  if (h.startsWith('#')) T.closeModal(quizModal);
});

/* ---------- 10. FAQ (acordeón) ---------- */
T.renderFaq = function (el, list) {
  el.innerHTML = list.map((f, i) => `<div class="qa reveal"><h3><button type="button" aria-expanded="false" aria-controls="fa${i}" id="fq${i}">${f[0]}<svg class="icon"><use href="#i-plus"/></svg></button></h3><div class="ans" id="fa${i}" role="region" aria-labelledby="fq${i}"><div><p>${f[1]}</p></div></div></div>`).join('');
  $$('.qa button', el).forEach(b => b.addEventListener('click', () => { const o = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', o); b.closest('.qa').classList.toggle('open', o); }));
};

/* ---------- 11. FORMULARIO DE SUSCRIPCIÓN: ahora es el formulario embebido de Brevo (iframe en index.html) ---------- */

/* ---------- 12. COOKIES ----------
   V39: la web no usa cookies de analítica ni de publicidad, así que no hay aviso de cookies.
   Solo guarda en el navegador el tema claro/oscuro que elige el visitante (localStorage).
   Si algún día se añade analítica con cookies, habrá que volver a poner un aviso con consentimiento. */
try { localStorage.removeItem('tai-cookies'); } catch (e) {}

/* ---------- 12b. MEDICIÓN DE CLICS (GoatCounter, sin cookies) ----------
   Cuenta como «eventos» los clics en los botones que importan. Se ven en el panel de GoatCounter.
   suscribirse/página/lugar = botones «Quiero el informe»; ver-informes/página/lugar = enlaces a la página de informes;
   pdf/AAAA-MM-abrir|descargar = informes en PDF; puerta/… = «Soy nuevo» / «Ya invierto»; siguiente/… = 2.º botón de los artículos. */
function gcPage() {
  const parts = location.pathname.split('/').filter(Boolean);
  if (parts.length && /\.html$/.test(parts[parts.length - 1])) parts.pop();
  const d = document.documentElement.getAttribute('data-base') || '';
  const depth = (d.match(/\.\.\//g) || []).length;          // en local (file://) quita las carpetas de más
  return depth ? (parts.slice(-depth).join('-') || 'inicio') : 'inicio';
}
function gcPlace(a) {
  if (a.closest('footer')) return 'pie';
  if (a.closest('.site-nav, header')) return 'menu';
  if (a.closest('#stickyCta')) return 'boton-fijo';
  if (a.closest('.cta-band')) return 'articulo';
  const s = a.closest('section[id]'); if (s) return s.id;
  if (a.closest('.hero, .page-hero, .strat-hero')) return 'cabecera';
  return 'texto';
}
document.addEventListener('click', e => {
  const a = e.target.closest('a'); if (!a) return;
  const href = a.getAttribute('href') || ''; let ev = null;
  const pg = gcPage();
  if (href.includes('#suscripcion')) ev = 'suscribirse/' + pg + '/' + gcPlace(a);
  else if (/\.pdf$/i.test(href)) { const m = href.match(/(\d{4}-\d{2})\.pdf$/i); ev = 'pdf/' + (m ? m[1] : 'informe') + (a.hasAttribute('download') ? '-descargar' : '-abrir'); }
  else if (a.classList.contains('door')) ev = 'puerta/' + (href.includes('empieza-aqui') ? 'soy-nuevo' : 'ya-invierto');
  else if (/informes\/(index\.html)?$/.test(href)) ev = 'ver-informes/' + pg + '/' + gcPlace(a);
  else if (a.closest('.cta-band') && a.classList.contains('btn-ghost')) ev = 'siguiente/' + pg;
  if (!ev) return;
  try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: ev, title: a.textContent.trim().slice(0, 60), event: true }); } catch (err) {}
});

/* ---------- 12c. CUENTA ATRÁS HASTA EL PRÓXIMO INFORME ----------
   El informe sale el día 1 de cada mes; se toma las 9:00 de Madrid como referencia. Solo días y horas (sin segundos:
   no queremos meter prisa a nadie). [data-countdown] = frase completa; [data-countdown-short] = texto del botón fijo. */
(function () {
  const els = $$('[data-countdown]'), shorts = $$('[data-countdown-short]');
  if (!els.length && !shorts.length) return;
  const MES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const parts = d => { const o = {}; new Intl.DateTimeFormat('en-GB', {timeZone: 'Europe/Madrid', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'})
    .formatToParts(d).forEach(p => { if (p.type !== 'literal') o[p.type] = +p.value; }); return o; };
  const madridUTC = (y, m, d, h) => {          // instante UTC de una hora de Madrid (con su horario de verano o invierno)
    let t = Date.UTC(y, m - 1, d, h);
    for (let i = 0; i < 2; i++) { const p = parts(new Date(t)); t -= (Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - Date.UTC(y, m - 1, d, h)); }
    return t;
  };
  function tick() {
    const now = Date.now(), p = parts(new Date(now));
    let y = p.year, m = p.month;
    let target = madridUTC(y, m, 1, 9);
    if (target <= now) { m++; if (m > 12) { m = 1; y++; } target = madridUTC(y, m, 1, 9); }
    const h = Math.max(0, Math.floor((target - now) / 3600000)), d = Math.floor(h / 24), hh = h % 24;
    const falta = d > 0 ? `${d} ${d === 1 ? 'día' : 'días'}${hh ? ` y ${hh} ${hh === 1 ? 'hora' : 'horas'}` : ''}` : `${hh} ${hh === 1 ? 'hora' : 'horas'}`;
    els.forEach(e => { e.hidden = false; e.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#i-clock"/></svg><span>El próximo informe sale el <strong>1 de ${MES[m - 1]}</strong> · faltan ${falta}</span>`; });
    shorts.forEach(e => { e.textContent = `Próximo informe: 1 de ${MES[m - 1]}`; });
  }
  tick(); setInterval(tick, 60000);
})();

/* ---------- 13. INICIO ---------- */
document.addEventListener('DOMContentLoaded', () => {
  T.observeReveal();
  if (location.hash === '#test') setTimeout(() => T.openQuiz(), 250);   // enlace directo al test desde otras páginas
});
if (document.readyState !== 'loading') { T.observeReveal(); }

/* ---------- MÓVIL: secciones de consulta plegadas (historial, señales, resultados, entornos) ---------- */
T.mobileCollapse = function () {
  if (!matchMedia('(max-width:600px)').matches) return;
  ['historial', 'senales', 'resultados', 'entorno'].forEach(id => {
    const s = document.getElementById(id); if (!s || s.dataset.mc) return;
    const c = s.querySelector('.container'); if (!c) return;
    const head = c.querySelector(':scope > .sec-head');
    const rest = [...c.children].filter(x => x !== head); if (!rest.length) return;
    const w = document.createElement('div'); w.className = 'm-collapse'; w.id = id + '-mc';
    rest.forEach(x => w.appendChild(x)); c.appendChild(w);
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn btn-ghost btn-sm m-more';
    b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', w.id); b.textContent = 'Ver todo';
    b.addEventListener('click', () => { const o = w.classList.toggle('open'); b.setAttribute('aria-expanded', o); b.textContent = o ? 'Ver menos' : 'Ver todo'; if (!o) s.scrollIntoView({block: 'start'}); window.dispatchEvent(new Event('resize')); });
    c.appendChild(b); s.dataset.mc = '1';
  });
};
if (document.readyState === 'complete') T.mobileCollapse(); else window.addEventListener('load', T.mobileCollapse);
})();
