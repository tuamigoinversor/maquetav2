# -*- coding: utf-8 -*-
"""Cabecera, pie y <head> comunes (usado por build_fichas.py)."""
import os
SPRITE = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sprite.txt'), encoding='utf8').read()
SOBRE_MI = 'https://tuamigoinversor.com/sobre-mi/'


def head(title, desc, base, scripts, og_title=None, ld=''):
    scripts_html = '\n'.join('<script defer src="%sassets/js/%s"></script>' % (base, s) for s in scripts)
    return '''<!DOCTYPE html>
<html lang="es" data-theme="dark" data-base="%(base)s">
<head>
<meta charset="UTF-8">
<meta name="robots" content="noindex, nofollow">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>%(title)s</title>
<meta name="description" content="%(desc)s">
<meta name="theme-color" content="#0a0f1e" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">

<!-- Open Graph / Twitter -->
<meta property="og:type" content="website">
<meta property="og:locale" content="es_ES">
<meta property="og:site_name" content="Tu Amigo Inversor">
<meta property="og:title" content="%(og)s">
<meta property="og:description" content="%(desc)s">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="%(og)s">
<meta name="twitter:description" content="%(desc)s">
<meta property="og:image" content="https://tuamigoinversor.com/assets/img/og-tuamigoinversor.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:image" content="https://tuamigoinversor.com/assets/img/og-tuamigoinversor.jpg">

<!-- Tema sin parpadeo: se aplica antes de pintar -->
<script>
(function(){try{var t=localStorage.getItem('tai-theme-v3');if(!t){t='light'}document.documentElement.setAttribute('data-theme',t)}catch(e){}})();
</script>

<link rel="stylesheet" href="%(base)sassets/css/fonts.css">
<link rel="stylesheet" href="%(base)sassets/css/site.css">
<link rel="icon" href="%(base)sassets/img/logo-tai.jpg" type="image/jpeg">
<link rel="apple-touch-icon" href="%(base)sassets/img/logo-tai.jpg">

<!-- Única librería externa: Chart.js (diferida) -->
<script defer src="%(base)sassets/js/chart.umd.js"></script>
%(scripts)s
%(ld)s
<!-- Analítica sin cookies (GoatCounter) -->
<script data-goatcounter="https://tuamigoinversor.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>
</head>
''' % dict(base=base, title=title, desc=desc, og=og_title or title, scripts=scripts_html, ld=ld)


def nav_links(base, home, current, mobile=False):
    """Menú: Estrategias ▾ · Cómo funciona ▾ · Informes · Blog · Sobre mí (en móvil, lista plana)."""
    def a(anchor):
        return ('#%s' % anchor) if home else ('%sindex.html#%s' % (base, anchor))
    P = lambda p: base + p + '/index.html'
    estr = [('estrategias', a('estrategias'), 'Las seis estrategias', ''), ('comparador', P('comparador'), 'Compáralas frente a frente', ''),
            ('test', a('test'), 'Test de riesgo (3 min)', ' data-quiz'), ('combinar', P('combinar-estrategias'), 'Combinar estrategias', '')]
    como = [('guia', P('empieza-aqui'), 'Explicado desde cero', ''), ('ejemplo', P('ejemplo-practico'), 'Un ejemplo práctico, paso a paso', ''),
            ('metodologia', P('metodologia'), 'Metodología y cálculos', ''), ('glosario', P('glosario'), 'Glosario', '')]
    tail = [('informes', P('informes'), 'Informes', ''), ('blog', P('blog'), 'Blog', ''), ('sobre-mi', P('sobre-mi'), 'Sobre mí', '')]
    def li(it):
        key, href, label, extra = it
        cur = ' aria-current="page"' if key == current else ''
        return '      <li><a href="%s"%s%s>%s</a></li>' % (href, extra, cur, label)
    def drop(label, items):
        has_cur = any(i[0] == current for i in items)
        subs = '\n'.join('          ' + li(i).strip() for i in items)
        return '      <li class="has-sub%s"><button type="button" class="sub-toggle" aria-expanded="false" aria-haspopup="true">%s <svg class="icon" aria-hidden="true"><use href="#i-down"/></svg></button>\n        <ul class="sub">\n%s\n        </ul></li>' % (' cur' if has_cur else '', label, subs)
    if mobile:
        out = [li(i) for i in estr] + [li(i) for i in como] + [li(i) for i in tail]
    else:
        out = [drop('Estrategias', estr), drop('Cómo funciona', como)] + [li(i) for i in tail]
    return '\n'.join(out)


def body_open(base, home, current):
    sub = '#suscripcion' if home else base + 'index.html#suscripcion'
    logo = '#main' if home else base + 'index.html'
    links = nav_links(base, home, current)
    links_m = nav_links(base, home, current, mobile=True)
    return '''<body>
<a class="skip" href="#main">Saltar al contenido</a>
<div class="progress" id="progress" aria-hidden="true"></div>

<!-- SVG sprite (iconos estilo Lucide) -->
%(sprite)s

<!-- =========================== CABECERA =========================== -->
<header class="site-header" id="header">
  <nav class="container nav" aria-label="Navegación principal">
    <a href="%(logo)s" class="logo" aria-label="Tu Amigo Inversor, inicio"><img class="logo-mark" src="%(base)sassets/img/logo-tai.jpg" width="40" height="40" alt="">Tu Amigo Inversor</a>
    <ul class="nav-links">
%(links)s
    </ul>
    <div class="nav-actions">
      <button class="icon-btn" id="themeToggle" type="button" aria-label="Cambiar a modo claro">
        <svg class="icon i-sun"><use href="#i-sun"/></svg><svg class="icon i-moon"><use href="#i-moon"/></svg>
      </button>
      <a href="%(sub)s" class="btn btn-primary btn-sm nav-cta magnetic">Quiero el informe</a>
      <button class="icon-btn burger" id="burger" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="mobileMenu"><svg class="icon"><use href="#i-menu"/></svg></button>
    </div>
  </nav>
  <div class="mobile-menu" id="mobileMenu">
    <ul>
%(links_m)s
      <li><a href="%(sub)s" class="btn btn-primary" style="margin-top:.5rem">Quiero el informe gratis</a></li>
    </ul>
  </div>
</header>
''' % dict(sprite=SPRITE, logo=logo, links=links, links_m=links_m, sub=sub, base=base)


