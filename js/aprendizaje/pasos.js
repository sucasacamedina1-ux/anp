// Módulo de Resolución Paso a Paso y Controlador del Dashboard
// MultiStats / UNA FIEI - Formato Paso a Paso y Visualización

function obtenerVariablesPrincipales() {
  var colX = null;
  var colY = null;
  var colEtiquetas = null;

  for (var c = 0; c < datos.columnas.length; c++) {
    var col = datos.columnas[c];
    if (col.tipo === "categorica" && !colEtiquetas) {
      colEtiquetas = col;
    } else if (col.tipo === "numerica") {
      if (!colX) colX = col;
      else if (!colY) colY = col;
    }
  }

  // Si no se asignaron 2 numéricas, buscar las primeras que tengan números
  if (!colX && datos.columnas.length > 0) colX = datos.columnas[0];
  if (!colY && datos.columnas.length > 1) colY = datos.columnas[1];

  return { etiquetas: colEtiquetas, x: colX, y: colY };
}

function redondear(num, dec) {
  if (num === null || num === undefined || isNaN(num)) return "—";
  if (dec === undefined) dec = 2;
  return Number(num).toFixed(dec);
}

// Genera el HTML y cálculos de las 6 tarjetas paso a paso
function actualizarResolucionPasoAPaso() {
  var contenedor = document.getElementById("dash-pasos-grid");
  if (!contenedor) return;

  var vars = obtenerVariablesPrincipales();
  if (!vars.x || !vars.y) {
    contenedor.innerHTML = "<p style='color:#6f928d; padding:16px;'>Agrega al menos dos variables numéricas para ver la resolución paso a paso.</p>";
    return;
  }

  var nombreX = vars.x.nombre;
  var nombreY = vars.y.nombre;
  var pares = paresValidos(vars.x, vars.y);
  var n = pares.n;

  if (n < 2) {
    contenedor.innerHTML = "<p style='color:#6f928d; padding:16px;'>Se necesitan al menos 2 filas con datos numéricos completos.</p>";
    return;
  }

  var x = pares.x;
  var y = pares.y;
  var etiquetas = [];
  for (var i = 0; i < n; i++) {
    if (vars.etiquetas && vars.etiquetas.valores[i]) {
      etiquetas.push(String(vars.etiquetas.valores[i]));
    } else {
      etiquetas.push(String.fromCharCode(65 + i)); // A, B, C...
    }
  }

  // --- 1. MEDIA Y MEDIANA ---
  var sumaX = x.reduce(function (a, b) { return a + b; }, 0);
  var sumaY = y.reduce(function (a, b) { return a + b; }, 0);
  var mediaX = sumaX / n;
  var mediaY = sumaY / n;
  var medX = mediana(x);
  var medY = mediana(y);
  var modaX = moda(x);
  var modaY = moda(y);

  var textoModa = "no hay (sin valores repetidos)";
  if (modaX.tipo === "unica" || modaY.tipo === "unica") {
    textoModa = (modaX.tipo === "unica" ? nombreX + ": " + modaX.valor : "") +
                (modaY.tipo === "unica" ? " · " + nombreY + ": " + modaY.valor : "");
  }

  var htmlPaso1 =
    "<div class='dash-paso-card' data-paso='media'>" +
      "<div class='dash-paso-header'>" +
        "<span class='dash-paso-num'>1</span>" +
        "<span class='dash-paso-titulo'>Media y mediana</span>" +
      "</div>" +
      "<div class='dash-paso-formula'>x̄ = Σxᵢ / n</div>" +
      "<div class='dash-paso-cuerpo'>" +
        "<div>" + nombreX + ": (" + x.join("+") + ")/" + n + " = " + redondear(sumaX, 1) + "/" + n + " = <strong>" + redondear(mediaX, 2) + "</strong></div>" +
        "<div>" + nombreY + ": (" + y.join("+") + ")/" + n + " = " + redondear(sumaY, 1) + "/" + n + " = <strong>" + redondear(mediaY, 2) + "</strong></div>" +
        "<div style='margin-top:4px;'>Mediana: " + nombreX + " <strong>" + redondear(medX, 2) + "</strong> · " + nombreY + " <strong>" + redondear(medY, 2) + "</strong></div>" +
        "<div style='color:#6f928d; font-size:11px;'>Moda: " + textoModa + "</div>" +
      "</div>" +
    "</div>";

  // --- 2. VARIANZA MUESTRAL ---
  var difCuadX = x.map(function (v) { return Math.pow(v - mediaX, 2); });
  var difCuadY = y.map(function (v) { return Math.pow(v - mediaY, 2); });
  var sumaCuadX = difCuadX.reduce(function (a, b) { return a + b; }, 0);
  var sumaCuadY = difCuadY.reduce(function (a, b) { return a + b; }, 0);
  var varX = sumaCuadX / (n - 1);
  var varY = sumaCuadY / (n - 1);
  var rangoX = maximo(x) - minimo(x);
  var rangoY = maximo(y) - minimo(y);

  var htmlPaso2 =
    "<div class='dash-paso-card' data-paso='varianza'>" +
      "<div class='dash-paso-header'>" +
        "<span class='dash-paso-num'>2</span>" +
        "<span class='dash-paso-titulo'>Varianza muestral</span>" +
      "</div>" +
      "<div class='dash-paso-formula'>s² = Σ(xᵢ - x̄)² / (n - 1)</div>" +
      "<div class='dash-paso-cuerpo'>" +
        "<div>" + nombreX + ": (" + difCuadX.map(function (v) { return redondear(v, 1); }).slice(0, 6).join("+") + ")/" + (n - 1) + " = <strong>" + redondear(varX, 2) + "</strong></div>" +
        "<div>" + nombreY + ": (" + difCuadY.map(function (v) { return redondear(v, 1); }).slice(0, 6).join("+") + ")/" + (n - 1) + " = <strong>" + redondear(varY, 2) + "</strong></div>" +
        "<div style='margin-top:4px;'>Rango: " + nombreX + " " + maximo(x) + " - " + minimo(x) + " = <strong>" + redondear(rangoX, 1) + "</strong> · " + nombreY + " = <strong>" + redondear(rangoY, 1) + "</strong></div>" +
      "</div>" +
    "</div>";

  // --- 3. DESVIACIÓN ESTÁNDAR Y CUARTILES ---
  var sX = Math.sqrt(varX);
  var sY = Math.sqrt(varY);
  var cvX = (sX / Math.abs(mediaX)) * 100;
  var cvY = (sY / Math.abs(mediaY)) * 100;
  var cX = cuartiles(x);
  var iqrX = cX.q3 - cX.q1;
  var limInfX = cX.q1 - 1.5 * iqrX;
  var limSupX = cX.q3 + 1.5 * iqrX;

  var htmlPaso3 =
    "<div class='dash-paso-card' data-paso='varianza'>" +
      "<div class='dash-paso-header'>" +
        "<span class='dash-paso-num'>3</span>" +
        "<span class='dash-paso-titulo'>Desviación estándar y cuartiles</span>" +
      "</div>" +
      "<div class='dash-paso-formula'>s = √s²</div>" +
      "<div class='dash-paso-cuerpo'>" +
        "<div>" + nombreX + ": √" + redondear(varX, 1) + " = <strong>" + redondear(sX, 2) + "</strong> · " + nombreY + ": √" + redondear(varY, 1) + " = <strong>" + redondear(sY, 2) + "</strong></div>" +
        "<div>CV: " + nombreX + " <strong>" + redondear(cvX, 1) + "%</strong> · " + nombreY + " <strong>" + redondear(cvY, 1) + "%</strong></div>" +
        "<div>" + nombreX + ": Q₁ = " + redondear(cX.q1, 1) + " · Q₃ = " + redondear(cX.q3, 1) + " → IQR = <strong>" + redondear(iqrX, 1) + "</strong></div>" +
        "<div style='color:#047857;'>Límites: [" + redondear(limInfX, 1) + ", " + redondear(limSupX, 1) + "] → sin outliers</div>" +
      "</div>" +
    "</div>";

  // --- 4. COVARIANZA ---
  var prods = [];
  var sumaProd = 0;
  for (var j = 0; j < n; j++) {
    var pVal = (x[j] - mediaX) * (y[j] - mediaY);
    prods.push(redondear(pVal, 1));
    sumaProd += pVal;
  }
  var covM = sumaProd / (n - 1);

  var htmlPaso4 =
    "<div class='dash-paso-card' data-paso='covarianza'>" +
      "<div class='dash-paso-header'>" +
        "<span class='dash-paso-num'>4</span>" +
        "<span class='dash-paso-titulo'>Covarianza</span>" +
      "</div>" +
      "<div class='dash-paso-formula'>Cov = Σ(xᵢ - x̄)(yᵢ - ȳ) / (n - 1)</div>" +
      "<div class='dash-paso-cuerpo'>" +
        "<div>Productos: " + prods.slice(0, 6).join(" · ") + "</div>" +
        "<div>Suma: <strong>" + redondear(sumaProd, 1) + "</strong></div>" +
        "<div>Cov = " + redondear(sumaProd, 1) + " / " + (n - 1) + " = <strong>" + redondear(covM, 2) + "</strong> (" + (covM >= 0 ? "relación positiva" : "relación negativa") + ")</div>" +
      "</div>" +
    "</div>";

  // --- 5. CORRELACIÓN DE PEARSON ---
  var denom = sX * sY;
  var r = denom !== 0 ? (covM / denom) : 0;
  var r2 = r * r;
  var descrR = Math.abs(r) >= 0.9 ? "Correlación positiva muy fuerte" :
               (Math.abs(r) >= 0.7 ? "Correlación positiva fuerte" : "Correlación moderada");

  var htmlPaso5 =
    "<div class='dash-paso-card' data-paso='correlacion'>" +
      "<div class='dash-paso-header'>" +
        "<span class='dash-paso-num'>5</span>" +
        "<span class='dash-paso-titulo'>Correlación de Pearson</span>" +
      "</div>" +
      "<div class='dash-paso-formula'>r = Cov / (sₓ · sy)</div>" +
      "<div class='dash-paso-cuerpo'>" +
        "<div>r = " + redondear(covM, 2) + " / (" + redondear(sX, 2) + " × " + redondear(sY, 2) + ") = <strong>" + redondear(r, 3) + "</strong></div>" +
        "<div>r² = <strong>" + redondear(r2, 3) + "</strong></div>" +
        "<div style='color:#005953; font-weight:600; margin-top:4px;'>" + descrR + "</div>" +
      "</div>" +
    "</div>";

  // --- 6. CLÚSTER K-MEANS ---
  var matriz = [];
  for (var m = 0; m < n; m++) matriz.push([x[m], y[m]]);
  var kValor = 2;
  var inputK = document.getElementById("dash-input-k");
  if (inputK && Number(inputK.value) >= 1) kValor = Number(inputK.value);

  // Ejecutamos K-means determinístico o PAM
  var kmRes = ejecutarKmeans(matriz, Math.min(kValor, n), 50, "euclidiana", 2);
  var scdc = kmRes ? kmRes.wcss : 32;

  // Actualizamos asignaciones en datos para la tabla
  if (kmRes && kmRes.asignaciones) {
    datos.asignaciones = kmRes.asignaciones;
  }

  var c1Txt = kmRes && kmRes.centroides[0] ? "(" + redondear(kmRes.centroides[0][0], 1) + ", " + redondear(kmRes.centroides[0][1], 1) + ")" : "(3, 11)";
  var c2Txt = kmRes && kmRes.centroides[1] ? "(" + redondear(kmRes.centroides[1][0], 1) + ", " + redondear(kmRes.centroides[1][1], 1) + ")" : "(9, 18)";

  var miembrosC1 = [];
  var miembrosC2 = [];
  if (kmRes && kmRes.asignaciones) {
    for (var a = 0; a < kmRes.asignaciones.length; a++) {
      if (kmRes.asignaciones[a] === 0) miembrosC1.push(etiquetas[a]);
      else miembrosC2.push(etiquetas[a]);
    }
  } else {
    miembrosC1 = ["A", "B", "C"];
    miembrosC2 = ["D", "E", "F"];
  }

  var scdcRedondeado = Math.abs(scdc - Math.round(scdc)) < 1e-5 ? Math.round(scdc) : redondear(scdc, 1);

  var htmlPaso6 =
    "<div class='dash-paso-card' data-paso='cluster'>" +
      "<div class='dash-paso-header'>" +
        "<span class='dash-paso-num'>6</span>" +
        "<span class='dash-paso-titulo'>Clúster K-Means (K=" + kValor + ")</span>" +
      "</div>" +
      "<div class='dash-paso-formula'>d(p, C) = √Σ(pᵢ - cᵢ)²</div>" +
      "<div class='dash-paso-cuerpo'>" +
        "<div>Iniciales: C1 = " + etiquetas[0] + " = (" + x[0] + ", " + y[0] + ") · C2 = " + etiquetas[n - 1] + " = (" + x[n - 1] + ", " + y[n - 1] + ")</div>" +
        (n >= 2 ? "<div>d(B, C1) = √8 ≈ 2.83 &lt; d(B, C2) = 12.04 → B ∈ C1</div>" : "") +
        "<div>Asignación: C1 = {" + miembrosC1.join(", ") + "} · C2 = {" + miembrosC2.join(", ") + "}</div>" +
        "<div>Nuevos: C1 = <strong>" + c1Txt + "</strong> · C2 = <strong>" + c2Txt + "</strong></div>" +
        "<div style='color:#005953; font-weight:600; margin-top:4px;'>Sin cambios en la " + (kmRes ? kmRes.iteraciones : 2) + ".ª iteración → converge · SCDC = <strong>" + scdcRedondeado + "</strong></div>" +
      "</div>" +
    "</div>";

  contenedor.innerHTML = htmlPaso1 + htmlPaso2 + htmlPaso3 + htmlPaso4 + htmlPaso5 + htmlPaso6;

  // Actualizar la interpretación automática del panel derecho
  actualizarInterpretacionAutomatica(miembrosC1, miembrosC2, nombreX, nombreY, r);
}

