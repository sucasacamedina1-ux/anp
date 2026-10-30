// P1 · Pestañas accesibles del menú y barra de estado
// No cambia la lógica de principal.js: observa qué sección está visible
// (la muestre el menú o el código con mostrarSeccion) y sincroniza las pestañas.

var NAV_SECCIONES = ["datos", "estadistica", "aprendizaje", "graficos", "resultados"];

// Nombre de la sección visible, o null
function seccionVisible() {
  for (var i = 0; i < NAV_SECCIONES.length; i++) {
    var el = document.getElementById("seccion-" + NAV_SECCIONES[i]);
    var disp = (typeof getComputedStyle === "function" ? getComputedStyle(el).display : (el && el.style && el.style.display ? el.style.display : "block"));
    if (el && disp !== "none") return NAV_SECCIONES[i];
  }
  return null;
}

// Marca la pestaña activa (aria-selected, foco itinerante y clase visual)
function sincronizarPestanas() {
  var activa = seccionVisible();
  var pestanas = document.querySelectorAll(".nav-pestana");
  for (var i = 0; i < pestanas.length; i++) {
    var esActiva = pestanas[i].getAttribute("data-seccion") === activa;
    pestanas[i].setAttribute("aria-selected", esActiva ? "true" : "false");
    pestanas[i].setAttribute("tabindex", esActiva ? "0" : "-1");
    pestanas[i].classList.toggle("nav-pestana--activa", esActiva);
  }
  actualizarBarraEstado(activa);
}

// Texto de la barra de estado: tamaño de la hoja y sección actual
function actualizarBarraEstado(activa) {
  var enDatos = document.getElementById("app-estado-datos");
  if (enDatos && typeof datos !== "undefined" && datos && datos.columnas) {
    enDatos.textContent = datos.filas + (datos.filas === 1 ? " fila" : " filas") + " · " +
      datos.columnas.length + (datos.columnas.length === 1 ? " variable" : " variables");
  }
  var enSeccion = document.getElementById("app-estado-seccion");
  var pestana = activa ? document.querySelector('.nav-pestana[data-seccion="' + activa + '"]') : null;
  if (enSeccion && pestana) enSeccion.textContent = "Sección: " + pestana.textContent.trim();
}

// Flechas, Inicio y Fin mueven el foco y activan la pestaña (el clic lo maneja principal.js)
function manejarTecladoPestanas(evento) {
  var pestanas = Array.prototype.slice.call(document.querySelectorAll(".nav-pestana"));
  var actual = pestanas.indexOf(evento.currentTarget);
  var destino = null;
  if (evento.key === "ArrowRight") destino = pestanas[(actual + 1) % pestanas.length];
  else if (evento.key === "ArrowLeft") destino = pestanas[(actual - 1 + pestanas.length) % pestanas.length];
  else if (evento.key === "Home") destino = pestanas[0];
  else if (evento.key === "End") destino = pestanas[pestanas.length - 1];
  if (!destino) return;
  evento.preventDefault();
  destino.focus();
  destino.click();
}

function inicializarNavegacion() {
  var pestanas = document.querySelectorAll(".nav-pestana");
  for (var i = 0; i < pestanas.length; i++) {
    pestanas[i].addEventListener("keydown", manejarTecladoPestanas);
  }

  // Cualquier cambio de sección actualiza las pestañas
  var observador = new MutationObserver(sincronizarPestanas);
  NAV_SECCIONES.forEach(function (nombre) {
    var el = document.getElementById("seccion-" + nombre);
    if (el) observador.observe(el, { attributes: true, attributeFilter: ["style", "class", "hidden"] });
  });

  // La tabla se vuelve a dibujar al editar, importar o pegar: refresca el resumen
  var tabla = document.getElementById("contenedor-tabla");
  if (tabla) {
    new MutationObserver(function () { actualizarBarraEstado(seccionVisible()); })
      .observe(tabla, { childList: true, subtree: true });
  }

  sincronizarPestanas();
}

document.addEventListener("DOMContentLoaded", inicializarNavegacion);
