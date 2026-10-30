const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('--- INICIANDO PRUEBAS DEL DASHBOARD MULTISTATS ---');

// Mock DOM
class ElementMock {
  constructor(tag, id = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.children = [];
    this.style = {
      display: '',
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
    this.listeners = {};
    this.parentNode = null;
  }
  get firstChild() { return this.children[0] || null; }
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
      else if (sel.startsWith('[data-tab="') && el.getAttribute('data-tab') === sel.slice(11, -2)) results.push(el);
      else if (sel.startsWith('[data-filtro="') && el.getAttribute('data-filtro') === sel.slice(14, -2)) results.push(el);
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
  'dash-pasos-grid', 'dash-area-grafico', 'dash-barra-filtros', 'contenedor-tabla',
  'dash-select-algoritmo', 'dash-input-k', 'dash-k-up', 'dash-k-down',
  'dash-select-distancia', 'dash-centroides-aleatorio', 'dash-centroides-manual',
  'dash-btn-ejecutar', 'dash-btn-reiniciar', 'dash-interp-cuerpo',
  'dash-toast-completado', 'dash-toast-texto', 'dash-footer-estado',
  'dash-export-word', 'dash-export-pdf', 'dash-export-word-2', 'dash-export-pdf-2',
  'dash-generar-informe', 'dash-modal-avanzado', 'dash-modal-titulo',
  'btn-importar', 'btn-exportar', 'btn-agregar-fila', 'btn-agregar-columna', 'input-archivo',
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
  if (id.includes('select')) tag = 'select';
  else if (id.includes('input') || id.includes('check')) tag = 'input';
  else if (id.includes('btn') || id.includes('export')) tag = 'button';
  getOrCreate(id, tag);
});

docElements['dash-select-algoritmo'].value = 'kmeans';
docElements['dash-input-k'].value = '2';
docElements['dash-select-distancia'].value = 'euclidiana';

const tabs = ['dispersion', 'cluster', 'boxplot', 'pasos'].map(t => {
  const btn = new ElementMock('button');
  btn.setAttribute('data-tab', t);
  if (t === 'pasos') btn.classList.add('dash-res-tab--activo');
  return btn;
});

const pills = ['todos', 'media', 'varianza', 'covarianza', 'correlacion', 'cluster'].map(p => {
  const btn = new ElementMock('button');
  btn.setAttribute('data-filtro', p);
  if (p === 'todos') btn.classList.add('dash-pill--activo');
  return btn;
});

const documentMock = {
  getElementById: (id) => getOrCreate(id),
  createElement: (tag) => new ElementMock(tag),
  createElementNS: (ns, tag) => new ElementMock(tag),
  createTextNode: (t) => ({ textContent: t }),
  querySelector: (sel) => {
    if (sel.startsWith('#')) return getOrCreate(sel.slice(1));
    if (sel.includes('data-tab="')) {
      const tabVal = sel.split('data-tab="')[1].split('"')[0];
      return tabs.find(t => t.getAttribute('data-tab') === tabVal) || null;
    }
    if (sel.includes('data-filtro="')) {
      const filVal = sel.split('data-filtro="')[1].split('"')[0];
      return pills.find(p => p.getAttribute('data-filtro') === filVal) || null;
    }
    if (sel === '.dash-res-tab--activo') return tabs.find(t => t.classList.contains('dash-res-tab--activo')) || tabs[3];
    return new ElementMock('div');
  },
  querySelectorAll: (sel) => {
    if (sel === '.dash-res-tab') return tabs;
    if (sel === '.dash-pill') return pills;
    if (sel === '.dash-item-nav') return [];
    if (sel === 'nav button') return [];
    return [];
  },
  addEventListener: () => {}
};

const windowMock = {
  document: documentMock,
  performance: { now: () => Date.now() },
  Date: Date,
  Math: Math,
  confirm: () => true,
  alert: () => {},
  print: () => {},
  Blob: class {},
  URL: { createObjectURL: () => 'blob:mock', revokeObjectURL: () => {} }
};

const context = vm.createContext({
  window: windowMock,
  document: documentMock,
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  Math: Math,
  Date: Date,
  Number: Number,
  String: String,
  Array: Array,
  Object: Object,
  RegExp: RegExp,
  parseFloat: parseFloat,
  parseInt: parseInt,
  isNaN: isNaN,
  isFinite: isFinite,
  confirm: windowMock.confirm,
  alert: windowMock.alert
});

// Load all scripts
const scripts = [
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
  'js/aprendizaje/pasos.js',
  'js/principal.js',
  'js/base/navegacion.js'
];

for (const s of scripts) {
  const code = fs.readFileSync(path.join(__dirname, '..', s), 'utf8');
  vm.runInContext(code, context, { filename: s });
}

console.log('✓ Todos los 18 scripts cargados en el contexto');

