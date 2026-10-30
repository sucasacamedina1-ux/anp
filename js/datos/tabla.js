// Estructura de datos común y renderizado de la tabla editable
// Esta estructura es la fuente de verdad para todos los módulos.

var datos = {
  columnas: [
    { nombre: "Edad", tipo: "numerica", valores: [18, 19, 20, 18] },
    { nombre: "Peso", tipo: "numerica", valores: [60, 65, 70, 58] },
    { nombre: "Nota", tipo: "numerica", valores: [14, 16, 15, 17] }
  ],
  filas: 4,
  seleccion: [],
  resultados: null
};

// Convierte un índice de columna en su letra estilo Excel (0 -> A, 26 -> AA)
function letraColumna(indice) {
  var letra = "";
  for (var n = indice + 1; n > 0; n = Math.floor((n - 1) / 26)) {
    letra = String.fromCharCode(65 + (n - 1) % 26) + letra;
  }
  return letra;
}
console.assert(letraColumna(0) === "A" && letraColumna(25) === "Z" && letraColumna(26) === "AA" && letraColumna(701) === "ZZ");

// Dibuja la tabla en el contenedor indicado
function dibujarTabla() {
  var contenedor = document.getElementById("contenedor-tabla");
  if (!contenedor) return;

  var html = "<table class='tabla-hoja'>";

  // Fila de letras de columna estilo Excel
  html += "<thead><tr><th class='tabla-num'></th>";
  for (var l = 0; l < datos.columnas.length; l++) {
    html += "<th class='tabla-letra'>" + letraColumna(l) + "</th>";
  }
  html += "<th class='tabla-letra tabla-acciones'></th></tr>";

  // Encabezado con nombres de columnas editables y botón eliminar
  html += "<tr><th class='tabla-num'>#</th>";
  for (var c = 0; c < datos.columnas.length; c++) {
    html += "<th class='tabla-variable'><div class='tabla-variable-contenido'>";
    html += "<input type='text' aria-label='Nombre de la columna " + letraColumna(c) + "' value='" + datos.columnas[c].nombre + "' ";
    html += "onchange='cambiarNombreColumna(" + c + ", this.value)'>";
    html += "<button class='tabla-boton-x' aria-label='Eliminar columna " + letraColumna(c) + "' onclick='eliminarColumna(" + c + ")'>&times;</button>";
    html += "</div></th>";
  }
  html += "<th class='tabla-variable tabla-acciones'>Acciones</th>";
  html += "</tr></thead>";

  // Cuerpo con celdas editables
  html += "<tbody>";
  for (var f = 0; f < datos.filas; f++) {
    html += "<tr>";
    html += "<td class='tabla-num'>" + (f + 1) + "</td>";
    for (var c2 = 0; c2 < datos.columnas.length; c2++) {
      var valor = datos.columnas[c2].valores[f];
      if (valor === undefined || valor === null) valor = "";
      html += "<td>";
      html += "<input type='text' class='" + (typeof valor === "number" ? "tabla-celda--num" : "") + "' aria-label='Celda " + letraColumna(c2) + (f + 1) + "' value='" + valor + "' ";
      html += "onchange='cambiarCelda(" + f + "," + c2 + ", this.value); this.classList.toggle(\"tabla-celda--num\", typeof datos.columnas[" + c2 + "].valores[" + f + "] === \"number\")'>";
      html += "</td>";
    }
    html += "<td class='tabla-acciones'><button class='tabla-boton-x' aria-label='Eliminar fila " + (f + 1) + "' onclick='eliminarFila(" + f + ")'>&times;</button></td>";
    html += "</tr>";
  }
  html += "</tbody></table>";

  contenedor.innerHTML = html;
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
}

// Cambia el nombre de una columna
function cambiarNombreColumna(columna, nombre) {
  datos.columnas[columna].nombre = nombre;
}

// Agrega una fila vacía
function agregarFila() {
  for (var c = 0; c < datos.columnas.length; c++) {
    datos.columnas[c].valores.push(null);
  }
  datos.filas++;
  dibujarTabla();
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
}

// Elimina una fila con confirmación
function eliminarFila(fila) {
  if (!confirm("¿Eliminar la fila " + (fila + 1) + "?")) return;
  for (var c = 0; c < datos.columnas.length; c++) {
    datos.columnas[c].valores.splice(fila, 1);
  }
  datos.filas--;
  dibujarTabla();
}

// Elimina una columna con confirmación
function eliminarColumna(columna) {
  if (!confirm("¿Eliminar la columna " + datos.columnas[columna].nombre + "?")) return;
  datos.columnas.splice(columna, 1);
  dibujarTabla();
}

// Reemplaza toda la estructura de datos (usado por importación)
function reemplazarDatos(nuevasColumnas) {
  datos.columnas = nuevasColumnas;
  datos.filas = 0;
  if (nuevasColumnas.length > 0) {
    datos.filas = nuevasColumnas[0].valores.length;
  }
  datos.seleccion = [];
  datos.resultados = null;
  dibujarTabla();
}