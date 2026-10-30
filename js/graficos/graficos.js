// Gráficos básicos con SVG nativo (sin librerías externas)

// Crea un SVG con las dimensiones indicadas
function crearSVG(ancho, alto) {
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", ancho);
  svg.setAttribute("height", alto);
  svg.setAttribute("style", "border:1px solid #ccc; background:#fff; margin-top:10px;");
  return svg;
}

// Añade un texto al SVG
function svgTexto(svg, x, y, texto, tamano, anclaje) {
  var t = document.createElementNS("http://www.w3.org/2000/svg", "text");
  t.setAttribute("x", x);
  t.setAttribute("y", y);
  t.setAttribute("font-size", tamano || 12);
  t.setAttribute("font-family", "Arial, sans-serif");
  t.setAttribute("fill", "#222");
  if (anclaje) t.setAttribute("text-anchor", anclaje);
  t.textContent = texto;
  svg.appendChild(t);
  return t;
}

// Añade una línea al SVG
function svgLinea(svg, x1, y1, x2, y2, color, grosor) {
  var l = document.createElementNS("http://www.w3.org/2000/svg", "line");
  l.setAttribute("x1", x1);
  l.setAttribute("y1", y1);
  l.setAttribute("x2", x2);
  l.setAttribute("y2", y2);
  l.setAttribute("stroke", color || "#333");
  l.setAttribute("stroke-width", grosor || 1);
  svg.appendChild(l);
  return l;
}

// Añade un rectángulo al SVG
function svgRect(svg, x, y, ancho, alto, color, borde) {
  var r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  r.setAttribute("x", x);
  r.setAttribute("y", y);
  r.setAttribute("width", ancho);
  r.setAttribute("height", alto);
  r.setAttribute("fill", color);
  if (borde) r.setAttribute("stroke", borde);
  svg.appendChild(r);
  return r;
}

// Añade un círculo al SVG
function svgCirculo(svg, cx, cy, r, color, borde) {
  var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  c.setAttribute("cx", cx);
  c.setAttribute("cy", cy);
  c.setAttribute("r", r);
  c.setAttribute("fill", color);
  if (borde) c.setAttribute("stroke", borde);
  svg.appendChild(c);
  return c;
}

// Escala lineal simple
function escalar(valor, min, max, rangoPixeles) {
  if (max === min) return rangoPixeles / 2;
  return ((valor - min) / (max - min)) * rangoPixeles;
}

// === HISTOGRAMA ===
function dibujarHistograma(valores, nombreVariable, numIntervalos) {
  var tabla = tablaFrecuenciasIntervalos(valores, numIntervalos);
  if (!tabla || tabla.intervalos.length === 0) return null;

  var ancho = 600;
  var alto = 350;
  var margen = { arriba: 30, derecha: 20, abajo: 60, izquierda: 60 };
  var anchoUtil = ancho - margen.izquierda - margen.derecha;
  var altoUtil = alto - margen.arriba - margen.abajo;

  var svg = crearSVG(ancho, alto);
  svgTexto(svg, ancho / 2, 20, "Histograma: " + nombreVariable, 14, "middle");

  var maxFrec = 0;
  for (var i = 0; i < tabla.intervalos.length; i++) {
    if (tabla.intervalos[i].absoluta > maxFrec) maxFrec = tabla.intervalos[i].absoluta;
  }
  if (maxFrec === 0) return svg;

  var anchoBarra = anchoUtil / tabla.intervalos.length;

  svgLinea(svg, margen.izquierda, margen.arriba, margen.izquierda, alto - margen.abajo, "#333", 1);
  svgLinea(svg, margen.izquierda, alto - margen.abajo, ancho - margen.derecha, alto - margen.abajo, "#333", 1);

  for (var j = 0; j < tabla.intervalos.length; j++) {
    var it = tabla.intervalos[j];
    var alturaBarra = (it.absoluta / maxFrec) * altoUtil;
    var x = margen.izquierda + j * anchoBarra + 2;
    var y = alto - margen.abajo - alturaBarra;
    svgRect(svg, x, y, anchoBarra - 4, alturaBarra, "#3498db", "#2980b9");

    if (it.absoluta > 0) {
      svgTexto(svg, x + (anchoBarra - 4) / 2, y - 3, String(it.absoluta), 10, "middle");
    }
    var etiqueta = formatearNumero(it.limiteInferior, 1) + "-" + formatearNumero(it.limiteSuperior, 1);
    svgTexto(svg, x + (anchoBarra - 4) / 2, alto - margen.abajo + 15, etiqueta, 9, "middle");
  }

  svgTexto(svg, 15, alto / 2, "Frecuencia", 11);
  return svg;
}

