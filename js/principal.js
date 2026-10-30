// Arranque de la aplicación MultiStats, navegación y conexión de botones

document.addEventListener("DOMContentLoaded", function () {

  dibujarTabla();
  actualizarSelectoresVariables();

  var botones = document.querySelectorAll("nav button");
  for (var i = 0; i < botones.length; i++) {
    botones[i].addEventListener("click", function () {
      var seccion = this.getAttribute("data-seccion");
      if (!seccion) return;
      mostrarSeccion(seccion);
      if (seccion === "estadistica" || seccion === "aprendizaje" || seccion === "graficos") {
        actualizarSelectoresVariables();
      }
    });
  }

  document.getElementById("btn-agregar-fila").addEventListener("click", agregarFila);
  document.getElementById("btn-agregar-columna").addEventListener("click", agregarColumna);
  document.getElementById("btn-exportar").addEventListener("click", exportarCSV);

  var btnImportar = document.getElementById("btn-importar");
  var inputArchivo = document.getElementById("input-archivo");
  btnImportar.addEventListener("click", function () { inputArchivo.click(); });
  inputArchivo.addEventListener("change", function () {
    if (this.files && this.files.length > 0) {
      importarCSV(this.files[0]);
      this.value = "";
      actualizarSelectoresVariables();
    }
  });

  var contenedor = document.getElementById("contenedor-tabla");
  contenedor.addEventListener("paste", function (evento) {
    var texto = (evento.clipboardData || window.clipboardData).getData("text");
    if (texto && (texto.indexOf("\t") !== -1 || texto.indexOf("\n") !== -1)) {
      evento.preventDefault();
      pegarDesdeTexto(texto);
      actualizarSelectoresVariables();
    }
  });

  document.getElementById("btn-resumen-univariado").addEventListener("click", ejecutarResumenUnivariado);
  document.getElementById("btn-frecuencias").addEventListener("click", ejecutarFrecuencias);
  document.getElementById("btn-intervalos").addEventListener("click", ejecutarIntervalos);

  document.getElementById("btn-cov-cor").addEventListener("click", ejecutarCovCor);
  document.getElementById("btn-matriz-cov").addEventListener("click", ejecutarMatrizCov);
  document.getElementById("btn-matriz-cor").addEventListener("click", ejecutarMatrizCor);
  document.getElementById("btn-reg-simple").addEventListener("click", ejecutarRegSimple);
  document.getElementById("btn-reg-multiple").addEventListener("click", ejecutarRegMultiple);

  document.getElementById("btn-ic-media").addEventListener("click", ejecutarICMedia);
  document.getElementById("btn-t-una-media").addEventListener("click", ejecutarTUnaMedia);
  document.getElementById("btn-t-dos-medias").addEventListener("click", ejecutarTDosMedias);
  document.getElementById("btn-ic-proporcion").addEventListener("click", ejecutarICProporcion);
  document.getElementById("btn-prueba-pendiente").addEventListener("click", ejecutarPruebaPendiente);

  document.getElementById("btn-kmeans").addEventListener("click", ejecutarKmeansUI);
  document.getElementById("btn-kmedoids").addEventListener("click", ejecutarKmedoidsUI);

  document.getElementById("btn-graf-histograma").addEventListener("click", ejecutarGraficoHistograma);
  document.getElementById("btn-graf-barras").addEventListener("click", ejecutarGraficoBarras);
  document.getElementById("btn-graf-caja").addEventListener("click", ejecutarGraficoCaja);
  document.getElementById("btn-graf-dispersion").addEventListener("click", ejecutarGraficoDispersion);
});

function mostrarSeccion(nombre) {
  var modoDashboard = document.body && document.body.classList.contains("dashboard-modo");
  if (modoDashboard) {
    if (nombre === "resultados") {
      if (typeof cambiarTabResolucion === "function") {
        cambiarTabResolucion("reporte");
      }
      var modal = document.getElementById("dash-modal-avanzado");
      if (modal) modal.style.display = "none";
      return;
    }
  }

  var secciones = ["datos", "estadistica", "aprendizaje", "graficos", "resultados"];
  for (var i = 0; i < secciones.length; i++) {
    var el = document.getElementById("seccion-" + secciones[i]);
    if (el) el.style.display = (secciones[i] === nombre) ? "block" : "none";
  }
  if (typeof sincronizarPestanas === "function") {
    sincronizarPestanas();
  }
}

