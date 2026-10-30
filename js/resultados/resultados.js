// Presentación de resultados en el panel

// =============================================================================
// NOTIFICACIONES (toasts) — P6
// Uso desde cualquier parte:
//   mostrarToast("Datos importados con éxito (25 filas)", "exito");
//   mostrarToast("Selecciona al menos 2 variables", "error");
// Tipos: "exito", "error", "info" (por defecto) y "aviso".
// Si una rama aún no tiene esta función: window.mostrarToast?.(mensaje, tipo)
// =============================================================================

var RES_TOAST_MAXIMO = 3;
var RES_TOAST_DURACION = 4000;

var RES_TOAST_TIPOS = {
  exito: { titulo: "Listo", icono: "M5 12.5l4.5 4.5L19 7.5" },
  error: { titulo: "Error", icono: "M12 7v6M12 16.5v.5M10.3 3.9L2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" },
  info: { titulo: "Información", icono: "M12 11v6M12 7.5v.5M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" },
  aviso: { titulo: "Atención", icono: "M12 8v5M12 16v.5M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" }
};

// Contenedor flotante de toasts (se crea una sola vez)
function contenedorToasts() {
  var contenedor = document.getElementById("res-toasts");
  if (contenedor) return contenedor;
  contenedor = document.createElement("div");
  contenedor.id = "res-toasts";
  contenedor.className = "res-toasts";
  contenedor.setAttribute("aria-live", "polite");
  contenedor.setAttribute("aria-relevant", "additions");
  document.body.appendChild(contenedor);
  return contenedor;
}

// Cierra un toast con animación de salida
function cerrarToast(toast) {
  if (!toast || toast.classList.contains("res-toast--saliendo")) return;
  clearTimeout(toast._temporizador);
  toast.classList.add("res-toast--saliendo");
  var quitar = function () { if (toast.parentNode) toast.parentNode.removeChild(toast); };
  toast.addEventListener("animationend", quitar);
  setTimeout(quitar, 400); // por si no hay animación (movimiento reducido)
}

// Muestra un aviso flotante; se cierra solo a los 4 s (se pausa con el mouse encima)
function mostrarToast(mensaje, tipo) {
  if (!RES_TOAST_TIPOS[tipo]) tipo = "info";
  var config = RES_TOAST_TIPOS[tipo];
  var contenedor = contenedorToasts();

  var toast = document.createElement("div");
  toast.className = "res-toast res-toast--" + tipo;
  if (tipo === "error") toast.setAttribute("role", "alert");

  var icono = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icono.setAttribute("viewBox", "0 0 24 24");
  icono.setAttribute("aria-hidden", "true");
  icono.setAttribute("class", "res-toast-icono");
  var trazo = document.createElementNS("http://www.w3.org/2000/svg", "path");
  trazo.setAttribute("d", config.icono);
  icono.appendChild(trazo);

  var cuerpo = document.createElement("div");
  cuerpo.className = "res-toast-cuerpo";
  var titulo = document.createElement("strong");
  titulo.textContent = config.titulo;
  var texto = document.createElement("span");
  texto.textContent = mensaje;
  cuerpo.appendChild(titulo);
  cuerpo.appendChild(texto);

  var cerrar = document.createElement("button");
  cerrar.type = "button";
  cerrar.className = "res-toast-cerrar";
  cerrar.setAttribute("aria-label", "Cerrar aviso");
  cerrar.textContent = "×";
  cerrar.addEventListener("click", function () { cerrarToast(toast); });

  toast.appendChild(icono);
  toast.appendChild(cuerpo);
  toast.appendChild(cerrar);
  contenedor.appendChild(toast);

  // Máximo 3 visibles: se cierra el más antiguo
  var visibles = contenedor.querySelectorAll(".res-toast:not(.res-toast--saliendo)");
  for (var i = 0; i < visibles.length - RES_TOAST_MAXIMO; i++) cerrarToast(visibles[i]);

  var programar = function () { toast._temporizador = setTimeout(function () { cerrarToast(toast); }, RES_TOAST_DURACION); };
  toast.addEventListener("mouseenter", function () { clearTimeout(toast._temporizador); });
  toast.addEventListener("mouseleave", programar);
  programar();
  return toast;
}