// === GRÁFICO DE BARRAS ===
function dibujarBarras(valores, nombreVariable) {
  var tabla = tablaFrecuencias(valores);
  if (!tabla || tabla.filas.length === 0) return null;

  var ancho = 600;
  var alto = 350;
  var margen = { arriba: 30, derecha: 20, abajo: 60, izquierda: 60 };
  var anchoUtil = ancho - margen.izquierda - margen.derecha;
  var altoUtil = alto - margen.arriba - margen.abajo;

  var svg = crearSVG(ancho, alto);
  svgTexto(svg, ancho / 2, 20, "Gráfico de barras: " + nombreVariable, 14, "middle");

  var maxFrec = 0;
  for (var i = 0; i < tabla.filas.length; i++) {
    if (tabla.filas[i].absoluta > maxFrec) maxFrec = tabla.filas[i].absoluta;
  }
  if (maxFrec === 0) return svg;

  var anchoBarra = anchoUtil / tabla.filas.length;

  svgLinea(svg, margen.izquierda, margen.arriba, margen.izquierda, alto - margen.abajo, "#333", 1);
  svgLinea(svg, margen.izquierda, alto - margen.abajo, ancho - margen.derecha, alto - margen.abajo, "#333", 1);

  for (var j = 0; j < tabla.filas.length; j++) {
    var f = tabla.filas[j];
    var alturaBarra = (f.absoluta / maxFrec) * altoUtil;
    var x = margen.izquierda + j * anchoBarra + 2;
    var y = alto - margen.abajo - alturaBarra;
    svgRect(svg, x, y, anchoBarra - 4, alturaBarra, "#1abc9c", "#16a085");

    if (f.absoluta > 0) {
      svgTexto(svg, x + (anchoBarra - 4) / 2, y - 3, String(f.absoluta), 10, "middle");
    }
    svgTexto(svg, x + (anchoBarra - 4) / 2, alto - margen.abajo + 15, String(f.valor), 10, "middle");
  }

  svgTexto(svg, 15, alto / 2, "Frecuencia", 11);
  return svg;
}

