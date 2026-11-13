
// =====================================================
// PROYECTO FINAL - ESTADÍSTICA I
// SIMULADOR ESTADÍSTICO WEB
// =====================================================

"use strict";

// 1. CONFIGURACIÓN DE LOS OCHO EJERCICIOS

const ejercicios = [
    {
        id: 1,
        titulo: "Detección de vulnerabilidades",
        distribucion: "Binomial",
        descripcion: "Se revisan 18 componentes independientes, cada uno con 12% de probabilidad de vulnerabilidad crítica. Se suspende la liberación con 4 o más vulnerables.",
        campos: [
            ["n", "Número de componentes", 18, 1, 200],
            ["p", "Probabilidad de vulnerabilidad (%)", 12, 0, 100]
        ]
    },
    {
        id: 2,
        titulo: "Recuperación de paquetes",
        distribucion: "Binomial negativa",
        descripcion: "Cada retransmisión tiene 75% de probabilidad de éxito. Se requieren 5 éxitos en un máximo de 8 intentos. El requisito de confiabilidad es 95%.",
        campos: [
            ["r", "Éxitos requeridos", 5, 1, 100],
            ["p", "Probabilidad de éxito (%)", 75, 0.01, 100],
            ["m", "Máximo de intentos", 8, 1, 300]
        ]
    },
    {
        id: 3,
        titulo: "Monitoreo de incidentes SOC",
        distribucion: "Poisson",
        descripcion: "Se registran 9 alertas cada 15 minutos. Existe riesgo elevado cuando se presentan más de 15 alertas en 20 minutos.",
        campos: [
            ["base", "Alertas promedio en 15 minutos", 9, 0, 1000]
        ]
    },
    {
        id: 4,
        titulo: "Disponibilidad de servidores",
        distribucion: "Binomial",
        descripcion: "Hay 20 servidores virtuales con 8% de probabilidad individual de falla. El sistema funciona si fallan como máximo 3.",
        campos: [
            ["n", "Número de servidores", 20, 1, 200],
            ["p", "Probabilidad de falla (%)", 8, 0, 100]
        ]
    },
    {
        id: 5,
        titulo: "Saturación de solicitudes API",
        distribucion: "Poisson",
        descripcion: "La API recibe 18 solicitudes cada 3 minutos. Se activa una alerta al superar 10 solicitudes por minuto.",
        campos: [
            ["base", "Solicitudes promedio en 3 minutos", 18, 0, 1000]
        ]
    },
    {
        id: 6,
        titulo: "Validación de módulos",
        distribucion: "Binomial negativa",
        descripcion: "Cada prueba tiene 65% de probabilidad de éxito. Se necesitan 6 pruebas satisfactorias y se evalúan límites de 8 y 10 intentos.",
        campos: [
            ["r", "Pruebas satisfactorias necesarias", 6, 1, 100],
            ["p", "Probabilidad de éxito (%)", 65, 0.01, 100]
        ]
    },
    {
        id: 7,
        titulo: "Tiempo de espera de mensajes",
        distribucion: "Exponencial",
        descripcion: "Un microservicio recibe 12 mensajes por minuto. Se estudia el tiempo hasta recibir el siguiente mensaje, medido en segundos.",
        campos: [
            ["rate", "Mensajes promedio por minuto", 12, 0.01, 1000]
        ]
    },
    {
        id: 8,
        titulo: "Rendimiento de base de datos",
        distribucion: "Normal",
        descripcion: "Los tiempos de respuesta siguen aproximadamente una distribución normal con media de 240 ms y desviación de 35 ms. El SLA exige 95% en 300 ms o menos.",
        campos: [
            ["mu", "Media (ms)", 240, 0, 10000],
            ["sd", "Desviación estándar (ms)", 35, 0.01, 10000]
        ]
    }
];

// 2. FUNCIONES MATEMÁTICAS GENERALES

const elemento = id => document.getElementById(id);

const porcentaje = valor =>
    (valor * 100).toFixed(4) + "%";

const decimal = valor =>
    Number(valor).toFixed(6);

function combinacion(n, k) {
    if (k < 0 || k > n) return 0;

    k = Math.min(k, n - k);
    let resultado = 1;

    for (let i = 1; i <= k; i++) {
        resultado = resultado * (n - k + i) / i;
    }

    return resultado;
}

function factorial(n) {
    let resultado = 1;

    for (let i = 2; i <= n; i++) {
        resultado *= i;
    }

    return resultado;
}

// 3. DISTRIBUCIÓN BINOMIAL

function binomial(n, k, p) {
    if (k < 0 || k > n) return 0;

    return combinacion(n, k) *
        Math.pow(p, k) *
        Math.pow(1 - p, n - k);
}

