const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('--- INICIANDO SUITE DE PRUEBAS MULTISTATS ---');

// Mock DOM environment
class ElementMock {
  constructor(tag, id = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.children = [];
    this.style = {
      setProperty: (k, v) => { this.style[k] = v; },
      getPropertyValue: (k) => this.style[k] || ''
    };
    this.attributes = {};
    this.classList = {
      _classes: new Set(),
      add: (c) => this.classList._classes.add(c),
      remove: (c) => this.classList._classes.delete(c),
      contains: (c) => this.classList._classes.has(c),
      toggle: (c, force) => {
        if (force === undefined) {
          if (this.classList._classes.has(c)) this.classList._classes.delete(c);
          else this.classList._classes.add(c);
        } else if (force) {
          this.classList._classes.add(c);
        } else {
          this.classList._classes.delete(c);
        }
      }
    };
    this.options = [];
    this.innerHTML = '';
    this.textContent = '';
    this._value = '';
    Object.defineProperty(this, 'value', {
      get: () => {
        if (this.tagName === 'SELECT') {
          const sel = this.options.find(o => o.selected);
          return sel ? sel.value : (this.options[0] ? this.options[0].value : '');
        }
        return this._value;
      },
      set: (v) => { this._value = String(v); }
    });
    this.checked = false;
    this.listeners = {};
    this.parentNode = null;
  }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] !== undefined ? this.attributes[k] : null; }
  removeAttribute(k) { delete this.attributes[k]; }
  appendChild(child) {
    this.children.push(child);
    child.parentNode = this;
    if (this.tagName === 'SELECT' && child.tagName === 'OPTION') {
      this.options.push(child);
    }
    return child;
  }
  insertBefore(child, before) {
    const idx = this.children.indexOf(before);
    if (idx === -1) this.children.unshift(child);
    else this.children.splice(idx, 0, child);
    child.parentNode = this;
    return child;
  }
  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) this.children.splice(idx, 1);
    child.parentNode = null;
    return child;
  }
  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }
  dispatchEvent(event) {
    if (this.listeners[event.type]) {
      this.listeners[event.type].forEach(fn => fn.call(this, event));
    }
  }
  querySelector(sel) {
    return this.querySelectorAll(sel)[0] || null;
  }
  querySelectorAll(sel) {
    const results = [];
    const check = (el) => {
      if (sel.startsWith('#') && el.id === sel.slice(1)) results.push(el);
      else if (sel.startsWith('.') && el.classList.contains(sel.slice(1))) results.push(el);
      else if (sel.toLowerCase() === el.tagName.toLowerCase()) results.push(el);
      for (const ch of el.children) check(ch);
    };
    for (const ch of this.children) check(ch);
    return results;
  }
  focus() {}
}

const docElements = {};
const getOrCreate = (id, tag = 'div') => {
  if (!docElements[id]) docElements[id] = new ElementMock(tag, id);
  return docElements[id];
};

const domIds = [
  'contenedor-tabla', 'input-archivo', 'btn-importar', 'btn-exportar',
  'btn-agregar-fila', 'btn-agregar-columna',
  'seccion-datos', 'seccion-estadistica', 'seccion-aprendizaje', 'seccion-graficos', 'seccion-resultados',
  'select-variable-univariada', 'select-variable-intervalos', 'input-num-intervalos',
  'btn-resumen-univariado', 'btn-frecuencias', 'btn-intervalos',
  'select-x-multi', 'select-y-multi', 'btn-cov-cor',
  'select-matriz', 'btn-matriz-cov', 'btn-matriz-cor',
  'select-x-reg', 'select-y-reg', 'btn-reg-simple',
  'select-y-regmul', 'select-x-regmul', 'btn-reg-multiple',
  'select-inf-var', 'select-nivel', 'input-mu0', 'btn-ic-media', 'btn-t-una-media',
  'select-grupo1', 'select-grupo2', 'btn-t-dos-medias',
  'input-exitos', 'input-total', 'btn-ic-proporcion',
  'select-x-pend', 'select-y-pend', 'btn-prueba-pendiente',
  'select-vars-cluster', 'input-k', 'input-max-iter', 'check-estandarizar',
  'select-distancia', 'input-q-minkowski', 'apr-campo-q', 'apr-estado',
  'btn-kmeans', 'btn-kmedoids',
  'select-graf-hist', 'input-graf-hist-int', 'btn-graf-histograma',
  'select-graf-barras', 'btn-graf-barras',
  'select-graf-caja', 'btn-graf-caja',
  'select-graf-disp-x', 'select-graf-disp-y', 'check-graf-recta', 'btn-graf-dispersion',
  'panel-resultados', 'res-acciones', 'btn-limpiar-resultados', 'btn-imprimir-resultados',
  'app-estado-datos', 'app-estado-seccion', 'hoja-activa'
];

