// Covarianza, correlación de Pearson y matrices

// Covarianza muestral (divisor n - 1)
function covarianzaMuestral(x, y) {
  if (x.length !== y.length || x.length < 2) return null;
  var mx = media(x);
  var my = media(y);
  var suma = 0;
  for (var i = 0; i < x.length; i++) {
    suma += (x[i] - mx) * (y[i] - my);
  }
  return suma / (x.length - 1);
}

// Covarianza poblacional (divisor n)
function covarianzaPoblacional(x, y) {
  if (x.length !== y.length || x.length < 1) return null;
  var mx = media(x);
  var my = media(y);
  var suma = 0;
  for (var i = 0; i < x.length; i++) {
    suma += (x[i] - mx) * (y[i] - my);
  }
  return suma / x.length;
}

// Correlación de Pearson
function correlacionPearson(x, y) {
  if (x.length !== y.length || x.length < 2) return null;
  var cov = covarianzaMuestral(x, y);
  var sx = desviacionMuestral(x);
  var sy = desviacionMuestral(y);
  if (sx === 0 || sy === 0 || sx === null || sy === null) return null;
  return cov / (sx * sy);
}

// Extrae pares válidos (ambos numéricos) de dos columnas
function paresValidos(colX, colY) {
  var x = [];
  var y = [];
  var n = Math.min(colX.valores.length, colY.valores.length);
  for (var i = 0; i < n; i++) {
    var vx = colX.valores[i];
    var vy = colY.valores[i];
    if (vx === null || vx === undefined || vx === "") continue;
    if (vy === null || vy === undefined || vy === "") continue;
    var nx = Number(vx);
    var ny = Number(vy);
    if (isNaN(nx) || isNaN(ny)) continue;
    x.push(nx);
    y.push(ny);
  }
  return { x: x, y: y, n: x.length };
}

// Matriz de covarianzas (muestral) para un arreglo de columnas numéricas
function matrizCovarianzas(columnas) {
  var k = columnas.length;
  var matriz = [];
  for (var i = 0; i < k; i++) {
    matriz.push([]);
    for (var j = 0; j < k; j++) {
      if (i === j) {
        // Varianza muestral de la columna
        var vals = valoresNumericosValidos(columnas[i].valores);
        matriz[i].push(varianzaMuestral(vals));
      } else {
        var pares = paresValidos(columnas[i], columnas[j]);
        matriz[i].push(pares.n >= 2 ? covarianzaMuestral(pares.x, pares.y) : null);
      }
    }
  }
  return matriz;
}

// Matriz de correlaciones para un arreglo de columnas numéricas
function matrizCorrelaciones(columnas) {
  var k = columnas.length;
  var matriz = [];
  for (var i = 0; i < k; i++) {
    matriz.push([]);
    for (var j = 0; j < k; j++) {
      if (i === j) {
        matriz[i].push(1);
      } else {
        var pares = paresValidos(columnas[i], columnas[j]);
        matriz[i].push(pares.n >= 2 ? correlacionPearson(pares.x, pares.y) : null);
      }
    }
  }
  return matriz;
}

// Interpretación básica de una correlación
function interpretarCorrelacion(r) {
  if (r === null) return "No se puede calcular.";
  var abs = Math.abs(r);
  var direccion = r > 0 ? "positiva" : (r < 0 ? "negativa" : "nula");
  var intensidad = "";
  if (abs >= 0.9) intensidad = "muy fuerte";
  else if (abs >= 0.7) intensidad = "fuerte";
  else if (abs >= 0.5) intensidad = "moderada";
  else if (abs >= 0.3) intensidad = "débil";
  else intensidad = "muy débil o nula";
  return "Correlación " + direccion + " " + intensidad + " (r = " + formatearNumero(r, 4) + ").";
}