function actualizarSelectoresVariables() {
  actualizarTiposColumnas();

  var selectoresNumericos = [
    "select-variable-intervalos",
    "select-vars-cluster",
    "select-graf-hist",
    "select-graf-caja",
    "select-graf-disp-x",
    "select-graf-disp-y",
    "select-x-multi",
    "select-y-multi",
    "select-matriz",
    "select-x-reg",
    "select-y-reg",
    "select-y-regmul",
    "select-x-regmul",
    "select-inf-var",
    "select-grupo1",
    "select-grupo2",
    "select-x-pend",
    "select-y-pend"
  ];

  var selectoresY = [
    "select-y-multi",
    "select-y-reg",
    "select-grupo2",
    "select-y-pend",
    "select-graf-disp-y"
  ];

  var todosSelectores = [
    "select-variable-univariada", "select-variable-intervalos",
    "select-x-multi", "select-y-multi", "select-matriz",
    "select-x-reg", "select-y-reg", "select-y-regmul", "select-x-regmul",
    "select-inf-var", "select-grupo1", "select-grupo2",
    "select-x-pend", "select-y-pend", "select-vars-cluster",
    "select-graf-hist", "select-graf-barras", "select-graf-caja",
    "select-graf-disp-x", "select-graf-disp-y"
  ];

  for (var i = 0; i < todosSelectores.length; i++) {
    var id = todosSelectores[i];
    var sel = document.getElementById(id);
    if (!sel) continue;

    var seleccionPrevia = [];
    for (var s = 0; s < sel.options.length; s++) {
      if (sel.options[s].selected) seleccionPrevia.push(sel.options[s].value);
    }

    sel.innerHTML = "";
    var esNumerico = selectoresNumericos.indexOf(id) !== -1;

    for (var c = 0; c < datos.columnas.length; c++) {
      var col = datos.columnas[c];
      if (esNumerico && col.tipo !== "numerica") continue;

      var opt = document.createElement("option");
      opt.value = c;
      opt.textContent = col.nombre;
      if (seleccionPrevia.indexOf(String(c)) !== -1) opt.selected = true;
      sel.appendChild(opt);
    }

    // Respaldo para clustering si no se detectaron columnas numéricas
    if (sel.options.length === 0 && id === "select-vars-cluster") {
      for (var c3 = 0; c3 < datos.columnas.length; c3++) {
        var opt2 = document.createElement("option");
        opt2.value = c3;
        opt2.textContent = datos.columnas[c3].nombre;
        sel.appendChild(opt2);
      }
    }

    // Preselección inteligente por defecto cuando no había selección previa
    if (seleccionPrevia.length === 0 && sel.options.length > 0) {
      if (id === "select-vars-cluster") {
        for (var k = 0; k < Math.min(3, sel.options.length); k++) {
          sel.options[k].selected = true;
        }
      } else if (id === "select-matriz") {
        for (var m = 0; m < Math.min(4, sel.options.length); m++) {
          sel.options[m].selected = true;
        }
      } else if (id === "select-x-regmul") {
        if (sel.options.length > 1) {
          for (var r = 1; r < sel.options.length; r++) {
            sel.options[r].selected = true;
          }
        } else {
          sel.options[0].selected = true;
        }
      } else if (selectoresY.indexOf(id) !== -1 && sel.options.length > 1) {
        sel.selectedIndex = 1;
      }
    }
  }
}

// Avisos de validación con Toast
function avisarEstadistica(mensaje) {
  if (typeof window.mostrarToast === "function") window.mostrarToast(mensaje, "error");
  else console.info(mensaje);
}

function avisarGraficos(mensaje) {
  if (typeof window.mostrarToast === "function") window.mostrarToast(mensaje, "error");
  else alert(mensaje);
}

