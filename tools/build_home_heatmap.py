# -*- coding: utf-8 -*-
"""Mapa de calor del año en la portada (bloque Resultados), a partir de assets/js/series.js.
Uso:  python tools/build_home_heatmap.py   (después de tools/build_series.py, en la actualización trimestral)"""
import os, re, json, math
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
MES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
COL = {'ROCA': '#0ea5e9', 'IMPULSO': '#10b981', 'HORIZONTE': '#7c3aed', 'GEDA': '#f59e00', 'GEN-Z': '#ec4899', 'CRYPTO': '#ef4444'}

def pct(x, s=True):
    return (('%+.2f' if s else '%.2f') % x).replace('-', '−').replace('.', ',') + '%'

def bg(x):
    a = min(abs(x) / 15.0, 1) * 0.55 + 0.1
    return 'rgba(16,185,129,%.2f)' % a if x >= 0 else 'rgba(239,68,68,%.2f)' % a

src = open(os.path.join(ROOT, 'assets', 'js', 'series.js'), encoding='utf-8').read()
S = json.loads(re.search(r'window\.TAI_SERIES\s*=\s*(\{.*\})\s*;?', src, re.S).group(1))
ends = []
for k, v in S.items():
    y, m = map(int, v['start'].split('-')); t = y * 12 + m - 1 + len(v['r']) - 1
    ends.append(t)
end = min(ends); Y, M = end // 12, end % 12 + 1
rows = []
for k in ['ROCA', 'IMPULSO', 'HORIZONTE', 'GEDA', 'GEN-Z', 'CRYPTO']:
    v = S[k]; y0, m0 = map(int, v['start'].split('-'))
    vals = [v['r'][(Y * 12 + i) - (y0 * 12 + m0 - 1)] for i in range(M)]
    # El acumulado del año no se calcula aquí (sumar meses redondeados da ±0,01): está en la tabla de arriba.
    tds = ''.join('<td style="background:%s">%s</td>' % (bg(x), pct(x, False)) for x in reversed(vals))   # del más reciente al más antiguo
    rows.append('<tr><th scope="row"><span class="sw" style="background:%s" aria-hidden="true"></span>%s</th>%s</tr>' % (COL[k], k, tds))
block = ('<!-- HEATMAP:INICIO -->\n      <div class="hm-wrap"><h3>%d, mes a mes</h3><div class="hm-scroll"><table class="hm-home"><caption class="sr-only">Rentabilidad mensual de cada estrategia en %d</caption>'
         '<thead><tr><th scope="col">Estrategia</th>%s</tr></thead><tbody>%s</tbody></table></div></div>\n      <!-- HEATMAP:FIN -->') % (
    Y, Y, ''.join('<th scope="col">%s</th>' % MES[i] for i in reversed(range(M))), ''.join(rows))
p = os.path.join(ROOT, 'index.html'); h = open(p, encoding='utf-8').read()
a, b = h.find('<!-- HEATMAP:INICIO -->'), h.find('<!-- HEATMAP:FIN -->')
if a < 0 or b < 0:
    raise SystemExit('No encuentro las marcas HEATMAP:INICIO / HEATMAP:FIN en index.html')
h = h[:a] + block + h[b + len('<!-- HEATMAP:FIN -->'):]
open(p, 'w', encoding='utf-8').write(h)
print('Mapa de calor %d (ene–%s) actualizado en la portada.' % (Y, MES[M - 1].lower()))