window.mostrarToast = mostrarToast;

function limpiarResultados() {
  var panel = document.getElementById("panel-resultados");
  if (panel) panel.innerHTML = "";
  var acciones = document.getElementById("res-acciones");
  if (acciones) acciones.style.display = "flex";
}

function restablecerResultados() {
  var panel = document.getElementById("panel-resultados");
  if (!panel) return;
  panel.innerHTML =
    '<div class="res-vacio">' +
      '<svg class="res-vacio-ilustracion" viewBox="0 0 120 96" aria-hidden="true" focusable="false">' +
        '<rect class="res-vacio-hoja" x="22" y="8" width="76" height="80" rx="8"/>' +
        '<path class="res-vacio-linea" d="M34 26h40M34 36h28"/>' +
        '<rect class="res-vacio-barra" x="36" y="58" width="10" height="18" rx="2"/>' +
        '<rect class="res-vacio-barra" x="52" y="50" width="10" height="26" rx="2"/>' +
        '<rect class="res-vacio-barra res-vacio-barra--acento" x="68" y="42" width="10" height="34" rx="2"/>' +
      '</svg>' +
      '<p class="res-vacio-titulo">Ejecuta un análisis o gráfico para ver el reporte aquí</p>' +
      '<p class="res-vacio-texto">Elige un análisis en Estadística, Aprendizaje no supervisado o Gráficos.</p>' +
    '</div>';
  var acciones = document.getElementById("res-acciones");
  if (acciones) acciones.style.display = "none";
  if (typeof window.mostrarToast === "function") {
    window.mostrarToast("Panel de resultados restablecido.", "info");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  var btnLimpiar = document.getElementById("btn-limpiar-resultados");
  if (btnLimpiar) btnLimpiar.addEventListener("click", restablecerResultados);

  var btnImprimir = document.getElementById("btn-imprimir-resultados");
  if (btnImprimir) btnImprimir.addEventListener("click", function () { window.print(); });
});

function mostrarTituloResultado(titulo) {
  var panel = document.getElementById("panel-resultados");
  if (!panel) return;
  var h = document.createElement("h3");
  h.className = "res-titulo";
  h.textContent = titulo;
  panel.appendChild(h);
}

function mostrarSubtitulo(texto) {
  var panel = document.getElementById("panel-resultados");
  if (!panel) return;
  var h = document.createElement("h4");
  h.className = "res-subtitulo";
  h.textContent = texto;
  panel.appendChild(h);
}

function mostrarParrafo(texto) {
  var panel = document.getElementById("panel-resultados");
  if (!panel) return;
  var p = document.createElement("p");
  p.className = "res-parrafo";
  p.textContent = texto;
  panel.appendChild(p);
}