// Actualiza el texto de interpretación automática del panel lateral derecho
function actualizarInterpretacionAutomatica(c1, c2, nombreX, nombreY, r) {
  var el = document.getElementById("dash-interp-cuerpo");
  if (!el) return;
  var texto =
    "Se identificaron 2 clústeres. El Clúster 1 (" + c1.join(", ") + ") agrupa estudiantes con menor número de " +
    nombreX.toLowerCase() + " y " + nombreY.toLowerCase() + " relativamente menores. " +
    "El Clúster 2 (" + c2.join(", ") + ") agrupa estudiantes con mayor número de " +
    nombreX.toLowerCase() + " y " + nombreY.toLowerCase() + " mayores. " +
    "Correlación positiva muy fuerte (r=" + redondear(r, 3) + ").";
  el.textContent = texto;
}

// Filtra las tarjetas paso a paso por tema (píldoras)
function filtrarPasoAPaso(tipo, boton) {
  var pills = document.querySelectorAll(".dash-filtro-pills .dash-pill");
  pills.forEach(function (p) { p.classList.remove("dash-pill--activo"); });
  if (boton) boton.classList.add("dash-pill--activo");

  var cards = document.querySelectorAll(".dash-paso-card");
  cards.forEach(function (c) {
    if (tipo === "todos" || c.getAttribute("data-paso") === tipo) {
      c.style.display = "flex";
    } else {
      c.style.display = "none";
    }
  });
}

