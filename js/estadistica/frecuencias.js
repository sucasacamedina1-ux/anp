// Tablas de frecuencias

// Frecuencias para variable categórica o numérica discreta
function tablaFrecuencias(valores) {
  var conteo = {};
  var total = 0;

  for (var i = 0; i < valores.length; i++) {
    var v = valores[i];
    if (v === null || v === undefined || v === "") continue;
    if (conteo[v] === undefined) conteo[v] = 0;
    conteo[v]++;
    total++;
  }

  var filas = [];
  for (var clave in conteo) {
    filas.push({
      valor: isNaN(Number(clave)) ? clave : Number(clave),
      absoluta: conteo[clave],
      relativa: conteo[clave] / total,
      porcentual: (conteo[clave] / total) * 100
    });
  }

  // Ordenar por valor
  filas.sort(function (a, b) {
    if (typeof a.valor === "number" && typeof b.valor === "number") {
      return a.valor - b.valor;
    }
    return String(a.valor).localeCompare(String(b.valor));
  });

  // Acumuladas
  var acumulada = 0;
  var relAcumulada = 0;
  for (var j = 0; j < filas.length; j++) {
    acumulada += filas[j].absoluta;
    relAcumulada += filas[j].relativa;
    filas[j].acumulada = acumulada;
    filas[j].relativaAcumulada = relAcumulada;
  }

  return { filas: filas, total: total };
}

// Tabla de frecuencias por intervalos para variable numérica continua
function tablaFrecuenciasIntervalos(valores, numIntervalos) {
  var validos = [];
  for (var i = 0; i < valores.length; i++) {
    var v = valores[i];
    if (v === null || v === undefined || v === "") continue;
    var num = Number(v);
    if (!isNaN(num)) validos.push(num);
  }

  if (validos.length === 0) return null;

  var min = minimo(validos);
  var max = maximo(validos);
  var rango = max - min;

  if (numIntervalos === undefined || numIntervalos === null) {
    // Regla de Sturges
    numIntervalos = Math.ceil(1 + 3.322 * Math.log10(validos.length));
  }

  var amplitud = rango / numIntervalos;
  if (amplitud === 0) {
    // Todos los valores son iguales
    return {
      intervalos: [{
        limiteInferior: min,
        limiteSuperior: max,
        marcaClase: min,
        absoluta: validos.length,
        relativa: 1,
        porcentual: 100,
        acumulada: validos.length,
        relativaAcumulada: 1
      }],
      total: validos.length,
      numIntervalos: 1,
      amplitud: 0
    };
  }

  var intervalos = [];
  for (var k = 0; k < numIntervalos; k++) {
    var li = min + k * amplitud;
    var ls = li + amplitud;
    intervalos.push({
      limiteInferior: li,
      limiteSuperior: ls,
      marcaClase: (li + ls) / 2,
      absoluta: 0,
      relativa: 0,
      porcentual: 0,
      acumulada: 0,
      relativaAcumulada: 0
    });
  }

  // Contar
  for (var j = 0; j < validos.length; j++) {
    var val = validos[j];
    for (var k2 = 0; k2 < intervalos.length; k2++) {
      var esUltimo = (k2 === intervalos.length - 1);
      if (esUltimo) {
        if (val >= intervalos[k2].limiteInferior && val <= intervalos[k2].limiteSuperior) {
          intervalos[k2].absoluta++;
          break;
        }
      } else {
        if (val >= intervalos[k2].limiteInferior && val < intervalos[k2].limiteSuperior) {
          intervalos[k2].absoluta++;
          break;
        }
      }
    }
  }

  // Relativas y acumuladas
  var acum = 0;
  var relAcum = 0;
  for (var m = 0; m < intervalos.length; m++) {
    intervalos[m].relativa = intervalos[m].absoluta / validos.length;
    intervalos[m].porcentual = intervalos[m].relativa * 100;
    acum += intervalos[m].absoluta;
    relAcum += intervalos[m].relativa;
    intervalos[m].acumulada = acum;
    intervalos[m].relativaAcumulada = relAcum;
  }

  return {
    intervalos: intervalos,
    total: validos.length,
    numIntervalos: numIntervalos,
    amplitud: amplitud
  };
}