function mostrarAdvertencia(texto) {
  var panel = document.getElementById("panel-resultados");
  if (!panel) return;
  var p = document.createElement("p");
  p.className = "res-aviso";
  p.setAttribute("role", "note");
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

  // Columnas numéricas: todas sus celdas son números (o "—")
  var columnaNumerica = [];
  for (var col = 0; col < encabezados.length; col++) {
    var numerica = filas.length > 0;
    for (var fil = 0; fil < filas.length; fil++) {
      if (!esTextoNumerico(filas[fil][col])) { numerica = false; break; }
    }
    columnaNumerica.push(numerica);
  }

  var contenedor = document.createElement("div");
  contenedor.className = "res-tabla-contenedor";
  contenedor.setAttribute("tabindex", "0");
  contenedor.setAttribute("role", "region");
  contenedor.setAttribute("aria-label", "Tabla de resultados" + (encabezados[0] ? ": " + encabezados[0] : ""));

  var tabla = document.createElement("table");
  tabla.className = "res-tabla";
  var thead = document.createElement("thead");
  var trh = document.createElement("tr");
  for (var i = 0; i < encabezados.length; i++) {
    var th = document.createElement("th");
    th.setAttribute("scope", "col");
    if (columnaNumerica[i]) th.className = "res-num";
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
      if (columnaNumerica[c]) td.className = "res-num";
      td.textContent = filas[f][c];
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  tabla.appendChild(tbody);
  contenedor.appendChild(tabla);
  panel.appendChild(contenedor);
}

// ¿El texto de una celda es un número (o el guion de "sin valor")?
function esTextoNumerico(texto) {
  return /^\s*([-+−]?(\d+([.,]\d+)?|[.,]\d+)(e[-+]?\d+)?\s*%?|—)\s*$/i.test(String(texto));
}

// === TARJETAS KPI, DECISIÓN E INTERPRETACIÓN (P6) ===

// Iconos de las tarjetas KPI (trazos SVG de 24×24)
var RES_ICONOS = {
  conteo: "M4 6h16M4 12h16M4 18h10",
  centro: "M12 3v18M5 8h14M7 16h10",
  dispersion: "M4 12h16M8 8l-4 4 4 4M16 8l4 4-4 4",
  relacion: "M4 20L20 4M6 10a2 2 0 1 0 0-.01M18 14a2 2 0 1 0 0-.01",
  ajuste: "M4 20h16M6 16l4-5 3 3 5-7",
  prueba: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3",
  grupos: "M7 9a2.5 2.5 0 1 0 0-.01M17 7a2.5 2.5 0 1 0 0-.01M12 17a2.5 2.5 0 1 0 0-.01",
  intervalo: "M4 12h16M7 8v8M17 8v8M12 10v4"
};

// Valor corto para KPIs: sin ceros sobrantes; p-valores diminutos como "< 0.0001"
function formatearKPI(v, decimales) {
  if (v === null || v === undefined || isNaN(v)) return "—";
  if (decimales === undefined) decimales = 4;
  var minimo = Math.pow(10, -decimales);
  if (v !== 0 && Math.abs(v) < minimo) return (v < 0 ? "> −" : "< ") + minimo.toFixed(decimales);
  return String(Number(Number(v).toFixed(decimales)));
}

// Fila de tarjetas KPI: [{etiqueta, valor, icono, nota}]
function mostrarKPIs(items) {
  var panel = document.getElementById("panel-resultados");
  if (!panel) return;
  var lista = document.createElement("dl");
  lista.className = "res-kpis";
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var tarjeta = document.createElement("div");
    tarjeta.className = "res-kpi";

    var icono = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icono.setAttribute("viewBox", "0 0 24 24");
    icono.setAttribute("aria-hidden", "true");
    icono.setAttribute("class", "res-kpi-icono");
    var trazo = document.createElementNS("http://www.w3.org/2000/svg", "path");
    trazo.setAttribute("d", RES_ICONOS[item.icono] || RES_ICONOS.centro);
    icono.appendChild(trazo);

    var dt = document.createElement("dt");
    dt.className = "res-kpi-etiqueta";
    dt.textContent = item.etiqueta;
    var dd = document.createElement("dd");
    dd.className = "res-kpi-valor";
    dd.textContent = item.valor;

    tarjeta.appendChild(icono);
    tarjeta.appendChild(dt);
    tarjeta.appendChild(dd);
    if (item.nota) {
      var nota = document.createElement("dd");
      nota.className = "res-kpi-nota";
      nota.textContent = item.nota;
      tarjeta.appendChild(nota);
    }
    lista.appendChild(tarjeta);
  }
  panel.appendChild(lista);
}

