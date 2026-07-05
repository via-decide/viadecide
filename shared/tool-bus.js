const BUS_PREFIX = 'bus:';

function getStorage() {
  if (typeof window === 'undefined') return null;
  return window.ToolStorage || null;
}

function getSource() {
  if (typeof document === 'undefined') return 'unknown';
  return document.body?.dataset?.toolId || document.documentElement?.dataset?.toolId || 'unknown';
}

export function emit(channel, payload) {
  const storage = getStorage();
  if (!storage || typeof storage.write !== 'function') return;
  const envelope = {
    data: payload,
    emittedAt: new Date().toISOString(),
    source: getSource()
  };
  storage.write(`${BUS_PREFIX}${channel}`, envelope);
}

export function read(channel) {
  const storage = getStorage();
  if (!storage || typeof storage.read !== 'function') return null;
  return storage.read(`${BUS_PREFIX}${channel}`, null);
}

export function clear(channel) {
  const storage = getStorage();
  if (!storage || typeof storage.remove !== 'function') return;
  storage.remove(`${BUS_PREFIX}${channel}`);
}

export function listChannels() {
  if (typeof localStorage === 'undefined') return [];
  const channels = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key) continue;
    const busMarker = `.tools.${BUS_PREFIX}`;
    const markerIndex = key.indexOf(busMarker);
    if (markerIndex === -1) continue;
    channels.push(key.slice(markerIndex + busMarker.length));
  }
  return channels;
}

export function onUpdate(channel, callback, intervalMs = 1500) {
  let lastValue = JSON.stringify(read(channel));
  const timer = window.setInterval(() => {
    const next = read(channel);
    const serialized = JSON.stringify(next);
    if (serialized === lastValue) return;
    lastValue = serialized;
    callback(next);
  }, intervalMs);

  return () => window.clearInterval(timer);
}

export function buildPipelineStatus(steps, currentStep) {
  if (!Array.isArray(steps) || !steps.length) return '';
  const activeIndex = steps.indexOf(currentStep);

  return `<div class="pipeline-strip">${steps.map((step, index) => {
    let className = 'future';
    if (activeIndex !== -1 && index < activeIndex) className = 'past';
    if (step === currentStep) className = 'active';
    return `<span class="pipeline-step ${className}">${step}</span>`;
  }).join('<span class="pipeline-arrow">→</span>')}</div>`;
}