function ejecutarResumenUnivariado() {
  var idx = Number(document.getElementById("select-variable-univariada").value);
  if (isNaN(idx) || !datos.columnas[idx]) { avisarEstadistica("Selecciona una variable."); return; }
  var col = datos.columnas[idx];
  var valores = valoresNumericosValidos(col.valores);
  if (valores.length === 0) { avisarEstadistica("Sin valores numéricos válidos."); return; }
  mostrarResumenUnivariado(col.nombre, resumenUnivariado(valores));
  mostrarSeccion("resultados");
}

function ejecutarFrecuencias() {
  var idx = Number(document.getElementById("select-variable-univariada").value);
  if (isNaN(idx) || !datos.columnas[idx]) { avisarEstadistica("Selecciona una variable."); return; }
  var col = datos.columnas[idx];
  var tabla = tablaFrecuencias(col.valores);
  if (!tabla || tabla.total === 0) { avisarEstadistica("Sin datos."); return; }
  mostrarTablaFrecuencias(col.nombre, tabla);
  mostrarSeccion("resultados");
}

function ejecutarIntervalos() {
  var idx = Number(document.getElementById("select-variable-intervalos").value);
  if (isNaN(idx) || !datos.columnas[idx]) { avisarEstadistica("Selecciona una variable numérica."); return; }
  var numInt = Number(document.getElementById("input-num-intervalos").value);
  if (isNaN(numInt) || numInt < 1) { avisarEstadistica("Número de intervalos inválido."); return; }
  var tabla = tablaFrecuenciasIntervalos(datos.columnas[idx].valores, numInt);
  if (!tabla) { avisarEstadistica("Sin valores numéricos válidos."); return; }
  mostrarTablaIntervalos(datos.columnas[idx].nombre, tabla);
  mostrarSeccion("resultados");
}

function ejecutarCovCor() {
  var ix = Number(document.getElementById("select-x-multi").value);
  var iy = Number(document.getElementById("select-y-multi").value);
  if (isNaN(ix) || isNaN(iy) || !datos.columnas[ix] || !datos.columnas[iy]) {
    avisarEstadistica("Selecciona dos variables."); return;
  }
  var pares = paresValidos(datos.columnas[ix], datos.columnas[iy]);
  if (pares.n < 2) { avisarEstadistica("Se necesitan al menos 2 pares válidos."); return; }
  mostrarCovarianzaCorrelacion(
    datos.columnas[ix].nombre, datos.columnas[iy].nombre, pares,
    covarianzaMuestral(pares.x, pares.y),
    covarianzaPoblacional(pares.x, pares.y),
    correlacionPearson(pares.x, pares.y)
  );
  mostrarSeccion("resultados");
}

function obtenerColumnasSeleccionadas(idSelect) {
  var sel = document.getElementById(idSelect);
  var cols = [];
  if (!sel) return cols;
  for (var i = 0; i < sel.options.length; i++) {
    if (sel.options[i].selected) {
      var col = datos.columnas[Number(sel.options[i].value)];
      if (col) cols.push(col);
    }
  }
  if (cols.length < 2 && idSelect === "select-matriz") {
    for (var c = 0; c < datos.columnas.length; c++) {
      if (datos.columnas[c].tipo === "numerica") cols.push(datos.columnas[c]);
    }
  }
  return cols;
}

function ejecutarMatrizCov() {
  var cols = obtenerColumnasSeleccionadas("select-matriz");
  if (cols.length < 2) { avisarEstadistica("Selecciona al menos 2 variables."); return; }
  var nombres = [];
  for (var i = 0; i < cols.length; i++) nombres.push(cols[i].nombre);
  mostrarMatriz("Matriz de covarianzas (muestral)", nombres, matrizCovarianzas(cols));
  mostrarSeccion("resultados");
}

function ejecutarMatrizCor() {
  var cols = obtenerColumnasSeleccionadas("select-matriz");
  if (cols.length < 2) { avisarEstadistica("Selecciona al menos 2 variables."); return; }
  var nombres = [];
  for (var i = 0; i < cols.length; i++) nombres.push(cols[i].nombre);
  mostrarMatriz("Matriz de correlaciones", nombres, matrizCorrelaciones(cols));
  mostrarSeccion("resultados");
}

