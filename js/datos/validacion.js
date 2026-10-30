// Validaciones de datos

// Detecta el tipo de una columna a partir de sus valores
function detectarTipoColumna(valores) {
  var tieneNumeros = false;
  var tieneTexto = false;

  for (var i = 0; i < valores.length; i++) {
    var v = valores[i];
    if (v === null || v === undefined || v === "") continue;

    if (typeof v === "number" && !isNaN(v)) {
      tieneNumeros = true;
    } else {
      var num = Number(v);
      if (!isNaN(num) && String(v).trim() !== "") {
        tieneNumeros = true;
      } else {
        tieneTexto = true;
      }
    }
  }

  if (tieneTexto) return "categorica";
  if (tieneNumeros) return "numerica";
  return "vacia";
}

// Cuenta valores vacíos en una columna
function contarVacios(valores) {
  var cuenta = 0;
  for (var i = 0; i < valores.length; i++) {
    if (valores[i] === null || valores[i] === undefined || valores[i] === "") {
      cuenta++;
    }
  }
  return cuenta;
}

// Devuelve un arreglo solo con valores numéricos válidos (ignora vacíos y texto)
function valoresNumericosValidos(valores) {
  var resultado = [];
  for (var i = 0; i < valores.length; i++) {
    var v = valores[i];
    if (v === null || v === undefined || v === "") continue;
    var num = Number(v);
    if (!isNaN(num)) {
      resultado.push(num);
    }
  }
  return resultado;
}

// Verifica si una columna es numérica
function esColumnaNumerica(columna) {
  return columna.tipo === "numerica";
}

// Actualiza el tipo de todas las columnas según sus valores
function actualizarTiposColumnas() {
  for (var c = 0; c < datos.columnas.length; c++) {
    datos.columnas[c].tipo = detectarTipoColumna(datos.columnas[c].valores);
  }
}

// Devuelve un resumen de problemas encontrados
function validarDatos() {
  var problemas = [];
  actualizarTiposColumnas();

  for (var c = 0; c < datos.columnas.length; c++) {
    var col = datos.columnas[c];
    var vacios = contarVacios(col.valores);
    if (vacios > 0) {
      problemas.push("Columna '" + col.nombre + "': " + vacios + " valor(es) vacío(s).");
    }
    if (col.tipo === "vacia") {
      problemas.push("Columna '" + col.nombre + "': sin datos.");
    }
  }
  return problemas;
}