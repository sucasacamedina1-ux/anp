// Presentación de resultados en el panel
// [P6 - Viviana] Panel de resultados, métricas y notificaciones (Results Dashboard & UX)
//
// Funciones compartidas que pueden usar los demás módulos:
//   mostrarToast(mensaje, tipo, duracionMs)  -> tipo: "exito" | "error" | "aviso" | "info"
//   mostrarKPIs([{ etiqueta, valor, detalle, destacado }])
//   mostrarBadgeHipotesis(seRechaza, texto)
//   limpiarResultados() / mostrarEstadoVacio()

// ===================== NOTIFICACIONES (TOASTS) =====================

var ICONOS_TOAST = {
  exito: "✓",
  error: "✕",
  aviso: "!",
  info: "i"
};

function obtenerContenedorToasts() {
  var cont = document.getElementById("res-toasts");
  if (!cont) {
    cont = document.createElement("div");
    cont.id = "res-toasts";
    cont.setAttribute("aria-live", "polite");
    cont.setAttribute("aria-atomic", "false");
    document.body.appendChild(cont);
  }
  return cont;
}

// Muestra una notificación flotante en la esquina superior derecha.
// Ejemplos:
//   mostrarToast("Datos importados con éxito (150 filas)", "exito");
//   mostrarToast("Selecciona al menos 2 variables", "error");
function mostrarToast(mensaje, tipo, duracionMs) {
  if (!ICONOS_TOAST[tipo]) tipo = "info";
  if (duracionMs === undefined) duracionMs = (tipo === "error") ? 6000 : 4000;

  var cont = obtenerContenedorToasts();

  var toast = document.createElement("div");
  toast.className = "res-toast res-toast--" + tipo;
  toast.setAttribute("role", tipo === "error" ? "alert" : "status");

  var icono = document.createElement("span");
  icono.className = "res-toast-icono";
  icono.textContent = ICONOS_TOAST[tipo];

  var texto = document.createElement("span");
  texto.className = "res-toast-texto";
  texto.textContent = mensaje;

  var cerrar = document.createElement("button");
  cerrar.type = "button";
  cerrar.className = "res-toast-cerrar";
  cerrar.setAttribute("aria-label", "Cerrar notificación");
  cerrar.textContent = "×";

  toast.appendChild(icono);
  toast.appendChild(texto);
  toast.appendChild(cerrar);
  cont.appendChild(toast);

  // Máximo 4 toasts visibles a la vez
  while (cont.children.length > 4) cont.removeChild(cont.firstChild);

  var temporizador = null;
  function quitar() {
    if (temporizador) clearTimeout(temporizador);
    if (!toast.parentNode) return;
    toast.classList.add("res-toast--saliendo");
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 250);
  }
  cerrar.addEventListener("click", quitar);
  if (duracionMs > 0) temporizador = setTimeout(quitar, duracionMs);

  return toast;
}

// ===================== ESTRUCTURA DEL PANEL =====================

function obtenerPanel() {
  return document.getElementById("panel-resultados");
}

function limpiarResultados() {
  var panel = obtenerPanel();
  if (panel) {
    panel.innerHTML = "";
    panel.classList.remove("res-panel--vacio");
  }
  actualizarBarraResultados(true);
}

function mostrarEstadoVacio() {
  var panel = obtenerPanel();
  if (!panel) return;
  panel.innerHTML =
    '<div class="res-vacio">' +
      '<svg class="res-vacio-icono" viewBox="0 0 64 64" width="72" height="72" aria-hidden="true">' +
        '<rect x="8" y="10" width="48" height="44" rx="6" fill="none" stroke="currentColor" stroke-width="2.5"/>' +
        '<line x1="8" y1="20" x2="56" y2="20" stroke="currentColor" stroke-width="2.5"/>' +
        '<rect x="16" y="38" width="6" height="10" rx="1.5" fill="currentColor" opacity=".45"/>' +
        '<rect x="26" y="31" width="6" height="17" rx="1.5" fill="currentColor" opacity=".65"/>' +
        '<rect x="36" y="26" width="6" height="22" rx="1.5" fill="currentColor" opacity=".85"/>' +
        '<rect x="46" y="34" width="6" height="14" rx="1.5" fill="currentColor" opacity=".55"/>' +
      '</svg>' +
      '<p class="res-vacio-titulo">Aún no hay resultados</p>' +
      '<p class="res-vacio-texto">Ejecuta un análisis o gráfico para ver el reporte aquí.</p>' +
    '</div>';
  panel.classList.add("res-panel--vacio");
  actualizarBarraResultados(false);
}

