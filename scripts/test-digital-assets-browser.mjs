import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { JSDOM, ResourceLoader, VirtualConsole } from 'jsdom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools-manifest.json'), 'utf8'));
const routeMap = new Map(manifest.entries.map((entry) => [entry.route, entry.entry]));
const outputSelectors = {
  'task-splitter': '#cards',
  'seed-quality-scorer': '#snapshotOutput',
  'wave1-simulation-runner': '#jsonOutput',
  'balance-dashboard': '#jsonOutput',
  'growth-milestone-engine': '#terminal-log'
};
const actionSelectors = {
  'seed-quality-scorer': '#scoreBtn',
  'synthetic-player-generator': '#generate',
  'wave1-simulation-runner': '#run',
  'balance-dashboard': '#run',
  'growth-milestone-engine': '#btn-simulate'
};
const defaultActions = [
  '#generate', '#build', '#review', '#suggest', '#prepare', '#save', '#split',
  '#search', '#package', '#evaluate', '#run'
];
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

const threeStub = `
(() => {
  class Vector {
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
    set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
    lerp(next) { this.x = next.x; this.y = next.y; this.z = next.z; return this; }
  }
  class Node {
    constructor() {
      this.children = [];
      this.position = new Vector();
      this.rotation = new Vector();
      this.scale = new Vector(1, 1, 1);
      this.color = { setHex() {} };
    }
    add(...items) { this.children.push(...items); }
    remove(item) { this.children = this.children.filter((child) => child !== item); }
    lookAt() {}
  }
  class Renderer {
    constructor() { this.domElement = document.createElement('canvas'); }
    setSize() {}
    render() {}
  }
  class Material { constructor(options = {}) { Object.assign(this, options); } }
  class Light extends Node { constructor() { super(); this.color = { setHex() {} }; } }
  window.THREE = {
    Scene: class extends Node {},
    Group: class extends Node {},
    Mesh: class extends Node {},
    PerspectiveCamera: class extends Node {},
    WebGLRenderer: Renderer,
    AmbientLight: Light,
    DirectionalLight: Light,
    CylinderGeometry: class {},
    SphereGeometry: class {},
    MeshStandardMaterial: Material,
    Vector3: Vector
  };
})();`;

function resolveRequestPath(requestUrl) {
  const url = new URL(requestUrl, 'http://127.0.0.1');
  const cleanPath = url.pathname.replace(/\/$/, '') || '/';
  const routeEntry = routeMap.get(cleanPath);
  const relative = routeEntry || url.pathname.replace(/^\//, '') || 'index.html';
  const absolute = path.resolve(root, relative);
  if (absolute !== root && !absolute.startsWith(`${root}${path.sep}`)) return null;
  return absolute;
}

const server = http.createServer((request, response) => {
  let target = resolveRequestPath(request.url || '/');
  if (!target) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    target = path.join(target, 'index.html');
  }
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
    response.writeHead(404).end('Not found');
    return;
  }
  response.writeHead(200, {
    'Content-Type': contentTypes[path.extname(target)] || 'application/octet-stream',
    'Cache-Control': 'no-store'
  });
  fs.createReadStream(target).pipe(response);
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const origin = `http://127.0.0.1:${port}`;

class LocalResourceLoader extends ResourceLoader {
  constructor(failures) {
    super();
    this.failures = failures;
  }

  fetch(url, options) {
    if (url.startsWith('https://fonts.googleapis.com/')) return Promise.resolve(Buffer.from(''));
    if (url.includes('cdnjs.cloudflare.com/ajax/libs/three.js/')) return Promise.resolve(Buffer.from(threeStub));
    const request = super.fetch(url, options);
    request.catch((error) => {
      if (url.startsWith(origin)) this.failures.push(`${url} — ${error.message}`);
    });
    return request;
  }
}

function installBrowserShims(window) {
  Object.defineProperty(window.navigator, 'clipboard', {
    configurable: true,
    value: { writeText: async () => {} }
  });
  window.fetch = (input, init) => fetch(new URL(input, window.location.href), init);
  window.URL.createObjectURL = () => 'blob:viadecide-test';
  window.URL.revokeObjectURL = () => {};
  window.requestAnimationFrame = () => 0;
  window.cancelAnimationFrame = () => {};
  window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });
  window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  window.alert = () => {};
  window.confirm = () => true;
  window.scrollTo = () => {};
  window.HTMLAnchorElement.prototype.click = () => {};
}

async function evaluateModuleScripts(dom, entryPath) {
  const context = dom.getInternalVMContext();
  const cache = new Map();

  async function loadModule(absolutePath) {
    const identifier = pathToFileURL(absolutePath).href;
    if (cache.has(identifier)) return cache.get(identifier);
    const source = fs.readFileSync(absolutePath, 'utf8');
    const module = new vm.SourceTextModule(source, {
      context,
      identifier,
      initializeImportMeta(meta) { meta.url = identifier; }
    });
    cache.set(identifier, module);
    await module.link(async (specifier, referencingModule) => {
      const resolved = fileURLToPath(new URL(specifier, referencingModule.identifier));
      if (!resolved.startsWith(`${root}${path.sep}`)) {
        throw new Error(`Module import escapes repository: ${specifier}`);
      }
      return loadModule(resolved);
    });
    return module;
  }

  const moduleScripts = [...dom.window.document.querySelectorAll('script[type="module"][src]')];
  for (const script of moduleScripts) {
    const sourceUrl = new URL(script.src, dom.window.location.href);
    const absolutePath = resolveRequestPath(sourceUrl.pathname);
    if (!absolutePath || !fs.existsSync(absolutePath)) throw new Error(`Missing module script: ${script.src}`);
    const module = await loadModule(absolutePath);
    await module.evaluate();
  }

  if (!fs.existsSync(path.join(root, entryPath))) throw new Error(`Missing entry file: ${entryPath}`);
}