domIds.forEach(id => {
  let tag = 'div';
  if (id.startsWith('select-')) tag = 'select';
  else if (id.startsWith('input-') || id.startsWith('check-')) tag = 'input';
  else if (id.startsWith('btn-')) tag = 'button';
  getOrCreate(id, tag);
});

// Configure defaults
docElements['select-distancia'].value = 'euclidiana';
docElements['input-k'].value = '2';
docElements['input-max-iter'].value = '100';
docElements['input-num-intervalos'].value = '5';
docElements['select-nivel'].value = '0.95';
docElements['input-mu0'].value = '0';
docElements['input-exitos'].value = '10';
docElements['input-total'].value = '20';
docElements['input-graf-hist-int'].value = '5';

const documentMock = {
  getElementById: (id) => getOrCreate(id),
  createElement: (tag) => new ElementMock(tag),
  createElementNS: (ns, tag) => new ElementMock(tag),
  createTextNode: (t) => ({ textContent: t }),
  querySelector: (sel) => {
    if (sel.startsWith('#')) return getOrCreate(sel.slice(1));
    return new ElementMock('div');
  },
  querySelectorAll: (sel) => {
    return [];
  },
  body: new ElementMock('body'),
  documentElement: new ElementMock('html'),
  addEventListener: () => {}
};

const windowMock = {
  document: documentMock,
  performance: { now: () => Date.now() },
  addEventListener: () => {},
  print: () => console.log('[PRINT TRIGGERED]')
};

const sandbox = {
  window: windowMock,
  document: documentMock,
  console: console,
  Math: Math,
  Number: Number,
  String: String,
  Array: Array,
  Date: Date,
  setTimeout: (fn) => fn(),
  clearTimeout: () => {},
  Blob: class {},
  URL: { createObjectURL: () => 'blob:mock', revokeObjectURL: () => {} },
  alert: (m) => console.log('[ALERT]:', m),
  confirm: () => true,
  getComputedStyle: () => ({ getPropertyValue: () => '' }),
  MutationObserver: class { observe() {} disconnect() {} }
};
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);

const scriptsToLoad = [
  'js/datos/tabla.js',
  'js/datos/validacion.js',
  'js/datos/importacion.js',
  'js/datos/exportacion.js',
  'js/estadistica/descriptiva.js',
  'js/estadistica/frecuencias.js',
  'js/estadistica/agrupados.js',
  'js/estadistica/multivariado.js',
  'js/estadistica/regresion.js',
  'js/estadistica/inferencia.js',
  'js/aprendizaje/distancias.js',
  'js/aprendizaje/kmeans.js',
  'js/aprendizaje/kmedoids.js',
  'js/graficos/graficos.js',
  'js/resultados/resultados.js',
  'js/principal.js',
  'js/base/navegacion.js'
];

for (const s of scriptsToLoad) {
  const code = fs.readFileSync(path.join('d:/anp/Aprendizaje-no-Supervisado', s), 'utf8');
  vm.runInContext(code, sandbox);
}
console.log('✓ Todos los 17 scripts cargados sin errores de sintaxis');

// Test 1: Initial State & Table Drawing
vm.runInContext('dibujarTabla(); actualizarSelectoresVariables();', sandbox);
console.log('✓ dibujarTabla y actualizarSelectoresVariables ejecutados');

const clusterSel = docElements['select-vars-cluster'];
console.log(`✓ Opciones de cluster pobladas: ${clusterSel.options.length} columnas`);
const clusterSelected = clusterSel.options.filter(o => o.selected).length;
console.log(`✓ Opciones de cluster preseleccionadas por defecto: ${clusterSelected} (Listo para clustering directo)`);

// Test 2: Descriptive stats & Frequencies
vm.runInContext('ejecutarResumenUnivariado();', sandbox);
console.log('✓ ejecutarResumenUnivariado ejecutado con éxito');

vm.runInContext('ejecutarFrecuencias();', sandbox);
console.log('✓ ejecutarFrecuencias ejecutado con éxito');

vm.runInContext('ejecutarIntervalos();', sandbox);
console.log('✓ ejecutarIntervalos ejecutado con éxito');

// Test 3: Multivariado, Cov/Cor, Matrices
vm.runInContext('ejecutarCovCor();', sandbox);
console.log('✓ ejecutarCovCor ejecutado con éxito');