// Barra con "Limpiar" e "Imprimir / Exportar PDF", encima del panel
function crearBarraResultados() {
  var seccion = document.getElementById("seccion-resultados");
  var panel = obtenerPanel();
  if (!seccion || !panel || document.getElementById("res-barra")) return;

  var barra = document.createElement("div");
  barra.id = "res-barra";
  barra.className = "res-barra";

  var btnLimpiar = document.createElement("button");
  btnLimpiar.type = "button";
  btnLimpiar.id = "res-btn-limpiar";
  btnLimpiar.className = "res-btn res-btn--secundario";
  btnLimpiar.textContent = "Limpiar resultados";
  btnLimpiar.addEventListener("click", function () {
    mostrarEstadoVacio();
    mostrarToast("Resultados limpiados", "info", 2500);
  });

  var btnImprimir = document.createElement("button");
  btnImprimir.type = "button";
  btnImprimir.id = "res-btn-pdf";
  btnImprimir.className = "res-btn res-btn--primario";
  btnImprimir.textContent = "Imprimir / Exportar PDF";
  btnImprimir.addEventListener("click", function () {
    if (obtenerPanel().classList.contains("res-panel--vacio")) {
      mostrarToast("No hay resultados para exportar todavía", "aviso");
      return;
    }
    window.print();
  });

  var btnWord = document.createElement("button");
  btnWord.type = "button";
  btnWord.id = "res-btn-word";
  btnWord.className = "res-btn res-btn--secundario";
  btnWord.textContent = "Exportar Word";
  btnWord.addEventListener("click", exportarReporteWord);

  btnImprimir.textContent = "Exportar PDF";

  barra.appendChild(btnLimpiar);
  barra.appendChild(btnWord);
  barra.appendChild(btnImprimir);
  seccion.insertBefore(barra, panel);
}

function actualizarBarraResultados(hayResultados) {
  var ids = ["res-btn-limpiar", "res-btn-word", "res-btn-pdf"];
  for (var i = 0; i < ids.length; i++) {
    var b = document.getElementById(ids[i]);
    if (b) b.disabled = !hayResultados;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  crearBarraResultados();
  mostrarEstadoVacio();
});

