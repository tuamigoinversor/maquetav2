# -*- coding: utf-8 -*-
"""
GENERADOR DEL INFORME MENSUAL · Tu Amigo Inversor
=================================================
Uso (desde la carpeta raíz de la web):

    python tools/informe/generar_informe.py tools/informe/datos/2026-10.yaml

Crea en tools/informe/salida/:
    tuamigoinversor-informe-2026-10.html   (se abre en cualquier navegador)
    tuamigoinversor-informe-2026-10.pdf    (si está instalado Playwright)

Qué lee:
    datos/estrategias_limpias.xlsx  -> rentabilidades y posiciones de las seis estrategias (lo calcula todo)
    datos/referencias.csv           -> rentabilidad mensual de los índices (añade una fila cada mes)
    datos/horizonte_planes.csv      -> rentabilidad mensual de los planes de HORIZONTE (una fila cada mes)
    datos/nombres.yaml              -> nombre de cada ticker
    datos/AAAA-MM.yaml              -> fecha de envío, cambios del mes y tus textos

Requisitos:  pip install openpyxl pyyaml pypdf playwright   y después   playwright install chromium
Sin Playwright: abre el .html en Chrome y usa Imprimir > Guardar como PDF (activa «Gráficos de fondo»).
"""
import sys, os, re, csv, math, html, datetime, argparse

import yaml
import openpyxl

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
DATA = os.path.join(HERE, 'datos')

MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
MES_C = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

# ---------------------------------------------------------------------------------------------------------------
# Estructura del Excel (columnas, empezando en 0). Si cambias el Excel de sitio una columna, ajústalo aquí:
# el script comprueba que en cada celda de ticker haya texto y en cada rentabilidad, un número.
# ---------------------------------------------------------------------------------------------------------------
ESTRATEGIAS = ['ROCA', 'IMPULSO', 'HORIZONTE', 'GEDA', 'GEN-Z', 'CRYPTO']
INFO = {
    'ROCA':      dict(hoja='ROCA-detalle', perfil='Conservador', color='#0ea5e9', revision='Revisión en enero y julio'),
    'IMPULSO':   dict(hoja='IMPULSO-detalle', perfil='Moderado', color='#10b981', revision='Revisión en enero y julio'),
    'HORIZONTE': dict(hoja='HORIZONTE-detalle', perfil='Moderado', color='#7c3aed', revision='Revisión mensual'),
    'GEDA':      dict(hoja='GEDA-detalle', perfil='Agresivo', color='#f59e00', revision='Revisión mensual'),
    'GEN-Z':     dict(hoja='GENZ-detalle', perfil='Muy agresivo', color='#ec4899', revision='Revisión mensual'),
    'CRYPTO':    dict(hoja='CRYPTO-detalle', perfil='Especulativo', color='#ef4444', revision='Revisión mensual'),
}
# Carteras permanentes: (nombre que se muestra, columna de la rentabilidad mensual). El peso se lee de la cabecera.
COMPONENTES = {
    'ROCA': [('RF ligada a la inflación', 19), ('RF a corto plazo', 11), ('RF global', 3), ('Oro', 7), ('RV EE. UU. small cap value', 23), ('RV global', 15)],
    'IMPULSO': [('Oro', 3), ('RV EE. UU. small cap value', 11), ('RV global', 7)],
}
TOTAL_PERM = {'ROCA': 28, 'IMPULSO': 16, 'HORIZONTE': 15}
HORIZONTE_COLS = {'RF': 4, 'RV': 9}
# Estrategias tácticas: bloques -> (nombre, [(col ticker, col rentabilidad)...], col rentabilidad del bloque o None)
BLOQUES = {
    'GEDA': [('Índices', [(3, 4)], None), ('Sectores', [(8, 9), (10, 11)], 12),
             ('Acciones EE. UU.', [(16, 17), (18, 19)], 20), ('Acciones Europa', [(24, 25), (26, 27)], 28)],
    'GEN-Z': [('Sectores disruptivos', [(3, 4), (8, 9), (13, 14), (18, 19)], 24)],
    'CRYPTO': [('Bitcoin', [(3, 4)], None), ('Ether', [(8, 9)], None), ('Altcoins', [(13, 14), (15, 16), (17, 18)], None)]  # media de las 3 altcoins (la columna T del Excel no cuadra con el total),
}
TOTAL_TACT = {'GEDA': 33, 'GEN-Z': 24, 'CRYPTO': 24}