// 1. Verificar renderizado de tabla con badges de cluster
vm.runInContext('dibujarTabla()', context);
const tablaHTML = docElements['contenedor-tabla'].innerHTML;
if (!tablaHTML.includes('dash-cluster-pill--1') || !tablaHTML.includes('dash-cluster-pill--2')) {
  throw new Error('Fallo: La tabla no contiene los badges de cluster esperados');
}
console.log('✓ Tabla inicial renderizada correctamente con badges Clúster 1 y 2');

// 2. Verificar resolución paso a paso (las 6 tarjetas matemáticas)
vm.runInContext('actualizarResolucionPasoAPaso()', context);
const pasosHTML = docElements['dash-pasos-grid'].innerHTML;
if (!pasosHTML.includes('Media y mediana') || !pasosHTML.includes('x̄ = Σxᵢ / n')) {
  throw new Error('Fallo: Tarjeta 1 (Media y mediana) faltante');
}
if (!pasosHTML.includes('Varianza muestral') || !pasosHTML.includes('s² = Σ(xᵢ - x̄)² / (n - 1)')) {
  throw new Error('Fallo: Tarjeta 2 (Varianza muestral) faltante');
}
if (!pasosHTML.includes('Desviación estándar y cuartiles') || !pasosHTML.includes('s = √s²')) {
  throw new Error('Fallo: Tarjeta 3 (Desviación estándar) faltante');
}
if (!pasosHTML.includes('Covarianza') || !pasosHTML.includes('15.8')) {
  throw new Error('Fallo: Tarjeta 4 (Covarianza Cov=15.8) faltante');
}
if (!pasosHTML.includes('Correlación de Pearson') || !pasosHTML.includes('0.998')) {
  throw new Error('Fallo: Tarjeta 5 (Correlación r=0.998) faltante');
}
if (!pasosHTML.includes('Clúster K-Means (K=2)') || !pasosHTML.includes('32')) {
  throw new Error('Fallo: Tarjeta 6 (Clúster K-Means SCDC=32) faltante');
}
console.log('✓ Las 6 tarjetas matemáticas de resolución paso a paso renderizadas con exactitud');

// 3. Verificar ejecución de clustering en el dashboard
vm.runInContext('ejecutarClusteringDashboard()', context);
const toastTexto = docElements['dash-toast-completado'].innerHTML;
if (!toastTexto.includes('Clustering completado')) {
  throw new Error('Fallo: Notificación toast no actualizada');
}
const footerHTML = docElements['dash-footer-estado'].innerHTML;
if (!footerHTML.includes('Listo') || !footerHTML.includes('K=2')) {
  throw new Error('Fallo: Barra de estado inferior no actualizada');
}
console.log('✓ Clustering ejecutado, toast y barra de estado verificados');

// 4. Verificar stepper de K (aumentar a 3)
vm.runInContext('cambiarK(1)', context);
const nuevoK = docElements['dash-input-k'].value;
if (nuevoK !== '3') {
  throw new Error('Fallo: Stepper de K no incrementó a 3, valor: ' + nuevoK);
}
console.log('✓ Stepper de K funcionando (K=3)');

// 5. Restablecer parámetros
vm.runInContext('reiniciarDashboard()', context);
if (docElements['dash-input-k'].value !== '2') {
  throw new Error('Fallo: Reiniciar dashboard no restableció K a 2');
}
console.log('✓ Reiniciar dashboard funcionando (K restablecido a 2)');

// 6. Verificar cambio de pestañas de visualización
vm.runInContext('cambiarTabResolucion("dispersion", window.document.querySelector(\'[data-tab="dispersion"]\'))', context);
if (docElements['dash-area-grafico'].style.display !== 'flex') {
  throw new Error('Fallo: El área de gráfico debería estar visible en el tab dispersión');
}
if (docElements['dash-pasos-grid'].style.display !== 'none') {
  throw new Error('Fallo: La cuadrícula de pasos debería estar oculta en el tab dispersión');
}
console.log('✓ Tab de Dispersión activado correctamente');

vm.runInContext('cambiarTabResolucion("pasos", window.document.querySelector(\'[data-tab="pasos"]\'))', context);
if (docElements['dash-pasos-grid'].style.display !== 'grid') {
  throw new Error('Fallo: La cuadrícula de pasos debería estar visible en el tab pasos');
}
console.log('✓ Tab de Resolución paso a paso restablecido a la vista');

// 7. Verificar filtrado de pasos por píldoras
vm.runInContext('filtrarPasoAPaso("media", window.document.querySelector(\'[data-filtro="media"]\'))', context);
console.log('✓ Filtrado por píldora (media) ejecutado');

vm.runInContext('filtrarPasoAPaso("todos", window.document.querySelector(\'[data-filtro="todos"]\'))', context);
console.log('✓ Filtrado por píldora (todos) restablecido');

// 8. Verificar funciones de limpiar y filtrar
vm.runInContext('limpiarTablaDatos()', context);
console.log('✓ limpiarTablaDatos() ejecutado con éxito');

vm.runInContext('filtrarDatosValidos()', context);
console.log('✓ filtrarDatosValidos() ejecutado con éxito');

console.log('--- TODAS LAS PRUEBAS DEL DASHBOARD PASARON EXITOSAMENTE (100%) ---');