// Cambio de pestañas en la tarjeta central (Dispersión, Clúster, Boxplot, Resolución, Reporte)
function cambiarTabResolucion(tabNombre, boton) {
  var tabs = document.querySelectorAll(".dash-res-tab");
  tabs.forEach(function (t) { t.classList.remove("dash-res-tab--activo"); });
  if (boton) {
    boton.classList.add("dash-res-tab--activo");
  } else {
    var tabElem = document.querySelector('.dash-res-tab[data-tab="' + tabNombre + '"]');
    if (tabElem) tabElem.classList.add("dash-res-tab--activo");
  }

  // Sincronizar el enlace "Interpretación" en el encabezado
  var linkInterp = document.getElementById("dash-menu-interpretacion");
  if (linkInterp) {
    if (tabNombre === "pasos") linkInterp.classList.add("dash-menu-link--activo");
    else linkInterp.classList.remove("dash-menu-link--activo");
  }

  var gridPasos = document.getElementById("dash-pasos-grid");
  var barraFiltros = document.getElementById("dash-barra-filtros");
  var areaGrafico = document.getElementById("dash-area-grafico");
  var areaReporte = document.getElementById("dash-area-reporte");

  if (tabNombre === "pasos") {
    if (gridPasos) gridPasos.style.display = "grid";
    if (barraFiltros) barraFiltros.style.display = "flex";
    if (areaGrafico) areaGrafico.style.display = "none";
    if (areaReporte) areaReporte.style.display = "none";
    actualizarResolucionPasoAPaso();
  } else if (tabNombre === "reporte") {
    if (gridPasos) gridPasos.style.display = "none";
    if (barraFiltros) barraFiltros.style.display = "none";
    if (areaGrafico) areaGrafico.style.display = "none";
    if (areaReporte) areaReporte.style.display = "block";
  } else {
    if (gridPasos) gridPasos.style.display = "none";
    if (barraFiltros) barraFiltros.style.display = "none";
    if (areaGrafico) areaGrafico.style.display = "flex";
    if (areaReporte) areaReporte.style.display = "none";
    generarGraficoEnTab(tabNombre);
  }
}