def footer_and_floating(base, home):
    sub = '#suscripcion' if home else base + 'index.html#suscripcion'
    test = '#test' if home else base + 'index.html#test'
    return '''
<!-- =========================== PIE =========================== -->
<footer class="site-footer">
  <div class="container">
    <div class="foot-grid">
      <div>
        <a href="%(logo)s" class="logo" style="margin-bottom:1rem"><img class="logo-mark" src="%(base)sassets/img/logo-tai.jpg" width="40" height="40" alt="">Tu Amigo Inversor</a>
        <p>Te cuento cada mes qué hago con mi dinero: estrategias con reglas claras, sin corazonadas. Lo que hagas con tu dinero lo decides tú.</p>
        <p style="margin-top:.8rem"><a href="mailto:info@tuamigoinversor.com">info@tuamigoinversor.com</a></p>
      </div>
      <nav aria-label="Carteras permanentes"><h2>Cartera permanente</h2><ul><li><a href="%(base)scartera-permanente-conservadora-roca/index.html">ROCA</a></li><li><a href="%(base)scartera-inversion-crecimiento-impulso/index.html">IMPULSO</a></li></ul></nav>
      <nav aria-label="Asignación táctica"><h2>Asignación táctica</h2><ul><li><a href="%(base)sinversion-tactica-geda/index.html">GEDA</a></li><li><a href="%(base)sinversion-tematica-gen-z/index.html">GEN-Z</a></li><li><a href="%(base)sinversion-criptomonedas-crypto/index.html">CRYPTO</a></li><li><a href="%(base)splan-pensiones-moderado-horizonte/index.html">HORIZONTE <small class="pp">plan de pensiones</small></a></li></ul></nav>
      <nav aria-label="Herramientas y proyecto"><h2>Empieza por aquí</h2><ul><li><a href="%(base)sempieza-aqui/index.html">Explicado desde cero</a></li><li><a href="%(base)sejemplo-practico/index.html">Ejemplo práctico</a></li><li><a href="%(base)scomparador/index.html">Comparador</a></li><li><a href="%(test)s" data-quiz>Test de riesgo</a></li><li><a href="%(base)scombinar-estrategias/index.html">Combinar estrategias</a></li><li><a href="%(base)sinformes/index.html">Informes</a></li><li><a href="%(base)smetodologia/index.html">Metodología</a></li><li><a href="%(base)sglosario/index.html">Glosario</a></li><li><a href="%(base)sblog/index.html">Blog</a></li><li><a href="%(base)ssobre-mi/index.html">Sobre mí</a></li></ul></nav>
      <nav aria-label="Legal"><h2>Legal</h2><ul><li><a href="%(base)saviso-legal/index.html">Aviso legal</a></li><li><a href="%(base)sprivacidad/index.html">Política de privacidad</a></li><li><a href="%(base)srecomendaciones/index.html">Cómo elaboro los informes</a></li></ul></nav>
    </div>
    <div class="legal">
      <p><strong>Aviso:</strong> la información publicada en esta web tiene carácter meramente informativo y no constituye asesoramiento financiero ni una recomendación personalizada de inversión. Las inversiones conllevan riesgo y pueden implicar la pérdida total o parcial del capital. Las rentabilidades pasadas no garantizan rentabilidades futuras. Cada inversor debe realizar su propio análisis y tomar decisiones en función de su situación personal.</p>
      <p style="margin-top:.8rem">© 2026 Tu Amigo Inversor.</p>
    </div>
  </div>
</footer>

<!-- Test de riesgo (ventana emergente) -->
<div class="modal" id="quizModal" aria-hidden="true">
  <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="quizTitle">
    <button class="icon-btn modal-close" type="button" aria-label="Cerrar test"><svg class="icon"><use href="#i-x"/></svg></button>
    <div class="modal-content">
      <span class="eyebrow">Test de riesgo</span>
      <h2 id="quizTitle" style="font-size:var(--fs-xl);margin:.3rem 0 .4rem">¿Cuánto riesgo toleras?</h2>
      <p style="color:var(--muted);margin-bottom:1.4rem">Diez preguntas, unos 3 minutos. Te explico tu tolerancia al riesgo y qué significa en caídas reales.</p>
      <div class="quiz" id="quiz" aria-live="polite"></div>
    </div>
  </div>
</div>
<button class="icon-btn to-top" id="toTop" type="button" aria-label="Volver arriba"><svg class="icon"><use href="#i-up"/></svg></button>
<div class="sticky-cta" id="stickyCta"><small><strong>Gratis</strong><br><span data-countdown-short>El informe del día 1 en tu correo</span></small><a href="%(sub)s" class="btn btn-primary btn-sm">Quiero el informe</a></div>
</body>
</html>
''' % dict(base=base, logo=('#main' if home else base + 'index.html'), test=test, sub=sub, sobre=SOBRE_MI)
