---
title: "He auditado mis seis estrategias: qué encontré y cómo lo he resuelto"
fecha: 2026-11-13
categoria: "Metodología"
resumen: "En octubre y noviembre he sometido las seis estrategias a una auditoría completa: datos, cálculos, reglas y cada posición publicada. Lo que no la superó lo he corregido con reglas automáticas. GEDA y GEN-Z eligen ahora entre las acciones de los índices, CRYPTO pasa a ser 50 % bitcoin y 50 % ether y HORIZONTE publica su serie real."
imagen: "assets/img/posts/lo-que-he-cambiado-tras-revisar-mis-estrategias.webp"
siguiente_texto: "Ver todos los cambios de método, con fecha"
siguiente_url: "/metodologia/#cambios"
---

Durante octubre y noviembre he hecho algo que tenía pendiente desde hace tiempo: **auditar a fondo las seis estrategias**. No me he limitado a revisar las cifras del mes. He revisado los datos, los cálculos, las reglas y cada posición publicada, mes a mes, desde que cada estrategia empezó.

Es el trabajo más largo que he hecho en este proyecto, y cambia cosas importantes. Te cuento qué he auditado, qué no ha pasado la auditoría y qué solución he puesto en cada caso.

## Qué he auditado

A cada estrategia le he hecho cuatro preguntas:

1. **¿Los datos y los cálculos son correctos?** ¿La rentabilidad publicada de cada posición coincide con la que da un recálculo independiente?
2. **¿Cada decisión sale de una regla escrita?** ¿O hay alguna parte que depende de que yo acierte?
3. **¿El histórico usa solo la información que había en cada momento?** Un backtest que elige hoy las acciones sabiendo cómo les fue después sale siempre mejor de lo que habría salido de verdad.
4. **¿El resultado depende de muy pocos aciertos?** Si quitando tres o cuatro meses buenos se derrumba, no hay un método detrás, hay una racha.

## El resultado, en una tabla

| Estrategia | Qué no pasó la auditoría | Solución |
|---|---|---|
| **GEDA** | La lista de acciones candidatas la hacía yo a mano y tenía errores. El histórico simulado 2016–2020 usaba la lista de hoy hacia atrás. | Las candidatas salen cada mes de los índices, con una regla automática. Simulado 2016–2020 retirado. |
| **GEN-Z** | Universo elegido por mí, con muchas empresas pequeñas. El resultado dependía de cinco posiciones. Acabó con las cuatro acciones en el mismo sector. | Mismo universo de índices que GEDA y dos acciones por tema como máximo. Historial nuevo, separado del anterior. |
| **CRYPTO** | Las altcoins salían de listas que mantenía yo, con criterios que cambiaron. Casi toda la ventaja venía de tres meses. | Probé a sustituirlas por una regla automática. No mantuvo la ventaja: CRYPTO pasa a 50 % bitcoin y 50 % ether. |
| **HORIZONTE** | La serie publicada no correspondía a mis traspasos reales, y la regla no estaba escrita entera. | Serie rehecha con mis seis traspasos desde 2020 y regla publicada. |
| **ROCA e IMPULSO** | Nada. | Sin cambios. |

## Cómo he decidido cada cambio

Esta es la parte que más me importa que se entienda. **Antes de probar cada alternativa, he escrito qué tendría que conseguir para adoptarla**: cuánto debía mejorar, en qué periodos y con qué riesgo. Solo después he mirado los resultados.

Lo hago así por una razón práctica. Con datos de mercado, si pruebas suficientes variantes, alguna sale mejor por pura casualidad. Si decides después de ver los números, acabas eligiendo la que mejor le fue al pasado, no la que mejor funcionará.

Por eso, la mayoría de las alternativas que he probado se han quedado fuera, aunque alguna cifra pareciera mejor. Y por eso tampoco cambio una regla solo porque un año haya salido mal.

## GEDA: la señal aprueba, la lista de acciones no