function binomialAcumulada(n, k, p) {
    let suma = 0;

    for (let i = 0; i <= Math.min(k, n); i++) {
        suma += binomial(n, i, p);
    }

    return Math.min(1, suma);
}

// 4. DISTRIBUCIÓN BINOMIAL NEGATIVA

function binomialNegativa(r, k, p) {
    if (k < r) return 0;

    return combinacion(k - 1, r - 1) *
        Math.pow(p, r) *
        Math.pow(1 - p, k - r);
}

function negativaAcumulada(r, k, p) {
    let suma = 0;

    for (let i = r; i <= k; i++) {
        suma += binomialNegativa(r, i, p);
    }

    return Math.min(1, suma);
}

// 5. DISTRIBUCIÓN DE POISSON

function poisson(k, lambda) {
    if (k < 0) return 0;

    return Math.exp(-lambda) *
        Math.pow(lambda, k) /
        factorial(k);
}

function poissonAcumulada(k, lambda) {
    let suma = 0;

    for (let i = 0; i <= k; i++) {
        suma += poisson(i, lambda);
    }

    return Math.min(1, suma);
}

// 6. DISTRIBUCIÓN EXPONENCIAL

function exponencialAcumulada(t, lambda) {
    return 1 - Math.exp(-lambda * t);
}

// 7. DISTRIBUCIÓN NORMAL

// Aproximación matemática de la función de error.
function erf(x) {
    const signo = x < 0 ? -1 : 1;

    x = Math.abs(x);

    const t = 1 / (1 + 0.3275911 * x);

    const resultado = 1 -
        (((((1.061405429 * t - 1.453152027) * t
        + 1.421413741) * t - 0.284496736) * t
        + 0.254829592) * t) * Math.exp(-x * x);

    return signo * resultado;
}

function normalAcumulada(x, media, desviacion) {
    const z = (x - media) /
        (desviacion * Math.SQRT2);

    return 0.5 * (1 + erf(z));
}

// 8. FORMATO DE RESPUESTAS

function respuesta(titulo, formula, valor, explicacion, tipo = "prob") {
    return {
        titulo,
        formula,
        valor,
        explicacion,
        tipo
    };
}

function decision(condicion, positivo, negativo) {
    return condicion ? positivo : negativo;
}

// =====================================================
// 9. RESOLVER LOS OCHO EJERCICIOS
// =====================================================

