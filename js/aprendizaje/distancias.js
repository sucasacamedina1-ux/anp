// Distancias para clustering

function distanciaEuclidiana(a, b) {
  var suma = 0;
  for (var i = 0; i < a.length; i++) {
    suma += Math.pow(a[i] - b[i], 2);
  }
  return Math.sqrt(suma);
}

function distanciaManhattan(a, b) {
  var suma = 0;
  for (var i = 0; i < a.length; i++) {
    suma += Math.abs(a[i] - b[i]);
  }
  return suma;
}

function distanciaMinkowski(a, b, q) {
  if (q <= 0) return null;
  var suma = 0;
  for (var i = 0; i < a.length; i++) {
    suma += Math.pow(Math.abs(a[i] - b[i]), q);
  }
  return Math.pow(suma, 1 / q);
}

function calcularDistancia(a, b, tipo, q) {
  if (tipo === "manhattan") return distanciaManhattan(a, b);
  if (tipo === "minkowski") return distanciaMinkowski(a, b, q || 2);
  return distanciaEuclidiana(a, b);
}