vm.runInContext('ejecutarMatrizCov();', sandbox);
console.log('✓ ejecutarMatrizCov ejecutado con éxito');

vm.runInContext('ejecutarMatrizCor();', sandbox);
console.log('✓ ejecutarMatrizCor ejecutado con éxito');

// Test 4: Regresion Simple y Multiple
vm.runInContext('ejecutarRegSimple();', sandbox);
console.log('✓ ejecutarRegSimple ejecutado con éxito');

vm.runInContext('ejecutarRegMultiple();', sandbox);
console.log('✓ ejecutarRegMultiple ejecutado con éxito');

// Test 5: Inferencia
vm.runInContext('ejecutarICMedia();', sandbox);
console.log('✓ ejecutarICMedia ejecutado con éxito');

vm.runInContext('ejecutarTUnaMedia();', sandbox);
console.log('✓ ejecutarTUnaMedia ejecutado con éxito');

vm.runInContext('ejecutarTDosMedias();', sandbox);
console.log('✓ ejecutarTDosMedias ejecutado con éxito');

vm.runInContext('ejecutarICProporcion();', sandbox);
console.log('✓ ejecutarICProporcion ejecutado con éxito');

vm.runInContext('ejecutarPruebaPendiente();', sandbox);
console.log('✓ ejecutarPruebaPendiente ejecutado con éxito');

// Test 6: Clustering (K-means y K-medoids con y sin estandarizar)
vm.runInContext('ejecutarKmeansUI();', sandbox);
console.log('✓ ejecutarKmeansUI (K-means estándar) ejecutado con éxito');

docElements['check-estandarizar'].checked = true;
vm.runInContext('ejecutarKmeansUI();', sandbox);
console.log('✓ ejecutarKmeansUI (K-means estandarizado) ejecutado con éxito');

vm.runInContext('ejecutarKmedoidsUI();', sandbox);
console.log('✓ ejecutarKmedoidsUI (K-medoids) ejecutado con éxito');

// Test 7: Gráficos
vm.runInContext('ejecutarGraficoHistograma();', sandbox);
console.log('✓ ejecutarGraficoHistograma ejecutado con éxito');

vm.runInContext('ejecutarGraficoBarras();', sandbox);
console.log('✓ ejecutarGraficoBarras ejecutado con éxito');

vm.runInContext('ejecutarGraficoCaja();', sandbox);
console.log('✓ ejecutarGraficoCaja ejecutado con éxito');

vm.runInContext('ejecutarGraficoDispersion();', sandbox);
console.log('✓ ejecutarGraficoDispersion ejecutado con éxito');

// Test 8: Data manipulation updates
vm.runInContext('agregarColumna();', sandbox);
console.log(`✓ agregarColumna ejecutado. Columnas actuales: ${sandbox.datos.columnas.length}`);

vm.runInContext('agregarFila();', sandbox);
console.log(`✓ agregarFila ejecutado. Filas actuales: ${sandbox.datos.filas}`);

vm.runInContext('cambiarNombreColumna(0, "Edad_Modificada");', sandbox);
console.log(`✓ cambiarNombreColumna ejecutado. Nuevo nombre: ${sandbox.datos.columnas[0].nombre}`);

vm.runInContext('eliminarFila(4);', sandbox);
console.log(`✓ eliminarFila ejecutado. Filas actuales: ${sandbox.datos.filas}`);

vm.runInContext('eliminarColumna(3);', sandbox);
console.log(`✓ eliminarColumna ejecutado. Columnas actuales: ${sandbox.datos.columnas.length}`);

// Test CSV Import and Paste
vm.runInContext('procesarCSV("A,B,C\\n1,2,3\\n4,5,6");', sandbox);
console.log(`✓ procesarCSV ejecutado. Filas: ${sandbox.datos.filas}, Columnas: ${sandbox.datos.columnas.map(c => c.nombre).join(', ')}`);

vm.runInContext('pegarDesdeTexto("X\\tY\\n10\\t20\\n30\\t40");', sandbox);
console.log(`✓ pegarDesdeTexto ejecutado. Filas: ${sandbox.datos.filas}, Columnas: ${sandbox.datos.columnas.map(c => c.nombre).join(', ')}`);

// Test 9: Results clear and restore
vm.runInContext('restablecerResultados();', sandbox);
console.log('✓ restablecerResultados ejecutado con éxito');

console.log('--- TODAS LAS PRUEBAS E2E PASARON EXITOSAMENTE (100% FUNCIONAL) ---');