**Lo que sí pasó la auditoría.** Comparé cada rentabilidad publicada con un recálculo independiente. En los 432 casos en los que coincidían la posición y el mes, la diferencia media fue de 0,01 puntos. Los índices y los sectores elegidos coincidieron los 69 meses revisados. Los datos, el cálculo y la señal de momentum aguantan.

**Lo que no la pasó.** Las acciones candidatas salían de una lista que actualizaba yo a mano una vez al año. Esa lista se quedaba desfasada durante meses y, al hacerla a mano, cometí errores. Publiqué acciones europeas que todavía no estaban en su índice, como Rheinmetall entre 2022 y 2023. En 2026, SanDisk entró recién incorporada a su índice, y en julio y agosto llevé Western Digital cuando la regla pedía Lumentum.

Además, el histórico simulado de 2016 a 2020 que mostraba la web, un 41,6 % anual, usaba la composición actual de los índices europeos hacia atrás. Incluía empresas años antes de que entraran en sus índices. Repetido sin ese sesgo, sale alrededor de un 27 % anual.

**La solución.** Una acción es candidata si a cierre de mes está en alguno de los índices (S&P 500, Nasdaq-100 o Dow Jones en EE. UU.; Euro Stoxx 50, IBEX 35, CAC 40, DAX, FTSE MIB o AEX en Europa) y lleva más de tres meses dentro. Se comprueba cada mes con la composición real, sin que yo intervenga. La señal no cambia.

He retirado el simulado de 2016 a 2020. La tabla de GEDA empieza ahora en 2021, con las posiciones que publiqué y tuve.

**Lo que significa para 2026.** Las cifras publicadas son las de las posiciones que comuniqué cada mes y no las voy a recalcular. Pero con la regla actual, enero–septiembre habría sido de alrededor del **+67 %**, frente al +100,1 % publicado. Para hacerse una idea del método, la cifra útil es la de la regla.

**Lo que probé y descarté.** Once variantes, todas con su criterio escrito antes:

- limitar a una acción por sector;
- juntar las acciones de EE. UU. y Europa en un solo bloque;
- mantener una acción mientras siga entre las tres primeras;
- revisar cada semana en vez de cada mes;
- poner stop-loss;
- usar señales de momentum más simples.

Ninguna cumplió el criterio. Los stop-loss, por ejemplo, suavizaban los peores meses, pero se comían cerca de la mitad de la rentabilidad: saltaban y el precio volvía a subir después.

## GEN-Z: una estrategia nueva

**Lo que no pasó la auditoría.** GEN-Z elegía entre unas 100 empresas de temas de futuro que seleccionaba yo, muchas de ellas pequeñas y muy volátiles. Las cifras de 2024 y 2025 son espectaculares, pero dependen de muy pocos nombres: quitando las cinco mejores posiciones individuales, el resultado acumulado de enero de 2024 a septiembre de 2026 pasa de +637 % a +184 %. Y sin límite por tema, desde julio de 2026 acabó con las cuatro acciones en semiconductores. Cuando cayó el sector, cayeron las cuatro.

**La solución.** Solo son candidatas las acciones de los mismos índices que GEDA, con más de tres meses dentro, que pertenecen a uno de los temas de la estrategia. Cada mes entran las cuatro con más momentum, un 25 % cada una, con **dos del mismo tema como máximo**.

**Lo que probé y descarté.** Ampliar el universo a las empresas medianas y pequeñas de EE. UU. (S&P 400 y S&P 600). Aun con un sesgo a favor, salía peor en rentabilidad, en caídas y en todo lo demás. También comparé distintas combinaciones de número de acciones y límite por tema. Ninguna diferencia entre ellas era fiable, así que me quedo con la más sencilla de ejecutar: cuatro acciones que se compran en cualquier bróker.

**El historial.** Al exigir que las empresas estén en un índice grande, salen las compañías pequeñas que protagonizaron la versión anterior. La GEN-Z actual es otra estrategia. Su historial empieza en noviembre de 2026 y lo publico separado del anterior, sin cifras simuladas que la hagan parecer mejor de lo que está demostrado. Sigue siendo una estrategia muy agresiva, con caídas posibles del 30 % o más.

