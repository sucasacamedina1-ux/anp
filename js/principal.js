// Arranque de la aplicación, navegación y conexión de botones

document.addEventListener("DOMContentLoaded", function () {

  dibujarTabla();
  actualizarSelectoresVariables();

  var botones = document.querySelectorAll("nav button");
  for (var i = 0; i < botones.length; i++) {
    botones[i].addEventListener("click", function () {
      var seccion = this.getAttribute("data-seccion");
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
  var secciones = ["datos", "estadistica", "aprendizaje", "graficos", "resultados"];
  for (var i = 0; i < secciones.length; i++) {
    var el = document.getElementById("seccion-" + secciones[i]);
    if (el) el.style.display = (secciones[i] === nombre) ? "block" : "none";
  }
}

function actualizarSelectoresVariables() {
  actualizarTiposColumnas();

  var ids = [
    "select-variable-univariada", "select-variable-intervalos",
    "select-x-multi", "select-y-multi", "select-matriz",
    "select-x-reg", "select-y-reg", "select-y-regmul", "select-x-regmul",
    "select-inf-var", "select-grupo1", "select-grupo2",
    "select-x-pend", "select-y-pend", "select-vars-cluster",
    "select-graf-hist", "select-graf-barras", "select-graf-caja",
    "select-graf-disp-x", "select-graf-disp-y"
  ];

  for (var i = 0; i < ids.length; i++) {
    var sel = document.getElementById(ids[i]);
    if (!sel) continue;

    var seleccionPrevia = [];
    for (var s = 0; s < sel.options.length; s++) {
      if (sel.options[s].selected) seleccionPrevia.push(sel.options[s].value);
    }

    sel.innerHTML = "";

    for (var c = 0; c < datos.columnas.length; c++) {
      var col = datos.columnas[c];

      if (ids[i] === "select-variable-intervalos" && col.tipo !== "numerica") continue;
      if (ids[i] === "select-vars-cluster" && col.tipo !== "numerica") continue;
      if (ids[i] === "select-graf-hist" && col.tipo !== "numerica") continue;
      if (ids[i] === "select-graf-caja" && col.tipo !== "numerica") continue;
      if (ids[i] === "select-graf-disp-x" && col.tipo !== "numerica") continue;
      if (ids[i] === "select-graf-disp-y" && col.tipo !== "numerica") continue;

      var opt = document.createElement("option");
      opt.value = c;
      opt.textContent = col.nombre;
      if (seleccionPrevia.indexOf(String(c)) !== -1) opt.selected = true;
      sel.appendChild(opt);
    }

    if (sel.options.length === 0 && ids[i] === "select-vars-cluster") {
      for (var c3 = 0; c3 < datos.columnas.length; c3++) {
        var opt2 = document.createElement("option");
        opt2.value = c3;
        opt2.textContent = datos.columnas[c3].nombre;
        sel.appendChild(opt2);
      }
    }
  }
}

function ejecutarResumenUnivariado() {
  var idx = Number(document.getElementById("select-variable-univariada").value);
  if (isNaN(idx) || !datos.columnas[idx]) { alert("Selecciona una variable."); return; }
  var col = datos.columnas[idx];
  var valores = valoresNumericosValidos(col.valores);
  if (valores.length === 0) { alert("Sin valores numéricos válidos."); return; }
  mostrarResumenUnivariado(col.nombre, resumenUnivariado(valores));
  mostrarSeccion("resultados");
}

function ejecutarFrecuencias() {
  var idx = Number(document.getElementById("select-variable-univariada").value);
  if (isNaN(idx) || !datos.columnas[idx]) { alert("Selecciona una variable."); return; }
  var col = datos.columnas[idx];
  var tabla = tablaFrecuencias(col.valores);
  if (!tabla || tabla.total === 0) { alert("Sin datos."); return; }
  mostrarTablaFrecuencias(col.nombre, tabla);
  mostrarSeccion("resultados");
}

function ejecutarIntervalos() {
  var idx = Number(document.getElementById("select-variable-intervalos").value);
  if (isNaN(idx) || !datos.columnas[idx]) { alert("Selecciona una variable numérica."); return; }
  var numInt = Number(document.getElementById("input-num-intervalos").value);
  if (isNaN(numInt) || numInt < 1) { alert("Número de intervalos inválido."); return; }
  var tabla = tablaFrecuenciasIntervalos(datos.columnas[idx].valores, numInt);
  if (!tabla) { alert("Sin valores numéricos válidos."); return; }
  mostrarTablaIntervalos(datos.columnas[idx].nombre, tabla);
  mostrarSeccion("resultados");
}

function ejecutarCovCor() {
  var ix = Number(document.getElementById("select-x-multi").value);
  var iy = Number(document.getElementById("select-y-multi").value);
  if (isNaN(ix) || isNaN(iy) || !datos.columnas[ix] || !datos.columnas[iy]) {
    alert("Selecciona dos variables."); return;
  }
  var pares = paresValidos(datos.columnas[ix], datos.columnas[iy]);
  if (pares.n < 2) { alert("Se necesitan al menos 2 pares válidos."); return; }
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
  for (var i = 0; i < sel.options.length; i++) {
    if (sel.options[i].selected) cols.push(datos.columnas[Number(sel.options[i].value)]);
  }
  return cols;
}

function ejecutarMatrizCov() {
  var cols = obtenerColumnasSeleccionadas("select-matriz");
  if (cols.length < 2) { alert("Selecciona al menos 2 variables."); return; }
  var nombres = [];
  for (var i = 0; i < cols.length; i++) nombres.push(cols[i].nombre);
  mostrarMatriz("Matriz de covarianzas (muestral)", nombres, matrizCovarianzas(cols));
  mostrarSeccion("resultados");
}

function ejecutarMatrizCor() {
  var cols = obtenerColumnasSeleccionadas("select-matriz");
  if (cols.length < 2) { alert("Selecciona al menos 2 variables."); return; }
  var nombres = [];
  for (var i = 0; i < cols.length; i++) nombres.push(cols[i].nombre);
  mostrarMatriz("Matriz de correlaciones", nombres, matrizCorrelaciones(cols));
  mostrarSeccion("resultados");
}

function ejecutarRegSimple() {
  var ix = Number(document.getElementById("select-x-reg").value);
  var iy = Number(document.getElementById("select-y-reg").value);
  if (isNaN(ix) || isNaN(iy)) { alert("Selecciona dos variables."); return; }
  var pares = paresValidos(datos.columnas[ix], datos.columnas[iy]);
  if (pares.n < 2) { alert("Datos insuficientes."); return; }
  var reg = regresionSimple(pares.x, pares.y);
  if (!reg) { alert("No se pudo calcular (X constante o datos insuficientes)."); return; }
  mostrarRegresionSimple(datos.columnas[ix].nombre, datos.columnas[iy].nombre, reg);
  mostrarSeccion("resultados");
}

function ejecutarRegMultiple() {
  var iy = Number(document.getElementById("select-y-regmul").value);
  if (isNaN(iy)) { alert("Selecciona la variable Y."); return; }
  var colsX = obtenerColumnasSeleccionadas("select-x-regmul");
  if (colsX.length < 1) { alert("Selecciona al menos una variable X."); return; }

  var datosReg = datosRegresionMultiple(datos.columnas[iy], colsX);
  if (datosReg.n < colsX.length + 1) {
    alert("Datos insuficientes: más observaciones que variables."); return;
  }
  var reg = regresionMultiple(datosReg.y, datosReg.columnasX);
  if (!reg) { alert("No se pudo estimar (matriz singular o colinealidad)."); return; }

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
  if (isNaN(idx)) { alert("Selecciona una variable."); return; }
  var valores = valoresNumericosValidos(datos.columnas[idx].valores);
  var ic = intervaloConfianzaMedia(valores, obtenerNivel());
  if (!ic) { alert("Datos insuficientes (n < 2)."); return; }
  mostrarICMedia(datos.columnas[idx].nombre, ic);
  mostrarSeccion("resultados");
}

function ejecutarTUnaMedia() {
  var idx = Number(document.getElementById("select-inf-var").value);
  if (isNaN(idx)) { alert("Selecciona una variable."); return; }
  var mu0 = Number(document.getElementById("input-mu0").value);
  if (isNaN(mu0)) { alert("Ingresa un valor válido para H₀."); return; }
  var valores = valoresNumericosValidos(datos.columnas[idx].valores);
  var res = pruebaTUnaMedia(valores, mu0, obtenerNivel());
  if (!res) { alert("Datos insuficientes o varianza cero."); return; }
  mostrarPruebaTUnaMedia(datos.columnas[idx].nombre, res);
  mostrarSeccion("resultados");
}

function ejecutarTDosMedias() {
  var i1 = Number(document.getElementById("select-grupo1").value);
  var i2 = Number(document.getElementById("select-grupo2").value);
  if (isNaN(i1) || isNaN(i2)) { alert("Selecciona dos variables."); return; }
  var x = valoresNumericosValidos(datos.columnas[i1].valores);
  var y = valoresNumericosValidos(datos.columnas[i2].valores);
  var res = pruebaTDosMedias(x, y, obtenerNivel());
  if (!res) { alert("Datos insuficientes."); return; }
  mostrarPruebaTDosMedias(datos.columnas[i1].nombre, datos.columnas[i2].nombre, res);
  mostrarSeccion("resultados");
}

function ejecutarICProporcion() {
  var exitos = Number(document.getElementById("input-exitos").value);
  var total = Number(document.getElementById("input-total").value);
  if (isNaN(exitos) || isNaN(total) || total <= 0 || exitos < 0 || exitos > total) {
    alert("Verifica éxitos y total."); return;
  }
  var res = intervaloConfianzaProporcion(exitos, total, obtenerNivel());
  if (!res) { alert("No se pudo calcular."); return; }
  mostrarICProporcion(res);
  mostrarSeccion("resultados");
}

function ejecutarPruebaPendiente() {
  var ix = Number(document.getElementById("select-x-pend").value);
  var iy = Number(document.getElementById("select-y-pend").value);
  if (isNaN(ix) || isNaN(iy)) { alert("Selecciona dos variables."); return; }
  var pares = paresValidos(datos.columnas[ix], datos.columnas[iy]);
  var res = pruebaTPendiente(pares.x, pares.y, obtenerNivel());
  if (!res) { alert("Datos insuficientes o X constante."); return; }
  mostrarPruebaPendiente(datos.columnas[ix].nombre, datos.columnas[iy].nombre, res);
  mostrarSeccion("resultados");
}

function ejecutarKmeansUI() {
  var cols = obtenerColumnasSeleccionadas("select-vars-cluster");
  if (cols.length < 1) { alert("Selecciona al menos 1 variable numérica."); return; }

  var k = Number(document.getElementById("input-k").value);
  var maxIter = Number(document.getElementById("input-max-iter").value);
  var estandarizar = document.getElementById("check-estandarizar").checked;
  var tipoDist = document.getElementById("select-distancia").value;
  var qMinkowski = Number(document.getElementById("input-q-minkowski").value) || 2;

  if (isNaN(k) || k < 1) { alert("K debe ser un entero positivo."); return; }
  if (isNaN(maxIter) || maxIter < 1) { alert("Máx. iteraciones inválido."); return; }

  var matriz = extraerMatriz(cols);
  if (matriz.length < k) {
    alert("Datos insuficientes: se necesitan al menos K observaciones completas.");
    return;
  }

  if (estandarizar) matriz = estandarizarMatriz(matriz);

  var resultado = ejecutarKmeans(matriz, k, maxIter, tipoDist, qMinkowski);
  if (!resultado) { alert("No se pudo ejecutar K-means."); return; }

  var nombres = [];
  for (var i = 0; i < cols.length; i++) nombres.push(cols[i].nombre);

  mostrarResultadoKmeans(nombres, resultado, estandarizar);
  mostrarSeccion("resultados");
}

function ejecutarKmedoidsUI() {
  var cols = obtenerColumnasSeleccionadas("select-vars-cluster");
  if (cols.length < 1) { alert("Selecciona al menos 1 variable numérica."); return; }

  var k = Number(document.getElementById("input-k").value);
  var maxIter = Number(document.getElementById("input-max-iter").value);
  var estandarizar = document.getElementById("check-estandarizar").checked;
  var tipoDist = document.getElementById("select-distancia").value;
  var qMinkowski = Number(document.getElementById("input-q-minkowski").value) || 2;

  if (isNaN(k) || k < 1) { alert("K debe ser un entero positivo."); return; }
  if (isNaN(maxIter) || maxIter < 1) { alert("Máx. iteraciones inválido."); return; }

  var matriz = extraerMatriz(cols);
  if (matriz.length < k) {
    alert("Datos insuficientes: se necesitan al menos K observaciones completas.");
    return;
  }

  if (estandarizar) matriz = estandarizarMatriz(matriz);

  var resultado = ejecutarKmedoids(matriz, k, maxIter, tipoDist, qMinkowski);
  if (!resultado) { alert("No se pudo ejecutar K-medoids."); return; }

  var nombres = [];
  for (var i = 0; i < cols.length; i++) nombres.push(cols[i].nombre);

  mostrarResultadoKmedoids(nombres, resultado, estandarizar);
  mostrarSeccion("resultados");
}

function ejecutarGraficoHistograma() {
  var idx = Number(document.getElementById("select-graf-hist").value);
  if (isNaN(idx) || !datos.columnas[idx]) { alert("Selecciona una variable numérica."); return; }
  var numInt = Number(document.getElementById("input-graf-hist-int").value);
  if (isNaN(numInt) || numInt < 1) { alert("Número de intervalos inválido."); return; }
  var valores = valoresNumericosValidos(datos.columnas[idx].valores);
  if (valores.length === 0) { alert("Sin valores numéricos válidos."); return; }

  limpiarResultados();
  mostrarTituloResultado("Histograma: " + datos.columnas[idx].nombre);
  var svg = dibujarHistograma(valores, datos.columnas[idx].nombre, numInt);
  if (svg) mostrarGrafico(svg);
  mostrarSeccion("resultados");
}

function ejecutarGraficoBarras() {
  var idx = Number(document.getElementById("select-graf-barras").value);
  if (isNaN(idx) || !datos.columnas[idx]) { alert("Selecciona una variable."); return; }
  limpiarResultados();
  mostrarTituloResultado("Gráfico de barras: " + datos.columnas[idx].nombre);
  var svg = dibujarBarras(datos.columnas[idx].valores, datos.columnas[idx].nombre);
  if (svg) mostrarGrafico(svg);
  mostrarSeccion("resultados");
}

function ejecutarGraficoCaja() {
  var idx = Number(document.getElementById("select-graf-caja").value);
  if (isNaN(idx) || !datos.columnas[idx]) { alert("Selecciona una variable numérica."); return; }
  limpiarResultados();
  mostrarTituloResultado("Diagrama de caja: " + datos.columnas[idx].nombre);
  var svg = dibujarCaja(datos.columnas[idx].valores, datos.columnas[idx].nombre);
  if (svg) mostrarGrafico(svg);
  mostrarSeccion("resultados");
}

function ejecutarGraficoDispersion() {
  var ix = Number(document.getElementById("select-graf-disp-x").value);
  var iy = Number(document.getElementById("select-graf-disp-y").value);
  if (isNaN(ix) || isNaN(iy)) { alert("Selecciona dos variables."); return; }
  var pares = paresValidos(datos.columnas[ix], datos.columnas[iy]);
  if (pares.n < 2) { alert("Datos insuficientes."); return; }

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