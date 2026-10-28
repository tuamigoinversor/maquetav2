#!/usr/bin/env python3
"""Ejecutar UNA VEZ antes de lanzar (desde la raíz del sitio): python3 tools/prelaunch.py
Quita noindex, añade canonical + og:url, crea sitemap.xml y reescribe robots.txt.
Cambia DOMINIO si el dominio final es otro. Haz copia de seguridad antes."""
import os, re, glob
DOMINIO = 'https://tuamigoinversor.com'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
urls = []
for f in sorted(glob.glob('**/index.html', recursive=True)):
    t = open(f, encoding='utf-8').read()
    ruta = '/' + f[:-len('index.html')]
    url = DOMINIO + ruta
    if 'http-equiv="refresh"' in t:   # páginas de redirección: nunca indexar
        t = t if 'noindex' in t else t.replace('</head>', '<meta name="robots" content="noindex, follow"></head>', 1)
        open(f, 'w', encoding='utf-8').write(t); continue
    t = re.sub(r'\s*<meta name="robots" content="noindex, nofollow">', '', t)
    t = re.sub(r'\s*<link rel="canonical"[^>]*>', '', t)
    t = re.sub(r'\s*<meta property="og:url"[^>]*>', '', t)
    t = t.replace('</title>', '</title>\n<link rel="canonical" href="%s">\n<meta property="og:url" content="%s">' % (url, url), 1)
    open(f, 'w', encoding='utf-8').write(t); urls.append(url)
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join('  <url><loc>%s</loc></url>\n' % u for u in urls) + '</urlset>\n'
open('sitemap.xml', 'w', encoding='utf-8').write(sm)
open('robots.txt', 'w', encoding='utf-8').write('User-agent: *\nAllow: /\nSitemap: %s/sitemap.xml\n' % DOMINIO)
print('Listo: %d páginas en sitemap.xml; noindex quitado.' % len(urls))