function populateInputs(document) {
  const radiosByName = new Set();
  for (const element of document.querySelectorAll('input:not([type="hidden"]):not([disabled]), textarea:not([disabled])')) {
    const type = (element.getAttribute('type') || '').toLowerCase();
    if (type === 'radio') {
      const name = element.getAttribute('name') || element.id;
      element.checked = !radiosByName.has(name);
      radiosByName.add(name);
    } else if (type === 'checkbox') {
      element.checked = true;
    } else if (type === 'number' || type === 'range') {
      const min = Number(element.getAttribute('min'));
      element.value = Number.isFinite(min) ? String(Math.max(min, 5)) : '5';
    } else if (!['button', 'submit', 'reset', 'file'].includes(type)) {
      element.value = 'ViaDecide repair verification';
    }
    element.dispatchEvent(new document.defaultView.Event('input', { bubbles: true }));
    element.dispatchEvent(new document.defaultView.Event('change', { bubbles: true }));
  }

  for (const element of document.querySelectorAll('select:not([disabled])')) {
    const usable = [...element.options].find((option) => !option.disabled && option.value !== '');
    if (usable) element.value = usable.value;
    element.dispatchEvent(new document.defaultView.Event('change', { bubbles: true }));
  }
}

async function openTool(entry, captureErrors = true) {
  const localFailures = [];
  const runtimeErrors = [];
  const virtualConsole = new VirtualConsole();
  if (captureErrors) {
    virtualConsole.on('error', (...args) => runtimeErrors.push(args.map(String).join(' ')));
    virtualConsole.on('jsdomError', (error) => runtimeErrors.push(error.message));
  }
  const dom = await JSDOM.fromURL(`${origin}${entry.route}`, {
    resources: new LocalResourceLoader(localFailures),
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole,
    beforeParse: installBrowserShims
  });
  await new Promise((resolve) => dom.window.addEventListener('load', resolve, { once: true }));
  await evaluateModuleScripts(dom, entry.entry);
  await new Promise((resolve) => setTimeout(resolve, 80));
  return { dom, localFailures, runtimeErrors };
}

const results = [];
for (const entry of manifest.entries) {
  let status = 'passed';
  let detail = '';
  let first;
  let refreshed;
  try {
    const routeResponse = await fetch(`${origin}${entry.route}`, { redirect: 'manual' });
    if (routeResponse.status !== 200) throw new Error(`Direct route returned HTTP ${routeResponse.status}`);

    first = await openTool(entry);
    const { document } = first.dom.window;
    const title = document.title.trim();
    const bodyLength = document.body.textContent.trim().length;
    if (!title || bodyLength < 20) throw new Error(`Blank render: title=${JSON.stringify(title)}, body=${bodyLength}`);

    populateInputs(document);
    const outputSelector = outputSelectors[entry.id] || '#output';
    const output = document.querySelector(outputSelector);
    if (!output) throw new Error(`Missing interaction output: ${outputSelector}`);
    const before = output.textContent.trim();

    const selectors = [actionSelectors[entry.id], ...defaultActions].filter(Boolean);
    const action = selectors.map((selector) => document.querySelector(selector)).find(Boolean);
    if (!action) throw new Error('No core interaction control found');
    action.click();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const after = output.textContent.trim();
    if (!after) throw new Error(`Core interaction did not populate ${outputSelector}`);
    if (before === after && entry.id !== 'growth-milestone-engine') {
      throw new Error(`Core interaction did not change ${outputSelector}`);
    }
    if (first.localFailures.length) throw new Error(`Local request failures: ${first.localFailures.join('; ')}`);
    if (first.runtimeErrors.length) throw new Error(`Runtime/console errors: ${first.runtimeErrors.join('; ')}`);

    refreshed = await openTool(entry);
    const refreshedLength = refreshed.dom.window.document.body.textContent.trim().length;
    if (refreshedLength < 20) throw new Error('Refresh/deep-link render is blank');
    if (refreshed.localFailures.length) throw new Error(`Refresh request failures: ${refreshed.localFailures.join('; ')}`);
    if (refreshed.runtimeErrors.length) throw new Error(`Refresh runtime/console errors: ${refreshed.runtimeErrors.join('; ')}`);

    detail = `${title}; direct route, primary interaction, assets, console, and refresh passed`;
  } catch (error) {
    status = 'failed';
    detail = error.message;
  } finally {
    first?.dom.window.close();
    refreshed?.dom.window.close();
    results.push({ id: entry.id, route: entry.route, status, detail });
  }
}

await new Promise((resolve) => server.close(resolve));
const failed = results.filter((result) => result.status === 'failed');
console.log(JSON.stringify({
  status: failed.length ? 'failed' : 'passed',
  testEnvironment: 'jsdom with isolated HTTP routing and browser API shims',
  passed: results.length - failed.length,
  failed: failed.length,
  results
}, null, 2));

process.exit(failed.length ? 1 : 0);
