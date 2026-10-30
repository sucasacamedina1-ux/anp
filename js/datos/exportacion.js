// Exportación de datos a CSV

function exportarCSV() {
  if (datos.columnas.length === 0) {
    if (typeof window.mostrarToast === "function") {
      window.mostrarToast("No hay datos para exportar.", "aviso");
    } else {
      alert("No hay datos para exportar.");
    }
    return;
  }

  var escaparCSV = function (str) {
    if (str === null || str === undefined) return "";
    var s = String(str);
    if (s.indexOf(",") !== -1 || s.indexOf("\"") !== -1 || s.indexOf("\n") !== -1 || s.indexOf("\r") !== -1) {
      return "\"" + s.replace(/\"/g, "\"\"") + "\"";
    }
    return s;
  };

  var lineas = [];

  // Encabezado
  var encabezado = [];
  for (var c = 0; c < datos.columnas.length; c++) {
    encabezado.push(escaparCSV(datos.columnas[c].nombre));
  }
  lineas.push(encabezado.join(","));

  // Filas
  for (var f = 0; f < datos.filas; f++) {
    var fila = [];
    for (var c2 = 0; c2 < datos.columnas.length; c2++) {
      var v = datos.columnas[c2].valores[f];
      fila.push(escaparCSV(v));
    }
    lineas.push(fila.join(","));
  }

  var contenido = "\uFEFF" + lineas.join("\r\n"); // BOM para compatibilidad con Excel
  var blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
  var url = URL.createObjectURL(blob);

  var enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "multistats_datos.csv";
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);

  if (typeof window.mostrarToast === "function") {
    window.mostrarToast("Archivo multistats_datos.csv exportado.", "exito");
  }
}
