#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Genera el blog a partir de los archivos de la carpeta articulos/:
  - aprende/<slug>/index.html   una página por artículo
  - blog/index.html             listado de todos los artículos
  - feed.xml                    RSS (útil para campañas automáticas de email)
  - index.html                  actualiza los 3 últimos artículos (entre <!-- BLOG:INICIO --> y <!-- BLOG:FIN -->)
Uso:  python tools/build_blog.py        (requiere:  pip install markdown pyyaml)
"""
import os, re, sys, glob, html, json, datetime
import yaml, markdown

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import chrome as C

SITE_URL = 'https://tuamigoinversor.com'     # dirección definitiva de la web
MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
ARROW = '<svg class="icon"><use href="#i-arrow"/></svg>'
esc = html.escape


def fdate(d):
    return '%d %s %d' % (d.day, MESES[d.month - 1], d.year)


def read_posts():
    posts = []
    for path in sorted(glob.glob(os.path.join(ROOT, 'articulos', '*.md'))):
        name = os.path.basename(path)
        if name.startswith('_'):
            continue
        raw = open(path, encoding='utf8').read()
        m = re.match(r'^---\n(.*?)\n---\n(.*)$', raw, re.S)
        if not m:
            print('AVISO: %s no tiene cabecera (---) y se ignora' % name); continue
        fm = yaml.safe_load(m.group(1)) or {}
        slug = re.sub(r'^\d{4}-\d{2}-\d{2}-', '', name[:-3])
        d = fm.get('fecha')
        if isinstance(d, str):
            d = datetime.date.fromisoformat(d)
        if d is None:
            d = datetime.date.fromisoformat(name[:10])
        if d > datetime.date.today():
            print('Programado (no se publica hasta %s): %s' % (d, name)); continue
        u = fm.get('actualizado')
        if isinstance(u, str): u = datetime.date.fromisoformat(u)
        posts.append(dict(slug=slug, title=str(fm.get('title', slug)), date=d, updated=u, cat=str(fm.get('categoria') or 'Aprende'),
                          summary=str(fm.get('resumen') or ''), image=str(fm.get('imagen') or ''), md=m.group(2),
                          next_text=str(fm.get('siguiente_texto') or ''), next_url=str(fm.get('siguiente_url') or '')))
    posts.sort(key=lambda p: p['date'], reverse=True)   # V38: orden por fecha de publicación (lo nuevo, siempre primero)
    return posts


def exists(rel):
    return os.path.exists(os.path.join(ROOT, rel.lstrip('/')))


def fix_html(h, base):
    """Reescribe imágenes y enlaces para que funcionen con rutas relativas."""
    def img(m):
        tag = m.group(0); src = re.search(r'src="([^"]+)"', tag).group(1)
        if src.startswith('/assets/'):
            if not exists(src):
                return ''                       # imagen aún no subida: no se muestra
            tag = tag.replace(src, base + src[1:])
        if 'alt=' not in tag: tag = tag.replace('<img', '<img alt=""', 1)
        return tag.replace('<img', '<img loading="lazy" decoding="async"', 1)
    h = re.sub(r'<img[^>]*>', img, h)
    h = re.sub(r'<figure class="imagen">\s*</figure>', '', h)
    h = re.sub(r'<figure class="imagen">\s*<figcaption>.*?</figcaption>\s*</figure>', '', h, flags=re.S)
    def link(m):
        u = m.group(1)
        if u.startswith('/') and not u.startswith('//'):
            p, _, frag = u.partition('#')
            if p.endswith('/'): p += 'index.html'
            return 'href="%s%s%s"' % (base, p.lstrip('/'), ('#' + frag) if frag else '')
        if u.startswith('http'):
            return 'href="%s" target="_blank" rel="noopener"' % u
        return m.group(0)
    h = re.sub(r'href="([^"]+)"', link, h)
    h = re.sub(r'<ul>((?:\s*<li>\s*(?:✔|✅|❌)\ufe0f?.*?</li>)+\s*)</ul>', r'<ul class="check-list">\1</ul>', h, flags=re.S)
    h = re.sub(r'(?<!<div class="table-wrap">)<table>', '<div class="table-wrap"><table>', h)
    return h.replace('</table>', '</table></div>')


def render_md(md, base):
    h = markdown.markdown(md, extensions=['extra', 'sane_lists'])
    return fix_html(h, base)


def card(p, base, i):
    if p['image'] and exists(p['image']):
        media = '<div class="post-media"><img src="%s%s" width="1200" height="800" loading="lazy" decoding="async" alt=""></div>' % (base, p['image'])
    else:
        media = '<div class="post-media post-media--empty" aria-hidden="true"></div>'   # sin imagen: hueco en blanco para rellenar despues
    return '''<article class="post reveal" data-cat="%(cat)s">
  %(media)s
  <div class="post-body"><small>%(cat)s · %(date)s</small><h3><a href="%(base)saprende/%(slug)s/index.html">%(title)s</a></h3><p>%(summary)s</p><a class="more" href="%(base)saprende/%(slug)s/index.html">Leer artículo %(arrow)s<span class="sr-only">: %(title)s</span></a></div>
</article>''' % dict(cat=esc(p['cat']), media=media, base=base, date=fdate(p['date']) + (' · actualizado el ' + fdate(p['updated']) if p['updated'] else ''), slug=p['slug'], title=esc(p['title']), summary=esc(p['summary']), arrow=ARROW)


def write(rel, content):
    full = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, 'w', encoding='utf8').write(content)


def site_url(base, url):
    """Ruta de la web («/informes/», «/index.html#test») -> ruta relativa a la página."""
    u = url.lstrip('/')
    path, _, frag = u.partition('#')
    if path == '' or path.endswith('/'):
        path += 'index.html'
    return base + path + ('#' + frag if frag else '')


def cta_band(base, p=None):
    nxt = ''
    if p and p.get('next_text') and p.get('next_url'):   # V39: siguiente paso propio de cada artículo
        nxt = '<a href="%s" class="btn btn-ghost">%s</a>' % (site_url(base, p['next_url']), esc(p['next_text']))
    return '''<div class="cta-band reveal" style="margin-top:2.5rem"><div><h2>¿Quieres ver las estrategias en directo?</h2><p>Cada día 1 te mando por correo qué tengo en cada estrategia y qué cambio. Lo lees y decides tú qué hacer con tu dinero. Gratis y sin compromiso.</p></div>
<div class="cta-row"><a href="%sindex.html#suscripcion" class="btn btn-primary magnetic">Quiero el informe gratis %s</a>%s</div></div>''' % (base, ARROW, nxt)


def build_post(p, posts):
    base = '../../'
    body = render_md(p['md'], base)
    words = len(re.sub(r'<[^>]+>', ' ', body).split()); mins = max(1, round(words / 200))
    img = ''
    if p['image'] and exists(p['image']):
        img = '<figure class="post-cover"><img src="%s%s" alt="" width="1200" height="800" decoding="async"></figure>' % (base, p['image'])
    more = [q for q in posts if q['slug'] != p['slug']][:3]
    more_html = '<section class="section alt tight" aria-labelledby="seguir-t"><div class="container"><h2 id="seguir-t" class="small-h reveal">Sigue leyendo</h2><div class="blog">%s</div></div></section>' % ''.join(card(q, base, i) for i, q in enumerate(more)) if more else ''
    ld = json.dumps({'@context': 'https://schema.org', '@type': 'Article', 'headline': p['title'], 'datePublished': p['date'].isoformat(), 'dateModified': (p['updated'] or p['date']).isoformat(),
                     'author': {'@type': 'Person', 'name': 'José Manuel García'}, 'description': p['summary'],
                     'mainEntityOfPage': '%s/aprende/%s/' % (SITE_URL, p['slug'])}, ensure_ascii=False)
    page = (C.head('%s | Tu Amigo Inversor' % p['title'], p['summary'], base, ['tai.js'], og_title=p['title'], ld='<script type="application/ld+json">%s</script>' % ld)
            + C.body_open(base, False, 'blog') + '''
<main id="main" tabindex="-1">
<section class="page-hero" aria-labelledby="page-title"><div class="container narrow">
  <nav class="crumbs" aria-label="Migas de pan"><a href="%(b)sindex.html">Inicio</a><span aria-hidden="true">/</span><a href="%(b)sblog/index.html">Blog</a><span aria-hidden="true">/</span><span aria-current="page">%(cat)s</span></nav>
  <span class="eyebrow">%(cat)s</span>
  <h1 id="page-title">%(title)s</h1>
  <p class="post-meta">Por José Manuel García · <time datetime="%(iso)s">%(date)s</time>%(upd)s · %(mins)d min de lectura</p>
</div></section>
<article class="page-body"><div class="container narrow">%(img)s
<div class="post-content prose">%(body)s</div>
<div class="disclaimer-bar" role="note"><svg class="icon"><use href="#i-alert"/></svg><p><strong>Importante:</strong> este artículo es informativo y no constituye asesoramiento financiero. Las rentabilidades pasadas no garantizan rentabilidades futuras.</p></div>
%(cta)s
</div></article>
%(more)s
</main>
''' % dict(b=base, cat=esc(p['cat']), title=esc(p['title']), iso=p['date'].isoformat(), date=fdate(p['date']), upd=(' · Actualizado el <time datetime="%s">%s</time>' % (p['updated'].isoformat(), fdate(p['updated']))) if p['updated'] else '', mins=mins, img=img, body=body, cta=cta_band(base, p), more=more_html)
            + C.footer_and_floating(base, False))
    write('aprende/%s/index.html' % p['slug'], page)


def build_index(posts):
    base = '../'
    cats = sorted({p['cat'] for p in posts})
    chips = '<div class="filters reveal" role="group" aria-label="Filtrar por tema"><button class="chip" type="button" aria-pressed="true" data-f="all">Todos</button>%s</div>' % ''.join(
        '<button class="chip" type="button" aria-pressed="false" data-f="%s">%s</button>' % (esc(c), esc(c)) for c in cats)
    script = '''<script>
document.querySelectorAll('.filters .chip').forEach(function(b){b.addEventListener('click',function(){
  document.querySelectorAll('.filters .chip').forEach(function(x){x.setAttribute('aria-pressed','false')});b.setAttribute('aria-pressed','true');
  document.querySelectorAll('.post').forEach(function(p){p.hidden=!(b.dataset.f==='all'||p.dataset.cat===b.dataset.f)});});});
</script>'''
    page = (C.head('Blog de inversión | Tu Amigo Inversor', 'Artículos sobre inversión sistemática, gestión del riesgo y funcionamiento de los mercados para comprender mejor las estrategias y mantener una visión realista de sus resultados.', base, ['tai.js'], og_title='Blog de inversión · Tu Amigo Inversor')
            + C.body_open(base, False, 'blog') + '''
<main id="main" tabindex="-1">
<section class="page-hero" aria-labelledby="page-title"><div class="container">
  <nav class="crumbs" aria-label="Migas de pan"><a href="../index.html">Inicio</a><span aria-hidden="true">/</span><span aria-current="page">Blog</span></nav>
  <span class="eyebrow">Blog</span>
  <h1 id="page-title">Aprende a entender y aplicar las estrategias de inversión</h1>
  <p class="lead">Artículos sobre inversión sistemática, gestión del riesgo y funcionamiento de los mercados para comprender mejor las estrategias y mantener una visión realista de sus resultados.</p>
</div></section>
<section class="page-body" aria-labelledby="art-t"><div class="container">
<h2 id="art-t" class="sr-only">Artículos</h2>
%s
<div class="blog">%s</div>
</div></section>
</main>
''' % (chips if len(cats) > 1 else '', ''.join(card(p, base, i) for i, p in enumerate(posts)))
            + C.footer_and_floating(base, False).replace('</body>', script + '\n</body>'))
    write('blog/index.html', page)


def update_home(posts):
    path = os.path.join(ROOT, 'index.html'); h = open(path, encoding='utf8').read()
    a, b = h.find('<!-- BLOG:INICIO -->'), h.find('<!-- BLOG:FIN -->')
    if a < 0 or b < 0:
        return  # sin marcas BLOG:INICIO/FIN en la home: no se muestran artículos
    block = '<!-- BLOG:INICIO -->\n    <div class="blog blog-home">\n' + '\n'.join(card(p, '', i) for i, p in enumerate(posts[:3])) + '\n    </div>\n    '
    open(path, 'w', encoding='utf8').write(h[:a] + block + h[b:])


def build_feed(posts):
    items = ''.join('<item><title>%s</title><link>%s/aprende/%s/</link><guid>%s/aprende/%s/</guid><pubDate>%s</pubDate><description>%s</description></item>' % (
        esc(p['title']), SITE_URL, p['slug'], SITE_URL, p['slug'], p['date'].strftime('%a, %d %b %Y 08:00:00 +0000'), esc(p['summary'])) for p in posts[:20])
    write('feed.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Tu Amigo Inversor</title><link>%s/blog/</link><description>Artículos de inversión con método</description><language>es</language>%s</channel></rss>\n' % (SITE_URL, items))


if __name__ == '__main__':
    posts = read_posts()
    for p in posts: build_post(p, posts)
    build_index(posts); update_home(posts); build_feed(posts)
    nimg = sum(1 for p in posts if p['image'] and exists(p['image']))
    print('Blog generado: %d artículos (%d con imagen destacada).' % (len(posts), nimg))