function ejecutarRegSimple() {
  var ix = Number(document.getElementById("select-x-reg").value);
  var iy = Number(document.getElementById("select-y-reg").value);
  if (isNaN(ix) || isNaN(iy)) { avisarEstadistica("Selecciona dos variables."); return; }
  var pares = paresValidos(datos.columnas[ix], datos.columnas[iy]);
  if (pares.n < 2) { avisarEstadistica("Datos insuficientes."); return; }
  var reg = regresionSimple(pares.x, pares.y);
  if (!reg) { avisarEstadistica("No se pudo calcular (X constante o datos insuficientes)."); return; }
  mostrarRegresionSimple(datos.columnas[ix].nombre, datos.columnas[iy].nombre, reg);
  mostrarSeccion("resultados");
}

function ejecutarRegMultiple() {
  var iy = Number(document.getElementById("select-y-regmul").value);
  if (isNaN(iy)) { avisarEstadistica("Selecciona la variable Y."); return; }
  var colsX = obtenerColumnasSeleccionadas("select-x-regmul");
  if (colsX.length < 1) { avisarEstadistica("Selecciona al menos una variable X."); return; }

  var datosReg = datosRegresionMultiple(datos.columnas[iy], colsX);
  if (datosReg.n < colsX.length + 1) {
    avisarEstadistica("Datos insuficientes: más observaciones que variables."); return;
  }
  var reg = regresionMultiple(datosReg.y, datosReg.columnasX);
  if (!reg) { avisarEstadistica("No se pudo estimar (matriz singular o colinealidad)."); return; }

  var nombresX = [];
  for (var i = 0; i < colsX.length; i++) nombresX.push(colsX[i].nombre);
  mostrarRegresionMultiple(nombresX, datos.columnas[iy].nombre, reg);
  mostrarSeccion("resultados");
}

function obtenerNivel() {
  return Number(document.getElementById("select-nivel").value);
}

function ejecutarICMedia() {
  var idx = Number(document.getElementById("select-inf-var").value);
  if (isNaN(idx)) { avisarEstadistica("Selecciona una variable."); return; }
  var valores = valoresNumericosValidos(datos.columnas[idx].valores);
  var ic = intervaloConfianzaMedia(valores, obtenerNivel());
  if (!ic) { avisarEstadistica("Datos insuficientes (n < 2)."); return; }
  mostrarICMedia(datos.columnas[idx].nombre, ic);
  mostrarSeccion("resultados");
}

function ejecutarTUnaMedia() {
  var idx = Number(document.getElementById("select-inf-var").value);
  if (isNaN(idx)) { avisarEstadistica("Selecciona una variable."); return; }
  var mu0 = Number(document.getElementById("input-mu0").value);
  if (isNaN(mu0)) { avisarEstadistica("Ingresa un valor válido para H₀."); return; }
  var valores = valoresNumericosValidos(datos.columnas[idx].valores);
  var res = pruebaTUnaMedia(valores, mu0, obtenerNivel());
  if (!res) { avisarEstadistica("Datos insuficientes o varianza cero."); return; }
  mostrarPruebaTUnaMedia(datos.columnas[idx].nombre, res);
  mostrarSeccion("resultados");
}

function ejecutarTDosMedias() {
  var i1 = Number(document.getElementById("select-grupo1").value);
  var i2 = Number(document.getElementById("select-grupo2").value);
  if (isNaN(i1) || isNaN(i2)) { avisarEstadistica("Selecciona dos variables."); return; }
  var x = valoresNumericosValidos(datos.columnas[i1].valores);
  var y = valoresNumericosValidos(datos.columnas[i2].valores);
  var res = pruebaTDosMedias(x, y, obtenerNivel());
  if (!res) { avisarEstadistica("Datos insuficientes."); return; }
  mostrarPruebaTDosMedias(datos.columnas[i1].nombre, datos.columnas[i2].nombre, res);
  mostrarSeccion("resultados");
}

