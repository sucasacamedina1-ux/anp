// Media, mediana y moda para datos agrupados por intervalos

function mediaAgrupada(intervalos) {
  var totalF = 0;
  var suma = 0;
  for (var i = 0; i < intervalos.length; i++) {
    totalF += intervalos[i].absoluta;
    suma += intervalos[i].marcaClase * intervalos[i].absoluta;
  }
  if (totalF === 0) return null;
  return suma / totalF;
}

function medianaAgrupada(intervalos) {
  var total = 0;
  for (var i = 0; i < intervalos.length; i++) {
    total += intervalos[i].absoluta;
  }
  if (total === 0) return null;

  var mitad = total / 2;
  var acum = 0;
  for (var j = 0; j < intervalos.length; j++) {
    var acumAnterior = acum;
    acum += intervalos[j].absoluta;
    if (acum >= mitad) {
      var li = intervalos[j].limiteInferior;
      var fi = intervalos[j].absoluta;
      var Fi_1 = acumAnterior;
      var A = intervalos[j].limiteSuperior - intervalos[j].limiteInferior;
      return li + ((mitad - Fi_1) / fi) * A;
    }
  }
  return null;
}

function modaAgrupada(intervalos) {
  if (!intervalos || intervalos.length === 0) return null;

  var maxFi = 0;
  var idx = 0;
  for (var i = 0; i < intervalos.length; i++) {
    if (intervalos[i].absoluta > maxFi) {
      maxFi = intervalos[i].absoluta;
      idx = i;
    }
  }
  if (maxFi === 0) return null;

  var fi = intervalos[idx].absoluta;
  var fi_1 = idx > 0 ? intervalos[idx - 1].absoluta : 0;
  var fi_next = idx < intervalos.length - 1 ? intervalos[idx + 1].absoluta : 0;
  var A = intervalos[idx].limiteSuperior - intervalos[idx].limiteInferior;
  var Li = intervalos[idx].limiteInferior;

  var denominador = (fi - fi_1) + (fi - fi_next);
  if (denominador === 0) return null;
  return Li + ((fi - fi_1) / denominador) * A;
}

function resumenAgrupado(intervalos) {
  return {
    media: mediaAgrupada(intervalos),
    mediana: medianaAgrupada(intervalos),
    moda: modaAgrupada(intervalos)
  };
}