# ---------------------------------------------------------------- utilidades
def esc(s):
    return html.escape(str(s), quote=True)

def md(s):
    """Texto con **negrita** -> HTML seguro."""
    s = esc(' '.join(str(s).split()))
    return re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', s)

def num(x):
    return float(str(x).replace('%', '').replace(',', '.').strip())

def pct(x, signo=True, dec=2, corto=False):
    if x is None or (isinstance(x, float) and math.isnan(x)):
        return '—'
    s = ('%+.' + str(dec) + 'f') % x if signo else ('%.' + str(dec) + 'f') % x
    s = s.replace('-', '−').replace('.', ',')
    return s + ('%' if corto else ' %')


def pc(x, signo=True):
    return pct(x, signo, corto=True)

def acc(xs):
    xs = [x for x in xs if x is not None]
    return (math.prod(1 + x / 100 for x in xs) - 1) * 100 if xs else None

def mkey(y, m):
    return '%04d-%02d' % (y, m)

def prev_month(y, m, n=1):
    t = y * 12 + (m - 1) - n
    return t // 12, t % 12 + 1

def heat(x, escala=10.0):
    """Color de fondo para un rendimiento (verde/rojo, intensidad según tamaño)."""
    if x is None:
        return 'transparent'
    a = min(abs(x) / escala, 1.0) * 0.55 + 0.08
    return 'rgba(16,185,129,%.2f)' % a if x >= 0 else 'rgba(239,68,68,%.2f)' % a

def cls(x):
    return '' if x is None else ('pos' if x >= 0 else 'neg')


# ---------------------------------------------------------------- lectura de datos
def leer_excel(path):
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    hojas = {}
    for ws in wb.worksheets:
        rows = list(ws.iter_rows(values_only=True))
        datos = {}
        for r in rows[1:]:
            f = str(r[1]) if len(r) > 1 and r[1] is not None else ''
            m = re.match(r'^(\d{4})-(\d{1,2})$', f)
            if m:
                datos[mkey(int(m.group(1)), int(m.group(2)))] = (str(r[0] or ''), r)
        hojas[ws.title] = (rows[0], datos)
    return hojas

def leer_csv(path):
    with open(path, encoding='utf-8') as fh:
        rows = list(csv.reader(fh, delimiter=';'))
    cab = rows[0][1:]
    serie = {c: {} for c in cab}
    for r in rows[1:]:
        if not r or not r[0].strip():
            continue
        for c, v in zip(cab, r[1:]):
            if v.strip():
                serie[c][r[0].strip()] = num(v)
    return cab, serie

def f_(v):
    return None if v is None else float(v) * 100


