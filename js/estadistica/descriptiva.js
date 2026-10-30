// Medidas descriptivas univariadas
// Convenciones:
//   - Varianza/desviación muestral: divisor n - 1
//   - Varianza/desviación poblacional: divisor n
//   - Cuantiles: interpolación lineal (tipo 7)
//   - Asimetría: coeficiente de Fisher (ajustado por sesgo)
//   - Curtosis: exceso de curtosis (curtosis - 3)

// Media aritmética
function media(valores) {
  if (valores.length === 0) return null;
  var suma = 0;
  for (var i = 0; i < valores.length; i++) suma += valores[i];
  return suma / valores.length;
}

// Mediana (requiere arreglo ordenado)
function mediana(valores) {
  if (valores.length === 0) return null;
  var ordenados = valores.slice().sort(function (a, b) { return a - b; });
  var n = ordenados.length;
  if (n % 2 === 1) {
    return ordenados[(n - 1) / 2];
  } else {
    return (ordenados[n / 2 - 1] + ordenados[n / 2]) / 2;
  }
}

// Moda (puede devolver: {tipo:"unica", valor}, {tipo:"multiple", valores}, {tipo:"ninguna"})
function moda(valores) {
  if (valores.length === 0) return { tipo: "ninguna", valores: [] };

  var conteo = {};
  for (var i = 0; i < valores.length; i++) {
    var v = valores[i];
    if (conteo[v] === undefined) conteo[v] = 0;
    conteo[v]++;
  }

  var maxFrec = 0;
  for (var clave in conteo) {
    if (conteo[clave] > maxFrec) maxFrec = conteo[clave];
  }

  // Si todos aparecen una sola vez, no hay moda
  if (maxFrec === 1) return { tipo: "ninguna", valores: [] };

  var modas = [];
  for (var clave2 in conteo) {
    if (conteo[clave2] === maxFrec) modas.push(Number(clave2));
  }

  if (modas.length === 1) return { tipo: "unica", valor: modas[0], valores: modas };
  return { tipo: "multiple", valores: modas };
}

// Mínimo
function minimo(valores) {
  if (valores.length === 0) return null;
  var m = valores[0];
  for (var i = 1; i < valores.length; i++) if (valores[i] < m) m = valores[i];
  return m;
}

// Máximo
function maximo(valores) {
  if (valores.length === 0) return null;
  var m = valores[0];
  for (var i = 1; i < valores.length; i++) if (valores[i] > m) m = valores[i];
  return m;
}

// Rango
function rango(valores) {
  if (valores.length === 0) return null;
  return maximo(valores) - minimo(valores);
}

// Varianza muestral (divisor n - 1)
function varianzaMuestral(valores) {
  if (valores.length < 2) return null;
  var m = media(valores);
  var suma = 0;
  for (var i = 0; i < valores.length; i++) {
    suma += Math.pow(valores[i] - m, 2);
  }
  return suma / (valores.length - 1);
}

// Varianza poblacional (divisor n)
function varianzaPoblacional(valores) {
  if (valores.length < 1) return null;
  var m = media(valores);
  var suma = 0;
  for (var i = 0; i < valores.length; i++) {
    suma += Math.pow(valores[i] - m, 2);
  }
  return suma / valores.length;
}

// Desviación estándar muestral
function desviacionMuestral(valores) {
  var v = varianzaMuestral(valores);
  return v === null ? null : Math.sqrt(v);
}

// Desviación estándar poblacional
function desviacionPoblacional(valores) {
  var v = varianzaPoblacional(valores);
  return v === null ? null : Math.sqrt(v);
}

// Coeficiente de variación (usa desviación muestral y media)
function coeficienteVariacion(valores) {
  var m = media(valores);
  var s = desviacionMuestral(valores);
  if (m === null || s === null || m === 0) return null;
  return (s / Math.abs(m)) * 100;
}

// Cuantil con interpolación lineal (tipo 7)
function cuantil(valores, p) {
  if (valores.length === 0) return null;
  if (p < 0 || p > 1) return null;
  var ordenados = valores.slice().sort(function (a, b) { return a - b; });
  var n = ordenados.length;
  if (n === 1) return ordenados[0];

  var posicion = (n - 1) * p;
  var inferior = Math.floor(posicion);
  var superior = Math.ceil(posicion);
  var fraccion = posicion - inferior;

  if (inferior === superior) return ordenados[inferior];
  return ordenados[inferior] + fraccion * (ordenados[superior] - ordenados[inferior]);
}

// Cuartiles (Q1, Q2, Q3)
function cuartiles(valores) {
  return {
    q1: cuantil(valores, 0.25),
    q2: cuantil(valores, 0.50),
    q3: cuantil(valores, 0.75)
  };
}

// Deciles (D1 a D9)
function deciles(valores) {
  var resultado = [];
  for (var i = 1; i <= 9; i++) {
    resultado.push(cuantil(valores, i / 10));
  }
  return resultado;
}

// Percentiles (P1 a P99) — devuelve solo los solicitados
function percentil(valores, p) {
  return cuantil(valores, p / 100);
}

// Asimetría (coeficiente de Fisher ajustado por sesgo)
function asimetria(valores) {
  var n = valores.length;
  if (n < 3) return null;
  var m = media(valores);
  var s = desviacionMuestral(valores);
  if (s === 0 || s === null) return null;

  var suma = 0;
  for (var i = 0; i < n; i++) {
    suma += Math.pow((valores[i] - m) / s, 3);
  }
  return (n / ((n - 1) * (n - 2))) * suma;
}

// Curtosis (exceso de curtosis, ajustada por sesgo)
function curtosis(valores) {
  var n = valores.length;
  if (n < 4) return null;
  var m = media(valores);
  var s = desviacionMuestral(valores);
  if (s === 0 || s === null) return null;

  var suma = 0;
  for (var i = 0; i < n; i++) {
    suma += Math.pow((valores[i] - m) / s, 4);
  }
  var parte1 = (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3));
  var parte2 = suma;
  var parte3 = (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
  return parte1 * parte2 - parte3;
}

// Resumen completo univariado
function resumenUnivariado(valores) {
  var n = valores.length;
  if (n === 0) return null;

  return {
    n: n,
    media: media(valores),
    mediana: mediana(valores),
    moda: moda(valores),
    minimo: minimo(valores),
    maximo: maximo(valores),
    rango: rango(valores),
    varianzaMuestral: varianzaMuestral(valores),
    varianzaPoblacional: varianzaPoblacional(valores),
    desviacionMuestral: desviacionMuestral(valores),
    desviacionPoblacional: desviacionPoblacional(valores),
    coeficienteVariacion: coeficienteVariacion(valores),
    cuartiles: cuartiles(valores),
    asimetria: asimetria(valores),
    curtosis: curtosis(valores)
  };
}