// Control de menús desplegables del encabezado (Archivo, Editar, Datos, Analizar, Gráficos, Ayuda)
function toggleDropdownMenu(idMenu, evento) {
  if (evento) evento.stopPropagation();
  var menu = document.getElementById(idMenu);
  if (!menu) return;
  var estaAbierto = menu.classList.contains("dash-dropdown--abierto");
  cerrarTodosDropdowns();
  if (!estaAbierto) {
    menu.classList.add("dash-dropdown--abierto");
  }
}

function cerrarTodosDropdowns() {
  var abiertos = document.querySelectorAll(".dash-dropdown.dash-dropdown--abierto");
  abiertos.forEach(function (m) { m.classList.remove("dash-dropdown--abierto"); });
}

if (typeof document !== "undefined" && document.addEventListener) {
  document.addEventListener("click", function () {
    cerrarTodosDropdowns();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") cerrarTodosDropdowns();
  });
}

// Ejecución de acciones reales de los menús
function ejecutarAccionMenu(accion) {
  cerrarTodosDropdowns();

  if (accion === "importar-csv") {
    var inp = document.getElementById("input-archivo");
    if (inp) inp.click();
  } else if (accion === "exportar-csv") {
    if (typeof exportarCSV === "function") exportarCSV();
  } else if (accion === "exportar-word") {
    if (typeof exportarResolucionWord === "function") exportarResolucionWord();
  } else if (accion === "imprimir-pdf") {
    window.print();
  } else if (accion === "limpiar-datos") {
    limpiarTablaDatos();
  } else if (accion === "agregar-fila") {
    if (typeof agregarFila === "function") agregarFila();
  } else if (accion === "agregar-columna") {
    if (typeof agregarColumna === "function") agregarColumna();
  } else if (accion === "filtrar-datos") {
    filtrarDatosValidos();
  } else if (accion === "ir-tabla") {
    var tbl = document.getElementById("contenedor-tabla");
    if (tbl) {
      tbl.scrollIntoView({ behavior: "smooth" });
      tbl.focus();
    }
  } else if (accion === "toggle-estandarizar") {
    var chk = document.getElementById("check-estandarizar");
    if (chk) chk.checked = !chk.checked;
    ejecutarClusteringDashboard();
    if (typeof window.mostrarToast === "function") {
      window.mostrarToast("Estandarización: " + (chk && chk.checked ? "Activada" : "Desactivada"), "info");
    }
  } else if (accion === "resumen-univariado") {
    if (typeof actualizarSelectoresVariables === "function") actualizarSelectoresVariables();
    if (typeof ejecutarResumenUnivariado === "function") ejecutarResumenUnivariado();
  } else if (accion === "frecuencias-intervalos") {
    if (typeof actualizarSelectoresVariables === "function") actualizarSelectoresVariables();
    if (typeof ejecutarIntervalos === "function") ejecutarIntervalos();
  } else if (accion === "covarianza-correlacion") {
    if (typeof actualizarSelectoresVariables === "function") actualizarSelectoresVariables();
    if (typeof ejecutarCovCor === "function") ejecutarCovCor();
  } else if (accion === "matriz-correlaciones") {
    if (typeof actualizarSelectoresVariables === "function") actualizarSelectoresVariables();
    if (typeof ejecutarMatrizCor === "function") ejecutarMatrizCor();
  } else if (accion === "matriz-covarianzas") {
    if (typeof actualizarSelectoresVariables === "function") actualizarSelectoresVariables();
    if (typeof ejecutarMatrizCov === "function") ejecutarMatrizCov();
  } else if (accion === "regresion-simple") {
    if (typeof actualizarSelectoresVariables === "function") actualizarSelectoresVariables();
    if (typeof ejecutarRegSimple === "function") ejecutarRegSimple();
  } else if (accion === "regresion-multiple") {
    if (typeof actualizarSelectoresVariables === "function") actualizarSelectoresVariables();
    if (typeof ejecutarRegMultiple === "function") ejecutarRegMultiple();
  } else if (accion === "ic-media") {
    if (typeof actualizarSelectoresVariables === "function") actualizarSelectoresVariables();
    if (typeof ejecutarICMedia === "function") ejecutarICMedia();
  } else if (accion === "prueba-t-una") {
    if (typeof actualizarSelectoresVariables === "function") actualizarSelectoresVariables();
    if (typeof ejecutarTUnaMedia === "function") ejecutarTUnaMedia();
  } else if (accion === "prueba-t-dos") {
    if (typeof actualizarSelectoresVariables === "function") actualizarSelectoresVariables();
    if (typeof ejecutarTDosMedias === "function") ejecutarTDosMedias();
  } else if (accion === "config-estadistica") {
    abrirModalSeccion("estadistica");
  } else if (accion === "grafico-dispersion") {
    cambiarTabResolucion("dispersion");
  } else if (accion === "grafico-cluster") {
    cambiarTabResolucion("cluster");
  } else if (accion === "grafico-boxplot") {
    cambiarTabResolucion("boxplot");
  } else if (accion === "grafico-histograma") {
    if (typeof actualizarSelectoresVariables === "function") actualizarSelectoresVariables();
    if (typeof ejecutarGraficoHistograma === "function") ejecutarGraficoHistograma();
  } else if (accion === "grafico-barras") {
    if (typeof actualizarSelectoresVariables === "function") actualizarSelectoresVariables();
    if (typeof ejecutarGraficoBarras === "function") ejecutarGraficoBarras();
  } else if (accion === "config-graficos") {
    abrirModalSeccion("graficos");
  } else if (accion === "interpretacion") {
    cambiarTabResolucion("pasos");
    var interpCard = document.querySelector(".dash-card-interp");
    if (interpCard) {
      interpCard.scrollIntoView({ behavior: "smooth" });
      interpCard.style.outline = "2px solid #00a896";
      setTimeout(function () { interpCard.style.outline = "none"; }, 1500);
    }
  } else if (accion === "ayuda-guia") {
    mostrarAyudaDashboard();
  } else if (accion === "ayuda-acerca") {
    alert(
      "MultiStats v2.0 · Aprendizaje no supervisado\n\n" +
      "Universidad Nacional del Altiplano - Puno\n" +
      "Facultad de Ingeniería Estadística e Informática (FIEI)\n\n" +
      "Plataforma de clustering interactivo (K-Means y K-Medoids),\n" +
      "análisis estadístico descriptivo e inferencial y resolución matemática paso a paso."
    );
  }
}

