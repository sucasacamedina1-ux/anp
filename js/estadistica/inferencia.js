// Pruebas de hipótesis e intervalos de confianza
// Métodos implementados:
//   - Intervalo de confianza para la media (t de Student)
//   - Prueba t para una media
//   - Prueba t para dos medias independientes (Welch)
//   - Intervalo de confianza para una proporción (aproximación normal)
//   - Prueba t para la pendiente de una regresión simple

// Aproximación de la función gamma (Lanczos)
function gammaLanczos(z) {
  var g = 7;
  var C = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7
  ];
  if (z < 0.5) {
    return Math.PI / (Math.sin(Math.PI * z) * gammaLanczos(1 - z));
  }
  z -= 1;
  var x = C[0];
  for (var i = 1; i < g + 2; i++) {
    x += C[i] / (z + i);
  }
  var t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

// Función beta incompleta regularizada (para la t de Student)
function betaIncompletaRegularizada(x, a, b) {
  if (x < 0 || x > 1) return null;
  var bt = Math.exp(
    gammaLanczos(a + b) - gammaLanczos(a) - gammaLanczos(b) +
    a * Math.log(x) + b * Math.log(1 - x)
  );
  if (x < (a + 1) / (a + b + 2)) {
    return bt * betaContinua(x, a, b) / a;
  } else {
    return 1 - bt * betaContinua(1 - x, b, a) / b;
  }
}

// Fracción continua para la función beta incompleta
function betaContinua(x, a, b) {
  var maxIter = 200;
  var eps = 1e-10;
  var qab = a + b;
  var qap = a + 1;
  var qam = a - 1;
  var c = 1;
  var d = 1 - qab * x / qap;
  if (Math.abs(d) < 1e-30) d = 1e-30;
  d = 1 / d;
  var h = d;

  for (var m = 1; m <= maxIter; m++) {
    var m2 = 2 * m;
    var aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    h *= d * c;

    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    var del = d * c;
    h *= del;

    if (Math.abs(del - 1) < eps) break;
  }
  return h;
}

// p-valor de dos colas para la t de Student
function pValorT(t, gl) {
  if (gl <= 0) return null;
  var x = gl / (gl + t * t);
  var p = betaIncompletaRegularizada(x, gl / 2, 0.5);
  return p;
}