function resolverEjercicio(id, v) {

    let respuestas = [];
    let grafica = [];
    let simulacion = null;
    let tituloGrafica = "";

    // ================================================
    // EJERCICIO 1 - VULNERABILIDADES
    // ================================================

    if (id === 1) {
        const n = v.n;
        const p = v.p / 100;

        const a = binomial(n, 3, p);
        const b = binomialAcumulada(n, 2, p);
        const c = 1 - binomialAcumulada(n, 3, p);
        const d = 1 - binomial(n, 0, p);

        respuestas = [
            respuesta(
                "a) Exactamente 3 componentes vulnerables",
                `C(${n},3) × ${p}³ × (1-${p})^(${n}-3)`,
                a,
                "Probabilidad de encontrar exactamente tres componentes vulnerables."
            ),
            respuesta(
                "b) Como máximo 2 componentes vulnerables",
                "P(X≤2) = P(0) + P(1) + P(2)",
                b,
                "Incluye cero, uno o dos componentes vulnerables."
            ),
            respuesta(
                "c) Suspensión del lanzamiento",
                "P(X≥4) = 1 - P(X≤3)",
                c,
                "La política se activa con cuatro o más componentes vulnerables."
            ),
            respuesta(
                "d) Al menos un componente vulnerable",
                `1 - (1-${p})^${n}`,
                d,
                "Se calcula utilizando el complemento."
            ),
            respuesta(
                "e) Riesgo máximo permitido del 10%",
                `Riesgo calculado: ${porcentaje(c)}`,
                c,
                decision(
                    c <= 0.10,
                    "Sí cumple el criterio.",
                    "No cumple el criterio."
                ),
                "decision"
            ),
            respuesta(
                "f) Biblioteca vulnerable compartida",
                "Supuesto: independencia",
                null,
                "Si varios componentes utilizan una misma biblioteca vulnerable, las fallas pueden estar relacionadas y la distribución binomial independiente podría dejar de ser adecuada.",
                "texto"
            )
        ];

        for (let k = 0; k <= Math.min(n, 20); k++) {
            grafica.push({
                x: k,
                y: binomial(n, k, p)
            });
        }

        simulacion = {
            evento: x => x >= 4,
            teorica: c,
            generar: () => aleatorioBinomial(n, p),
            nombre: "Cuatro o más componentes vulnerables"
        };

        tituloGrafica = "Número de componentes vulnerables";
    }

    // ================================================
    // EJERCICIO 2 - RECUPERACIÓN DE PAQUETES
    // ================================================

    if (id === 2) {
        const r = v.r;
        const p = v.p / 100;
        const m = v.m;

        const a = binomialNegativa(r, 7, p);
        const b = negativaAcumulada(r, m, p);
        const c = 1 - b;
        const d = binomialNegativa(r, r, p);

        respuestas = [
            respuesta(
                "a) Quinto éxito en el intento 7",
                `C(6,${r - 1}) × ${p}^${r} × (1-${p})^(7-${r})`,
                a,
                "Probabilidad de obtener el éxito requerido exactamente en el intento 7."
            ),
            respuesta(
                "b) Completar los éxitos en máximo 8 intentos",
                `P(X≤${m}) = suma desde k=${r} hasta ${m}`,
                b,
                "Probabilidad de completar la recuperación dentro del límite."
            ),
            respuesta(
                "c) Necesitar al menos 9 intentos",
                `P(X>${m}) = 1 - P(X≤${m})`,
                c,
                "Probabilidad de necesitar más intentos que los permitidos."
            ),
            respuesta(
                "d) Completar todos los éxitos sin fallar",
                `P(X=${r}) = ${p}^${r}`,
                d,
                "Todos los primeros intentos deben ser exitosos."
            ),
            respuesta(
                "e) Requisito mínimo del 95%",
                `Probabilidad obtenida: ${porcentaje(b)}`,
                b,
                decision(
                    b >= 0.95,
                    "Sí cumple el requisito.",
                    "No cumple el requisito."
                ),
                "decision"
            ),
            respuesta(
                "f) Congestión en la red",
                "Supuesto: intentos independientes",
                null,
                "Si la congestión provoca fallos consecutivos relacionados, la probabilidad de éxito puede cambiar y el modelo binomial negativo independiente dejaría de ser adecuado.",
                "texto"
            )
        ];

        const limite = Math.min(18, Math.max(m + 3, r + 7));

        for (let k = r; k <= limite; k++) {
            grafica.push({
                x: k,
                y: binomialNegativa(r, k, p)
            });
        }

        simulacion = {
            evento: x => x <= m,
            teorica: b,
            generar: () => aleatorioNegativa(r, p),
            nombre: `Completar ${r} éxitos en ${m} intentos`
        };

        tituloGrafica = "Intento en que se obtiene el éxito requerido";
    }

    // ================================================
    // EJERCICIO 3 - ALERTAS SOC
    // ================================================

    if (id === 3) {
        const tasa = v.base / 15;
        const lambda = tasa * 20;
        const lambda5 = tasa * 5;

        const b = poisson(12, lambda);
        const c = 1 - poissonAcumulada(15, lambda);
        const d = poissonAcumulada(3, lambda5);

        respuestas = [
            respuesta(
                "a) Promedio de alertas en 20 minutos",
                `${v.base} / 15 × 20`,
                lambda,
                "Número promedio de alertas esperadas.",
                "numero"
            ),
            respuesta(
                "b) Exactamente 12 alertas",
                `e^(-${decimal(lambda)}) × ${decimal(lambda)}^12 / 12!`,
                b,
                "Probabilidad de registrar exactamente doce alertas."
            ),
            respuesta(
                "c) Más de 15 alertas",
                "P(X>15) = 1 - P(X≤15)",
                c,
                "Probabilidad de activar la señal de riesgo elevado."
            ),
            respuesta(
                "d) Máximo 3 alertas en 5 minutos",
                `P(X≤3), lambda=${decimal(lambda5)}`,
                d,
                "Se utiliza el promedio ajustado a cinco minutos."
            ),
            respuesta(
                "e) Falsas alarmas inferiores al 5%",
                `Probabilidad: ${porcentaje(c)}`,
                c,
                decision(
                    c < 0.05,
                    "Sí cumple el límite.",
                    "No cumple. Conviene revisar el umbral."
                ),
                "decision"
            ),
            respuesta(
                "f) Aumento de alertas",
                "Más alertas no implica necesariamente un ataque",
                null,
                "Las alertas pueden aumentar por actividad legítima, actualizaciones, errores o cambios de configuración. Es necesario analizar su contexto.",
                "texto"
            )
        ];

        const limite = Math.min(
            30,
            Math.max(20, Math.ceil(lambda + 4 * Math.sqrt(lambda)))
        );

        for (let k = 0; k <= limite; k++) {
            grafica.push({
                x: k,
                y: poisson(k, lambda)
            });
        }

        simulacion = {
            evento: x => x > 15,
            teorica: c,
            generar: () => aleatorioPoisson(lambda),
            nombre: "Más de 15 alertas en 20 minutos"
        };

        tituloGrafica = "Cantidad de alertas en 20 minutos";
    }

    // ================================================
    // EJERCICIO 4 - SERVIDORES
    // ================================================

    if (id === 4) {
        const n = v.n;
        const p = v.p / 100;

        const a = binomial(n, 4, p);
        const b = binomialAcumulada(n, 3, p);
        const c = 1 - binomialAcumulada(n, 4, p);

        respuestas = [
            respuesta(
                "a) Exactamente 4 servidores fallan",
                `C(${n},4) × ${p}⁴ × (1-${p})^(${n}-4)`,
                a,
                "Probabilidad de cuatro servidores fallidos."
            ),
            respuesta(
                "b) Como máximo 3 servidores fallan",
                "P(X≤3) = P(0)+P(1)+P(2)+P(3)",
                b,
                "Probabilidad de mantener la operación normal."
            ),
            respuesta(
                "c) Al menos 5 servidores fallan",
                "P(X≥5) = 1 - P(X≤4)",
                c,
                "Probabilidad de cinco o más fallas."
            ),
            respuesta(
                "d) Disponibilidad mínima del 95%",
                `Disponibilidad calculada: ${porcentaje(b)}`,
                b,
                decision(
                    b >= 0.95,
                    "Sí cumple el requisito.",
                    "No cumple el requisito."
                ),
                "decision"
            ),
            respuesta(
                "e) Tener 20 servidores",
                "Una falla es posible, no segura",
                null,
                "La existencia de veinte servidores no significa que todos fallarán. Cada uno tiene una probabilidad individual de presentar fallas.",
                "texto"
            ),
            respuesta(
                "f) Suministro eléctrico compartido",
                "Dependencia entre fallas",
                null,
                "Un corte eléctrico puede afectar a varios servidores simultáneamente, invalidando el supuesto de independencia.",
                "texto"
            )
        ];

        for (let k = 0; k <= Math.min(n, 20); k++) {
            grafica.push({
                x: k,
                y: binomial(n, k, p)
            });
        }

        simulacion = {
            evento: x => x <= 3,
            teorica: b,
            generar: () => aleatorioBinomial(n, p),
            nombre: "Como máximo tres servidores fallidos"
        };

        tituloGrafica = "Número de servidores que fallan";
    }

    // ================================================
    // EJERCICIO 5 - API REST
    // ================================================

    if (id === 5) {
        const lambda = v.base / 3;

        const b = poisson(8, lambda);
        const c = 1 - poissonAcumulada(10, lambda);
        const d = poisson(0, lambda / 2);

        respuestas = [
            respuesta(
                "a) Promedio de solicitudes por minuto",
                `${v.base} / 3`,
                lambda,
                "Promedio de solicitudes esperado durante un minuto.",
                "numero"
            ),
            respuesta(
                "b) Exactamente 8 solicitudes",
                `e^(-${decimal(lambda)}) × ${decimal(lambda)}⁸ / 8!`,
                b,
                "Probabilidad de recibir ocho solicitudes."
            ),
            respuesta(
                "c) Activación de la alerta",
                "P(X>10) = 1 - P(X≤10)",
                c,
                "La alerta se activa a partir de once solicitudes."
            ),
            respuesta(
                "d) Ninguna solicitud en 30 segundos",
                `e^(-${decimal(lambda / 2)})`,
                d,
                "Se utiliza el promedio de medio minuto."
            ),
            respuesta(
                "e) ¿Es necesario revisar el umbral?",
                `Probabilidad de alerta: ${porcentaje(c)}`,
                c,
                decision(
                    c > 0.05,
                    "Sí. La probabilidad supera el 5%.",
                    "No es necesario según el criterio establecido."
                ),
                "decision"
            ),
            respuesta(
                "f) Conversión de unidades",
                "El promedio de 18 corresponde a 3 minutos",
                null,
                "Para calcular probabilidades de un minuto es necesario ajustar el promedio al intervalo correcto.",
                "texto"
            )
        ];

        const limite = Math.min(
            30,
            Math.max(17, Math.ceil(lambda + 4 * Math.sqrt(lambda)))
        );

        for (let k = 0; k <= limite; k++) {
            grafica.push({
                x: k,
                y: poisson(k, lambda)
            });
        }

        simulacion = {
            evento: x => x > 10,
            teorica: c,
            generar: () => aleatorioPoisson(lambda),
            nombre: "Más de diez solicitudes en un minuto"
        };

        tituloGrafica = "Solicitudes recibidas en un minuto";
    }

    // ================================================
    // EJERCICIO 6 - PRUEBAS DE SOFTWARE
    // ================================================

    if (id === 6) {
        const r = v.r;
        const p = v.p / 100;

        const a = binomialNegativa(r, 10, p);
        const b = negativaAcumulada(r, 8, p);
        const c = 1 - negativaAcumulada(r, 10, p);
        const d = 1 - b;

        respuestas = [
            respuesta(
                "a) Sexta prueba satisfactoria en intento 10",
                `C(9,${r - 1}) × ${p}^${r} × (1-${p})^(10-${r})`,
                a,
                "Probabilidad de alcanzar el éxito requerido exactamente en el décimo intento."
            ),
            respuesta(
                "b) Completar en máximo 8 intentos",
                `P(X≤8), éxitos requeridos=${r}`,
                b,
                "Probabilidad de completar la validación dentro del límite."
            ),
            respuesta(
                "c) Necesitar más de 10 intentos",
                "P(X>10) = 1 - P(X≤10)",
                c,
                "Probabilidad de superar diez pruebas."
            ),
            respuesta(
                "d) Riesgo de no completar en 8 intentos",
                "P(X>8) = 1 - P(X≤8)",
                d,
                "Probabilidad de no alcanzar la meta con los recursos disponibles."
            ),
            respuesta(
                "e) Número total de pruebas desconocido",
                "Cantidad de éxitos fija, intentos variables",
                null,
                "Cada prueba puede resultar satisfactoria o fallida; por lo tanto, no se conoce previamente el número de intentos necesarios.",
                "texto"
            ),
            respuesta(
                "f) Corrección de errores",
                "La probabilidad de éxito puede cambiar",
                null,
                "Al corregir errores, la probabilidad de éxito de las siguientes pruebas podría aumentar. Esto afecta los supuestos de la distribución.",
                "texto"
            )
        ];

        const limite = Math.min(22, Math.max(15, r + 8));

        for (let k = r; k <= limite; k++) {
            grafica.push({
                x: k,
                y: binomialNegativa(r, k, p)
            });
        }

        simulacion = {
            evento: x => x <= 8,
            teorica: b,
            generar: () => aleatorioNegativa(r, p),
            nombre: `Completar ${r} pruebas satisfactorias en ocho intentos`
        };

        tituloGrafica = "Intento en que se logra el éxito requerido";
    }

    // ================================================
    // EJERCICIO 7 - TIEMPO DE ESPERA
    // ================================================

    if (id === 7) {
        const lambda = v.rate / 60;

        const a = exponencialAcumulada(4, lambda);
        const b = Math.exp(-lambda * 10);

        const c =
            Math.exp(-lambda * 3) -
            Math.exp(-lambda * 8);

        const d = -Math.log(0.10) / lambda;
        const e = Math.exp(-lambda * 15);

        respuestas = [
            respuesta(
                "a) Mensaje antes de 4 segundos",
                `1 - e^(-${decimal(lambda)} × 4)`,
                a,
                "Probabilidad de recibir el siguiente mensaje antes de cuatro segundos."
            ),
            respuesta(
                "b) Esperar más de 10 segundos",
                `e^(-${decimal(lambda)} × 10)`,
                b,
                "Probabilidad de esperar más de diez segundos."
            ),
            respuesta(
                "c) Llegada entre 3 y 8 segundos",
                `e^(-${decimal(lambda)} × 3) - e^(-${decimal(lambda)} × 8)`,
                c,
                "Probabilidad de recibir el mensaje dentro de ese intervalo."
            ),
            respuesta(
                "d) Tiempo para alcanzar el 90%",
                `t = -ln(0.10) / ${decimal(lambda)}`,
                d,
                "Tiempo correspondiente al 90% de probabilidad acumulada.",
                "segundos"
            ),
            respuesta(
                "e) Más de 15 segundos sin mensajes",
                `e^(-${decimal(lambda)} × 15)`,
                e,
                "Esta situación es poco frecuente bajo las condiciones normales del modelo."
            ),
            respuesta(
                "f) Unidades de tiempo y lotes",
                "La tasa debe corresponder a segundos",
                null,
                "Es necesario utilizar unidades compatibles. Las llegadas programadas en lotes pueden violar la independencia y la tasa constante.",
                "texto"
            )
        ];

        for (let t = 0; t <= 30; t++) {
            grafica.push({
                x: t,
                y: lambda * Math.exp(-lambda * t)
            });
        }

        simulacion = {
            evento: x => x < 4,
            teorica: a,
            generar: () => aleatorioExponencial(lambda),
            nombre: "Siguiente mensaje antes de cuatro segundos"
        };

        tituloGrafica = "Densidad del tiempo de espera en segundos";
    }

    // ================================================
    // EJERCICIO 8 - BASE DE DATOS
    // ================================================

    if (id === 8) {
        const media = v.mu;
        const desviacion = v.sd;

        const a =
            1 - normalAcumulada(300, media, desviacion);

        const b =
            normalAcumulada(280, media, desviacion) -
            normalAcumulada(210, media, desviacion);

        const c = normalAcumulada(200, media, desviacion);

        const d =
            media + 1.6448536269514722 * desviacion;

        const e = 1 - a;

        const f = normalAcumulada(300, 220, 55);

        respuestas = [
            respuesta(
                "a) Consulta tarda más de 300 ms",
                `1 - Φ((300-${media})/${desviacion})`,
                a,
                "Probabilidad de superar el límite de 300 milisegundos."
            ),
            respuesta(
                "b) Respuesta entre 210 y 280 ms",
                `Φ((280-${media})/${desviacion}) - Φ((210-${media})/${desviacion})`,
                b,
                "Probabilidad de responder dentro de ese intervalo."
            ),
            respuesta(
                "c) Consulta responde antes de 200 ms",
                `Φ((200-${media})/${desviacion})`,
                c,
                "Porcentaje de consultas con respuesta inferior a 200 milisegundos."
            ),
            respuesta(
                "d) Percentil 95",
                `${media} + 1.64485 × ${desviacion}`,
                d,
                "Tiempo de respuesta correspondiente al percentil 95.",
                "ms"
            ),
            respuesta(
                "e) Cumplimiento del SLA del 95%",
                `P(X≤300) = ${porcentaje(e)}`,
                e,
                decision(
                    e >= 0.95,
                    "Sí cumple el SLA.",
                    "No cumple el SLA."
                ),
                "decision"
            ),
            respuesta(
                "f) Media 220 ms y desviación 55 ms",
                `Φ((300-220)/55) = ${porcentaje(f)}`,
                f,
                decision(
                    f >= 0.95,
                    "Sí cumpliría el SLA.",
                    "No cumpliría el SLA. La mayor dispersión perjudica el cumplimiento."
                ),
                "decision"
            )
        ];

        for (let i = 0; i <= 30; i++) {
            const x =
                Math.max(0, media - 3 * desviacion) +
                i * (6 * desviacion / 30);

            const z = (x - media) / desviacion;

            grafica.push({
                x: Math.round(x),
                y: Math.exp(-0.5 * z * z) /
                    (desviacion * Math.sqrt(2 * Math.PI))
            });
        }

        simulacion = {
            evento: x => x <= 300,
            teorica: e,
            generar: () => aleatorioNormal(media, desviacion),
            nombre: "Consultas de 300 milisegundos o menos"
        };

        tituloGrafica = "Densidad de los tiempos de respuesta";
    }

    return {
        respuestas,
        grafica,
        simulacion,
        tituloGrafica
    };
}

