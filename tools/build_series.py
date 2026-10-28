#!/usr/bin/env python3
"""Genera assets/js/series.js a partir de las rentabilidades mensuales que llevan las 6 fichas
(constante `const GEDA={"2016":[...],...}` dentro del script de cada ficha). Ejecutar tras actualizar los datos de las fichas."""
import os,re,json
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FICHAS={'ROCA':'cartera-permanente-conservadora-roca','IMPULSO':'cartera-inversion-crecimiento-impulso','HORIZONTE':'plan-pensiones-moderado-horizonte','GEDA':'inversion-tactica-geda','GEN-Z':'inversion-tematica-gen-z','CRYPTO':'inversion-criptomonedas-crypto'}
out={}
for k,d in FICHAS.items():
    h=open(os.path.join(ROOT,d,'index.html'),encoding='utf8').read()
    m=re.search(r'const \w+=(\{"20\d\d":\[.*?\]\});',h,re.S)
    data=json.loads(m.group(1)); years=sorted(int(y) for y in data)
    r=[x for y in years for x in data[str(y)]]
    out[k]={'start':f'{years[0]}-01','r':r}
js='/* Generado por tools/build_series.py desde las fichas. No editar a mano. Rentabilidades mensuales en %, en euros. */\nwindow.TAI_SERIES='+json.dumps(out,separators=(',',':'))+';\n'
open(os.path.join(ROOT,'assets','js','series.js'),'w',encoding='utf8').write(js)
print({k:(v['start'],len(v['r'])) for k,v in out.items()})