// === DIAGRAMA DE CAJA Y BIGOTES ===
function dibujarCaja(valores, nombreVariable) {
  var validos = valoresNumericosValidos(valores);
  if (validos.length < 2) return null;

  var cuart = cuartiles(validos);
  var q1 = cuart.q1;
  var q2 = cuart.q2;
  var q3 = cuart.q3;
  var iqr = q3 - q1;
  var limInf = q1 - 1.5 * iqr;
  var limSup = q3 + 1.5 * iqr;

  // Bigotes: valores más extremos dentro de los límites
  var min = null;
  var max = null;
  for (var i = 0; i < validos.length; i++) {
    var v = validos[i];
    if (v >= limInf && (min === null || v < min)) min = v;
    if (v <= limSup && (max === null || v > max)) max = v;
  }
  if (min === null) min = q1;
  if (max === null) max = q3;

  // Atípicos
  var atipicos = [];
  for (var j = 0; j < validos.length; j++) {
    if (validos[j] < limInf || validos[j] > limSup) atipicos.push(validos[j]);
  }

  var ancho = 400;
  var alto = 400;
  var margen = { arriba: 30, derecha: 40, abajo: 40, izquierda: 80 };
  var anchoUtil = ancho - margen.izquierda - margen.derecha;
  var altoUtil = alto - margen.arriba - margen.abajo;

  var svg = crearSVG(ancho, alto);
  svgTexto(svg, ancho / 2, 20, "Diagrama de caja: " + nombreVariable, 14, "middle");

  // Rango vertical
  var minEscala = Math.min(min, q1);
  var maxEscala = Math.max(max, q3);
  if (atipicos.length > 0) {
    minEscala = Math.min(minEscala, Math.min.apply(null, atipicos));
    maxEscala = Math.max(maxEscala, Math.max.apply(null, atipicos));
  }
  if (maxEscala === minEscala) maxEscala = minEscala + 1;

  var yDe = function (v) {
    return margen.arriba + altoUtil - escalar(v, minEscala, maxEscala, altoUtil);
  };

  // Eje vertical
  svgLinea(svg, margen.izquierda, margen.arriba, margen.izquierda, alto - margen.abajo, "#333", 1);

  var cx = margen.izquierda + anchoUtil / 2;
  var anchoCaja = 80;

  // Bigote superior (max)
  svgLinea(svg, cx, yDe(max), cx, yDe(q3), "#333", 1);
  svgLinea(svg, cx - 20, yDe(max), cx + 20, yDe(max), "#333", 1);

  // Caja (q3 a q1)
  svgRect(svg, cx - anchoCaja / 2, yDe(q3), anchoCaja, yDe(q1) - yDe(q3), "#aed6f1", "#2980b9");

  // Mediana (q2)
  svgLinea(svg, cx - anchoCaja / 2, yDe(q2), cx + anchoCaja / 2, yDe(q2), "#c0392b", 2);

  // Bigote inferior (min)
  svgLinea(svg, cx, yDe(q1), cx, yDe(min), "#333", 1);
  svgLinea(svg, cx - 20, yDe(min), cx + 20, yDe(min), "#333", 1);

  // Atípicos
  for (var k = 0; k < atipicos.length; k++) {
    svgCirculo(svg, cx, yDe(atipicos[k]), 3, "#e74c3c", "#c0392b");
  }

  // Etiquetas de los cuantiles
  svgTexto(svg, cx + anchoCaja / 2 + 5, yDe(max) + 3, "max=" + formatearNumero(max, 2), 10);
  svgTexto(svg, cx + anchoCaja / 2 + 5, yDe(q3) + 3, "Q3=" + formatearNumero(q3, 2), 10);
  svgTexto(svg, cx + anchoCaja / 2 + 5, yDe(q2) + 3, "Q2=" + formatearNumero(q2, 2), 10);
  svgTexto(svg, cx + anchoCaja / 2 + 5, yDe(q1) + 3, "Q1=" + formatearNumero(q1, 2), 10);
  svgTexto(svg, cx + anchoCaja / 2 + 5, yDe(min) + 3, "min=" + formatearNumero(min, 2), 10);

  return svg;
}

// === DISPERSIÓN (con o sin recta de regresión) ===
function dibujarDispersion(x, y, nombreX, nombreY, reg) {
  if (x.length !== y.length || x.length === 0) return null;

  var ancho = 600;
  var alto = 400;
  var margen = { arriba: 30, derecha: 20, abajo: 50, izquierda: 60 };
  var anchoUtil = ancho - margen.izquierda - margen.derecha;
  var altoUtil = alto - margen.arriba - margen.abajo;

  var svg = crearSVG(ancho, alto);
  var titulo = reg ? "Dispersión con recta ajustada" : "Dispersión";
  svgTexto(svg, ancho / 2, 20, titulo + ": " + nombreX + " vs " + nombreY, 14, "middle");

  var minX = Math.min.apply(null, x);
  var maxX = Math.max.apply(null, x);
  var minY = Math.min.apply(null, y);
  var maxY = Math.max.apply(null, y);
  if (maxX === minX) maxX = minX + 1;
  if (maxY === minY) maxY = minY + 1;

  // Ejes
  svgLinea(svg, margen.izquierda, margen.arriba, margen.izquierda, alto - margen.abajo, "#333", 1);
  svgLinea(svg, margen.izquierda, alto - margen.abajo, ancho - margen.derecha, alto - margen.abajo, "#333", 1);

  // Etiquetas de ejes
  svgTexto(svg, ancho / 2, alto - 10, nombreX, 12, "middle");
  svgTexto(svg, 15, alto / 2, nombreY, 12);

  // Puntos
  for (var i = 0; i < x.length; i++) {
    var px = margen.izquierda + escalar(x[i], minX, maxX, anchoUtil);
    var py = margen.arriba + altoUtil - escalar(y[i], minY, maxY, altoUtil);
    svgCirculo(svg, px, py, 4, "#2980b9", "#1c5980");
  }

  // Recta de regresión
  if (reg) {
    var x1 = minX;
    var y1 = reg.b0 + reg.b1 * x1;
    var x2 = maxX;
    var y2 = reg.b0 + reg.b1 * x2;
    var px1 = margen.izquierda + escalar(x1, minX, maxX, anchoUtil);
    var py1 = margen.arriba + altoUtil - escalar(y1, minY, maxY, altoUtil);
    var px2 = margen.izquierda + escalar(x2, minX, maxX, anchoUtil);
    var py2 = margen.arriba + altoUtil - escalar(y2, minY, maxY, altoUtil);
    svgLinea(svg, px1, py1, px2, py2, "#c0392b", 2);
  }

  return svg;
}

