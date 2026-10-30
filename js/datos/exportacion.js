// Exportación de datos a CSV

function exportarCSV() {
  if (datos.columnas.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  var lineas = [];

  // Encabezado
  var encabezado = [];
  for (var c = 0; c < datos.columnas.length; c++) {
    encabezado.push(datos.columnas[c].nombre);
  }
  lineas.push(encabezado.join(","));

  // Filas
  for (var f = 0; f < datos.filas; f++) {
    var fila = [];
    for (var c2 = 0; c2 < datos.columnas.length; c2++) {
      var v = datos.columnas[c2].valores[f];
      if (v === null || v === undefined) {
        fila.push("");
      } else {
        fila.push(String(v));
      }
    }
    lineas.push(fila.join(","));
  }

  var contenido = lineas.join("\n");
  var blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
  var url = URL.createObjectURL(blob);

  var enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "datos_estadistica_web.csv";
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}