// =====================================================
// 10. FUNCIONES PARA GENERAR DATOS ALEATORIOS
// =====================================================

function aleatorioBinomial(n, p) {
    let exitos = 0;

    for (let i = 0; i < n; i++) {
        if (Math.random() < p) exitos++;
    }

    return exitos;
}

function aleatorioNegativa(r, p) {
    let intentos = 0;
    let exitos = 0;

    while (exitos < r && intentos < 100000) {
        intentos++;

        if (Math.random() < p) {
            exitos++;
        }
    }

    return intentos;
}

function aleatorioPoisson(lambda) {
    if (lambda === 0) return 0;

    let k = 0;
    let producto = 1;

    const limite = Math.exp(-lambda);

    do {
        k++;
        producto *= Math.random();
    } while (producto > limite);

    return k - 1;
}

function aleatorioExponencial(lambda) {
    return -Math.log(1 - Math.random()) / lambda;
}

function aleatorioNormal(media, desviacion) {
    const u = Math.max(
        Math.random(),
        Number.MIN_VALUE
    );

    const z =
        Math.sqrt(-2 * Math.log(u)) *
        Math.cos(2 * Math.PI * Math.random());

    return media + desviacion * z;
}

// =====================================================
// 11. NAVEGACIÓN DEL SISTEMA
// =====================================================

