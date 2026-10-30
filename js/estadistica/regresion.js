// Regresión lineal simple y múltiple

// Regresión lineal simple: Y = b0 + b1*X
function regresionSimple(x, y) {
  var n = x.length;
  if (n !== y.length || n < 2) return null;

  var mx = media(x);
  var my = media(y);

  var num = 0;
  var den = 0;
  for (var i = 0; i < n; i++) {
    num += (x[i] - mx) * (y[i] - my);
    den += Math.pow(x[i] - mx, 2);
  }

  if (den === 0) return null; // X constante

  var b1 = num / den;
  var b0 = my - b1 * mx;

  // Valores estimados y residuos
  var estimados = [];
  var residuos = [];
  for (var j = 0; j < n; j++) {
    var yhat = b0 + b1 * x[j];
    estimados.push(yhat);
    residuos.push(y[j] - yhat);
  }

  // R^2
  var ssTotal = 0;
  var ssResid = 0;
  for (var k = 0; k < n; k++) {
    ssTotal += Math.pow(y[k] - my, 2);
    ssResid += Math.pow(residuos[k], 2);
  }
  var r2 = ssTotal === 0 ? null : 1 - ssResid / ssTotal;

  return {
    b0: b0,
    b1: b1,
    r2: r2,
    estimados: estimados,
    residuos: residuos,
    n: n
  };
}

// Regresión lineal múltiple: Y = b0 + b1*X1 + ... + bk*Xk
// Resuelve por eliminación de Gauss las ecuaciones normales (X'X)b = X'Y
function regresionMultiple(y, columnasX) {
  var n = y.length;
  var k = columnasX.length;
  if (n < k + 1) return null;

  // Construir matriz X con columna de unos
  var X = [];
  for (var i = 0; i < n; i++) {
    var fila = [1];
    for (var j = 0; j < k; j++) {
      fila.push(columnasX[j][i]);
    }
    X.push(fila);
  }

  // X'X
  var XtX = [];
  for (var a = 0; a <= k; a++) {
    XtX.push([]);
    for (var b = 0; b <= k; b++) {
      var suma = 0;
      for (var r = 0; r < n; r++) {
        suma += X[r][a] * X[r][b];
      }
      XtX[a].push(suma);
    }
  }

  // X'Y
  var XtY = [];
  for (var c = 0; c <= k; c++) {
    var suma2 = 0;
    for (var r2 = 0; r2 < n; r2++) {
      suma2 += X[r2][c] * y[r2];
    }
    XtY.push(suma2);
  }

  // Resolver sistema por Gauss
  var coef = resolverSistema(XtX, XtY);
  if (coef === null) return null;

  // Estimados y residuos
  var estimados = [];
  var residuos = [];
  for (var m = 0; m < n; m++) {
    var yhat = coef[0];
    for (var j2 = 0; j2 < k; j2++) {
      yhat += coef[j2 + 1] * columnasX[j2][m];
    }
    estimados.push(yhat);
    residuos.push(y[m] - yhat);
  }

  // R^2 y R^2 ajustado
  var my = media(y);
  var ssTotal = 0;
  var ssResid = 0;
  for (var p = 0; p < n; p++) {
    ssTotal += Math.pow(y[p] - my, 2);
    ssResid += Math.pow(residuos[p], 2);
  }
  var r2 = ssTotal === 0 ? null : 1 - ssResid / ssTotal;
  var r2ajustado = null;
  if (r2 !== null && n > k + 1) {
    r2ajustado = 1 - (1 - r2) * (n - 1) / (n - k - 1);
  }

  return {
    coeficientes: coef,
    estimados: estimados,
    residuos: residuos,
    r2: r2,
    r2ajustado: r2ajustado,
    n: n,
    k: k
  };
}

// Resuelve un sistema lineal A*x = b mediante eliminación de Gauss con pivoteo parcial
function resolverSistema(A, b) {
  var n = A.length;
  // Copiar para no modificar originales
  var M = [];
  for (var i = 0; i < n; i++) {
    M.push(A[i].slice());
    M[i].push(b[i]);
  }

  for (var col = 0; col < n; col++) {
    // Pivoteo
    var maxFila = col;
    var maxVal = Math.abs(M[col][col]);
    for (var f = col + 1; f < n; f++) {
      if (Math.abs(M[f][col]) > maxVal) {
        maxVal = Math.abs(M[f][col]);
        maxFila = f;
      }
    }
    if (maxVal < 1e-12) return null; // Singular

    // Intercambiar filas
    if (maxFila !== col) {
      var temp = M[col];
      M[col] = M[maxFila];
      M[maxFila] = temp;
    }

    // Eliminar
    for (var f2 = col + 1; f2 < n; f2++) {
      var factor = M[f2][col] / M[col][col];
      for (var c2 = col; c2 <= n; c2++) {
        M[f2][c2] -= factor * M[col][c2];
      }
    }
  }

  // Sustitución hacia atrás
  var x = [];
  for (var i2 = n - 1; i2 >= 0; i2--) {
    var suma = M[i2][n];
    for (var j = i2 + 1; j < n; j++) {
      suma -= M[i2][j] * x[j];
    }
    if (Math.abs(M[i2][i2]) < 1e-12) return null;
    x[i2] = suma / M[i2][i2];
  }
  return x;
}

// Extrae pares válidos para regresión múltiple
function datosRegresionMultiple(colY, columnasX) {
  var y = [];
  var xs = [];
  var n = colY.valores.length;

  for (var i = 0; i < n; i++) {
    var vy = colY.valores[i];
    if (vy === null || vy === undefined || vy === "") continue;
    var ny = Number(vy);
    if (isNaN(ny)) continue;

    var filaX = [];
    var valido = true;
    for (var j = 0; j < columnasX.length; j++) {
      var vx = columnasX[j].valores[i];
      if (vx === null || vx === undefined || vx === "") { valido = false; break; }
      var nx = Number(vx);
      if (isNaN(nx)) { valido = false; break; }
      filaX.push(nx);
    }
    if (!valido) continue;

    y.push(ny);
    xs.push(filaX);
  }

  // Transponer xs a columnas
  var columnas = [];
  for (var c = 0; c < columnasX.length; c++) {
    columnas.push([]);
    for (var f = 0; f < xs.length; f++) {
      columnas[c].push(xs[f][c]);
    }
  }

  return { y: y, columnasX: columnas, n: y.length };
}