class Modelo:
    def __init__(self, cfg, excel, avisos):
        self.cfg, self.avisos = cfg, avisos
        y, m = map(int, str(cfg['mes']).split('-'))
        self.y_inf, self.m_inf = y, m
        self.y, self.m = prev_month(y, m)                      # último mes con datos
        self.ultimo = mkey(self.y, self.m)
        self.meses_anyo = [mkey(self.y, k) for k in range(1, self.m + 1)]   # meses del año en curso
        self.hojas = leer_excel(excel)
        self.est = {}
        for e in ESTRATEGIAS:
            self.est[e] = self.leer_estrategia(e)

    def fila(self, e, mes):
        cab, datos = self.hojas[INFO[e]['hoja']]
        return datos.get(mes, (None, None))[1]

    def leer_estrategia(self, e):
        cab, datos = self.hojas[INFO[e]['hoja']]
        if self.ultimo not in datos:
            raise SystemExit('ERROR: el Excel (%s) no tiene datos de %s.' % (INFO[e]['hoja'], self.ultimo))
        col = TOTAL_PERM.get(e, TOTAL_TACT.get(e))
        serie = {k: f_(v[1][col]) for k, v in datos.items() if isinstance(v[1][col], (int, float))}
        out = dict(serie=serie, real=datos[self.ultimo][0])
        if e in COMPONENTES:
            comps = []
            for nombre, c in COMPONENTES[e]:
                peso = cab[c + 1]
                if not isinstance(peso, (int, float)):
                    raise SystemExit('ERROR: no encuentro el peso de %s en la cabecera de %s.' % (nombre, INFO[e]['hoja']))
                comps.append(dict(nombre=nombre, peso=peso * 100,
                                  serie={k: f_(v[1][c]) for k, v in datos.items() if isinstance(v[1][c], (int, float))}))
            out['comps'] = comps
        if e == 'HORIZONTE':
            r = datos[self.ultimo][1]
            out['senal'] = 'renta variable' if isinstance(r[HORIZONTE_COLS['RV']], (int, float)) else 'renta fija'
        if e in BLOQUES:
            bloques = []
            for nombre, pares, cb in BLOQUES[e]:
                meses = {}
                for k, (_, r) in datos.items():
                    pos = []
                    for ct, cr in pares:
                        t, v = r[ct], r[cr]
                        if t is None or v is None:
                            continue
                        if not isinstance(t, str) or not isinstance(v, (int, float)):
                            raise SystemExit('ERROR: columna inesperada en %s (%s). Revisa BLOQUES en el script.' % (INFO[e]['hoja'], k))
                        pos.append((t.strip(), v * 100))
                    br = r[cb] * 100 if cb is not None and isinstance(r[cb], (int, float)) else (sum(v for _, v in pos) / len(pos) if pos else None)
                    meses[k] = dict(pos=pos, ret=br)
                bloques.append(dict(nombre=nombre, meses=meses))
            out['bloques'] = bloques
        return out

    # acumulados de una serie mensual {AAAA-MM: %}
    def acum(self, serie, override_12=None):
        def ult(n):
            ks = [mkey(*prev_month(self.y, self.m, i)) for i in range(n)]
            if any(k not in serie for k in ks):
                return None
            return acc([serie[k] for k in ks])
        ytd = acc([serie[k] for k in self.meses_anyo if k in serie]) if all(k in serie for k in self.meses_anyo) else None
        a12 = ult(12)
        if a12 is None and override_12 is not None:
            a12 = float(override_12)
        return dict(mes=serie.get(self.ultimo), ytd=ytd, m3=ult(3), m6=ult(6), a12=a12)


# ---------------------------------------------------------------- HTML
def tabla_serie(filas, meses, etiqueta='', escala=10.0):
    """filas = [(nombre, serie, acumulados)]"""
    cab = ''.join('<th>%s</th>' % MES_C[int(k[5:]) - 1] for k in reversed(meses))
    h = ['<table class="hm"><thead><tr><th class="l">%s</th>%s<th class="sep">%s</th><th>3 m</th><th>6 m</th><th>12 m</th></tr></thead><tbody>' % (esc(etiqueta), cab, meses[0][:4])]
    for nombre, serie, a, extra in filas:
        tot = ' class="total"' if extra == 'total' else ''
        celdas = ''.join('<td style="background:%s">%s</td>' % (heat(serie.get(k), escala), pc(serie.get(k), signo=False)) for k in reversed(meses))
        h.append('<tr%s><th class="l">%s</th>%s<td class="sep %s">%s</td><td class="%s">%s</td><td class="%s">%s</td><td class="%s">%s</td></tr>' % (
            tot, nombre, celdas, cls(a['ytd']), pc(a['ytd']), cls(a['m3']), pc(a['m3']), cls(a['m6']), pc(a['m6']), cls(a['a12']), pc(a['a12'])))
    h.append('</tbody></table>')
    return '<div class="tw">' + ''.join(h) + '</div>'