let ejercicioActual = 0;
let ultimoResultado = null;

const menu = elemento("menu");
const tarjetas = elemento("tarjetas");

// Crear menú y tarjetas automáticamente

ejercicios.forEach(ejercicio => {

    const botonMenu = document.createElement("button");

    botonMenu.className = "nav-btn";
    botonMenu.textContent = "Ejercicio " + ejercicio.id;
    botonMenu.dataset.ejercicio = ejercicio.id;

    menu.appendChild(botonMenu);

    const tarjeta = document.createElement("article");

    tarjeta.className = "tarjeta";

    if ([2, 6, 7].includes(ejercicio.id)) {
        tarjeta.classList.add("destacado");
    }

    const etiqueta = [2, 6, 7].includes(ejercicio.id)
        ? " · VIDEO" : "";

    tarjeta.innerHTML = `
        <span class="mini">
            EJERCICIO ${ejercicio.id}${etiqueta}
        </span>

        <h3>${ejercicio.titulo}</h3>
        <p>${ejercicio.distribucion}</p>

        <button class="boton" type="button">
            Abrir ejercicio
        </button>
    `;

    tarjeta.querySelector("button").addEventListener(
        "click",
        () => abrirEjercicio(ejercicio.id)
    );

    tarjetas.appendChild(tarjeta);
});

