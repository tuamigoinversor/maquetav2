/* =========================================================
   HOME · tarjetas de estrategias, FAQ y formulario
   ========================================================= */
(function () {
'use strict';
const T = window.TAI, { $, $$, STRATEGIES, pct, cls } = T;

/* ---------- 1. TARJETAS DE ESTRATEGIA ---------- */
const cardsEl = $('#cards');
const f1 = v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(1).replace('.', ',') + '%';
const dur = m => { const a = Math.floor(m / 12), b = m % 12; return a + (a === 1 ? ' año' : ' años') + (b ? ' y ' + b + (b === 1 ? ' mes' : ' meses') : ''); };
const GROUP = { tranquila: 'Tranquila', equilibrada: 'Equilibrada', atrevida: 'Atrevida' };
cardsEl.innerHTML = STRATEGIES.map(s => `
<article class="s-card spot reveal" data-group="${s.group}" style="--c:${s.color}" aria-labelledby="t-${s.slug}">
  <div class="s-media">
    <span class="s-pill"><i></i>${s.type === 'permanente' ? 'Se revisa 2 veces al año' : 'Rota cada mes'}</span>
    <img src="${s.img.src}" width="600" height="450" loading="lazy" decoding="async" alt="${s.alt}">
  </div>
  <div class="s-body">
    <span class="s-profile">${GROUP[s.group]} · ${s.profile.toLowerCase()}</span>
    <h3 id="t-${s.slug}"><a class="s-link" href="${s.url}">${s.id}</a>${s.note ? ` <span class="pp">${s.note.toLowerCase()}</span>` : ''}</h3>
    <p>${s.desc}</p>
    <div class="risk"><span>Riesgo</span><div class="risk-bars" role="img" aria-label="Nivel de riesgo ${s.risk} de 5">${[1,2,3,4,5].map(i => `<i class="${i <= s.risk ? 'on' : ''}"></i>`).join('')}</div><span class="mono">${s.risk}/5</span></div>
    <div class="metrics">
      ${s.short
        ? `<div class="metric"><span>Acumulado con dinero real</span><b class="mono ${cls(s.realCum)}">${f1(s.realCum)}</b><small class="m-since">desde ${s.realFrom}</small></div>`
        : `<div class="metric"><span>Rentabilidad anualizada</span><b class="mono ${cls(s.realAvg)}">${f1(s.realAvg)}</b><small class="m-since">con dinero real desde ${s.realFrom}</small></div>`}
      <div class="metric"><span>Peor caída</span><b class="mono neg">${f1(s.dd)}</b><small class="m-since">con dinero real</small></div>
      <div class="metric"><span>2025</span><b class="mono ${cls(s.y25)}">${f1(s.y25)}</b></div>
      <div class="metric"><span>2026 (ene–sep)</span><b class="mono ${cls(s.y26)}">${f1(s.y26)}</b></div>
    </div>
    ${s.short ? `<p class="s-sim">Historial corto con dinero real (${dur(s.realMonths)}): por eso muestro el acumulado y no una media anual, que dependería de uno o dos años excepcionales.</p>` : ''}
    <div class="s-actions">
      <a class="btn btn-primary btn-sm" href="${s.url}">Ver la estrategia <svg class="icon"><use href="#i-arrow"/></svg><span class="sr-only"> ${s.id}</span></a>
    </div>
  </div>
</article>`).join('');

$$('.filters .chip').forEach(b => b.addEventListener('click', () => {
  $$('.filters .chip').forEach(x => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true');
  $$('.s-card').forEach(c => c.hidden = !(b.dataset.filter === 'all' || c.dataset.group === b.dataset.filter));
}));

/* ---------- 3. FAQ ---------- */
T.renderFaq($('#faqList'), [
  ["¿Qué recibo exactamente?", "Un correo el día 1 de cada mes con tres cosas: qué ha pasado en los mercados, cómo le ha ido a cada una de las seis estrategias y qué posiciones cambian. En la página de <a href=\"informes/index.html\">informes</a> tienes ejemplos de meses anteriores. Las fichas, la metodología y las herramientas de la web son libres."],
  ["¿Por qué suscribirme si hay informes en la web?", "Porque en la web solo publico informes de ejemplo de meses anteriores y actualizo los datos cada trimestre. Las posiciones de cada mes, con lo que entra y lo que sale, solo te llegan por correo el día 1."],
  ["¿Cuánto cuesta?", "Ahora mismo, nada. Seguirá siendo gratis hasta que te avise, con 3 meses de antelación, del paso a un modelo de pago, con nuevos contenidos y novedades que estoy preparando. La cuota prevista es de 5 € al mes (30 € el semestre o 50 € al año, unos 4,17 € al mes). Nunca habrá un cobro automático: para el servicio de pago tendrás que darte de alta tú."],
  ["¿Con cuánto dinero puedo empezar?", "No hay un mínimo. Depende de cuántas posiciones tenga la estrategia y de lo que cobre tu bróker: ROCA tiene 6 fondos o ETF; IMPULSO, 3; HORIZONTE, 1 plan de pensiones; GEDA, 7; GEN-Z, 4 acciones, y CRYPTO, 5 criptomonedas. Con poco dinero, las comisiones fijas pesan más. En el <a href=\"ejemplo-practico/index.html\">ejemplo práctico</a> verás un reparto concreto."],
  ["¿Tengo que operar todos los meses?", "No necesariamente. GEDA, GEN-Z, CRYPTO y HORIZONTE (un plan de pensiones) se revisan cada mes y pueden cambiar algo; ROCA e IMPULSO, dos veces al año. Si no hay cambios, el informe te lo dice y no haces nada. Leerlo te lleva unos minutos."],
  ["Ya tengo fondos indexados, ¿para qué me sirve esto?", "No tienes que cambiar tu cartera. Puedes empezar solo leyendo los informes para ver cómo se comportan las estrategias mes a mes. Si algún día decides incorporar alguna, piensa en ella como una pieza más: lo que importa es el riesgo del conjunto y cuánto pesa cada parte. En <a href=\"combinar-estrategias/index.html\">Combinar estrategias</a> puedes ver cómo cambia la caída máxima al mezclar. No es una recomendación: cada caso depende de tu situación."],
  ["¿Puedo empezar a mitad de mes o después de una caída?", "Sí, cuando quieras, tomando como referencia las posiciones del último informe. Como nadie sabe cuál es el mejor momento, una opción es entrar poco a poco, en varias veces. Lo explico en el artículo «Cómo incorporarte a una estrategia sin que el mal momento te arruine la entrada», en el <a href=\"blog/index.html\">blog</a>."],
  ["¿Las rentabilidades son reales?", "Sí. Todas las cifras de la web son con dinero real, lo que he hecho con mi dinero: ROCA desde 2017, IMPULSO desde 2018, HORIZONTE desde 2020, GEDA desde 2021, CRYPTO desde 2023 y GEN-Z desde 2024. Antes de empezar con cada una probé sus reglas con datos pasados (backtest), pero esos años no cuentan en ninguna cifra: solo los menciono como contexto en cada ficha."],
  ["¿Y los impuestos y las comisiones?", "Las rentabilidades publicadas no los incluyen. Vender con ganancias puede tributar, y los traspasos entre fondos o entre planes de pensiones funcionan distinto. Depende de tu caso: consulta fuentes actualizadas o a un profesional. En el blog explico cómo funciona cada tipo de bróker."],
  ["¿Puedo darme de baja?", "Sí, cuando quieras, con el enlace que va al final de cada correo. Sin permanencia y sin dar explicaciones."],
  ["¿Necesito experiencia?", "No hace falta ser experto, pero sí saber comprar y vender en tu bróker. Los términos técnicos (momentum, drawdown, rotación…) los explico en el <a href=\"glosario/index.html\">glosario</a>. Ojo: algunas estrategias llevan activos de mucho riesgo, como acciones sueltas o criptomonedas. Antes de seguir cualquiera, lee su ficha."],
  ["¿Para quién está pensado?", "Para inversores particulares en España: las cifras están en euros y lo que cuento de fiscalidad, brókers y planes de pensiones se refiere sobre todo al mercado español. Sirve tanto si empiezas de cero (empieza por la <a href=\"empieza-aqui/index.html\">guía</a>) como si ya inviertes y quieres un método con reglas."],
  ["¿Gestionas mi dinero?", "No. Tu dinero está siempre en tu bróker y las operaciones las haces tú. Yo solo cuento qué hago con el mío."],
  ["¿Es asesoramiento financiero?", "No. Explico cómo funcionan mis estrategias y cuento lo que hago con mi dinero: es la misma información para todos y no tiene en cuenta tu situación. No es una recomendación personalizada ni un servicio de asesoramiento. Qué hacer con tu dinero lo decides tú; si quieres una recomendación para tu caso, tiene que dártela una entidad o un asesor autorizado por la CNMV."], ["¿Puedo preguntarte qué hacer en mi caso?", "Puedes escribirme con dudas sobre cómo funcionan las estrategias, los informes o la web. Lo que no hago es responder sobre tu caso concreto (cuánto invertir, qué estrategia seguir o qué producto comprar): eso sería asesoramiento, y solo pueden prestarlo entidades o personas autorizadas."]
]);

})();
