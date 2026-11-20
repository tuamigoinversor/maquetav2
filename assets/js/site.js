/* Tu Amigo Inversor · v57 · menú, cabecera, filtro del blog y "volver arriba". Sin dependencias. */
(function () {
  var hdr = document.getElementById('header'), bar = document.getElementById('progress'), top = document.getElementById('toTop');
  function onScroll() {
    var y = window.scrollY || 0, h = document.documentElement.scrollHeight - innerHeight;
    if (hdr) hdr.classList.toggle('scrolled', y > 40);
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    if (top) top.classList.toggle('show', y > 900);
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (top) top.addEventListener('click', function () { scrollTo({ top: 0, behavior: 'smooth' }); });

  var burger = document.getElementById('burger'), mm = document.getElementById('mobileMenu');
  if (burger && mm) burger.addEventListener('click', function () {
    var o = mm.classList.toggle('open'); burger.setAttribute('aria-expanded', o);
  });

  var subs = document.querySelectorAll('.has-sub');
  subs.forEach(function (li) {
    var b = li.querySelector('.sub-toggle'), t = null;
    /* con ratón: se abre al pasar por encima y se cierra con un pequeño retardo al salir */
    li.addEventListener('mouseenter', function () {
      clearTimeout(t);
      subs.forEach(function (x) { if (x !== li) x.classList.remove('hover', 'open'); });
      li.classList.add('hover');
    });
    li.addEventListener('mouseleave', function () { t = setTimeout(function () { li.classList.remove('hover'); }, 350); });
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var o = !li.classList.contains('open');
      subs.forEach(function (x) { x.classList.remove('open'); x.querySelector('.sub-toggle').setAttribute('aria-expanded', 'false'); });
      li.classList.toggle('open', o); b.setAttribute('aria-expanded', o);
    });
  });
  document.addEventListener('click', function () { subs.forEach(function (x) { x.classList.remove('open'); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') subs.forEach(function (x) { x.classList.remove('open'); }); });

  /* Blog: filtro por tema. Sin JavaScript se ven todos los grupos. */
  var chips = document.querySelectorAll('.filters .chip');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.getAttribute('data-f');
      chips.forEach(function (x) { x.setAttribute('aria-pressed', x === c); });
      document.querySelectorAll('.blog-group').forEach(function (g) {
        g.hidden = !(f === 'all' || g.getAttribute('data-cat') === f);
      });
    });
  });
})();