## CRYPTO: mitad bitcoin, mitad ether

**Lo que no pasó la auditoría.** Desde enero de 2023, casi cuatro años, CRYPTO ha tenido un 30 % en bitcoin, un 30 % en ether y un 40 % en tres altcoins elegidas por momentum. Esas altcoins salían de listas que mantenía yo. Usé más de una, y el criterio para incluir una moneda no siempre fue el mismo. Además, la ventaja venía de muy pocos meses: quitando los tres mejores meses de las altcoins, el resultado acumulado pasa de +443 % a +202 %.

**La solución que probé.** Sustituí las listas por una regla automática: las 100 criptomonedas de mayor capitalización cada mes. Comparé el resultado con una cartera solo de bitcoin y ether en cuatro versiones: con ventanas de momentum más cortas y más largas, y limitando las altcoins a las que se pueden comprar en Revolut X o Coinbase.

**El resultado.** Con reglas automáticas, la ventaja de las altcoins no se mantiene. Quitando sus pocos meses excepcionales, ninguna versión bate a bitcoin y ether, y las caídas son más profundas. Todos los sesgos de la prueba jugaban a favor de las altcoins, y aun así no la superaron.

**Lo que hace ahora.** 50 % bitcoin y 50 % ether. En enero y julio compruebo que ninguno se aleje más de un 15 % de su peso y, si se aleja, rebalanceo. Funciona igual que [ROCA e IMPULSO](/aprende/rebalanceo-roca-impulso/).

Que sea permanente no la hace tranquila. Sigue siendo una estrategia de **riesgo muy alto**: una cartera de bitcoin y ether ha llegado a caer cerca de un 70 % desde máximos en los últimos años.

## HORIZONTE: la serie, rehecha con mis traspasos

**Lo que no pasó la auditoría.** La web mostraba una serie de HORIZONTE que no correspondía a mis traspasos reales. En 2022, por ejemplo, figuraba un −19,3 %. Y la regla que sigo con mi plan desde 2020 no estaba escrita entera en la web.

**La solución.** He rehecho la serie con las fechas de mis seis traspasos desde 2020, que tengo en los extractos del plan, y los valores liquidativos diarios de los dos planes. En 2022 la serie corregida da un −0,6 %. La regla, un MACD semanal sobre el S&P 500 revisado a fin de mes, está ahora explicada en la [ficha de HORIZONTE](/plan-pensiones-moderado-horizonte/). Las cifras de 2026 no cambian.

## Qué cambia en los informes

- **GEDA y GEN-Z:** las posiciones de noviembre ya salen de las reglas nuevas. Los informes siguen igual que siempre.
- **CRYPTO:** en el informe del 1 de diciembre venderé las tres altcoins y quedaré en 50 % bitcoin y 50 % ether. Vender es una operación que tributa en el ejercicio de 2026; cómo afecte a cada uno depende de su situación.
- **HORIZONTE:** la operativa no cambia; solo cambian las cifras históricas de la web.
- **ROCA e IMPULSO:** nada cambia.

Todos estos cambios están anotados con fecha en [cambios de método](/metodologia/#cambios) y en la ficha de cada estrategia.

## Por qué hacer esto ahora

Auditar tus propias estrategias no es cómodo, y menos cuando algunas cifras publicadas salen peor con las reglas nuevas. Habría sido más fácil seguir enseñando el +100 % de GEDA o el +637 % de GEN-Z y no mirar debajo.

Pero un sistema que depende de que yo acierte al hacer una lista a mano no es del todo un sistema. Ahora cada decisión de GEDA, GEN-Z y CRYPTO sale de una regla que puedes leer, y cada cambio queda anotado con fecha.

GEN-Z y CRYPTO quedan congeladas: no las tocaré, salvo error, hasta enero de 2028. Y si algún día cambio algo en GEDA, lo anotaré con fecha y con el criterio escrito antes de probarlo.
