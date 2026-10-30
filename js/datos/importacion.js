// Importación de archivos CSV y pegado desde Excel

// Lee un archivo CSV y reemplaza los datos
function importarCSV(archivo) {
  var lector = new FileReader();

  lector.onload = function (evento) {
    var texto = evento.target.result;
    procesarCSV(texto);
  };

  lector.onerror = function () {
    alert("No se pudo leer el archivo.");
  };

  lector.readAsText(archivo);
}

// Procesa el texto CSV y reemplaza la estructura de datos
function procesarCSV(texto) {
  // Detectar delimitador: coma o punto y coma
  var delimitador = ",";
  var primeraLinea = texto.split("\n")[0];
  if (primeraLinea.indexOf(";") !== -1 && primeraLinea.indexOf(",") === -1) {
    delimitador = ";";
  }

  var lineas = texto.split(/\r?\n/);
  var filas = [];

  for (var i = 0; i < lineas.length; i++) {
    var linea = lineas[i].trim();
    if (linea === "") continue;
    filas.push(linea.split(delimitador));
  }

  if (filas.length === 0) {
    alert("El archivo está vacío.");
    return;
  }

  // Detectar si la primera fila es encabezado
  var primera = filas[0];
  var esEncabezado = false;
  var numerosEnPrimera = 0;
  for (var j = 0; j < primera.length; j++) {
    var num = Number(primera[j]);
    if (!isNaN(num) && primera[j].trim() !== "") numerosEnPrimera++;
  }
  if (numerosEnPrimera < primera.length) {
    esEncabezado = true;
  }

  var nombresColumnas = [];
  var inicioDatos = 0;

  if (esEncabezado) {
    nombresColumnas = primera;
    inicioDatos = 1;
  } else {
    for (var k = 0; k < primera.length; k++) {
      nombresColumnas.push("C" + (k + 1));
    }
  }

  // Detectar número máximo de columnas
  var maxCols = nombresColumnas.length;
  for (var m = inicioDatos; m < filas.length; m++) {
    if (filas[m].length > maxCols) maxCols = filas[m].length;
  }

  // Completar nombres si faltan
  while (nombresColumnas.length < maxCols) {
    nombresColumnas.push("C" + (nombresColumnas.length + 1));
  }

  // Construir columnas
  var nuevasColumnas = [];
  for (var c = 0; c < maxCols; c++) {
    nuevasColumnas.push({
      nombre: nombresColumnas[c].trim(),
      tipo: "numerica",
      valores: []
    });
  }

  // Llenar valores
  for (var f = inicioDatos; f < filas.length; f++) {
    for (var c2 = 0; c2 < maxCols; c2++) {
      var celda = filas[f][c2];
      if (celda === undefined || celda.trim() === "") {
        nuevasColumnas[c2].valores.push(null);
      } else {
        var num = Number(celda);
        if (!isNaN(num) && celda.trim() !== "") {
          nuevasColumnas[c2].valores.push(num);
        } else {
          nuevasColumnas[c2].valores.push(celda.trim());
        }
      }
    }
  }

  reemplazarDatos(nuevasColumnas);
  actualizarTiposColumnas();
  alert("CSV importado: " + datos.filas + " filas, " + datos.columnas.length + " columnas.");
}

// Pegado desde Excel (tabulaciones y saltos de línea)
function pegarDesdeTexto(texto) {
  var lineas = texto.split(/\r?\n/);
  var filas = [];

  for (var i = 0; i < lineas.length; i++) {
    var linea = lineas[i];
    if (linea.trim() === "") continue;
    filas.push(linea.split("\t"));
  }

  if (filas.length === 0) {
    alert("No hay datos para pegar.");
    return;
  }

  var maxCols = 0;
  for (var j = 0; j < filas.length; j++) {
    if (filas[j].length > maxCols) maxCols = filas[j].length;
  }

  var nuevasColumnas = [];
  for (var c = 0; c < maxCols; c++) {
    nuevasColumnas.push({
      nombre: "C" + (c + 1),
      tipo: "numerica",
      valores: []
    });
  }

  for (var f = 0; f < filas.length; f++) {
    for (var c2 = 0; c2 < maxCols; c2++) {
      var celda = filas[f][c2];
      if (celda === undefined || celda.trim() === "") {
        nuevasColumnas[c2].valores.push(null);
      } else {
        var num = Number(celda);
        if (!isNaN(num) && celda.trim() !== "") {
          nuevasColumnas[c2].valores.push(num);
        } else {
          nuevasColumnas[c2].valores.push(celda.trim());
        }
      }
    }
  }

  reemplazarDatos(nuevasColumnas);
  actualizarTiposColumnas();
  alert("Datos pegados: " + datos.filas + " filas, " + datos.columnas.length + " columnas.");
}