function ejecutarICProporcion() {
  var exitos = Number(document.getElementById("input-exitos").value);
  var total = Number(document.getElementById("input-total").value);
  if (isNaN(exitos) || isNaN(total) || total <= 0 || exitos < 0 || exitos > total) {
    avisarEstadistica("Verifica éxitos y total."); return;
  }
  var res = intervaloConfianzaProporcion(exitos, total, obtenerNivel());
  if (!res) { avisarEstadistica("No se pudo calcular."); return; }
  mostrarICProporcion(res);
  mostrarSeccion("resultados");
}

function ejecutarPruebaPendiente() {
  var ix = Number(document.getElementById("select-x-pend").value);
  var iy = Number(document.getElementById("select-y-pend").value);
  if (isNaN(ix) || isNaN(iy)) { avisarEstadistica("Selecciona dos variables."); return; }
  var pares = paresValidos(datos.columnas[ix], datos.columnas[iy]);
  var res = pruebaTPendiente(pares.x, pares.y, obtenerNivel());
  if (!res) { avisarEstadistica("Datos insuficientes o X constante."); return; }
  mostrarPruebaPendiente(datos.columnas[ix].nombre, datos.columnas[iy].nombre, res);
  mostrarSeccion("resultados");
}

// =============================================================================
// Aprendizaje no supervisado: clustering, estado de carga y configuración
// =============================================================================

function avisarAprendizaje(mensaje, tipo) {
  if (typeof window.mostrarToast === "function") window.mostrarToast(mensaje, tipo || "error");
  else console.info(mensaje);
}

// Lee y valida la configuración común de K-means y K-medoids; null si algo falla
function leerConfiguracionClustering() {
  var cols = obtenerColumnasSeleccionadas("select-vars-cluster");
  if (cols.length < 2) { avisarAprendizaje("Selecciona al menos 2 variables numéricas."); return null; }

  var k = Number(document.getElementById("input-k").value);
  var maxIter = Number(document.getElementById("input-max-iter").value);
  var estandarizar = document.getElementById("check-estandarizar").checked;
  var tipoDist = document.getElementById("select-distancia").value;
  var qMinkowski = Number(document.getElementById("input-q-minkowski").value) || 2;

  if (isNaN(k) || k < 1 || Math.floor(k) !== k) { avisarAprendizaje("K debe ser un número entero mayor o igual a 1."); return null; }
  if (isNaN(maxIter) || maxIter < 1) { avisarAprendizaje("Máx. iteraciones inválido."); return null; }
  if (tipoDist === "minkowski" && qMinkowski < 1) { avisarAprendizaje("El parámetro q de Minkowski debe ser al menos 1."); return null; }

  var matrizOriginal = extraerMatriz(cols);
  if (matrizOriginal.length < k) {
    avisarAprendizaje("Datos insuficientes: se necesitan al menos K observaciones completas.");
    return null;
  }

  var matriz = matrizOriginal;
  var medias = [];
  var desviaciones = [];

  if (estandarizar) {
    var d = matrizOriginal[0].length;
    for (var j = 0; j < d; j++) {
      var colVals = [];
      for (var i = 0; i < matrizOriginal.length; i++) colVals.push(matrizOriginal[i][j]);
      medias.push(media(colVals));
      desviaciones.push(desviacionMuestral(colVals));
    }
    matriz = estandarizarMatriz(matrizOriginal);
  }

  var nombres = [];
  for (var i2 = 0; i2 < cols.length; i2++) nombres.push(cols[i2].nombre);

  return {
    matriz: matriz,
    matrizOriginal: matrizOriginal,
    medias: medias,
    desviaciones: desviaciones,
    k: k,
    maxIter: maxIter,
    estandarizar: estandarizar,
    tipoDist: tipoDist,
    q: qMinkowski,
    nombres: nombres
  };
}

