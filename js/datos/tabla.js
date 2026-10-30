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

// Dibuja la tabla en el contenedor indicado
function dibujarTabla() {
  var contenedor = document.getElementById("contenedor-tabla");
  if (!contenedor) return;

  var html = "<table>";

  // Encabezado con nombres de columnas editables y botón eliminar
  html += "<thead><tr><th>#</th>";
  for (var c = 0; c < datos.columnas.length; c++) {
    html += "<th>";
    html += "<input type='text' value='" + datos.columnas[c].nombre + "' ";
    html += "onchange='cambiarNombreColumna(" + c + ", this.value)'>";
    html += " <button onclick='eliminarColumna(" + c + ")'>X</button>";
    html += "</th>";
  }
  html += "<th>Acciones</th>";
  html += "</tr></thead>";

  // Cuerpo con celdas editables
  html += "<tbody>";
  for (var f = 0; f < datos.filas; f++) {
    html += "<tr>";
    html += "<td>" + (f + 1) + "</td>";
    for (var c2 = 0; c2 < datos.columnas.length; c2++) {
      var valor = datos.columnas[c2].valores[f];
      if (valor === undefined || valor === null) valor = "";
      html += "<td>";
      html += "<input type='text' value='" + valor + "' ";
      html += "onchange='cambiarCelda(" + f + "," + c2 + ", this.value)'>";
      html += "</td>";
    }
    html += "<td><button onclick='eliminarFila(" + f + ")'>X</button></td>";
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