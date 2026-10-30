// Algoritmo K-means con distancia configurable (euclidiana, manhattan, minkowski)
// Variante: inicialización aleatoria simple
// Criterio de parada: centroides sin cambio o máximo de iteraciones

function extraerMatriz(columnas) {
  var filas = [];
  var n = columnas[0].valores.length;

  for (var i = 0; i < n; i++) {
    var fila = [];
    var valida = true;
    for (var j = 0; j < columnas.length; j++) {
      var v = columnas[j].valores[i];
      if (v === null || v === undefined || v === "") { valida = false; break; }
      var num = Number(v);
      if (isNaN(num)) { valida = false; break; }
      fila.push(num);
    }
    if (valida) filas.push(fila);
  }
  return filas;
}

function estandarizarMatriz(matriz) {
  if (matriz.length === 0) return matriz;
  var d = matriz[0].length;
  var medias = [];
  var desviaciones = [];

  for (var j = 0; j < d; j++) {
    var col = [];
    for (var i = 0; i < matriz.length; i++) col.push(matriz[i][j]);
    medias.push(media(col));
    desviaciones.push(desviacionMuestral(col));
  }

  var resultado = [];
  for (var i2 = 0; i2 < matriz.length; i2++) {
    var fila = [];
    for (var j2 = 0; j2 < d; j2++) {
      var desv = desviaciones[j2];
      if (desv === 0 || desv === null) {
        fila.push(0);
      } else {
        fila.push((matriz[i2][j2] - medias[j2]) / desv);
      }
    }
    resultado.push(fila);
  }
  return resultado;
}

function inicializarCentroides(matriz, k) {
  var indices = [];
  var disponibles = [];
  for (var i = 0; i < matriz.length; i++) disponibles.push(i);

  for (var c = 0; c < k; c++) {
    var pos = Math.floor(Math.random() * disponibles.length);
    indices.push(disponibles[pos]);
    disponibles.splice(pos, 1);
  }

  var centroides = [];
  for (var c2 = 0; c2 < indices.length; c2++) {
    centroides.push(matriz[indices[c2]].slice());
  }
  return centroides;
}

function ejecutarKmeans(matriz, k, maxIter, tipoDistancia, q) {
  if (maxIter === undefined) maxIter = 100;
  if (tipoDistancia === undefined) tipoDistancia = "euclidiana";
  if (q === undefined) q = 2;
  if (matriz.length === 0) return null;
  if (k < 1 || k > matriz.length) return null;

  var d = matriz[0].length;
  var centroides = inicializarCentroides(matriz, k);
  var asignaciones = [];
  var iteraciones = 0;
  var convergio = false;

  for (var it = 0; it < maxIter; it++) {
    iteraciones = it + 1;
    var nuevasAsignaciones = [];

    for (var i = 0; i < matriz.length; i++) {
      var mejor = 0;
      var mejorDist = calcularDistancia(matriz[i], centroides[0], tipoDistancia, q);
      for (var c = 1; c < k; c++) {
        var dist = calcularDistancia(matriz[i], centroides[c], tipoDistancia, q);
        if (dist < mejorDist) {
          mejorDist = dist;
          mejor = c;
        }
      }
      nuevasAsignaciones.push(mejor);
    }

    var nuevosCentroides = [];
    for (var c2 = 0; c2 < k; c2++) {
      var suma = [];
      for (var j = 0; j < d; j++) suma.push(0);
      var cuenta = 0;
      for (var i2 = 0; i2 < matriz.length; i2++) {
        if (nuevasAsignaciones[i2] === c2) {
          cuenta++;
          for (var j2 = 0; j2 < d; j2++) {
            suma[j2] += matriz[i2][j2];
          }
        }
      }
      if (cuenta === 0) {
        nuevosCentroides.push(centroides[c2].slice());
      } else {
        var nuevo = [];
        for (var j3 = 0; j3 < d; j3++) nuevo.push(suma[j3] / cuenta);
        nuevosCentroides.push(nuevo);
      }
    }

    var cambio = false;
    for (var c3 = 0; c3 < k; c3++) {
      if (calcularDistancia(centroides[c3], nuevosCentroides[c3], tipoDistancia, q) > 1e-9) {
        cambio = true;
        break;
      }
    }

    centroides = nuevosCentroides;
    asignaciones = nuevasAsignaciones;

    if (!cambio) {
      convergio = true;
      break;
    }
  }

  var wcss = 0;
  for (var i3 = 0; i3 < matriz.length; i3++) {
    var c4 = asignaciones[i3];
    wcss += Math.pow(calcularDistancia(matriz[i3], centroides[c4], tipoDistancia, q), 2);
  }

  var tamanos = [];
  for (var c5 = 0; c5 < k; c5++) tamanos.push(0);
  for (var i4 = 0; i4 < asignaciones.length; i4++) {
    tamanos[asignaciones[i4]]++;
  }

  return {
    centroides: centroides,
    asignaciones: asignaciones,
    iteraciones: iteraciones,
    convergio: convergio,
    wcss: wcss,
    tamanos: tamanos,
    k: k,
    n: matriz.length,
    tipoDistancia: tipoDistancia
  };
}