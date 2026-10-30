// Presentación de resultados en el panel

function limpiarResultados() {
  var panel = document.getElementById("panel-resultados");
  if (panel) panel.innerHTML = "";
}

function mostrarTituloResultado(titulo) {
  var panel = document.getElementById("panel-resultados");
  if (!panel) return;
  var h = document.createElement("h3");
  h.textContent = titulo;
  panel.appendChild(h);
}

function mostrarSubtitulo(texto) {
  var panel = document.getElementById("panel-resultados");
  if (!panel) return;
  var h = document.createElement("h4");
  h.textContent = texto;
  panel.appendChild(h);
}

function mostrarParrafo(texto) {
  var panel = document.getElementById("panel-resultados");
  if (!panel) return;
  var p = document.createElement("p");
  p.textContent = texto;
  panel.appendChild(p);
}

function mostrarAdvertencia(texto) {
  var panel = document.getElementById("panel-resultados");
  if (!panel) return;
  var p = document.createElement("p");
  p.style.color = "#b00";
  p.textContent = "⚠ " + texto;
  panel.appendChild(p);
}

function formatearNumero(v, decimales) {
  if (v === null || v === undefined || isNaN(v)) return "—";
  if (decimales === undefined) decimales = 4;
  return Number(v).toFixed(decimales);
}