def generar(cfg_path, excel=None, salida=None, pdf=True):
    avisos = []
    cfg = yaml.safe_load(open(cfg_path, encoding='utf-8'))
    excel = excel or os.path.join(DATA, 'estrategias_limpias.xlsx')
    M = Modelo(cfg, excel, avisos)
    nombres = yaml.safe_load(open(os.path.join(DATA, 'nombres.yaml'), encoding='utf-8')) or {}
    o12 = cfg.get('doce_meses') or {}
    rcab, refs = leer_csv(os.path.join(DATA, 'referencias.csv'))
    pcab, planes = leer_csv(os.path.join(DATA, 'horizonte_planes.csv'))
    for c, s in list(refs.items()) + list(planes.items()):
        if M.ultimo not in s:
            avisos.append('Falta el dato de %s para %s en el .csv' % (c, M.ultimo))
    msci = M.acum(refs['MSCI World'], o12.get('MSCI World')) if 'MSCI World' in refs else None

    mes_txt = MESES[M.m_inf - 1]
    mes_dat = MESES[M.m - 1]
    fin_mes = (datetime.date(M.y_inf, M.m_inf, 1) - datetime.timedelta(days=1))
    envio = str(cfg.get('envio') or '').strip()
    if envio:
        d = datetime.datetime.strptime(envio, '%Y-%m-%d %H:%M')
        envio_txt = '%d de %s de %d a las %s' % (d.day, MESES[d.month - 1], d.year, d.strftime('%H:%M'))
    else:
        envio_txt = None
        avisos.append('Falta «envio» (fecha y hora de envío) en el archivo del mes')

    A = {e: M.acum(M.est[e]['serie']) for e in ESTRATEGIAS}
    positivas = sum(1 for e in ESTRATEGIAS if (A[e]['ytd'] or 0) > 0)
    titular = '%d de 6 estrategias en positivo en %d' % (positivas, M.y) if positivas < 6 else 'Las 6 estrategias, en positivo en %d' % M.y
    cambios = cfg.get('cambios') or {}

    P = []   # partes del HTML
    # --- cabecera
    P.append('''<header class="top"><div class="brand">● tu<b>amigo</b>inversor</div>
<div class="meta">Informe mensual · %s %d<br>Datos a %d de %s de %d · en euros</div>
<h1>%s</h1><p class="sub">%s</p></header>''' % (mes_txt.capitalize(), M.y_inf, fin_mes.day, mes_dat, M.y, esc(titular), md(cfg.get('subtitulo', ''))))
    # --- cambios del mes
    chips = []
    sin = []
    for e in ESTRATEGIAS:
        if cambios.get(e):
            for c in cambios[e]:
                chips.append('<div class="chg"><span class="k">%s</span><span class="out">%s</span><span class="ar">→</span><span class="in">%s</span></div>' % (
                    e, esc(str(c['sale']).replace('-USD', '')), esc(str(c['entra']).replace('-USD', ''))))
        else:
            sin.append(e)
    P.append('<section class="box resumen"><h2 class="mini">Cambios del mes · posiciones desde el 1 de %s</h2><div class="chips">%s</div><p class="note">%s</p></section>' % (
        mes_txt, ''.join(chips) or '<p>Este mes no hay rotaciones.</p>',
        ('%s: <strong>sin cambios</strong>. ' % (', '.join(sin[:-1]) + ' y ' + sin[-1] if len(sin) > 1 else sin[0]) if sin else '') +
        'En cada rotación vendo toda la posición que sale y, con ese dinero, compro la que entra.'))
    # --- introducción
    P.append('<section class="txt"><p>Hola,</p><p>%s</p></section>' % md(cfg.get('introduccion', '')))
    # --- marcador
    mx = max(abs(A[e]['ytd'] or 0) for e in ESTRATEGIAS) or 1
    orden = sorted(ESTRATEGIAS, key=lambda e: -(A[e]['ytd'] or -1e9))
    barras = []
    for e in orden:
        v = A[e]['ytd'] or 0
        barras.append('<div class="bar"><span class="bn">%s</span><span class="bt"><i style="width:%.1f%%;background:%s"></i>%s</span><b class="%s">%s</b></div>' % (
            e, max(abs(v) / mx * 100, 1), INFO[e]['color'],
            ('<em style="left:%.1f%%"></em>' % (min(max(msci['ytd'], 0) / mx * 100, 100)) if msci and msci['ytd'] is not None else ''), cls(v), pct(v)))
    P.append('<section><h2 class="eyebrow">El marcador</h2><h3>Rentabilidad en %d frente al MSCI World</h3><div class="box">%s<p class="note">%s</p></div></section>' % (
        M.y, ''.join(barras), ('Línea discontinua: MSCI World (%s en %d).' % (pct(msci['ytd']), M.y)) if msci else ''))
    # --- contexto de mercado
    ctx = cfg.get('contexto') or {}
    kpis = []
    for c in rcab:
        a = M.acum(refs[c], o12.get(c))
        kpis.append('<div class="kpi"><span>%s</span><b class="%s">%s</b><small>en el mes · %s en %d</small></div>' % (esc(c), cls(a['mes']), pct(a['mes']), pct(a['ytd']), M.y))
    filas = [(esc(c), refs[c], M.acum(refs[c], o12.get(c)), None) for c in rcab]
    P.append('<section><h2 class="eyebrow">Contexto de mercado</h2><h3>%s</h3><p>%s</p><div class="kpis">%s</div>%s</section>' % (
        esc(ctx.get('titulo', '¿Qué pasó en %s?' % mes_dat)), md(ctx.get('texto', '')), ''.join(kpis),
        tabla_serie(filas, M.meses_anyo, 'Índices', escala=8)))
    # --- mapa de calor de estrategias
    filas = [(e, M.est[e]['serie'], A[e], None) for e in ESTRATEGIAS]
    P.append('<section><h2 class="eyebrow">Mapa de calor</h2><h3>Las seis estrategias, mes a mes</h3>%s</section>' % tabla_serie(filas, M.meses_anyo, 'Estrategia', escala=15))
    # --- opinión
    op = cfg.get('opinion')
    if op:
        P.append('<section class="box opinion"><span class="tag">Mi opinión</span><h3>%s</h3><p>%s</p></section>' % (esc(op.get('titulo', '')), md(op.get('texto', ''))))
    # --- estrategia a estrategia
    P.append('<section><h2 class="eyebrow">Estrategia a estrategia</h2><h3>Repaso detallado</h3></section>')
    com = cfg.get('comentarios') or {}
    for e in ESTRATEGIAS:
        a = A[e]; inf = INFO[e]; c = com.get(e) or {}
        dif = (a['ytd'] - msci['ytd']) if (msci and a['ytd'] is not None and msci['ytd'] is not None) else None
        h = ['<article class="card" style="--c:%s"><div class="ch"><h4>%s</h4><span class="pf">Perfil %s · %s</span></div>' % (inf['color'], e, inf['perfil'].lower(), inf['revision'].lower())]
        h.append('<div class="ck"><div><span>%s</span><b class="%s">%s</b></div><div><span>%d</span><b class="%s">%s</b></div><div><span>12 meses</span><b class="%s">%s</b></div><div><span>Frente al MSCI World</span><b class="%s">%s</b></div></div>' % (
            mes_dat.capitalize(), cls(a['mes']), pct(a['mes']), M.y, cls(a['ytd']), pct(a['ytd']), cls(a['a12']), pct(a['a12']), cls(dif),
            (('%+.2f' % dif).replace('-', '−').replace('.', ',') + ' p. p.') if dif is not None else '—'))
        h.append('<div class="cb">')
        if c.get('titular'):
            h.append('<h5>%s</h5>' % esc(c['titular']))
        if c.get('puntos'):
            h.append('<ul>%s</ul>' % ''.join('<li>%s</li>' % md(p) for p in c['puntos']))
        est = M.est[e]
        if e in COMPONENTES:
            filas = [('%s <small>%s</small>' % (esc(x['nombre']), pct(x['peso'], signo=False, dec=0)), x['serie'], M.acum(x['serie']), None) for x in est['comps']]
            filas.append(('Total', est['serie'], a, 'total'))
            h.append('<h6>Composición y evolución en %d</h6>%s' % (M.y, tabla_serie(filas, M.meses_anyo, 'Componente (peso)', escala=8)))
        elif e == 'HORIZONTE':
            filas = [(esc(p), planes[p], M.acum(planes[p], o12.get(p)), None) for p in pcab]
            h.append('<p class="note">Señal a cierre de %s: <strong>%s</strong>. La estrategia se mide con el primer plan de la tabla; los demás son alternativas que siguen una tendencia parecida.</p>' % (mes_dat, est['senal']))
            h.append('<h6>Planes en %d</h6>%s' % (M.y, tabla_serie(filas, M.meses_anyo, 'Plan', escala=8)))
        else:
            h.append(bloque_tactico(e, est, M, cambios.get(e) or [], nombres, mes_txt))
        if not cambios.get(e):
            h.append('<p class="ok">✓ Sin cambios este mes</p>')
        for cc in cambios.get(e) or []:
            h.append('<div class="cambio"><span class="tag2">Cambio para %s</span><p><span class="out">Sale %s</span> → <span class="in">Entra %s</span></p><p>%s</p></div>' % (
                mes_txt, esc(str(cc['sale']).replace('-USD', '')), esc(str(cc['entra']).replace('-USD', '')), md(cc.get('texto', ''))))
        h.append('</div></article>')
        P.append(''.join(h))
    # --- novedades
    nov = cfg.get('novedades') or []
    if nov:
        items = []
        for n in nov:
            items.append('<div class="nov"><span class="tag2">%s</span>%s%s<p>%s</p>%s</div>' % (
                esc(n.get('tipo', '')), ('<b class="big">%s</b>' % esc(n['destacado'])) if n.get('destacado') else '',
                ('<h5>%s</h5>' % esc(n['titulo'])) if n.get('titulo') else '', md(n.get('texto', '')),
                ('<a href="%s">%s →</a>' % (esc(n['url']), esc(n.get('boton', 'Ver')))) if n.get('url') else ''))
        P.append('<section><h2 class="eyebrow">Novedades</h2><div class="novs">%s</div></section>' % ''.join(items))
    # --- principios y firma
    P.append('''<section class="box"><h2 class="mini">Cómo funcionan las estrategias</h2><ul class="chk">
<li>Reglas sistemáticas basadas en momentum y fortaleza relativa (GEDA, GEN-Z, CRYPTO y HORIZONTE) o en pesos fijos (ROCA e IMPULSO).</li>
<li>Revisión mensual en las tácticas; ROCA e IMPULSO se revisan en enero y julio.</li>
<li>Sin decisiones discrecionales: el precio manda, no la opinión.</li>
<li>El objetivo no es predecir el mercado, sino reaccionar de forma consistente a lo que hace el precio.</li></ul></section>''')
    P.append('<section class="txt"><p>%s</p><p>Un saludo,<br><strong>José Manuel García</strong> · Tu Amigo Inversor</p></section>' % md(cfg.get('cierre', 'Gracias por seguir el proyecto.')))
    P.append('''<footer><p><strong>Quién elabora este informe y qué intereses tengo.</strong> Lo elaboro yo, José Manuel García, autor de Tu Amigo Inversor e inversor particular. No soy una entidad autorizada ni presto asesoramiento en materia de inversión. <strong>Invierto mi propio dinero en las posiciones de este informe</strong> y hago mis operaciones el primer día hábil del mes, el mismo día del envío, antes o después de enviarlo. No tengo acuerdos comerciales ni de afiliación con ningún bróker. Más detalle en <a href="https://tuamigoinversor.com/recomendaciones/">tuamigoinversor.com/recomendaciones</a>.</p>
<p><strong>Cómo leerlo.</strong> Las posiciones, los cambios y las rentabilidades son datos; los comentarios y el apartado «Mi opinión» son opiniones. Es la misma información para todos: no tiene en cuenta tu situación y no es una recomendación personalizada. Qué hacer con tu dinero lo decides tú.</p>
<p>Datos a cierre de %s de %d. Rentabilidades en euros, sin comisiones ni impuestos. Puede haber pequeñas diferencias con los datos definitivos por el tipo de cambio y los valores liquidativos de fondos y planes. Toda inversión puede perder valor, y las criptomonedas tienen un riesgo especialmente alto. Las rentabilidades pasadas no garantizan rentabilidades futuras.</p>
<p class="env">%s</p></footer>''' % (mes_dat, M.y, ('Enviado el %s.' % envio_txt) if envio_txt else ''))

    css = open(os.path.join(HERE, 'plantilla.css'), encoding='utf-8').read().replace('{FONTS}', fuentes())
    titulo = 'Tu Amigo Inversor · Informe %s %d' % (mes_txt, M.y_inf)
    doc = '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="author" content="José Manuel García"><title>%s</title><style>%s</style></head><body><main class="doc">%s</main></body></html>' % (esc(titulo), css, '\n'.join(P))

    salida = salida or os.path.join(HERE, 'salida')
    os.makedirs(salida, exist_ok=True)
    base = os.path.join(salida, 'tuamigoinversor-informe-%04d-%02d' % (M.y_inf, M.m_inf))
    open(base + '.html', 'w', encoding='utf-8').write(doc)
    print('HTML:', base + '.html')
    if pdf:
        hacer_pdf(base, titulo, avisos)
    for a in avisos:
        print('AVISO:', a)
    return base