// Menú lateral

menu.addEventListener("click", evento => {
    const boton = evento.target.closest("[data-ejercicio]");

    if (boton) {
        abrirEjercicio(Number(boton.dataset.ejercicio));
    }
});

// Botones principales

elemento("volver").addEventListener(
    "click",
    () => abrirEjercicio(0)
);

elemento("calcular").addEventListener(
    "click",
    calcular
);

elemento("simular").addEventListener(
    "click",
    ejecutarSimulacion
);

// Abrir ejercicio

function abrirEjercicio(id) {
    ejercicioActual = id;

    elemento("inicio").classList.toggle(
        "oculto",
        id !== 0
    );

    elemento("vista-ejercicio").classList.toggle(
        "oculto",
        id === 0
    );

    document.querySelectorAll(".nav-btn").forEach(b => {
        b.classList.toggle(
            "activo",
            Number(b.dataset.ejercicio) === id
        );
    });

    if (id === 0) {
        window.scrollTo(0, 0);
        return;
    }

    const ejercicio = ejercicios[id - 1];

    elemento("tipo").textContent =
        `EJERCICIO ${id} · ${ejercicio.distribucion}`;

    elemento("titulo").textContent = ejercicio.titulo;

    elemento("enunciado").textContent =
        ejercicio.descripcion;

    const formulario = elemento("formulario");

    formulario.replaceChildren();

    ejercicio.campos.forEach(campo => {

        const [clave, titulo, valor, minimo, maximo] = campo;

        const etiqueta = document.createElement("label");
        etiqueta.textContent = titulo;

        const input = document.createElement("input");
        input.type = "number";
        input.id = "campo-" + clave;
        input.value = valor;
        input.min = minimo;
        input.max = maximo;

        input.step = ["n", "r", "m"].includes(clave)
            ? "1" : "any";

        etiqueta.appendChild(input);
        formulario.appendChild(etiqueta);
    });

    elemento("resultado-simulacion").replaceChildren();

    calcular();

    window.scrollTo(0, 0);
}

