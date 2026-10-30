// Algoritmo K-medoids (variante PAM simplificada)
// Distancia configurable (euclidiana, manhattan, minkowski)

function ejecutarKmedoids(matriz, k, maxIter, tipoDistancia, q) {
  if (maxIter === undefined) maxIter = 100;
  if (tipoDistancia === undefined) tipoDistancia = "euclidiana";
  if (q === undefined) q = 2;
  if (matriz.length === 0) return null;
  if (k < 1 || k > matriz.length) return null;

  var n = matriz.length;

  var indicesMedoides = [];
  var disponibles = [];
  for (var i = 0; i < n; i++) disponibles.push(i);

  for (var c = 0; c < k; c++) {
    var pos = Math.floor(Math.random() * disponibles.length);
    indicesMedoides.push(disponibles[pos]);
    disponibles.splice(pos, 1);
  }

  var iteraciones = 0;
  var convergio = false;
  var asignaciones = [];

  for (var it = 0; it < maxIter; it++) {
    iteraciones = it + 1;

    var nuevasAsignaciones = [];
    for (var i2 = 0; i2 < n; i2++) {
      var mejor = 0;
      var mejorDist = calcularDistancia(matriz[i2], matriz[indicesMedoides[0]], tipoDistancia, q);
      for (var c2 = 1; c2 < k; c2++) {
        var dist = calcularDistancia(matriz[i2], matriz[indicesMedoides[c2]], tipoDistancia, q);
        if (dist < mejorDist) {
          mejorDist = dist;
          mejor = c2;
        }
      }
      nuevasAsignaciones.push(mejor);
    }

    var nuevosMedoides = indicesMedoides.slice();

    for (var c3 = 0; c3 < k; c3++) {
      var clusterActual = [];
      for (var i3 = 0; i3 < n; i3++) {
        if (nuevasAsignaciones[i3] === c3) clusterActual.push(i3);
      }

      if (clusterActual.length === 0) continue;

      var mejorIndice = indicesMedoides[c3];
      var mejorCosto = costoCluster(matriz, clusterActual, mejorIndice, tipoDistancia, q);

      for (var m = 0; m < clusterActual.length; m++) {
        var candidato = clusterActual[m];
        var costo = costoCluster(matriz, clusterActual, candidato, tipoDistancia, q);
        if (costo < mejorCosto) {
          mejorCosto = costo;
          mejorIndice = candidato;
        }
      }

      nuevosMedoides[c3] = mejorIndice;
    }

    var cambio = false;
    for (var c4 = 0; c4 < k; c4++) {
      if (nuevosMedoides[c4] !== indicesMedoides[c4]) {
        cambio = true;
        break;
      }
    }

    indicesMedoides = nuevosMedoides;
    asignaciones = nuevasAsignaciones;

    if (!cambio) {
      convergio = true;
      break;
    }
  }

  var asignacionesFinales = [];
  for (var i4 = 0; i4 < n; i4++) {
    var mejor2 = 0;
    var mejorDist2 = calcularDistancia(matriz[i4], matriz[indicesMedoides[0]], tipoDistancia, q);
    for (var c5 = 1; c5 < k; c5++) {
      var dist2 = calcularDistancia(matriz[i4], matriz[indicesMedoides[c5]], tipoDistancia, q);
      if (dist2 < mejorDist2) {
        mejorDist2 = dist2;
        mejor2 = c5;
      }
    }
    asignacionesFinales.push(mejor2);
  }

  var costoTotal = 0;
  for (var i5 = 0; i5 < n; i5++) {
    costoTotal += calcularDistancia(matriz[i5], matriz[indicesMedoides[asignacionesFinales[i5]]], tipoDistancia, q);
  }

  var tamanos = [];
  for (var c6 = 0; c6 < k; c6++) tamanos.push(0);
  for (var i6 = 0; i6 < asignacionesFinales.length; i6++) {
    tamanos[asignacionesFinales[i6]]++;
  }

  var medoides = [];
  for (var c7 = 0; c7 < k; c7++) {
    medoides.push(matriz[indicesMedoides[c7]].slice());
  }

  return {
    medoides: medoides,
    indicesMedoides: indicesMedoides,
    asignaciones: asignacionesFinales,
    iteraciones: iteraciones,
    convergio: convergio,
    costoTotal: costoTotal,
    tamanos: tamanos,
    k: k,
    n: n,
    tipoDistancia: tipoDistancia
  };
}

function costoCluster(matriz, indicesCluster, indiceMedoide, tipoDistancia, q) {
  var suma = 0;
  for (var i = 0; i < indicesCluster.length; i++) {
    suma += calcularDistancia(matriz[indicesCluster[i]], matriz[indiceMedoide], tipoDistancia, q);
  }
  return suma;
}