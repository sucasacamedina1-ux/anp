const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('--- INICIANDO PRUEBA DE ACCIONES DE MENÚ MULTISTATS ---');

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
    this.checked = false;
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
  scrollIntoView() {}
  click() {
    if (this.listeners['click']) {
      this.listeners['click'].forEach(fn => fn.call(this, { type: 'click' }));
    }
  }
}

const docElements = {};
const getOrCreate = (id, tag = 'div') => {
  if (!docElements[id]) docElements[id] = new ElementMock(tag, id);
  return docElements[id];
};

const domIds = [
  'dash-pasos-grid', 'dash-area-grafico', 'dash-area-reporte', 'dash-barra-filtros', 'contenedor-tabla',
  'dash-select-algoritmo', 'dash-input-k', 'dash-k-up', 'dash-k-down',
  'dash-select-distancia', 'dash-centroides-aleatorio', 'dash-centroides-manual',
  'dash-btn-ejecutar', 'dash-btn-reiniciar', 'dash-interp-cuerpo',
  'dash-toast-completado', 'dash-toast-texto', 'dash-footer-estado',
  'dash-export-word', 'dash-export-pdf', 'dash-export-word-2', 'dash-export-pdf-2',
  'dash-generar-informe', 'dash-modal-avanzado', 'dash-modal-titulo',
  'dash-menu-interpretacion',
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
docElements['input-num-intervalos'].value = '5';
docElements['select-nivel'].value = '0.95';
docElements['input-mu0'].value = '0';
docElements['input-exitos'].value = '10';
docElements['input-total'].value = '20';
docElements['input-graf-hist-int'].value = '5';

const tabs = ['dispersion', 'cluster', 'boxplot', 'pasos', 'reporte'].map(t => {
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

const bodyMock = new ElementMock('body');
bodyMock.classList.add('dashboard-modo');

const documentMock = {
  body: bodyMock,
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
    if (sel.includes('.dash-dropdown')) return [];
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

// Inicializar tabla y selectores
vm.runInContext('dibujarTabla(); actualizarSelectoresVariables();', context);
console.log('✓ Estado inicial configurado');

// Probar cada acción del menú
const acciones = [
  'resumen-univariado',
  'frecuencias-intervalos',
  'covarianza-correlacion',
  'matriz-correlaciones',
  'matriz-covarianzas',
  'regresion-simple',
  'regresion-multiple',
  'ic-media',
  'prueba-t-una',
  'prueba-t-dos',
  'grafico-dispersion',
  'grafico-cluster',
  'grafico-boxplot',
  'grafico-histograma',
  'grafico-barras',
  'interpretacion',
  'toggle-estandarizar',
  'filtrar-datos',
  'agregar-fila',
  'agregar-columna',
  'limpiar-datos',
  'ayuda-guia',
  'ayuda-acerca'
];

for (const acc of acciones) {
  try {
    vm.runInContext(`ejecutarAccionMenu("${acc}")`, context);
    console.log(`✓ Acción de menú probada con éxito: ${acc}`);
  } catch (err) {
    console.error(`✗ Error en acción "${acc}":`, err);
    process.exit(1);
  }
}

console.log('--- TODAS LAS ACCIONES DE MENÚ FUNCIONAN AL 100% ---');