// Descarga el reporte actual como documento de Word (.doc)
function exportarReporteWord() {
  var panel = obtenerPanel();
  if (!panel || panel.classList.contains("res-panel--vacio")) {
    mostrarToast("No hay resultados para exportar todavía", "aviso");
    return;
  }
  var tituloEl = panel.querySelector(".res-titulo");
  var titulo = tituloEl ? tituloEl.textContent : "Reporte";

  // Copia del panel; los gráficos SVG se quitan porque Word no los muestra bien
  var copia = panel.cloneNode(true);
  var svgs = copia.querySelectorAll(".res-grafico");
  for (var i = 0; i < svgs.length; i++) {
    var aviso = document.createElement("p");
    aviso.textContent = "[Gráfico disponible en la exportación a PDF]";
    svgs[i].parentNode.replaceChild(aviso, svgs[i]);
  }

  var estilos =
    "body{font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#0f172a}" +
    "h3{color:#0f766e;font-size:16pt;margin:0 0 4pt}" +
    "h4{color:#0f766e;font-size:10pt;text-transform:uppercase;margin:14pt 0 4pt}" +
    "table{border-collapse:collapse;margin:4pt 0}" +
    "th{background:#0f766e;color:#ffffff;padding:4pt 8pt;font-size:9pt;text-align:left}" +
    "td{border-bottom:1px solid #d1e7e2;padding:4pt 8pt}" +
    "td.res-num{text-align:right}" +
    ".res-kpi{display:inline-block;border:1px solid #d1e7e2;padding:6pt;margin:2pt}" +
    ".res-kpi-valor{font-size:14pt;font-weight:bold;display:block}" +
    ".res-interpretacion{background:#e6f4f1;border-left:3pt solid #0f766e;padding:6pt}";

  var html = "<html><head><meta charset='utf-8'><title>" + titulo + "</title><style>" +
    estilos + "</style></head><body>" + copia.innerHTML + "</body></html>";

  var blob = new Blob(["\ufeff", html], { type: "application/msword" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = titulo.replace(/[^\w\u00C0-\u017F ]+/g, "").trim().replace(/\s+/g, "_") + ".doc";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  mostrarToast("Reporte exportado a Word", "exito");
}

// Cuadro "Interpretación automática" con texto en lenguaje natural
function mostrarInterpretacion(texto) {
  var panel = obtenerPanel();
  if (!panel || !texto) return;
  var caja = document.createElement("div");
  caja.className = "res-interpretacion";
  var t = document.createElement("p");
  t.className = "res-interpretacion-titulo";
  t.textContent = "Interpretación automática";
  var p = document.createElement("p");
  p.className = "res-interpretacion-texto";
  p.textContent = texto;
  caja.appendChild(t);
  caja.appendChild(p);
  panel.appendChild(caja);
}

// Genera la interpretación de un clustering comparando cada centro
// (centroide o medoide) con el promedio general de cada variable.
function interpretarClusters(nombresVariables, centros, asignaciones, tamanos) {
  var k = centros.length;
  var n = asignaciones.length;
  if (k === 0 || n === 0) return "";

  // Promedio general ponderado por tamaño (misma escala que los centros)
  var promedio = [];
  for (var j = 0; j < nombresVariables.length; j++) {
    var suma = 0;
    for (var c = 0; c < k; c++) suma += centros[c][j] * tamanos[c];
    promedio.push(suma / n);
  }

  var frases = ["Se identificaron " + k + (k === 1 ? " clúster." : " clústeres.")];
  for (var c2 = 0; c2 < k; c2++) {
    var obs = [];
    for (var i = 0; i < n; i++) if (asignaciones[i] === c2) obs.push(i + 1);
    if (obs.length === 0) {
      frases.push("El Clúster " + (c2 + 1) + " quedó vacío.");
      continue;
    }
    var listaObs = obs.length > 8 ? obs.slice(0, 8).join(", ") + "…" : obs.join(", ");

    var rasgos = [];
    for (var j2 = 0; j2 < nombresVariables.length; j2++) {
      var dif = centros[c2][j2] - promedio[j2];
      var escala = Math.abs(promedio[j2]) > 1e-9 ? Math.abs(promedio[j2]) : 1;
      if (Math.abs(dif) / escala < 0.02) rasgos.push(nombresVariables[j2] + " cercano al promedio");
      else rasgos.push(nombresVariables[j2] + (dif > 0 ? " mayor" : " menor"));
    }
    frases.push("El Clúster " + (c2 + 1) + " (obs. " + listaObs + ", " + obs.length +
      (obs.length === 1 ? " caso" : " casos") + ") agrupa observaciones con " + unirConY(rasgos) + ".");
  }
  return frases.join(" ");
}

function unirConY(lista) {
  if (lista.length <= 1) return lista.join("");
  return lista.slice(0, -1).join(", ") + " y " + lista[lista.length - 1];
}

// ===================== BLOQUES DE CONTENIDO =====================

function mostrarTituloResultado(titulo) {
  var panel = obtenerPanel();
  if (!panel) return;
  var cab = document.createElement("div");
  cab.className = "res-cabecera";

  var h = document.createElement("h3");
  h.className = "res-titulo";
  h.textContent = titulo;

  var fecha = document.createElement("span");
  fecha.className = "res-fecha";
  var ahora = new Date();
  fecha.textContent = ahora.toLocaleDateString() + " · " +
    ahora.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  cab.appendChild(h);
  cab.appendChild(fecha);
  panel.appendChild(cab);
}

function mostrarSubtitulo(texto) {
  var panel = obtenerPanel();
  if (!panel) return;
  var h = document.createElement("h4");
  h.className = "res-subtitulo";
  h.textContent = texto;
  panel.appendChild(h);
}

function mostrarParrafo(texto) {
  var panel = obtenerPanel();
  if (!panel) return;
  var p = document.createElement("p");
  p.className = "res-parrafo";
  p.textContent = texto;
  panel.appendChild(p);
}

function mostrarAdvertencia(texto) {
  var panel = obtenerPanel();
  if (!panel) return;
  var p = document.createElement("p");
  p.className = "res-advertencia";
  p.textContent = "⚠ " + texto;
  panel.appendChild(p);
}

// Ecuación de un modelo, en tipografía monoespaciada
function mostrarEcuacion(texto) {
  var panel = obtenerPanel();
  if (!panel) return;
  var p = document.createElement("p");
  p.className = "res-ecuacion";
  p.textContent = texto;
  panel.appendChild(p);
}

// Nota pequeña al pie de un resultado (ej: "correlación no implica causalidad")
function mostrarNota(texto) {
  var panel = obtenerPanel();
  if (!panel) return;
  var p = document.createElement("p");
  p.className = "res-nota";
  p.textContent = texto;
  panel.appendChild(p);
}

// Lista de datos de contexto (variables usadas, n, nivel...) como "chips"
// pares: [["Variable", "Edad"], ["n", 30]]
function mostrarDetalles(pares) {
  var panel = obtenerPanel();
  if (!panel) return;
  var dl = document.createElement("dl");
  dl.className = "res-detalles";
  for (var i = 0; i < pares.length; i++) {
    var item = document.createElement("div");
    item.className = "res-detalle";
    var dt = document.createElement("dt");
    dt.textContent = pares[i][0];
    var dd = document.createElement("dd");
    dd.textContent = String(pares[i][1]);
    item.appendChild(dt);
    item.appendChild(dd);
    dl.appendChild(item);
  }
  panel.appendChild(dl);
}

// Tarjetas KPI con números grandes.
// kpis: [{ etiqueta: "R²", valor: "0.8521", detalle: "bondad de ajuste", destacado: true }]
function mostrarKPIs(kpis) {
  var panel = obtenerPanel();
  if (!panel || !kpis || kpis.length === 0) return;
  var grid = document.createElement("div");
  grid.className = "res-kpi-grid";
  for (var i = 0; i < kpis.length; i++) {
    var k = kpis[i];
    var card = document.createElement("div");
    card.className = "res-kpi" + (k.destacado ? " res-kpi--destacado" : "");

    var et = document.createElement("span");
    et.className = "res-kpi-etiqueta";
    et.textContent = k.etiqueta;

    var val = document.createElement("span");
    val.className = "res-kpi-valor";
    val.textContent = (k.valor === null || k.valor === undefined) ? "—" : String(k.valor);

    card.appendChild(et);
    card.appendChild(val);

    if (k.detalle) {
      var det = document.createElement("span");
      det.className = "res-kpi-detalle";
      det.textContent = k.detalle;
      card.appendChild(det);
    }
    grid.appendChild(card);
  }
  panel.appendChild(grid);
}

// Etiqueta de conclusión de una prueba de hipótesis.
// seRechaza = true  -> verde  "Se rechaza H₀ (significativo)"
// seRechaza = false -> ámbar  "No se rechaza H₀"
function mostrarBadgeHipotesis(seRechaza, texto) {
  var panel = obtenerPanel();
  if (!panel) return;
  var cont = document.createElement("div");
  cont.className = "res-conclusion";

  var badge = document.createElement("span");
  badge.className = "res-badge " + (seRechaza ? "res-badge--significativo" : "res-badge--no-significativo");
  badge.textContent = seRechaza ? "Se rechaza H₀ (Significativo)" : "No se rechaza H₀";
  cont.appendChild(badge);

  if (texto) {
    var t = document.createElement("span");
    t.className = "res-conclusion-texto";
    t.textContent = texto;
    cont.appendChild(t);
  }
  panel.appendChild(cont);
}

function formatearNumero(v, decimales) {
  if (v === null || v === undefined || isNaN(v)) return "—";
  if (decimales === undefined) decimales = 4;
  return Number(v).toFixed(decimales);
}

// ¿La celda es un número? (para alinearla a la derecha)
function esTextoNumerico(texto) {
  return /^[-+]?(\d+([.,]\d+)?|[.,]\d+)(e[-+]?\d+)?%?$/i.test(String(texto).trim()) || texto === "—";
}

function mostrarTabla(encabezados, filas) {
  var panel = obtenerPanel();
  if (!panel) return;

  var envoltura = document.createElement("div");
  envoltura.className = "res-tabla-envoltura";

  var tabla = document.createElement("table");
  tabla.className = "res-tabla";

  // Una columna es numérica si todas sus celdas lo son
  // La primera columna es siempre la etiqueta de la fila (texto a la izquierda)
  var colNumerica = [false];
  for (var k = 1; k < encabezados.length; k++) {
    var todas = filas.length > 0;
    for (var r = 0; r < filas.length; r++) {
      if (!esTextoNumerico(filas[r][k])) { todas = false; break; }
    }
    colNumerica.push(todas);
  }

  var thead = document.createElement("thead");
  var trh = document.createElement("tr");
  for (var i = 0; i < encabezados.length; i++) {
    var th = document.createElement("th");
    th.textContent = encabezados[i];
    th.scope = "col";
    if (colNumerica[i]) th.className = "res-num";
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
      if (c > 0 && (colNumerica[c] || esTextoNumerico(filas[f][c]))) td.className = "res-num";
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  tabla.appendChild(tbody);
  envoltura.appendChild(tabla);
  panel.appendChild(envoltura);
}

function mostrarGrafico(svg) {
  var panel = obtenerPanel();
  if (!panel || !svg) return;
  var marco = document.createElement("div");
  marco.className = "res-grafico";
  marco.appendChild(svg);
  panel.appendChild(marco);
}

// Devuelve true si p < alfa
function esSignificativo(res) {
  return res.p !== null && res.p !== undefined && res.p < (1 - res.nivel);
}

// === UNIVARIADO ===

function mostrarResumenUnivariado(nombreVariable, resumen) {
  limpiarResultados();
  mostrarTituloResultado("Análisis univariado: " + nombreVariable);
  mostrarKPIs([
    { etiqueta: "n", valor: resumen.n, detalle: "observaciones válidas" },
    { etiqueta: "Media", valor: formatearNumero(resumen.media), destacado: true },
    { etiqueta: "Mediana", valor: formatearNumero(resumen.mediana) },
    { etiqueta: "Desv. estándar", valor: formatearNumero(resumen.desviacionMuestral), detalle: "muestral (n-1)" },
    { etiqueta: "Varianza", valor: formatearNumero(resumen.varianzaMuestral), detalle: "muestral (n-1)" }
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
  mostrarKPIs([
    { etiqueta: "Total", valor: tabla.total, detalle: "observaciones" },
    { etiqueta: "Valores distintos", valor: tabla.filas.length }
  ]);

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
  mostrarKPIs([
    { etiqueta: "Total", valor: tabla.total, detalle: "observaciones" },
    { etiqueta: "Intervalos", valor: tabla.numIntervalos },
    { etiqueta: "Amplitud", valor: formatearNumero(tabla.amplitud) }
  ]);

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
  mostrarDetalles([["Variables", nombreX + " y " + nombreY], ["Pares completos", pares.n]]);
  mostrarKPIs([
    { etiqueta: "Correlación (r)", valor: formatearNumero(r), detalle: r === null ? "" : interpretarCorrelacion(r), destacado: true },
    { etiqueta: "Covarianza", valor: formatearNumero(covM), detalle: "muestral (n-1)" },
    { etiqueta: "n", valor: pares.n, detalle: "pares válidos" }
  ]);

  mostrarTabla(["Medida", "Valor"], [
    ["Covarianza muestral (n-1)", formatearNumero(covM)],
    ["Covarianza poblacional (n)", formatearNumero(covP)],
    ["Correlación de Pearson (r)", formatearNumero(r)]
  ]);

  if (r === null) {
    mostrarAdvertencia("No se puede calcular la correlación (varianza cero o datos insuficientes).");
  } else {
    mostrarInterpretacion("Entre " + nombreX + " y " + nombreY + " existe una " +
      interpretarCorrelacion(r).charAt(0).toLowerCase() + interpretarCorrelacion(r).slice(1) +
      (r > 0 ? " Cuando " + nombreX + " aumenta, " + nombreY + " tiende a aumentar."
             : (r < 0 ? " Cuando " + nombreX + " aumenta, " + nombreY + " tiende a disminuir." : "")));
    mostrarNota("Nota: correlación no implica causalidad.");
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
  mostrarDetalles([["Y (dependiente)", nombreY], ["X (independiente)", nombreX], ["Observaciones", reg.n]]);
  mostrarKPIs([
    { etiqueta: "R²", valor: formatearNumero(reg.r2), detalle: "bondad de ajuste", destacado: true },
    { etiqueta: "Pendiente (b1)", valor: formatearNumero(reg.b1) },
    { etiqueta: "Intercepto (b0)", valor: formatearNumero(reg.b0) },
    { etiqueta: "n", valor: reg.n }
  ]);

  if (reg.r2 !== null && reg.r2 !== undefined) {
    mostrarInterpretacion("Por cada unidad que aumenta " + nombreX + ", " + nombreY + " cambia en promedio " +
      formatearNumero(reg.b1) + " unidades. El modelo explica el " + formatearNumero(reg.r2 * 100, 1) +
      "% de la variabilidad de " + nombreY + ".");
  }

  mostrarSubtitulo("Coeficientes");
  mostrarTabla(["Parámetro", "Estimación"], [
    ["Intercepto (b0)", formatearNumero(reg.b0)],
    ["Pendiente (b1)", formatearNumero(reg.b1)]
  ]);

  mostrarSubtitulo("Ecuación ajustada");
  var signo = reg.b1 >= 0 ? " + " : " - ";
  mostrarEcuacion("Y = " + formatearNumero(reg.b0) + signo + formatearNumero(Math.abs(reg.b1)) + " * X");

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
  mostrarDetalles([["Y (dependiente)", nombreY], ["X (independientes)", nombresX.join(", ")], ["Observaciones", reg.n]]);
  mostrarKPIs([
    { etiqueta: "R²", valor: formatearNumero(reg.r2), destacado: true },
    { etiqueta: "R² ajustado", valor: formatearNumero(reg.r2ajustado) },
    { etiqueta: "Predictores", valor: nombresX.length },
    { etiqueta: "n", valor: reg.n }
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
  mostrarEcuacion(ecuacion);

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
  mostrarDetalles([["Nivel de confianza", (ic.nivel * 100) + "%"], ["n", ic.n], ["Grados de libertad", ic.gl]]);
  mostrarKPIs([
    { etiqueta: "Media muestral", valor: formatearNumero(ic.media), destacado: true },
    { etiqueta: "Intervalo", valor: "[" + formatearNumero(ic.limiteInferior) + " ; " + formatearNumero(ic.limiteSuperior) + "]", detalle: (ic.nivel * 100) + "% de confianza" },
    { etiqueta: "Margen de error", valor: formatearNumero(ic.margenError) }
  ]);
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
  mostrarDetalles([["H₀", "μ = " + res.mu0], ["H₁", "μ ≠ " + res.mu0], ["α", (1 - res.nivel).toFixed(2)]]);
  if (res.p !== null) mostrarBadgeHipotesis(esSignificativo(res), "");
  mostrarKPIs([
    { etiqueta: "p-valor", valor: formatearNumero(res.p, 6), detalle: "dos colas", destacado: true },
    { etiqueta: "t calculado", valor: formatearNumero(res.t), detalle: "t crítico ± " + formatearNumero(res.tCritico) },
    { etiqueta: "Media muestral", valor: formatearNumero(res.media) },
    { etiqueta: "gl", valor: res.gl }
  ]);
  mostrarTabla(["Estadístico", "Valor"], [
    ["Media muestral", formatearNumero(res.media)],
    ["t calculado", formatearNumero(res.t)],
    ["Grados de libertad", String(res.gl)],
    ["p-valor (dos colas)", formatearNumero(res.p, 6)],
    ["t crítico", formatearNumero(res.tCritico)]
  ]);
}

function mostrarPruebaTDosMedias(nombre1, nombre2, res) {
  limpiarResultados();
  mostrarTituloResultado("Prueba t para dos medias independientes (Welch)");
  mostrarDetalles([["Grupo 1", nombre1 + " (n = " + res.n1 + ")"], ["Grupo 2", nombre2 + " (n = " + res.n2 + ")"], ["Nivel de confianza", (res.nivel * 100) + "%"]]);
  if (res.p !== null) {
    mostrarBadgeHipotesis(esSignificativo(res),
      esSignificativo(res) ? "Las medias son diferentes." : "No hay evidencia de diferencia entre las medias.");
  }
  mostrarKPIs([
    { etiqueta: "p-valor", valor: formatearNumero(res.p, 6), detalle: "dos colas", destacado: true },
    { etiqueta: "Diferencia de medias", valor: formatearNumero(res.diferencia) },
    { etiqueta: "t calculado", valor: formatearNumero(res.t), detalle: "t crítico ± " + formatearNumero(res.tCritico) },
    { etiqueta: "gl (Welch)", valor: formatearNumero(res.gl, 2) }
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
}

function mostrarICProporcion(res) {
  limpiarResultados();
  mostrarTituloResultado("Intervalo de confianza para una proporción");
  mostrarDetalles([["Nivel de confianza", (res.nivel * 100) + "%"], ["Éxitos", res.exitos], ["Total", res.n]]);
  mostrarKPIs([
    { etiqueta: "Proporción (p)", valor: formatearNumero(res.p), destacado: true },
    { etiqueta: "Intervalo", valor: "[" + formatearNumero(res.limiteInferior) + " ; " + formatearNumero(res.limiteSuperior) + "]", detalle: (res.nivel * 100) + "% de confianza" },
    { etiqueta: "Margen de error", valor: formatearNumero(res.margenError) }
  ]);
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
  mostrarDetalles([["Y", nombreY], ["X", nombreX], ["H₀", "β₁ = 0"], ["Nivel de confianza", (res.nivel * 100) + "%"]]);
  if (res.p !== null) {
    mostrarBadgeHipotesis(esSignificativo(res),
      esSignificativo(res) ? "La pendiente es distinta de cero." : "No hay relación lineal significativa.");
  }
  mostrarKPIs([
    { etiqueta: "p-valor", valor: formatearNumero(res.p, 6), detalle: "dos colas", destacado: true },
    { etiqueta: "Pendiente (b1)", valor: formatearNumero(res.b1) },
    { etiqueta: "t calculado", valor: formatearNumero(res.t), detalle: "t crítico ± " + formatearNumero(res.tCritico) },
    { etiqueta: "gl", valor: res.gl }
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
}

// === CLUSTERING ===

function mostrarResultadoKmeans(nombresVariables, resultado, estandarizado) {
  limpiarResultados();
  mostrarTituloResultado("K-means");
  mostrarDetalles([
    ["Variables", nombresVariables.join(", ")],
    ["Distancia", resultado.tipoDistancia || "euclidiana"],
    ["Estandarización", estandarizado ? "sí (media 0, desv. 1)" : "no"],
    ["Parada", resultado.convergio ? "centroides sin cambio" : "máx. iteraciones alcanzado"]
  ]);
  mostrarKPIs([
    { etiqueta: "Clusters (K)", valor: resultado.k },
    { etiqueta: "Observaciones", valor: resultado.n },
    { etiqueta: "Iteraciones", valor: resultado.iteraciones, detalle: resultado.convergio ? "convergió" : "sin converger" },
    { etiqueta: "WCSS", valor: formatearNumero(resultado.wcss), detalle: "suma de cuadrados intra-cluster", destacado: true }
  ]);
  if (!resultado.convergio) mostrarAdvertencia("Se alcanzó el máximo de iteraciones sin converger. Prueba aumentar 'Máx. iteraciones'.");
  mostrarInterpretacion(interpretarClusters(nombresVariables, resultado.centroides, resultado.asignaciones, resultado.tamanos));
  mostrarToast("K-means completado: " + resultado.k + " clústeres, " + resultado.iteraciones + " iteraciones", "exito");

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
  mostrarNota("Nota: el resultado puede depender de los centroides iniciales. K-means no garantiza el óptimo global.");
}

function mostrarResultadoKmedoids(nombresVariables, resultado, estandarizado) {
  limpiarResultados();
  mostrarTituloResultado("K-medoids (PAM simplificado)");
  mostrarDetalles([
    ["Variables", nombresVariables.join(", ")],
    ["Distancia", resultado.tipoDistancia || "euclidiana"],
    ["Estandarización", estandarizado ? "sí (media 0, desv. 1)" : "no"],
    ["Parada", resultado.convergio ? "medoides sin cambio" : "máx. iteraciones alcanzado"]
  ]);
  mostrarKPIs([
    { etiqueta: "Clusters (K)", valor: resultado.k },
    { etiqueta: "Observaciones", valor: resultado.n },
    { etiqueta: "Iteraciones", valor: resultado.iteraciones, detalle: resultado.convergio ? "convergió" : "sin converger" },
    { etiqueta: "Costo total", valor: formatearNumero(resultado.costoTotal), detalle: "suma de distancias a medoides", destacado: true }
  ]);
  if (!resultado.convergio) mostrarAdvertencia("Se alcanzó el máximo de iteraciones sin converger. Prueba aumentar 'Máx. iteraciones'.");
  mostrarInterpretacion(interpretarClusters(nombresVariables, resultado.medoides, resultado.asignaciones, resultado.tamanos));
  mostrarToast("K-medoids completado: " + resultado.k + " clústeres, " + resultado.iteraciones + " iteraciones", "exito");

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
  mostrarNota("Nota: el medoide es una observación real del conjunto de datos.");
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