function mostrarTabla(encabezados, filas) {
  var panel = document.getElementById("panel-resultados");
  if (!panel) return;

  var tabla = document.createElement("table");
  var thead = document.createElement("thead");
  var trh = document.createElement("tr");
  for (var i = 0; i < encabezados.length; i++) {
    var th = document.createElement("th");
    th.textContent = encabezados[i];
    trh.appendChild(th);
  }
  thead.appendChild(trh);
  tabla.appendChild(thead);

  var tbody = document.createElement("tbody");
  for (var f = 0; f < filas.length; f++) {
    var tr = document.createElement("tr");
    for (var c = 0; c < filas[f].length; c++) {
      var td = document.createElement("td");
      td.textContent = filas[f][c];
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  tabla.appendChild(tbody);
  panel.appendChild(tabla);
}

function mostrarGrafico(svg) {
  var panel = document.getElementById("panel-resultados");
  if (!panel || !svg) return;
  panel.appendChild(svg);
}

// === UNIVARIADO ===

function mostrarResumenUnivariado(nombreVariable, resumen) {
  limpiarResultados();
  mostrarTituloResultado("Análisis univariado: " + nombreVariable);
  mostrarParrafo("Observaciones válidas (n): " + resumen.n);

  mostrarSubtitulo("Tendencia central");
  mostrarTabla(["Medida", "Valor"], [
    ["Media", formatearNumero(resumen.media)],
    ["Mediana", formatearNumero(resumen.mediana)],
    ["Moda", formatearModa(resumen.moda)]
  ]);

  mostrarSubtitulo("Dispersión");
  mostrarTabla(["Medida", "Valor"], [
    ["Mínimo", formatearNumero(resumen.minimo)],
    ["Máximo", formatearNumero(resumen.maximo)],
    ["Rango", formatearNumero(resumen.rango)],
    ["Varianza muestral (n-1)", formatearNumero(resumen.varianzaMuestral)],
    ["Varianza poblacional (n)", formatearNumero(resumen.varianzaPoblacional)],
    ["Desviación muestral", formatearNumero(resumen.desviacionMuestral)],
    ["Desviación poblacional", formatearNumero(resumen.desviacionPoblacional)],
    ["Coef. de variación (%)", formatearNumero(resumen.coeficienteVariacion, 2)]
  ]);

  mostrarSubtitulo("Posición (método: interpolación lineal, tipo 7)");
  mostrarTabla(["Cuantil", "Valor"], [
    ["Q1", formatearNumero(resumen.cuartiles.q1)],
    ["Q2 (mediana)", formatearNumero(resumen.cuartiles.q2)],
    ["Q3", formatearNumero(resumen.cuartiles.q3)]
  ]);

  mostrarSubtitulo("Forma");
  mostrarTabla(["Medida", "Valor"], [
    ["Asimetría (Fisher)", formatearNumero(resumen.asimetria)],
    ["Curtosis (exceso)", formatearNumero(resumen.curtosis)]
  ]);

  if (resumen.n < 2) mostrarAdvertencia("Con n < 2 no se puede calcular varianza muestral.");
  if (resumen.n < 3) mostrarAdvertencia("Con n < 3 no se puede calcular asimetría.");
  if (resumen.n < 4) mostrarAdvertencia("Con n < 4 no se puede calcular curtosis.");
  if (resumen.coeficienteVariacion === null && resumen.media === 0) {
    mostrarAdvertencia("La media es cero; el coeficiente de variación no es interpretable.");
  }
}

function formatearModa(m) {
  if (m.tipo === "ninguna") return "No existe moda única";
  if (m.tipo === "unica") return String(m.valor);
  if (m.tipo === "multiple") return "Multimodal: " + m.valores.join(", ");
  return "—";
}

function mostrarTablaFrecuencias(nombreVariable, tabla) {
  limpiarResultados();
  mostrarTituloResultado("Tabla de frecuencias: " + nombreVariable);
  mostrarParrafo("Total de observaciones: " + tabla.total);

  var encabezados = ["Valor", "Frec. absoluta", "Frec. relativa", "Frec. porcentual (%)", "Frec. acumulada", "Frec. rel. acumulada"];
  var filas = [];
  for (var i = 0; i < tabla.filas.length; i++) {
    var f = tabla.filas[i];
    filas.push([
      String(f.valor),
      String(f.absoluta),
      formatearNumero(f.relativa, 4),
      formatearNumero(f.porcentual, 2),
      String(f.acumulada),
      formatearNumero(f.relativaAcumulada, 4)
    ]);
  }
  mostrarTabla(encabezados, filas);
}

function mostrarTablaIntervalos(nombreVariable, tabla) {
  limpiarResultados();
  mostrarTituloResultado("Tabla de frecuencias por intervalos: " + nombreVariable);
  mostrarParrafo("Total de observaciones: " + tabla.total);
  mostrarParrafo("Número de intervalos: " + tabla.numIntervalos + " | Amplitud: " + formatearNumero(tabla.amplitud));

  var encabezados = ["Intervalo", "Marca de clase", "Frec. absoluta", "Frec. relativa", "Frec. porcentual (%)", "Frec. acumulada"];
  var filas = [];
  for (var i = 0; i < tabla.intervalos.length; i++) {
    var it = tabla.intervalos[i];
    var intervaloTexto = "[" + formatearNumero(it.limiteInferior, 2) + ", " + formatearNumero(it.limiteSuperior, 2) + ")";
    filas.push([
      intervaloTexto,
      formatearNumero(it.marcaClase, 2),
      String(it.absoluta),
      formatearNumero(it.relativa, 4),
      formatearNumero(it.porcentual, 2),
      String(it.acumulada)
    ]);
  }
  mostrarTabla(encabezados, filas);

  // Agregados (media, mediana, moda agrupadas)
  var agr = resumenAgrupado(tabla.intervalos);
  mostrarSubtitulo("Medidas para datos agrupados");
  mostrarTabla(["Medida", "Valor"], [
    ["Media agrupada", formatearNumero(agr.media)],
    ["Mediana agrupada", formatearNumero(agr.mediana)],
    ["Moda agrupada", formatearNumero(agr.moda)]
  ]);
}

// === MULTIVARIADO ===

function mostrarCovarianzaCorrelacion(nombreX, nombreY, pares, covM, covP, r) {
  limpiarResultados();
  mostrarTituloResultado("Covarianza y correlación");
  mostrarParrafo("Variables: " + nombreX + " y " + nombreY);
  mostrarParrafo("Observaciones válidas (pares completos): " + pares.n);

  mostrarTabla(["Medida", "Valor"], [
    ["Covarianza muestral (n-1)", formatearNumero(covM)],
    ["Covarianza poblacional (n)", formatearNumero(covP)],
    ["Correlación de Pearson (r)", formatearNumero(r)]
  ]);

  if (r === null) {
    mostrarAdvertencia("No se puede calcular la correlación (varianza cero o datos insuficientes).");
  } else {
    mostrarParrafo(interpretarCorrelacion(r));
    mostrarParrafo("Nota: correlación no implica causalidad.");
  }
}

function mostrarMatriz(titulo, nombres, matriz) {
  limpiarResultados();
  mostrarTituloResultado(titulo);
  var encabezados = [""].concat(nombres);
  var filas = [];
  for (var i = 0; i < matriz.length; i++) {
    var fila = [nombres[i]];
    for (var j = 0; j < matriz[i].length; j++) {
      fila.push(formatearNumero(matriz[i][j]));
    }
    filas.push(fila);
  }
  mostrarTabla(encabezados, filas);
}

// === REGRESIÓN ===

function mostrarRegresionSimple(nombreX, nombreY, reg) {
  limpiarResultados();
  mostrarTituloResultado("Regresión lineal simple");
  mostrarParrafo("Variable dependiente (Y): " + nombreY);
  mostrarParrafo("Variable independiente (X): " + nombreX);
  mostrarParrafo("Observaciones utilizadas: " + reg.n);

  mostrarSubtitulo("Coeficientes");
  mostrarTabla(["Parámetro", "Estimación"], [
    ["Intercepto (b0)", formatearNumero(reg.b0)],
    ["Pendiente (b1)", formatearNumero(reg.b1)]
  ]);

  mostrarSubtitulo("Ecuación ajustada");
  var signo = reg.b1 >= 0 ? " + " : " - ";
  mostrarParrafo("Y = " + formatearNumero(reg.b0) + signo + formatearNumero(Math.abs(reg.b1)) + " * X");

  mostrarSubtitulo("Bondad de ajuste");
  mostrarTabla(["Medida", "Valor"], [["R²", formatearNumero(reg.r2)]]);

  mostrarSubtitulo("Valores observados, estimados y residuos");
  var filas = [];
  for (var i = 0; i < reg.n; i++) {
    filas.push([String(i + 1), formatearNumero(reg.estimados[i]), formatearNumero(reg.residuos[i])]);
  }
  mostrarTabla(["#", "Estimado", "Residuo"], filas);
}

function mostrarRegresionMultiple(nombresX, nombreY, reg) {
  limpiarResultados();
  mostrarTituloResultado("Regresión lineal múltiple");
  mostrarParrafo("Variable dependiente (Y): " + nombreY);
  mostrarParrafo("Variables independientes: " + nombresX.join(", "));
  mostrarParrafo("Observaciones utilizadas: " + reg.n);

  mostrarSubtitulo("Coeficientes");
  var filas = [["Intercepto (b0)", formatearNumero(reg.coeficientes[0])]];
  for (var i = 0; i < nombresX.length; i++) {
    filas.push([nombresX[i] + " (b" + (i + 1) + ")", formatearNumero(reg.coeficientes[i + 1])]);
  }
  mostrarTabla(["Parámetro", "Estimación"], filas);

  mostrarSubtitulo("Ecuación del modelo");
  var ecuacion = "Y = " + formatearNumero(reg.coeficientes[0]);
  for (var j = 0; j < nombresX.length; j++) {
    var c = reg.coeficientes[j + 1];
    var signo = c >= 0 ? " + " : " - ";
    ecuacion += signo + formatearNumero(Math.abs(c)) + " * " + nombresX[j];
  }
  mostrarParrafo(ecuacion);

  mostrarSubtitulo("Bondad de ajuste");
  mostrarTabla(["Medida", "Valor"], [
    ["R²", formatearNumero(reg.r2)],
    ["R² ajustado", formatearNumero(reg.r2ajustado)]
  ]);

  if (reg.r2 === null) mostrarAdvertencia("No se pudo calcular R².");
}

// === INFERENCIA ===

function mostrarICMedia(nombre, ic) {
  limpiarResultados();
  mostrarTituloResultado("Intervalo de confianza para la media: " + nombre);
  mostrarParrafo("Nivel de confianza: " + (ic.nivel * 100) + "%");
  mostrarParrafo("n = " + ic.n + " | Grados de libertad = " + ic.gl);
  mostrarTabla(["Medida", "Valor"], [
    ["Media muestral", formatearNumero(ic.media)],
    ["Error estándar (margen)", formatearNumero(ic.margenError)],
    ["Límite inferior", formatearNumero(ic.limiteInferior)],
    ["Límite superior", formatearNumero(ic.limiteSuperior)]
  ]);
}

function mostrarPruebaTUnaMedia(nombre, res) {
  limpiarResultados();
  mostrarTituloResultado("Prueba t para una media: " + nombre);
  mostrarParrafo("H₀: μ = " + res.mu0);
  mostrarParrafo("H₁: μ ≠ " + res.mu0);
  mostrarParrafo("Nivel de significancia: " + (1 - res.nivel).toFixed(2));
  mostrarTabla(["Estadístico", "Valor"], [
    ["Media muestral", formatearNumero(res.media)],
    ["t calculado", formatearNumero(res.t)],
    ["Grados de libertad", String(res.gl)],
    ["p-valor (dos colas)", formatearNumero(res.p, 6)],
    ["t crítico", formatearNumero(res.tCritico)]
  ]);
  if (res.p !== null) {
    if (res.p < (1 - res.nivel)) mostrarParrafo("Se rechaza H₀.");
    else mostrarParrafo("No se rechaza H₀.");
  }
}

function mostrarPruebaTDosMedias(nombre1, nombre2, res) {
  limpiarResultados();
  mostrarTituloResultado("Prueba t para dos medias independientes (Welch)");
  mostrarParrafo("Grupo 1: " + nombre1 + " (n = " + res.n1 + ")");
  mostrarParrafo("Grupo 2: " + nombre2 + " (n = " + res.n2 + ")");
  mostrarParrafo("Nivel de confianza: " + (res.nivel * 100) + "%");
  mostrarTabla(["Estadístico", "Valor"], [
    ["Media grupo 1", formatearNumero(res.media1)],
    ["Media grupo 2", formatearNumero(res.media2)],
    ["Diferencia", formatearNumero(res.diferencia)],
    ["t calculado", formatearNumero(res.t)],
    ["Grados de libertad (Welch)", formatearNumero(res.gl, 2)],
    ["p-valor (dos colas)", formatearNumero(res.p, 6)],
    ["t crítico", formatearNumero(res.tCritico)],
    ["IC: límite inferior", formatearNumero(res.limiteInferior)],
    ["IC: límite superior", formatearNumero(res.limiteSuperior)]
  ]);
  if (res.p !== null) {
    if (res.p < (1 - res.nivel)) mostrarParrafo("Se rechaza H₀: las medias son diferentes.");
    else mostrarParrafo("No se rechaza H₀: no hay evidencia de diferencia.");
  }
}

function mostrarICProporcion(res) {
  limpiarResultados();
  mostrarTituloResultado("Intervalo de confianza para una proporción");
  mostrarParrafo("Nivel de confianza: " + (res.nivel * 100) + "%");
  mostrarParrafo("Éxitos: " + res.exitos + " | Total: " + res.n);
  mostrarTabla(["Medida", "Valor"], [
    ["Proporción muestral (p)", formatearNumero(res.p)],
    ["Margen de error", formatearNumero(res.margenError)],
    ["Límite inferior", formatearNumero(res.limiteInferior)],
    ["Límite superior", formatearNumero(res.limiteSuperior)]
  ]);
}

function mostrarPruebaPendiente(nombreX, nombreY, res) {
  limpiarResultados();
  mostrarTituloResultado("Prueba t para la pendiente de regresión");
  mostrarParrafo("Y: " + nombreY + " | X: " + nombreX);
  mostrarParrafo("H₀: β₁ = 0");
  mostrarParrafo("Nivel de confianza: " + (res.nivel * 100) + "%");
  mostrarTabla(["Estadístico", "Valor"], [
    ["Pendiente (b1)", formatearNumero(res.b1)],
    ["Error estándar", formatearNumero(res.seBeta1)],
    ["t calculado", formatearNumero(res.t)],
    ["Grados de libertad", String(res.gl)],
    ["p-valor (dos colas)", formatearNumero(res.p, 6)],
    ["t crítico", formatearNumero(res.tCritico)],
    ["IC: límite inferior", formatearNumero(res.limiteInferior)],
    ["IC: límite superior", formatearNumero(res.limiteSuperior)]
  ]);
  if (res.p !== null) {
    if (res.p < (1 - res.nivel)) mostrarParrafo("Se rechaza H₀: la pendiente es distinta de cero.");
    else mostrarParrafo("No se rechaza H₀: no hay relación lineal significativa.");
  }
}

// === CLUSTERING ===

function mostrarResultadoKmeans(nombresVariables, resultado, estandarizado) {
  limpiarResultados();
  mostrarTituloResultado("K-means");
  mostrarParrafo("Variables utilizadas: " + nombresVariables.join(", "));
  mostrarParrafo("Número de clusters (K): " + resultado.k);
  mostrarParrafo("Observaciones: " + resultado.n);
  mostrarParrafo("Iteraciones ejecutadas: " + resultado.iteraciones);
  mostrarParrafo("Criterio de parada: " + (resultado.convergio ? "centroides sin cambio" : "máximo de iteraciones alcanzado"));
  mostrarParrafo("Estandarización: " + (estandarizado ? "sí (media 0, desviación 1)" : "no"));
  mostrarParrafo("Tipo de distancia: " + (resultado.tipoDistancia || "euclidiana"));
  mostrarParrafo("Suma de cuadrados dentro de clusters (WCSS): " + formatearNumero(resultado.wcss));

  mostrarSubtitulo("Tamaño de cada cluster");
  var filasTam = [];
  for (var c = 0; c < resultado.k; c++) {
    filasTam.push(["Cluster " + (c + 1), String(resultado.tamanos[c])]);
  }
  mostrarTabla(["Cluster", "Observaciones"], filasTam);

  mostrarSubtitulo("Centroides");
  var encabezados = ["Cluster"].concat(nombresVariables);
  var filasC = [];
  for (var c2 = 0; c2 < resultado.k; c2++) {
    var fila = ["Cluster " + (c2 + 1)];
    for (var j = 0; j < resultado.centroides[c2].length; j++) {
      fila.push(formatearNumero(resultado.centroides[c2][j]));
    }
    filasC.push(fila);
  }
  mostrarTabla(encabezados, filasC);

  mostrarSubtitulo("Asignación de observaciones");
  var filasA = [];
  for (var i = 0; i < resultado.asignaciones.length; i++) {
    filasA.push([String(i + 1), "Cluster " + (resultado.asignaciones[i] + 1)]);
  }
  mostrarTabla(["Observación", "Cluster"], filasA);

  if (nombresVariables.length >= 2) {
    mostrarSubtitulo("Gráfico de clusters");
    var matriz = extraerMatrizParaGrafico(nombresVariables);
    if (matriz && matriz.length > 0) {
      var svg = dibujarClusters(matriz, resultado.asignaciones, nombresVariables, resultado.centroides, false);
      if (svg) mostrarGrafico(svg);
    }
  }

  if (nombresVariables.length > 2) {
    mostrarAdvertencia("Con más de 2 variables, el gráfico solo representa las 2 primeras.");
  }
  mostrarParrafo("Nota: el resultado puede depender de los centroides iniciales. K-means no garantiza el óptimo global.");
}

function mostrarResultadoKmedoids(nombresVariables, resultado, estandarizado) {
  limpiarResultados();
  mostrarTituloResultado("K-medoids (PAM simplificado)");
  mostrarParrafo("Variables utilizadas: " + nombresVariables.join(", "));
  mostrarParrafo("Número de clusters (K): " + resultado.k);
  mostrarParrafo("Observaciones: " + resultado.n);
  mostrarParrafo("Iteraciones ejecutadas: " + resultado.iteraciones);
  mostrarParrafo("Criterio de parada: " + (resultado.convergio ? "medoides sin cambio" : "máximo de iteraciones alcanzado"));
  mostrarParrafo("Estandarización: " + (estandarizado ? "sí" : "no"));
  mostrarParrafo("Tipo de distancia: " + (resultado.tipoDistancia || "euclidiana"));
  mostrarParrafo("Costo total (suma de distancias a medoides): " + formatearNumero(resultado.costoTotal));

  mostrarSubtitulo("Tamaño de cada cluster");
  var filasTam = [];
  for (var c = 0; c < resultado.k; c++) {
    filasTam.push(["Cluster " + (c + 1), String(resultado.tamanos[c])]);
  }
  mostrarTabla(["Cluster", "Observaciones"], filasTam);

  mostrarSubtitulo("Medoides (observaciones reales)");
  var encabezados = ["Cluster", "Índice obs."].concat(nombresVariables);
  var filasM = [];
  for (var c2 = 0; c2 < resultado.k; c2++) {
    var fila = ["Cluster " + (c2 + 1), String(resultado.indicesMedoides[c2] + 1)];
    for (var j = 0; j < resultado.medoides[c2].length; j++) {
      fila.push(formatearNumero(resultado.medoides[c2][j]));
    }
    filasM.push(fila);
  }
  mostrarTabla(encabezados, filasM);

  mostrarSubtitulo("Asignación de observaciones");
  var filasA = [];
  for (var i = 0; i < resultado.asignaciones.length; i++) {
    filasA.push([String(i + 1), "Cluster " + (resultado.asignaciones[i] + 1)]);
  }
  mostrarTabla(["Observación", "Cluster"], filasA);

  if (nombresVariables.length >= 2) {
    mostrarSubtitulo("Gráfico de clusters");
    var matriz = extraerMatrizParaGrafico(nombresVariables);
    if (matriz && matriz.length > 0) {
      var svg = dibujarClusters(matriz, resultado.asignaciones, nombresVariables, resultado.medoides, true);
      if (svg) mostrarGrafico(svg);
    }
  }

  if (nombresVariables.length > 2) {
    mostrarAdvertencia("Con más de 2 variables, el gráfico solo representa las 2 primeras.");
  }
  mostrarParrafo("Nota: el medoide es una observación real del conjunto de datos.");
}

function extraerMatrizParaGrafico(nombresVariables) {
  var cols = [];
  for (var i = 0; i < nombresVariables.length; i++) {
    for (var c = 0; c < datos.columnas.length; c++) {
      if (datos.columnas[c].nombre === nombresVariables[i]) {
        cols.push(datos.columnas[c]);
        break;
      }
    }
  }
  if (cols.length < 2) return null;
  return extraerMatriz([cols[0], cols[1]]);
}