// === GRÁFICO DE CLUSTERS ===
function dibujarClusters(matriz, asignaciones, nombresVariables, centroides, esMedoide) {
  if (matriz.length === 0 || matriz[0].length < 2) return null;

  var ancho = 600;
  var alto = 400;
  var margen = { arriba: 30, derecha: 20, abajo: 50, izquierda: 60 };
  var anchoUtil = ancho - margen.izquierda - margen.derecha;
  var altoUtil = alto - margen.arriba - margen.abajo;

  var svg = crearSVG(ancho, alto);
  var titulo = esMedoide ? "Clusters (K-medoids)" : "Clusters (K-means)";
  svgTexto(svg, ancho / 2, 20, titulo + ": " + nombresVariables[0] + " vs " + nombresVariables[1], 14, "middle");

  // Solo las dos primeras variables
  var xs = [];
  var ys = [];
  for (var i = 0; i < matriz.length; i++) {
    xs.push(matriz[i][0]);
    ys.push(matriz[i][1]);
  }

  // Incluir centroides/medoides en el rango
  var todosX = xs.slice();
  var todosY = ys.slice();
  if (centroides) {
    for (var c = 0; c < centroides.length; c++) {
      todosX.push(centroides[c][0]);
      todosY.push(centroides[c][1]);
    }
  }

  var minX = Math.min.apply(null, todosX);
  var maxX = Math.max.apply(null, todosX);
  var minY = Math.min.apply(null, todosY);
  var maxY = Math.max.apply(null, todosY);
  if (maxX === minX) maxX = minX + 1;
  if (maxY === minY) maxY = minY + 1;

  svgLinea(svg, margen.izquierda, margen.arriba, margen.izquierda, alto - margen.abajo, "#333", 1);
  svgLinea(svg, margen.izquierda, alto - margen.abajo, ancho - margen.derecha, alto - margen.abajo, "#333", 1);

  svgTexto(svg, ancho / 2, alto - 10, nombresVariables[0], 12, "middle");
  svgTexto(svg, 15, alto / 2, nombresVariables[1], 12);

  // Colores por cluster
  var colores = ["#e74c3c", "#3498db", "#27ae60", "#f39c12", "#8e44ad", "#16a085", "#d35400", "#2c3e50"];

  // Puntos
  for (var j = 0; j < matriz.length; j++) {
    var px = margen.izquierda + escalar(xs[j], minX, maxX, anchoUtil);
    var py = margen.arriba + altoUtil - escalar(ys[j], minY, maxY, altoUtil);
    var color = colores[asignaciones[j] % colores.length];
    svgCirculo(svg, px, py, 4, color, "#222");
  }

  // Centroides o medoides
  if (centroides) {
    for (var c2 = 0; c2 < centroides.length; c2++) {
      var cx = margen.izquierda + escalar(centroides[c2][0], minX, maxX, anchoUtil);
      var cy = margen.arriba + altoUtil - escalar(centroides[c2][1], minY, maxY, altoUtil);
      // Marcador especial: cuadrado negro
      svgRect(svg, cx - 5, cy - 5, 10, 10, "#000", "#fff");
      svgTexto(svg, cx + 8, cy + 4, "C" + (c2 + 1), 10);
    }
  }

  return svg;
}