// =====================================================
// 12. LEER Y VALIDAR DATOS DEL FORMULARIO
// =====================================================

function leerDatos() {
    const ejercicio = ejercicios[ejercicioActual - 1];

    const datos = {};

    ejercicio.campos.forEach(campo => {

        const [clave, titulo, defecto, min, max] = campo;
        const input = elemento("campo-" + clave);
        const valor = Number(input.value);

        if (
            input.value.trim() === "" ||
            !Number.isFinite(valor) ||
            valor < min ||
            valor > max ||
            (
                ["n", "r", "m"].includes(clave) &&
                !Number.isInteger(valor)
            )
        ) {
            throw new Error(
                `Revisa el campo ${titulo}. ` +
                `Debe estar entre ${min} y ${max}.`
            );
        }

        datos[clave] = valor;
    });

    if (
        ejercicioActual === 2 &&
        datos.m < datos.r
    ) {
        throw new Error(
            "El máximo de intentos no puede ser menor " +
            "que los éxitos requeridos."
        );
    }

    return datos;
}

// =====================================================
// 13. MOSTRAR LOS RESULTADOS
// =====================================================

function calcular() {
    const contenedor = elemento("resultados");

    try {
        const datos = leerDatos();

        const resultado = resolverEjercicio(
            ejercicioActual,
            datos
        );

        ultimoResultado = resultado;

        contenedor.replaceChildren();

        resultado.respuestas.forEach(r => {

            const tarjeta = document.createElement("article");
            tarjeta.className = "respuesta";

            const titulo = document.createElement("h4");
            titulo.textContent = r.titulo;
            tarjeta.appendChild(titulo);

            if (r.formula) {
                const formula = document.createElement("div");
                formula.className = "formula";
                formula.textContent = r.formula;
                tarjeta.appendChild(formula);
            }

            if (r.tipo !== "texto") {
                const valor = document.createElement("strong");

                if (r.tipo === "numero") {
                    valor.textContent = decimal(r.valor);
                } else if (r.tipo === "segundos") {
                    valor.textContent =
                        r.valor.toFixed(4) + " segundos";
                } else if (r.tipo === "ms") {
                    valor.textContent =
                        r.valor.toFixed(4) + " ms";
                } else {
                    valor.textContent = porcentaje(r.valor);
                }

                tarjeta.appendChild(valor);
            }

            const explicacion = document.createElement("p");
            explicacion.textContent = r.explicacion;

            tarjeta.appendChild(explicacion);
            contenedor.appendChild(tarjeta);
        });

        elemento("descripcion-grafica").textContent =
            resultado.tituloGrafica;

        dibujarGrafica(resultado.grafica);

        elemento("resultado-simulacion").textContent =
            "Presiona el botón para ejecutar la simulación.";

    } catch (error) {

        ultimoResultado = null;
        contenedor.textContent = error.message;

        elemento("resultado-simulacion").textContent = "";

        const ctx = elemento("grafico").getContext("2d");

        ctx.clearRect(0, 0, 850, 330);
    }
}