// Muestra el estado de carga (botón deshabilitado y spinner)
function ejecutarConCarga(boton, calcular) {
  var estado = document.getElementById("apr-estado");
  var seccion = document.getElementById("seccion-aprendizaje");
  if (boton) { boton.disabled = true; boton.classList.add("apr-cargando"); }
  if (seccion) seccion.setAttribute("aria-busy", "true");
  if (estado) estado.textContent = "Calculando…";

  setTimeout(function () {
    var inicio = (window.performance && window.performance.now) ? window.performance.now() : Date.now();
    var completo = false;
    try {
      completo = calcular();
    } finally {
      var fin = (window.performance && window.performance.now) ? window.performance.now() : Date.now();
      if (boton) { boton.disabled = false; boton.classList.remove("apr-cargando"); }
      if (seccion) seccion.removeAttribute("aria-busy");
      if (estado) estado.textContent = "";
      if (completo) {
        avisarAprendizaje("Clustering completado en " + ((fin - inicio) / 1000).toFixed(2) + " s", "exito");
      }
    }
  }, 30);
}

function ejecutarKmeansUI() {
  var config = leerConfiguracionClustering();
  if (!config) return;
  ejecutarConCarga(document.getElementById("btn-kmeans"), function () {
    var resultado = ejecutarKmeans(config.matriz, config.k, config.maxIter, config.tipoDist, config.q);
    if (!resultado) { avisarAprendizaje("No se pudo ejecutar K-means."); return false; }
    mostrarResultadoKmeans(config.nombres, resultado, config.estandarizar, config);
    mostrarSeccion("resultados");
    return true;
  });
}

function ejecutarKmedoidsUI() {
  var config = leerConfiguracionClustering();
  if (!config) return;
  ejecutarConCarga(document.getElementById("btn-kmedoids"), function () {
    var resultado = ejecutarKmedoids(config.matriz, config.k, config.maxIter, config.tipoDist, config.q);
    if (!resultado) { avisarAprendizaje("No se pudo ejecutar K-medoids."); return false; }
    mostrarResultadoKmedoids(config.nombres, resultado, config.estandarizar, config);
    mostrarSeccion("resultados");
    return true;
  });
}

// El campo q solo se muestra con la distancia de Minkowski
function actualizarCampoQ() {
  var campo = document.getElementById("apr-campo-q");
  var distancia = document.getElementById("select-distancia");
  if (campo && distancia) campo.hidden = distancia.value !== "minkowski";
}

// Tarjetas de algoritmo (role="radio")
function elegirAlgoritmo(tarjeta, enfocar) {
  var tarjetas = document.querySelectorAll(".apr-algoritmo");
  for (var i = 0; i < tarjetas.length; i++) {
    var elegida = tarjetas[i] === tarjeta;
    tarjetas[i].setAttribute("aria-checked", elegida ? "true" : "false");
    tarjetas[i].setAttribute("tabindex", elegida ? "0" : "-1");
    var boton = document.getElementById(tarjetas[i].getAttribute("data-boton"));
    if (boton) boton.hidden = !elegida;
  }
  if (enfocar) tarjeta.focus();
}

function inicializarPanelAprendizaje() {
  var distancia = document.getElementById("select-distancia");
  if (distancia) {
    distancia.addEventListener("change", actualizarCampoQ);
    actualizarCampoQ();
  }

  var tarjetas = Array.prototype.slice.call(document.querySelectorAll(".apr-algoritmo"));
  tarjetas.forEach(function (tarjeta, i) {
    tarjeta.addEventListener("click", function () { elegirAlgoritmo(tarjeta, false); });
    tarjeta.addEventListener("keydown", function (evento) {
      var destino = null;
      if (evento.key === " " || evento.key === "Enter") destino = tarjeta;
      else if (evento.key === "ArrowRight" || evento.key === "ArrowDown") destino = tarjetas[(i + 1) % tarjetas.length];
      else if (evento.key === "ArrowLeft" || evento.key === "ArrowUp") destino = tarjetas[(i - 1 + tarjetas.length) % tarjetas.length];
      if (!destino) return;
      evento.preventDefault();
      elegirAlgoritmo(destino, true);
    });
  });
  var inicial = document.querySelector('.apr-algoritmo[aria-checked="true"]') || tarjetas[0];
  if (inicial) elegirAlgoritmo(inicial, false);

  // Tooltips: Escape los oculta mientras el foco o el mouse siguen encima
  document.addEventListener("keydown", function (evento) {
    if (evento.key !== "Escape") return;
    var abiertos = document.querySelectorAll(".apr-ayuda");
    for (var j = 0; j < abiertos.length; j++) abiertos[j].classList.add("apr-ayuda--oculta");
  });
  var ayudas = document.querySelectorAll(".apr-ayuda");
  for (var a = 0; a < ayudas.length; a++) {
    ayudas[a].addEventListener("mouseleave", function () { this.classList.remove("apr-ayuda--oculta"); });
    ayudas[a].addEventListener("focusout", function () { this.classList.remove("apr-ayuda--oculta"); });
  }
}