def fuentes():
    """Incrusta en el HTML las fuentes de la web (Inter y JetBrains Mono), para que el informe se vea igual en cualquier sitio."""
    import base64
    out = []
    for fam, f, w in [('Inter', 'inter-latin-400-normal', 400), ('Inter', 'inter-latin-600-normal', 600), ('Inter', 'inter-latin-700-normal', 700),
                      ('Inter', 'inter-latin-800-normal', 800), ('JetBrains Mono', 'jetbrains-mono-latin-500-normal', 500), ('JetBrains Mono', 'jetbrains-mono-latin-700-normal', 700)]:
        p = os.path.join(ROOT, 'assets', 'fonts', f + '.woff2')
        if os.path.exists(p):
            b = base64.b64encode(open(p, 'rb').read()).decode()
            out.append("@font-face{font-family:'%s';font-weight:%d;font-style:normal;src:url(data:font/woff2;base64,%s) format('woff2')}" % (fam, w, b))
    return '\n'.join(out)


def bloque_tactico(e, est, M, cambios, nombres, mes_txt):
    """Rejilla de posiciones por mes + cartera vigente para el mes del informe."""
    meses = list(reversed(M.meses_anyo))
    h = ['<h6>Evolución de cada posición en %d</h6><p class="note">Rentabilidad mensual de cada activo. Con recuadro, el activo que entró ese mes.</p><div class="tw"><table class="grid"><thead><tr><th class="l">Bloque</th>%s<th class="sep">%d</th><th>3 m</th><th>6 m</th><th>12 m</th></tr></thead><tbody>' % (
        M.y, ''.join('<th>%s</th>' % MES_C[int(k[5:]) - 1] for k in meses), M.y)]
    for b in est['bloques']:
        serie_b = {k: v['ret'] for k, v in b['meses'].items() if v['ret'] is not None}
        a = M.acum(serie_b)
        celdas = []
        for k in meses:
            mm = b['meses'].get(k, {'pos': []})
            ant = b['meses'].get(mkey(*prev_month(int(k[:4]), int(k[5:]))), {'pos': []})
            prev = {t for t, _ in ant['pos']}
            celdas.append('<td><div class="st">%s</div></td>' % ''.join(
                '<span class="p%s" style="background:%s">%s<br><i>%s</i></span>' % (' new' if t not in prev else '', heat(v, 25), esc(t.replace('-USD', '')), pc(v, signo=False))
                for t, v in mm['pos']))
        h.append('<tr><th class="l">%s</th>%s<td class="sep %s">%s</td><td class="%s">%s</td><td class="%s">%s</td><td class="%s">%s</td></tr>' % (
            esc(b['nombre']), ''.join(celdas), cls(a['ytd']), pc(a['ytd']), cls(a['m3']), pc(a['m3']), cls(a['m6']), pc(a['m6']), cls(a['a12']), pc(a['a12'])))
    tot = M.acum(est['serie'])
    h.append('<tr class="total"><th class="l">Total</th>%s<td class="sep %s">%s</td><td class="%s">%s</td><td class="%s">%s</td><td class="%s">%s</td></tr></tbody></table></div>' % (
        ''.join('<td style="background:%s">%s</td>' % (heat(est['serie'].get(k), 15), pc(est['serie'].get(k), signo=False)) for k in meses),
        cls(tot['ytd']), pc(tot['ytd']), cls(tot['m3']), pc(tot['m3']), cls(tot['m6']), pc(tot['m6']), cls(tot['a12']), pc(tot['a12'])))
    # cartera vigente
    sale = {str(c['sale']).strip() for c in cambios}
    filas = []
    for b in est['bloques']:
        for t, v in b['meses'][M.ultimo]['pos']:
            estado = '<span class="out">Sale</span>' if t in sale else 'Mantiene'
            filas.append('<tr%s><td>%s</td><td><b>%s</b> <small>%s</small></td><td class="r %s">%s</td><td class="r">%s</td></tr>' % (
                ' class="x"' if t in sale else '', esc(b['nombre']), esc(t.replace('-USD', '')), esc(nombres.get(t, '')), cls(v), pct(v), estado))
            for c in cambios:
                if str(c['sale']).strip() == t:
                    n = str(c['entra']).strip()
                    filas.append('<tr class="n"><td>%s</td><td><b>%s</b> <small>%s</small></td><td class="r">—</td><td class="r"><span class="in">Entra</span></td></tr>' % (
                        esc(b['nombre']), esc(n.replace('-USD', '')), esc(nombres.get(n, ''))))
    falt = sale - {t for b in est['bloques'] for t, _ in b['meses'][M.ultimo]['pos']}
    if falt:
        raise SystemExit('ERROR: en %s quieres vender %s, pero no está en la cartera de %s según el Excel.' % (e, ', '.join(falt), M.ultimo))
    h.append('<h6>Cartera vigente desde el 1 de %s</h6><div class="tw"><table class="cv"><thead><tr><th>Bloque</th><th>Activo</th><th class="r">%s</th><th class="r">%s</th></tr></thead><tbody>%s</tbody></table></div>' % (
        mes_txt, MESES[M.m - 1].capitalize(), mes_txt.capitalize(), ''.join(filas)))
    return ''.join(h)