// =====================================================
// 14. DIBUJAR GRÁFICAS EN CANVAS
// =====================================================

function dibujarGrafica(datos) {
    const canvas = elemento("grafico");
    const ctx = canvas.getContext("2d");

    const ancho = canvas.width;
    const alto = canvas.height;

    ctx.clearRect(0, 0, ancho, alto);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, ancho, alto);

    const izquierda = 58;
    const arriba = 24;
    const abajo = 43;
    const derecha = 18;

    const espacioX = ancho - izquierda - derecha;
    const espacioY = alto - arriba - abajo;

    const maximo = Math.max(
        ...datos.map(d => d.y),
        0.00001
    ) * 1.12;

    // Cuadrícula

    ctx.strokeStyle = "#cbd5e1";
    ctx.fillStyle = "#64748b";
    ctx.font = "12px Arial";

    for (let i = 0; i <= 4; i++) {
        const y = arriba + espacioY * (1 - i / 4);

        ctx.beginPath();
        ctx.moveTo(izquierda, y);
        ctx.lineTo(ancho - derecha, y);
        ctx.stroke();

        const valor = maximo * i / 4;

        ctx.fillText(
            valor.toFixed(maximo < 0.02 ? 3 : 2),
            5,
            y + 4
        );
    }

    // Barras

    const anchoBarra = espacioX / datos.length;

    datos.forEach((dato, i) => {

        const altura = dato.y / maximo * espacioY;

        const x = izquierda + i * anchoBarra;
        const y = arriba + espacioY - altura;

        ctx.fillStyle = "#2563eb";

        ctx.fillRect(
            x + 1,
            y,
            Math.max(1, anchoBarra - 2),
            altura
        );

        if (
            i % Math.ceil(datos.length / 12) === 0
        ) {
            ctx.fillStyle = "#64748b";

            ctx.fillText(
                String(dato.x),
                x + 1,
                alto - 19
            );
        }
    });

    ctx.fillStyle = "#334155";

    ctx.fillText(
        "Valor de la variable",
        ancho / 2 - 50,
        alto - 3
    );
}

// =====================================================
// 15. EJECUTAR SIMULACIÓN ALEATORIA
// =====================================================

function ejecutarSimulacion() {

    if (!ultimoResultado) return;

    const simulacion = ultimoResultado.simulacion;

    let exitos = 0;

    const repeticiones = 10000;

    for (let i = 0; i < repeticiones; i++) {

        const muestra = simulacion.generar();

        if (simulacion.evento(muestra)) {
            exitos++;
        }
    }

    const experimental = exitos / repeticiones;

    const contenedor =
        elemento("resultado-simulacion");

    contenedor.replaceChildren();

    const tarjeta = document.createElement("div");
    tarjeta.className = "respuesta";

    const titulo = document.createElement("h4");

    titulo.textContent =
        "Evento simulado: " + simulacion.nombre;

    const teorica = document.createElement("p");

    teorica.textContent =
        "Probabilidad teórica: " +
        porcentaje(simulacion.teorica);

    const observada = document.createElement("p");

    observada.textContent =
        "Probabilidad experimental: " +
        porcentaje(experimental);

    const frecuencia = document.createElement("p");

    frecuencia.textContent =
        `Frecuencia: ${exitos} de ${repeticiones} experimentos.`;

    const nota = document.createElement("p");

    nota.textContent =
        "Los resultados experimentales pueden variar " +
        "en cada ejecución debido al azar.";

    tarjeta.append(
        titulo,
        teorica,
        observada,
        frecuencia,
        nota
    );

    contenedor.appendChild(tarjeta);
}

// =====================================================
// 16. INICIALIZACIÓN
// =====================================================

abrirEjercicio(0);

console.log(
    "Simulador Estadístico I: sistema iniciado."
);