// Bloque de interpretación automática (nota destacada)
function mostrarInterpretacion(texto) {
  var panel = document.getElementById("panel-resultados");
  if (!panel || !texto) return;
  var bloque = document.createElement("div");
  bloque.className = "res-interpretacion";
  var titulo = document.createElement("p");
  titulo.className = "res-interpretacion-titulo";
  titulo.textContent = "Interpretación";
  var cuerpo = document.createElement("p");
  cuerpo.className = "res-interpretacion-texto";
  cuerpo.textContent = texto;
  bloque.appendChild(titulo);
  bloque.appendChild(cuerpo);
  panel.appendChild(bloque);
}

// Badge de decisión de la prueba (p-valor frente a α) y su interpretación
function mostrarDecision(p, alfa, textoRechaza, textoNoRechaza) {
  var panel = document.getElementById("panel-resultados");
  if (!panel || p === null || p === undefined || isNaN(p)) return;
  var rechaza = p < alfa;
  var caja = document.createElement("div");
  caja.className = "res-decision";
  var badge = document.createElement("span");
  badge.className = "res-badge " + (rechaza ? "res-badge--rechaza" : "res-badge--no-rechaza");
  badge.textContent = rechaza ? "Se rechaza H₀ (Significativo)" : "No se rechaza H₀";
  var detalle = document.createElement("span");
  detalle.className = "res-decision-detalle";
  detalle.textContent = "p = " + formatearKPI(p, 4) + (rechaza ? " < " : " ≥ ") + "α = " + formatearKPI(alfa, 2);
  caja.appendChild(badge);
  caja.appendChild(detalle);
  panel.appendChild(caja);
  mostrarInterpretacion(rechaza ? textoRechaza : textoNoRechaza);
}

