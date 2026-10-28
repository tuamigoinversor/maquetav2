---
title: "El efecto del tipo de cambio: por qué todas las rentabilidades de este blog están en euros"
fecha: 2026-04-07
categoria: "Metodología"
resumen: "Por qué todas las rentabilidades del blog están en euros y cómo el tipo de cambio euro-dólar puede sumar o restar varios puntos a tu resultado."
imagen: "assets/img/posts/rentabilidad-en-euros-tipo-cambio.webp"
siguiente_texto: "Ver cómo calculo las cifras"
siguiente_url: "/metodologia/"
---

La **rentabilidad en euros** no es un número absoluto. Es una medida incompleta si no se tiene en cuenta en qué moneda está expresada.

En inversión, dos personas pueden analizar exactamente el mismo activo y obtener conclusiones distintas. No porque el activo se comporte de forma diferente, sino porque la divisa introduce una capa adicional de rentabilidad o de pérdida que muchas veces se ignora.

Y eso, aunque suele pasarse por alto, cambia completamente la interpretación de los resultados.

En este blog no se ignora.

Todo lo que ves aquí —estrategias, backtests, benchmarks, ratios de riesgo y seguimiento de carteras— está calculado en euros. No como un ajuste estético, sino como una decisión metodológica clave: reflejar la rentabilidad real de un inversor europeo.

Porque si inviertes en euros, tu resultado no depende solo de lo que hace el mercado. También depende de lo que hace el tipo de cambio.

## El problema que nadie menciona

Imagina que inviertes en un ETF que replica el S&P 500. Durante un año, el índice sube un 10% en dólares. Perfecto.

Pero tú no operas en dólares. Tú operas en euros.

Si en ese mismo periodo el dólar se deprecia un 8% frente al euro, tu rentabilidad real no es un 10%. Es aproximadamente un 1,2%. Una diferencia enorme que no aparece en la mayoría de gráficos si todo está expresado en USD.

Y el efecto contrario también existe: si el índice sube un 5% en dólares, pero el dólar se aprecia un 10% frente al euro, tu rentabilidad en euros puede acercarse al 15%. Más del triple de lo que muestra el activo en su moneda original.

Esto no es teórico. El EUR/USD ha oscilado más de un 20% en distintos periodos recientes. En 2022, por ejemplo, la fuerte apreciación del dólar hizo que muchos inversores europeos obtuvieran en euros rentabilidades muy superiores a las que reflejaban los propios activos. En otros periodos ha ocurrido lo contrario: el tipo de cambio ha reducido o incluso anulado ganancias que en dólares parecían sólidas.

Ignorar este efecto no es simplificar. Es distorsionar la realidad.

## El problema añadido de comparar estrategias

Existe un segundo problema, igual de importante: la comparabilidad.

Si una estrategia está medida en USD y otra en EUR, sus resultados no son directamente comparables, aunque los cálculos sean correctos.

Un ratio Sharpe calculado en dólares no mide lo mismo que uno calculado en euros, porque la volatilidad incluye dinámicas distintas del tipo de cambio. Lo mismo ocurre con el drawdown, la volatilidad anualizada o cualquier métrica de riesgo: cambian dependiendo de la divisa en la que se exprese la serie.

Esto implica que comparar estrategias sin homogeneizar la moneda es, en el mejor de los casos, impreciso.

Y en el peor, directamente engañoso.

Por eso, si quieres comparar estrategias entre sí —o contra un benchmark— necesitas que todas las series estén expresadas en la misma moneda.

En este caso: euros.

## Cómo lo hago técnicamente

El proceso se aplica antes de cualquier cálculo. No es un ajuste posterior. Es el punto de partida del análisis.

Para cada activo denominado en una moneda distinta al euro, el procedimiento es el siguiente:

- Se descarga la serie histórica de precios en su moneda original (USD, GBP, JPY, etc.)
- Se obtiene la serie del tipo de cambio EUR/moneda correspondiente para las mismas fechas
- Se convierte cada dato de precio a euros día a día, aplicando el tipo de cambio correspondiente
- Se trabaja exclusivamente sobre esa serie ya convertida

A partir de ahí, todos los cálculos —CAGR, volatilidad, Sharpe, Calmar, drawdowns y cualquier otra métrica— se realizan sobre la serie en euros.

El efecto del tipo de cambio no se elimina. Se incorpora.

De forma natural, como lo experimenta cualquier inversor real.

Los benchmarks siguen exactamente el mismo proceso. Si se compara una estrategia con el S&P 500 u otro índice en dólares, ese índice también se convierte a euros antes de cualquier análisis.

Si no, la comparación no tiene sentido.

## Por qué la mayoría de blogs no lo hacen

No es difícil entender por qué este ajuste se omite.

- Primero, porque la mayoría de herramientas de análisis trabajan por defecto en la moneda del activo, normalmente el dólar. Cambiarlo requiere un paso adicional.
- Segundo, porque los datos en USD están más estandarizados y son más fáciles de comparar con otros análisis publicados en inglés.
- Y tercero, porque según el periodo el resultado en dólares puede parecer mejor que el que de verdad obtuvo un inversor europeo. Cuando el dólar se deprecia frente al euro, ignorar el tipo de cambio hace que las cifras luzcan más de lo que fueron.

Pero eso es circunstancial.

La razón de fondo no debería ser cómo quedan los números, sino si reflejan la realidad.

## Lo que significa para ti

Cuando ves una rentabilidad en este blog, estás viendo algo concreto.

No es la rentabilidad teórica de un activo en su moneda original. No es una cifra parcial. Es la rentabilidad final en euros, con el efecto del tipo de cambio ya incorporado y calculado de forma consistente en todas las estrategias.

Eso hace que los resultados sean comparables entre sí.

Y, sobre todo, que sean interpretables desde una perspectiva real de inversión en la zona euro.

Porque al final, invertir no es acertar con un índice. Es entender cuánto dinero tienes realmente al final del proceso.