document.addEventListener("DOMContentLoaded", inicializarPanelAprendizaje);

function ejecutarGraficoHistograma() {
  var idx = Number(document.getElementById("select-graf-hist").value);
  if (isNaN(idx) || !datos.columnas[idx]) { avisarGraficos("Selecciona una variable numérica."); return; }
  var numInt = Number(document.getElementById("input-graf-hist-int").value);
  if (isNaN(numInt) || numInt < 1) { avisarGraficos("Número de intervalos inválido."); return; }
  var valores = valoresNumericosValidos(datos.columnas[idx].valores);
  if (valores.length === 0) { avisarGraficos("Sin valores numéricos válidos."); return; }

  limpiarResultados();
  mostrarTituloResultado("Histograma: " + datos.columnas[idx].nombre);
  var svg = dibujarHistograma(valores, datos.columnas[idx].nombre, numInt);
  if (svg) mostrarGrafico(svg);
  mostrarSeccion("resultados");
}

function ejecutarGraficoBarras() {
  var idx = Number(document.getElementById("select-graf-barras").value);
  if (isNaN(idx) || !datos.columnas[idx]) { avisarGraficos("Selecciona una variable."); return; }
  limpiarResultados();
  mostrarTituloResultado("Gráfico de barras: " + datos.columnas[idx].nombre);
  var svg = dibujarBarras(datos.columnas[idx].valores, datos.columnas[idx].nombre);
  if (svg) mostrarGrafico(svg);
  mostrarSeccion("resultados");
}

function ejecutarGraficoCaja() {
  var idx = Number(document.getElementById("select-graf-caja").value);
  if (isNaN(idx) || !datos.columnas[idx]) { avisarGraficos("Selecciona una variable numérica."); return; }
  limpiarResultados();
  mostrarTituloResultado("Diagrama de caja: " + datos.columnas[idx].nombre);
  var svg = dibujarCaja(datos.columnas[idx].valores, datos.columnas[idx].nombre);
  if (svg) mostrarGrafico(svg);
  mostrarSeccion("resultados");
}

function ejecutarGraficoDispersion() {
  var ix = Number(document.getElementById("select-graf-disp-x").value);
  var iy = Number(document.getElementById("select-graf-disp-y").value);
  if (isNaN(ix) || isNaN(iy)) { avisarGraficos("Selecciona dos variables."); return; }
  var pares = paresValidos(datos.columnas[ix], datos.columnas[iy]);
  if (pares.n < 2) { avisarGraficos("Datos insuficientes."); return; }

  var incluirRecta = document.getElementById("check-graf-recta").checked;
  var reg = null;
  if (incluirRecta) {
    reg = regresionSimple(pares.x, pares.y);
  }

  limpiarResultados();
  mostrarTituloResultado("Dispersión: " + datos.columnas[ix].nombre + " vs " + datos.columnas[iy].nombre);
  var svg = dibujarDispersion(pares.x, pares.y, datos.columnas[ix].nombre, datos.columnas[iy].nombre, reg);
  if (svg) mostrarGrafico(svg);
  if (reg) {
    mostrarParrafo("Ecuación ajustada: Y = " + formatearNumero(reg.b0) + " + " + formatearNumero(reg.b1) + " * X");
    mostrarParrafo("R² = " + formatearNumero(reg.r2));
  }
  mostrarSeccion("resultados");
}