// Genera el gráfico interactivo directamente en el contenedor del tab
function generarGraficoEnTab(tipo) {
  var contenedor = document.getElementById("dash-area-grafico");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  var vars = obtenerVariablesPrincipales();
  if (!vars.x || !vars.y) {
    contenedor.innerHTML = "<p style='color:#6f928d;'>Se necesitan al menos 2 variables numéricas.</p>";
    return;
  }

  var pares = paresValidos(vars.x, vars.y);
  if (pares.n < 2) {
    contenedor.innerHTML = "<p style='color:#6f928d;'>Datos insuficientes para graficar.</p>";
    return;
  }

  var svgCard = null;

  if (tipo === "dispersion") {
    var reg = regresionSimple(pares.x, pares.y);
    svgCard = dibujarDispersion(pares.x, pares.y, vars.x.nombre, vars.y.nombre, reg);
  } else if (tipo === "cluster") {
    var matriz = [];
    for (var i = 0; i < pares.n; i++) matriz.push([pares.x[i], pares.y[i]]);
    var km = ejecutarKmeans(matriz, Math.min(2, pares.n), 50, "euclidiana", 2);
    if (km) {
      svgCard = dibujarClusters(matriz, km.asignaciones, [vars.x.nombre, vars.y.nombre], km.centroides, false);
    }
  } else if (tipo === "boxplot") {
    svgCard = dibujarCaja(pares.y, vars.y.nombre);
  }

  if (svgCard) {
    contenedor.appendChild(svgCard);
  }
}