def hacer_pdf(base, titulo, avisos):
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        avisos.append('Playwright no está instalado: abre el .html en Chrome y usa Imprimir > Guardar como PDF.')
        return
    exe = os.environ.get('CHROMIUM_PATH')
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=exe) if exe else p.chromium.launch()
        pg = b.new_page(viewport={'width': 794, 'height': 1123})
        pg.goto('file://' + os.path.abspath(base + '.html').replace('\\', '/'))
        pg.wait_for_timeout(400)
        alto = pg.evaluate('Math.ceil(document.documentElement.scrollHeight)') + 4
        if alto * 0.75 > 14000:   # límite práctico de altura de página en PDF: si no cabe, en hojas A4
            pg.pdf(path=base + '.pdf', format='A4', print_background=True, margin={'top': '10mm', 'bottom': '10mm', 'left': '0', 'right': '0'})
            avisos.append('El informe es muy largo para una sola página: el PDF va en hojas A4.')
        else:
            pg.pdf(path=base + '.pdf', width='794px', height='%dpx' % alto, print_background=True, margin={'top': '0', 'bottom': '0', 'left': '0', 'right': '0'})
        b.close()
    try:   # metadatos limpios: autor y título propios
        from pypdf import PdfReader, PdfWriter
        r = PdfReader(base + '.pdf'); w = PdfWriter()
        for pgx in r.pages:
            w.add_page(pgx)
        w.add_metadata({'/Title': titulo, '/Author': 'José Manuel García', '/Creator': 'Tu Amigo Inversor', '/Producer': 'Tu Amigo Inversor'})
        with open(base + '.pdf', 'wb') as fh:
            w.write(fh)
    except ImportError:
        avisos.append('pypdf no está instalado: revisa a mano las propiedades (autor) del PDF.')
    print('PDF: ', base + '.pdf')


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description='Genera el informe mensual de Tu Amigo Inversor.')
    ap.add_argument('datos', help='archivo del mes, p. ej. tools/informe/datos/2026-11.yaml')
    ap.add_argument('--excel', help='ruta del Excel (por defecto, tools/informe/datos/estrategias_limpias.xlsx)')
    ap.add_argument('--salida', help='carpeta de salida (por defecto, tools/informe/salida)')
    ap.add_argument('--sin-pdf', action='store_true', help='crea solo el HTML')
    a = ap.parse_args()
    generar(a.datos, a.excel, a.salida, pdf=not a.sin_pdf)