// Valor crítico t para un nivel de confianza y gl dados
// Búsqueda binaria sobre la CDF
function tCritico(nivelConfianza, gl) {
  var objetivo = 1 - (1 - nivelConfianza) / 2; // dos colas
  var lo = 0;
  var hi = 100;
  for (var i = 0; i < 100; i++) {
    var mid = (lo + hi) / 2;
    var x = gl / (gl + mid * mid);
    var cdf = 1 - betaIncompletaRegularizada(x, gl / 2, 0.5) / 2;
    if (cdf < objetivo) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// IC para la media (t de Student)
function intervaloConfianzaMedia(valores, nivel) {
  var n = valores.length;
  if (n < 2) return null;
  var m = media(valores);
  var s = desviacionMuestral(valores);
  var gl = n - 1;
  var tc = tCritico(nivel, gl);
  var error = tc * s / Math.sqrt(n);
  return {
    media: m,
    limiteInferior: m - error,
    limiteSuperior: m + error,
    margenError: error,
    nivel: nivel,
    gl: gl,
    n: n
  };
}

// Prueba t para una media (H0: mu = mu0)
function pruebaTUnaMedia(valores, mu0, nivel) {
  var n = valores.length;
  if (n < 2) return null;
  var m = media(valores);
  var s = desviacionMuestral(valores);
  if (s === 0) return null;
  var gl = n - 1;
  var t = (m - mu0) / (s / Math.sqrt(n));
  var p = pValorT(t, gl);
  var tc = tCritico(nivel, gl);
  return {
    t: t,
    gl: gl,
    p: p,
    tCritico: tc,
    media: m,
    mu0: mu0,
    n: n,
    nivel: nivel
  };
}

// Prueba t para dos medias independientes (Welch)
function pruebaTDosMedias(x, y, nivel) {
  var n1 = x.length;
  var n2 = y.length;
  if (n1 < 2 || n2 < 2) return null;

  var m1 = media(x);
  var m2 = media(y);
  var s1 = desviacionMuestral(x);
  var s2 = desviacionMuestral(y);

  if (s1 === 0 && s2 === 0) return null;

  var v1 = s1 * s1 / n1;
  var v2 = s2 * s2 / n2;
  var t = (m1 - m2) / Math.sqrt(v1 + v2);

  // Grados de libertad de Welch
  var gl = Math.pow(v1 + v2, 2) / (Math.pow(v1, 2) / (n1 - 1) + Math.pow(v2, 2) / (n2 - 1));
  var p = pValorT(t, gl);
  var tc = tCritico(nivel, gl);

  var dif = m1 - m2;
  var error = tc * Math.sqrt(v1 + v2);

  return {
    t: t,
    gl: gl,
    p: p,
    tCritico: tc,
    media1: m1,
    media2: m2,
    diferencia: dif,
    limiteInferior: dif - error,
    limiteSuperior: dif + error,
    nivel: nivel,
    n1: n1,
    n2: n2
  };
}

// IC para una proporción (aproximación normal)
function intervaloConfianzaProporcion(exitos, total, nivel) {
  if (total === 0) return null;
  var p = exitos / total;
  // z para el nivel (aproximación)
  var z = zCritico(nivel);
  var error = z * Math.sqrt(p * (1 - p) / total);
  return {
    p: p,
    limiteInferior: Math.max(0, p - error),
    limiteSuperior: Math.min(1, p + error),
    margenError: error,
    nivel: nivel,
    n: total,
    exitos: exitos
  };
}

// Valor crítico z (normal estándar) para un nivel de confianza dado
function zCritico(nivel) {
  // Búsqueda binaria sobre la CDF normal
  var objetivo = 1 - (1 - nivel) / 2;
  var lo = 0;
  var hi = 10;
  for (var i = 0; i < 100; i++) {
    var mid = (lo + hi) / 2;
    var cdf = normalCDF(mid);
    if (cdf < objetivo) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// CDF de la normal estándar (aproximación de Zelen & Severo)
function normalCDF(z) {
  if (z < 0) return 1 - normalCDF(-z);
  var b1 = 0.319381530;
  var b2 = -0.356563782;
  var b3 = 1.781477937;
  var b4 = -1.821255978;
  var b5 = 1.330274429;
  var p = 0.2316419;
  var c = 0.39894228;
  var t = 1 / (1 + p * z);
  var poly = b1 * t + b2 * t * t + b3 * Math.pow(t, 3) + b4 * Math.pow(t, 4) + b5 * Math.pow(t, 5);
  return 1 - c * Math.exp(-z * z / 2) * poly;
}

// Prueba t para la pendiente de una regresión simple (H0: beta1 = 0)
function pruebaTPendiente(x, y, nivel) {
  var n = x.length;
  if (n < 3) return null;

  var reg = regresionSimple(x, y);
  if (reg === null) return null;

  var mx = media(x);
  var ssx = 0;
  for (var i = 0; i < n; i++) {
    ssx += Math.pow(x[i] - mx, 2);
  }
  if (ssx === 0) return null;

  var ssResid = 0;
  for (var j = 0; j < n; j++) {
    ssResid += Math.pow(reg.residuos[j], 2);
  }
  var gl = n - 2;
  var s2 = ssResid / gl;
  var seBeta1 = Math.sqrt(s2 / ssx);
  if (seBeta1 === 0) return null;

  var t = reg.b1 / seBeta1;
  var p = pValorT(t, gl);
  var tc = tCritico(nivel, gl);

  return {
    b1: reg.b1,
    seBeta1: seBeta1,
    t: t,
    gl: gl,
    p: p,
    tCritico: tc,
    limiteInferior: reg.b1 - tc * seBeta1,
    limiteSuperior: reg.b1 + tc * seBeta1,
    nivel: nivel,
    n: n
  };
}