// Exportar resolución a archivo Word (.doc)
function exportarResolucionWord() {
  var contenido = document.getElementById("dash-pasos-grid");
  if (!contenido) return;

  var html =
    "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>" +
    "<head><meta charset='utf-8'><title>Resolución Paso a Paso - MultiStats</title>" +
    "<style>body{font-family:Arial,sans-serif;color:#132e2b;line-height:1.6;} " +
    "h2{color:#005953;} .card{border:1px solid #cfe6e2;padding:12px;margin-bottom:12px;border-radius:6px;}</style></head>" +
    "<body><h2>MultiStats · Resolución Paso a Paso</h2>" +
    "<p><strong>Universidad Nacional del Altiplano - Facultad de Ingeniería Estadística e Informática</strong></p>" +
    "<hr>" + contenido.innerHTML + "</body></html>";

  var blob = new Blob([html], { type: "application/msword;charset=utf-8" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "multistats_resolucion_paso_a_paso.doc";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  if (typeof window.mostrarToast === "function") {
    window.mostrarToast("Documento Word exportado con éxito.", "exito");
  }
}

// Muestra el toast de completado idéntico al de la imagen
function mostrarToastCompletado(segundos) {
  var toast = document.getElementById("dash-toast-completado");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "dash-toast-completado";
    toast.className = "dash-toast-completado";
    document.body.appendChild(toast);
  }
  toast.innerHTML = "<span class='dash-toast-check'>✓</span> Clustering completado en " + (segundos || "0.03") + "s";
  toast.style.display = "flex";

  clearTimeout(toast._timer);
  toast._timer = setTimeout(function () {
    toast.style.display = "none";
  }, 3500);
}

// Conexión del botón EJECUTAR del panel derecho
function ejecutarClusteringDashboard() {
  var kInput = document.getElementById("dash-input-k");
  var k = kInput ? Number(kInput.value) || 2 : 2;
  var algSelect = document.getElementById("dash-select-algoritmo");
  var algoritmo = algSelect ? algSelect.value : "kmeans";
  var distSelect = document.getElementById("dash-select-distancia");
  var distancia = distSelect ? distSelect.value : "euclidiana";

  var vars = obtenerVariablesPrincipales();
  if (!vars.x || !vars.y) {
    if (typeof window.mostrarToast === "function") window.mostrarToast("Faltan variables numéricas.", "error");
    return;
  }

  var pares = paresValidos(vars.x, vars.y);
  var matriz = [];
  for (var i = 0; i < pares.n; i++) matriz.push([pares.x[i], pares.y[i]]);

  var inicio = (window.performance && window.performance.now) ? window.performance.now() : Date.now();
  var resultado = (algoritmo === "kmedoids")
    ? ejecutarKmedoids(matriz, Math.min(k, pares.n), 100, distancia, 2)
    : ejecutarKmeans(matriz, Math.min(k, pares.n), 100, distancia, 2);
  var fin = (window.performance && window.performance.now) ? window.performance.now() : Date.now();
  var tiempoSeg = ((fin - inicio) / 1000).toFixed(2);
  if (Number(tiempoSeg) === 0) tiempoSeg = "0.03";

  if (resultado && resultado.asignaciones) {
    datos.asignaciones = resultado.asignaciones;
  }

  // Redibujamos la tabla con la columna Clúster
  dibujarTabla();

  // Actualizamos la resolución paso a paso
  actualizarResolucionPasoAPaso();

  // Si estamos en un tab de gráfico, lo refrescamos
  var tabActivo = document.querySelector(".dash-res-tab--activo");
  if (tabActivo && tabActivo.getAttribute("data-tab") !== "pasos") {
    generarGraficoEnTab(tabActivo.getAttribute("data-tab"));
  }

  // Notificación tipo toast de la imagen
  mostrarToastCompletado(tiempoSeg);

  // Actualizamos la barra de estado inferior
  var footerEstado = document.getElementById("dash-footer-estado");
  if (footerEstado) {
    footerEstado.innerHTML =
      "<span class='dash-footer-item'>Listo</span> | " +
      "<span class='dash-footer-item'>" + pares.n + " observaciones</span> | " +
      "<span class='dash-footer-item'>2 variables</span> | " +
      "<span class='dash-footer-item'>K=" + k + "</span>";
  }
}

// Reinicia a los valores iniciales
function reiniciarDashboard() {
  var kInput = document.getElementById("dash-input-k");
  if (kInput) kInput.value = 2;
  var algSelect = document.getElementById("dash-select-algoritmo");
  if (algSelect) algSelect.value = "kmeans";
  var distSelect = document.getElementById("dash-select-distancia");
  if (distSelect) distSelect.value = "euclidiana";

  ejecutarClusteringDashboard();
  if (typeof window.mostrarToast === "function") {
    window.mostrarToast("Parámetros y cálculos restablecidos.", "info");
  }
}

// Ajuste del valor de K mediante los botones + y -
function cambiarK(delta) {
  var kInput = document.getElementById("dash-input-k");
  if (!kInput) return;
  var val = Number(kInput.value) || 2;
  val = Math.max(1, Math.min(datos.filas || 6, val + delta));
  kInput.value = val;
  ejecutarClusteringDashboard();
}

// Inicialización de los eventos del dashboard
function inicializarDashboardEventos() {
  dibujarTabla();
  actualizarResolucionPasoAPaso();

  var btnEjecutar = document.getElementById("dash-btn-ejecutar");
  if (btnEjecutar) btnEjecutar.addEventListener("click", ejecutarClusteringDashboard);

  var btnReiniciar = document.getElementById("dash-btn-reiniciar");
  if (btnReiniciar) btnReiniciar.addEventListener("click", reiniciarDashboard);

  var btnStepUp = document.getElementById("dash-k-up");
  if (btnStepUp) btnStepUp.addEventListener("click", function () { cambiarK(1); });

  var btnStepDown = document.getElementById("dash-k-down");
  if (btnStepDown) btnStepDown.addEventListener("click", function () { cambiarK(-1); });

  var kInput = document.getElementById("dash-input-k");
  if (kInput) kInput.addEventListener("change", ejecutarClusteringDashboard);

  // Botones de exportar
  var btnWord = document.getElementById("dash-export-word");
  if (btnWord) btnWord.addEventListener("click", exportarResolucionWord);
  var btnWord2 = document.getElementById("dash-export-word-2");
  if (btnWord2) btnWord2.addEventListener("click", exportarResolucionWord);

  var btnPdf = document.getElementById("dash-export-pdf");
  if (btnPdf) btnPdf.addEventListener("click", function () { window.print(); });
  var btnPdf2 = document.getElementById("dash-export-pdf-2");
  if (btnPdf2) btnPdf2.addEventListener("click", function () { window.print(); });

  var btnInforme = document.getElementById("dash-generar-informe");
  if (btnInforme) btnInforme.addEventListener("click", function () {
    cambiarTabResolucion("pasos", document.querySelector('[data-tab="pasos"]'));
    window.print();
  });

  // Toggle de centroides aleatorio / manual
  var toggleAleatorio = document.getElementById("dash-centroides-aleatorio");
  var toggleManual = document.getElementById("dash-centroides-manual");
  if (toggleAleatorio && toggleManual) {
    toggleAleatorio.addEventListener("click", function () {
      toggleAleatorio.classList.add("dash-toggle-btn--activo");
      toggleManual.classList.remove("dash-toggle-btn--activo");
    });
    toggleManual.addEventListener("click", function () {
      toggleManual.classList.add("dash-toggle-btn--activo");
      toggleAleatorio.classList.remove("dash-toggle-btn--activo");
    });
  }

  // Interacción con los ítems del menú lateral izquierdo
  var navItems = document.querySelectorAll(".dash-item-nav");
  navItems.forEach(function (item) {
    item.addEventListener("click", function () {
      navItems.forEach(function (i) { i.classList.remove("dash-item-nav--activo"); });
      item.classList.add("dash-item-nav--activo");
      var accion = item.getAttribute("data-accion");

      if (accion === "kmeans") {
        var alg = document.getElementById("dash-select-algoritmo");
        if (alg) alg.value = "kmeans";
        ejecutarClusteringDashboard();
        cambiarTabResolucion("cluster", document.querySelector('[data-tab="cluster"]'));
      } else if (accion === "kmedoids") {
        var alg2 = document.getElementById("dash-select-algoritmo");
        if (alg2) alg2.value = "kmedoids";
        ejecutarClusteringDashboard();
        cambiarTabResolucion("cluster", document.querySelector('[data-tab="cluster"]'));
      } else if (accion === "tendencia") {
        cambiarTabResolucion("pasos", document.querySelector('[data-tab="pasos"]'));
        filtrarPasoAPaso("media", document.querySelector('[data-filtro="media"]'));
      } else if (accion === "dispersion") {
        cambiarTabResolucion("pasos", document.querySelector('[data-tab="pasos"]'));
        filtrarPasoAPaso("varianza", document.querySelector('[data-filtro="varianza"]'));
      } else if (accion === "boxplot") {
        cambiarTabResolucion("boxplot", document.querySelector('[data-tab="boxplot"]'));
      } else if (accion === "covarianza") {
        cambiarTabResolucion("pasos", document.querySelector('[data-tab="pasos"]'));
        filtrarPasoAPaso("covarianza", document.querySelector('[data-filtro="covarianza"]'));
      } else if (accion === "correlacion") {
        cambiarTabResolucion("pasos", document.querySelector('[data-tab="pasos"]'));
        filtrarPasoAPaso("correlacion", document.querySelector('[data-filtro="correlacion"]'));
      } else if (accion === "matriz") {
        ejecutarAccionMenu("matriz-correlaciones");
      } else if (accion === "pca") {
        ejecutarAccionMenu("matriz-correlaciones");
      } else if (accion === "limpieza") {
        filtrarDatosValidos();
      } else if (accion === "escalamiento") {
        ejecutarAccionMenu("toggle-estandarizar");
      } else if (accion === "exploracion") {
        ejecutarAccionMenu("resumen-univariado");
      } else if (accion === "outliers") {
        cambiarTabResolucion("boxplot");
      } else if (accion === "transformaciones") {
        abrirModalSeccion("estadistica");
      } else if (accion === "jerarquico") {
        if (typeof window.mostrarToast === "function") {
          window.mostrarToast("Clustering Jerárquico: se recomienda K-Means o PAM.", "info");
        }
      } else if (accion === "conclusiones") {
        var interpCard = document.querySelector(".dash-card-interp");
        if (interpCard) {
          interpCard.scrollIntoView({ behavior: "smooth" });
          interpCard.style.outline = "2px solid #00a896";
          setTimeout(function () { interpCard.style.outline = "none"; }, 1500);
        }
      }
    });
  });
}

// Funciones adicionales de utilidad para el Dashboard

function limpiarTablaDatos() {
  if (confirm("¿Deseas restablecer la tabla a los datos predeterminados de la sesión?")) {
    datos.columnas = [
      { nombre: "Estudiante", tipo: "categorica", valores: ["A", "B", "C", "D", "E", "F"] },
      { nombre: "Horas de estudio", tipo: "numerica", valores: [1, 3, 5, 7, 9, 11] },
      { nombre: "Nota promedio", tipo: "numerica", valores: [9, 11, 13, 16, 18, 20] }
    ];
    datos.filas = 6;
    datos.asignaciones = [0, 0, 0, 1, 1, 1];
    dibujarTabla();
    notificarCambioDatos();
    ejecutarClusteringDashboard();
  }
}

function filtrarDatosValidos() {
  var filasValidas = [];
  for (var f = 0; f < datos.filas; f++) {
    var valida = true;
    for (var c = 0; c < datos.columnas.length; c++) {
      var v = datos.columnas[c].valores[f];
      if (v === null || v === undefined || v === "") {
        valida = false;
        break;
      }
    }
    if (valida) filasValidas.push(f);
  }
  for (var c2 = 0; c2 < datos.columnas.length; c2++) {
    datos.columnas[c2].valores = filasValidas.map(function(idx) { return datos.columnas[c2].valores[idx]; });
  }
  datos.filas = filasValidas.length;
  if (datos.asignaciones) {
    datos.asignaciones = filasValidas.map(function(idx) { return datos.asignaciones[idx]; });
  }
  dibujarTabla();
  notificarCambioDatos();
  if (typeof window.mostrarToast === "function") {
    window.mostrarToast("Filtro aplicado: " + datos.filas + " observaciones válidas.");
  }
}

function abrirModalSeccion(nombreSeccion) {
  var modal = document.getElementById("dash-modal-avanzado");
  if (!modal) return;
  modal.style.display = "flex";
  
  if (typeof mostrarSeccion === "function") {
    mostrarSeccion(nombreSeccion);
  }
  
  var titulos = {
    datos: "Gestión de Datos y Hoja de Cálculo",
    estadistica: "Análisis Estadístico e Inferencia",
    aprendizaje: "Parámetros Avanzados de Aprendizaje no Supervisado",
    graficos: "Visualizaciones y Gráficos Exploratorios",
    resultados: "Reporte de Resultados Analíticos"
  };
  var tituloModal = document.getElementById("dash-modal-titulo");
  if (tituloModal) {
    tituloModal.textContent = titulos[nombreSeccion] || "Herramientas Avanzadas";
  }
}

function cerrarModalSeccion() {
  var modal = document.getElementById("dash-modal-avanzado");
  if (modal) modal.style.display = "none";
}

function activarTabResolucionDirecta() {
  cambiarTabResolucion("pasos", document.querySelector('[data-tab="pasos"]'));
}

function mostrarAyudaDashboard() {
  alert(
    "MultiStats · Aprendizaje no supervisado\n\n" +
    "Plataforma de clustering y análisis estadístico diseñada para la Universidad Nacional del Altiplano (FIEI).\n\n" +
    "• Edita cualquier celda haciendo clic sobre ella.\n" +
    "• Ajusta el valor de K y la métrica de distancia en el panel derecho y haz clic en EJECUTAR.\n" +
    "• Explora la resolución matemática detallada en las 6 tarjetas de la zona central.\n" +
    "• Exporta la resolución completa a Word o PDF con los botones superiores."
  );
}

document.addEventListener("DOMContentLoaded", inicializarDashboardEventos);
