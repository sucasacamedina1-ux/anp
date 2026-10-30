// Estructura de datos común y renderizado de la tabla editable
// Esta estructura es la fuente de verdad para todos los módulos.

var datos = {
  columnas: [
    { nombre: "Estudiante", tipo: "categorica", valores: ["A", "B", "C", "D", "E", "F"] },
    { nombre: "Horas de estudio", tipo: "numerica", valores: [1, 3, 5, 7, 9, 11] },
    { nombre: "Nota promedio", tipo: "numerica", valores: [9, 11, 13, 16, 18, 20] }
  ],
  filas: 6,
  asignaciones: [0, 0, 0, 1, 1, 1],
  seleccion: [],
  resultados: null
};

// Letra de columna estilo Excel: 0 → A, 25 → Z, 26 → AA
function letraColumna(indice) {
  var letra = "";
  indice++;
  while (indice > 0) {
    var resto = (indice - 1) % 26;
    letra = String.fromCharCode(65 + resto) + letra;
    indice = Math.floor((indice - 1) / 26);
  }
  return letra;
}
console.assert(letraColumna(0) === "A" && letraColumna(25) === "Z" && letraColumna(26) === "AA" && letraColumna(701) === "ZZ");

// Escapa texto para insertarlo en HTML
function escaparHTML(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Icono "×" para los botones de eliminar
var TABLA_ICONO_ELIMINAR = "<svg viewBox='0 0 24 24' aria-hidden='true' focusable='false'><path d='M7 7l10 10M17 7L7 17'/></svg>";

// Dibuja la tabla con el formato y estilo UNA/MultiStats
function dibujarTabla() {
  var contenedor = document.getElementById("contenedor-tabla");
  if (!contenedor) return;

  // Estado vacío
  if (datos.columnas.length === 0 || datos.filas === 0) {
    contenedor.innerHTML =
      "<div class='tabla-vacio'>" +
      "<p class='tabla-vacio-titulo'>Aún no hay datos en la hoja</p>" +
      "<p class='tabla-vacio-texto'>Importa un archivo CSV o pega datos copiados desde Excel (Ctrl+V).</p>" +
      "<button type='button' class='dash-btn-outline' onclick=\"document.getElementById('input-archivo').click()\">Importar CSV</button>" +
      "</div>";
    return;
  }

  var hayClusters = datos.asignaciones && datos.asignaciones.length === datos.filas;

  var html = "<div class='dash-tabla-contenedor'><table class='dash-tabla-data'>";

  // Fila de letras de columna estilo Excel
  html += "<thead><tr class='tabla-letras'><th></th>";
  for (var l = 0; l < datos.columnas.length; l++) {
    html += "<th>" + letraColumna(l) + "</th>";
  }
  if (hayClusters) html += "<th></th>";
  html += "<th></th></tr>";

  // Encabezados de columnas (Estilo UNA: verde azulado #005953)
  html += "<tr class='tabla-nombres'>";
  html += "<th style='width: 38px; text-align: center;'>#</th>";
  for (var c = 0; c < datos.columnas.length; c++) {
    var nombre = escaparHTML(datos.columnas[c].nombre);
    html += "<th><div style='display: flex; align-items: center; justify-content: space-between; gap: 4px;'>";
    html += "<input type='text' value='" + nombre + "' title='Editar nombre de columna' ";
    html += "style='color: #ffffff; font-weight: 600; background: transparent; border: none; font-size: 12px; width: 100%; cursor: text;' ";
    html += "onchange='cambiarNombreColumna(" + c + ", this.value)'>";
    html += "<button type='button' onclick='eliminarColumna(" + c + ")' title='Eliminar columna' ";
    html += "style='background: transparent; border: none; color: #a7f3d0; cursor: pointer; padding: 0 2px; font-size: 12px;'>×</button>";
    html += "</div></th>";
  }

  if (hayClusters) {
    html += "<th style='width: 80px; text-align: center;'>Clúster</th>";
  }

  html += "<th style='width: 32px; text-align: center;'></th>";
  html += "</tr></thead>";

  // Filas del cuerpo de la tabla
  html += "<tbody>";
  for (var f = 0; f < datos.filas; f++) {
    html += "<tr>";
    html += "<td style='text-align: center; font-weight: 600; color: #6f928d;'>" + (f + 1) + "</td>";

    for (var c2 = 0; c2 < datos.columnas.length; c2++) {
      var valor = datos.columnas[c2].valores[f];
      var esNumero = typeof valor === "number";
      if (valor === undefined || valor === null) valor = "";
      html += "<td style='" + (esNumero ? "text-align: right;" : "") + "'>";
      html += "<input type='text' value='" + escaparHTML(valor) + "' ";
      html += "style='text-align: " + (esNumero ? "right" : "left") + ";' ";
      html += "aria-label='Fila " + (f + 1) + ", " + escaparHTML(datos.columnas[c2].nombre) + "' ";
      html += "onchange='cambiarCelda(" + f + "," + c2 + ", this.value)'>";
      html += "</td>";
    }

    if (hayClusters) {
      var numCluster = (datos.asignaciones[f] !== undefined && datos.asignaciones[f] !== null) ? (datos.asignaciones[f] + 1) : 1;
      html += "<td style='text-align: center;'>";
      html += "<span class='dash-cluster-pill dash-cluster-pill--" + numCluster + "'>" + numCluster + "</span>";
      html += "</td>";
    }

    html += "<td style='text-align: center;'>";
    html += "<button type='button' onclick='eliminarFila(" + f + ")' title='Eliminar fila' ";
    html += "style='background: transparent; border: none; color: #6f928d; cursor: pointer; font-size: 13px;'>×</button>";
    html += "</td>";

    html += "</tr>";
  }
  html += "</tbody></table></div>";

  contenedor.innerHTML = html;
}

// Notifica a los selectores y barra de estado que los datos han cambiado
function notificarCambioDatos() {
  if (typeof actualizarTiposColumnas === "function") {
    actualizarTiposColumnas();
  }
  if (typeof actualizarSelectoresVariables === "function") {
    actualizarSelectoresVariables();
  }
  if (typeof actualizarResolucionPasoAPaso === "function") {
    actualizarResolucionPasoAPaso();
  }
  if (typeof actualizarBarraEstado === "function" && typeof seccionVisible === "function") {
    actualizarBarraEstado(seccionVisible());
  }
}

// Cambia el valor de una celda en la estructura de datos
function cambiarCelda(fila, columna, valor) {
  if (valor === "") {
    datos.columnas[columna].valores[fila] = null;
  } else {
    var num = Number(valor);
    if (!isNaN(num) && valor.trim() !== "") {
      datos.columnas[columna].valores[fila] = num;
    } else {
      datos.columnas[columna].valores[fila] = valor;
    }
  }
  if (typeof actualizarTiposColumnas === "function") {
    actualizarTiposColumnas();
  }
  if (typeof actualizarResolucionPasoAPaso === "function") {
    actualizarResolucionPasoAPaso();
  }
}

// Cambia el nombre de una columna
function cambiarNombreColumna(columna, nombre) {
  datos.columnas[columna].nombre = nombre;
  if (typeof actualizarSelectoresVariables === "function") {
    actualizarSelectoresVariables();
  }
  if (typeof actualizarResolucionPasoAPaso === "function") {
    actualizarResolucionPasoAPaso();
  }
}

// Agrega una fila vacía
function agregarFila() {
  for (var c = 0; c < datos.columnas.length; c++) {
    datos.columnas[c].valores.push(null);
  }
  datos.filas++;
  if (datos.asignaciones) datos.asignaciones.push(0);
  dibujarTabla();
  notificarCambioDatos();
}

// Agrega una columna vacía
function agregarColumna() {
  var nuevoNombre = "C" + (datos.columnas.length + 1);
  var nuevaColumna = { nombre: nuevoNombre, tipo: "numerica", valores: [] };
  for (var f = 0; f < datos.filas; f++) {
    nuevaColumna.valores.push(null);
  }
  datos.columnas.push(nuevaColumna);
  dibujarTabla();
  notificarCambioDatos();
}

// Elimina una fila con confirmación
function eliminarFila(fila) {
  if (!confirm("¿Eliminar la fila " + (fila + 1) + "?")) return;
  for (var c = 0; c < datos.columnas.length; c++) {
    datos.columnas[c].valores.splice(fila, 1);
  }
  if (datos.asignaciones) datos.asignaciones.splice(fila, 1);
  datos.filas--;
  dibujarTabla();
  notificarCambioDatos();
}

// Elimina una columna con confirmación
function eliminarColumna(columna) {
  if (!confirm("¿Eliminar la columna " + datos.columnas[columna].nombre + "?")) return;
  datos.columnas.splice(columna, 1);
  dibujarTabla();
  notificarCambioDatos();
}

// Reemplaza toda la estructura de datos (usado por importación y pegado)
function reemplazarDatos(nuevasColumnas) {
  datos.columnas = nuevasColumnas;
  datos.filas = 0;
  if (nuevasColumnas.length > 0) {
    datos.filas = nuevasColumnas[0].valores.length;
  }
  datos.asignaciones = null;
  datos.seleccion = [];
  datos.resultados = null;
  dibujarTabla();
  notificarCambioDatos();
}