// Porcentaje legible de un R² (ej. 0.8924 → "89.2 %")
function porcentajeR2(r2) {
  return formatearNumero(r2 * 100, 1) + " %";
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
  mostrarKPIs([
    { etiqueta: "Observaciones (n)", valor: String(resumen.n), icono: "conteo" },
    { etiqueta: "Media", valor: formatearKPI(resumen.media), icono: "centro" },
    { etiqueta: "Mediana", valor: formatearKPI(resumen.mediana), icono: "centro" },
    { etiqueta: "Varianza muestral", valor: formatearKPI(resumen.varianzaMuestral), icono: "dispersion" },
    { etiqueta: "Desviación estándar", valor: formatearKPI(resumen.desviacionMuestral), icono: "dispersion", nota: "muestral (n − 1)" }
  ]);

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
  mostrarKPIs([
    { etiqueta: "Correlación (r)", valor: formatearKPI(r), icono: "relacion" },
    { etiqueta: "Covarianza muestral", valor: formatearKPI(covM), icono: "dispersion" },
    { etiqueta: "Pares completos (n)", valor: String(pares.n), icono: "conteo" }
  ]);

  mostrarTabla(["Medida", "Valor"], [
    ["Covarianza muestral (n-1)", formatearNumero(covM)],
    ["Covarianza poblacional (n)", formatearNumero(covP)],
    ["Correlación de Pearson (r)", formatearNumero(r)]
  ]);

  if (r === null) {
    mostrarAdvertencia("No se puede calcular la correlación (varianza cero o datos insuficientes).");
  } else {
    mostrarInterpretacion(interpretarCorrelacion(r) + " Recuerda: correlación no implica causalidad.");
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
  mostrarKPIs([
    { etiqueta: "R²", valor: formatearKPI(reg.r2), icono: "ajuste", nota: reg.r2 === null ? "" : porcentajeR2(reg.r2) + " explicado" },
    { etiqueta: "Pendiente (b1)", valor: formatearKPI(reg.b1), icono: "relacion" },
    { etiqueta: "Intercepto (b0)", valor: formatearKPI(reg.b0), icono: "centro" },
    { etiqueta: "Observaciones (n)", valor: String(reg.n), icono: "conteo" }
  ]);

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
  if (reg.r2 !== null) {
    mostrarInterpretacion("El modelo explica el " + porcentajeR2(reg.r2) + " de la variabilidad de " + nombreY +
      ". Por cada unidad que aumenta " + nombreX + ", " + nombreY + " cambia en promedio " + formatearNumero(reg.b1) + " unidades.");
  }

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
  mostrarKPIs([
    { etiqueta: "R²", valor: formatearKPI(reg.r2), icono: "ajuste" },
    { etiqueta: "R² ajustado", valor: formatearKPI(reg.r2ajustado), icono: "ajuste" },
    { etiqueta: "Predictores", valor: String(nombresX.length), icono: "grupos" },
    { etiqueta: "Observaciones (n)", valor: String(reg.n), icono: "conteo" }
  ]);

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
  else mostrarInterpretacion("En conjunto, " + nombresX.join(", ") + " explican el " + porcentajeR2(reg.r2) +
    " de la variabilidad de " + nombreY + " (R² ajustado: " + formatearNumero(reg.r2ajustado, 4) + ").");
}

// === INFERENCIA ===

function mostrarICMedia(nombre, ic) {
  limpiarResultados();
  mostrarTituloResultado("Intervalo de confianza para la media: " + nombre);
  mostrarParrafo("Nivel de confianza: " + (ic.nivel * 100) + "%");
  mostrarParrafo("n = " + ic.n + " | Grados de libertad = " + ic.gl);
  mostrarKPIs([
    { etiqueta: "Media muestral", valor: formatearKPI(ic.media), icono: "centro" },
    { etiqueta: "Límite inferior", valor: formatearKPI(ic.limiteInferior), icono: "intervalo" },
    { etiqueta: "Límite superior", valor: formatearKPI(ic.limiteSuperior), icono: "intervalo" },
    { etiqueta: "Confianza", valor: formatearNumero(ic.nivel * 100, 0) + " %", icono: "prueba" }
  ]);
  mostrarTabla(["Medida", "Valor"], [
    ["Media muestral", formatearNumero(ic.media)],
    ["Error estándar (margen)", formatearNumero(ic.margenError)],
    ["Límite inferior", formatearNumero(ic.limiteInferior)],
    ["Límite superior", formatearNumero(ic.limiteSuperior)]
  ]);
  mostrarInterpretacion("Con " + formatearNumero(ic.nivel * 100, 0) + " % de confianza, la media poblacional de " + nombre +
    " está entre " + formatearNumero(ic.limiteInferior) + " y " + formatearNumero(ic.limiteSuperior) + ".");
}

function mostrarPruebaTUnaMedia(nombre, res) {
  limpiarResultados();
  mostrarTituloResultado("Prueba t para una media: " + nombre);
  mostrarParrafo("H₀: μ = " + res.mu0);
  mostrarParrafo("H₁: μ ≠ " + res.mu0);
  mostrarParrafo("Nivel de significancia: " + (1 - res.nivel).toFixed(2));
  mostrarKPIs([
    { etiqueta: "t calculado", valor: formatearKPI(res.t), icono: "prueba" },
    { etiqueta: "p-valor", valor: formatearKPI(res.p), icono: "prueba", nota: "dos colas" },
    { etiqueta: "Media muestral", valor: formatearKPI(res.media), icono: "centro" },
    { etiqueta: "Grados de libertad", valor: String(res.gl), icono: "conteo" }
  ]);
  mostrarTabla(["Estadístico", "Valor"], [
    ["Media muestral", formatearNumero(res.media)],
    ["t calculado", formatearNumero(res.t)],
    ["Grados de libertad", String(res.gl)],
    ["p-valor (dos colas)", formatearNumero(res.p, 6)],
    ["t crítico", formatearNumero(res.tCritico)]
  ]);
  mostrarDecision(res.p, 1 - res.nivel,
    "Se rechaza H₀: hay evidencia de que la media de " + nombre + " es distinta de " + res.mu0 + ".",
    "No se rechaza H₀: los datos son compatibles con una media de " + res.mu0 + ".");
}

function mostrarPruebaTDosMedias(nombre1, nombre2, res) {
  limpiarResultados();
  mostrarTituloResultado("Prueba t para dos medias independientes (Welch)");
  mostrarParrafo("Grupo 1: " + nombre1 + " (n = " + res.n1 + ")");
  mostrarParrafo("Grupo 2: " + nombre2 + " (n = " + res.n2 + ")");
  mostrarParrafo("Nivel de confianza: " + (res.nivel * 100) + "%");
  mostrarKPIs([
    { etiqueta: "Diferencia de medias", valor: formatearKPI(res.diferencia), icono: "dispersion" },
    { etiqueta: "t calculado", valor: formatearKPI(res.t), icono: "prueba" },
    { etiqueta: "p-valor", valor: formatearKPI(res.p), icono: "prueba", nota: "dos colas" },
    { etiqueta: "gl (Welch)", valor: formatearKPI(res.gl, 2), icono: "conteo" }
  ]);
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
  mostrarDecision(res.p, 1 - res.nivel,
    "Se rechaza H₀: las medias de " + nombre1 + " y " + nombre2 + " son diferentes.",
    "No se rechaza H₀: no hay evidencia de diferencia entre las medias de " + nombre1 + " y " + nombre2 + ".");
}

function mostrarICProporcion(res) {
  limpiarResultados();
  mostrarTituloResultado("Intervalo de confianza para una proporción");
  mostrarParrafo("Nivel de confianza: " + (res.nivel * 100) + "%");
  mostrarParrafo("Éxitos: " + res.exitos + " | Total: " + res.n);
  mostrarKPIs([
    { etiqueta: "Proporción (p̂)", valor: formatearKPI(res.p), icono: "centro" },
    { etiqueta: "Límite inferior", valor: formatearKPI(res.limiteInferior), icono: "intervalo" },
    { etiqueta: "Límite superior", valor: formatearKPI(res.limiteSuperior), icono: "intervalo" }
  ]);
  mostrarTabla(["Medida", "Valor"], [
    ["Proporción muestral (p)", formatearNumero(res.p)],
    ["Margen de error", formatearNumero(res.margenError)],
    ["Límite inferior", formatearNumero(res.limiteInferior)],
    ["Límite superior", formatearNumero(res.limiteSuperior)]
  ]);
  mostrarInterpretacion("Con " + formatearNumero(res.nivel * 100, 0) + " % de confianza, la proporción poblacional está entre " +
    formatearNumero(res.limiteInferior * 100, 1) + " % y " + formatearNumero(res.limiteSuperior * 100, 1) + " %.");
}

function mostrarPruebaPendiente(nombreX, nombreY, res) {
  limpiarResultados();
  mostrarTituloResultado("Prueba t para la pendiente de regresión");
  mostrarParrafo("Y: " + nombreY + " | X: " + nombreX);
  mostrarParrafo("H₀: β₁ = 0");
  mostrarParrafo("Nivel de confianza: " + (res.nivel * 100) + "%");
  mostrarKPIs([
    { etiqueta: "Pendiente (b1)", valor: formatearKPI(res.b1), icono: "relacion" },
    { etiqueta: "t calculado", valor: formatearKPI(res.t), icono: "prueba" },
    { etiqueta: "p-valor", valor: formatearKPI(res.p), icono: "prueba", nota: "dos colas" }
  ]);
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
  mostrarDecision(res.p, 1 - res.nivel,
    "Se rechaza H₀: la pendiente es distinta de cero; " + nombreX + " tiene relación lineal significativa con " + nombreY + ".",
    "No se rechaza H₀: no hay relación lineal significativa entre " + nombreX + " y " + nombreY + ".");
}

// === CLUSTERING ===

function mostrarResultadoKmeans(nombresVariables, resultado, estandarizado, config) {
  limpiarResultados();
  mostrarTituloResultado("K-means");
  mostrarKPIs([
    { etiqueta: "Clusters (K)", valor: String(resultado.k), icono: "grupos" },
    { etiqueta: "Observaciones", valor: String(resultado.n), icono: "conteo" },
    { etiqueta: "Iteraciones", valor: String(resultado.iteraciones), icono: "ajuste", nota: resultado.convergio ? "convergió" : "límite alcanzado" },
    { etiqueta: "WCSS", valor: formatearKPI(resultado.wcss, 2), icono: "dispersion" }
  ]);
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

  // Si se estandarizó, calculamos los centroides en la escala natural para graficar e interpretar
  var centroidesOriginales = [];
  if (estandarizado && config && config.medias && config.desviaciones) {
    for (var c1 = 0; c1 < resultado.k; c1++) {
      var filaOrig = [];
      for (var j0 = 0; j0 < resultado.centroides[c1].length; j0++) {
        var s = config.desviaciones[j0] || 1;
        var m = config.medias[j0] || 0;
        filaOrig.push(resultado.centroides[c1][j0] * s + m);
      }
      centroidesOriginales.push(filaOrig);
    }
  } else {
    centroidesOriginales = resultado.centroides;
  }

  mostrarSubtitulo(estandarizado ? "Centroides (escala original desestandarizada)" : "Centroides");
  var encabezados = ["Cluster"].concat(nombresVariables);
  var filasC = [];
  for (var c2 = 0; c2 < resultado.k; c2++) {
    var fila = ["Cluster " + (c2 + 1)];
    for (var j = 0; j < centroidesOriginales[c2].length; j++) {
      fila.push(formatearNumero(centroidesOriginales[c2][j]));
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
    var matriz = (config && config.matrizOriginal) ? config.matrizOriginal : extraerMatrizParaGrafico(nombresVariables);
    if (matriz && matriz.length > 0) {
      var svg = dibujarClusters(matriz, resultado.asignaciones, nombresVariables, centroidesOriginales, false);
      if (svg) mostrarGrafico(svg);
    }
  }

  if (nombresVariables.length > 2) {
    mostrarAdvertencia("Con más de 2 variables, el gráfico solo representa las 2 primeras.");
  }
  mostrarParrafo("Nota: el resultado puede depender de los centroides iniciales. K-means no garantiza el óptimo global.");
}

function mostrarResultadoKmedoids(nombresVariables, resultado, estandarizado, config) {
  limpiarResultados();
  mostrarTituloResultado("K-medoids (PAM simplificado)");
  mostrarKPIs([
    { etiqueta: "Clusters (K)", valor: String(resultado.k), icono: "grupos" },
    { etiqueta: "Observaciones", valor: String(resultado.n), icono: "conteo" },
    { etiqueta: "Iteraciones", valor: String(resultado.iteraciones), icono: "ajuste", nota: resultado.convergio ? "convergió" : "límite alcanzado" },
    { etiqueta: "Costo total", valor: formatearKPI(resultado.costoTotal, 2), icono: "dispersion" }
  ]);
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

  var matrizReal = (config && config.matrizOriginal) ? config.matrizOriginal : extraerMatrizParaGrafico(nombresVariables);
  var medoidesReales = [];
  if (matrizReal) {
    for (var cm = 0; cm < resultado.k; cm++) {
      var idxM = resultado.indicesMedoides[cm];
      medoidesReales.push(matrizReal[idxM] ? matrizReal[idxM].slice() : resultado.medoides[cm]);
    }
  } else {
    medoidesReales = resultado.medoides;
  }

  mostrarSubtitulo("Medoides (observaciones reales)");
  var encabezados = ["Cluster", "Índice obs."].concat(nombresVariables);
  var filasM = [];
  for (var c2 = 0; c2 < resultado.k; c2++) {
    var fila = ["Cluster " + (c2 + 1), String(resultado.indicesMedoides[c2] + 1)];
    for (var j = 0; j < medoidesReales[c2].length; j++) {
      fila.push(formatearNumero(medoidesReales[c2][j]));
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
    if (matrizReal && matrizReal.length > 0) {
      var svg = dibujarClusters(matrizReal, resultado.asignaciones, nombresVariables, medoidesReales, true);
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