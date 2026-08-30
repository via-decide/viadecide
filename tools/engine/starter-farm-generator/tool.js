const inputA = document.getElementById('inputA');
const inputB = document.getElementById('inputB');
const inputC = document.getElementById('inputC');
const output = document.getElementById('output');

const PLAYER_STATE_KEY = 'orchard_engine_player_state';
const STORE_KEY = 'engine.starter-farm-generator.draft';

function hydrateState() {
  const defaults = { water: 30, credits: 60, nutrients: 100, stress: 0, pests: 0, day: 1 };
  try {
    const raw = localStorage.getItem(PLAYER_STATE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...(JSON.parse(raw) || {}) };
  } catch (_error) {
    return defaults;
  }
}

function syncState(state) {
  localStorage.setItem(PLAYER_STATE_KEY, JSON.stringify(state));
}

function emitEvent(name, data) {
  window.dispatchEvent(new CustomEvent(name, { detail: data }));
}

function saveDraft() {
  localStorage.setItem(STORE_KEY, JSON.stringify({
    primary: inputA.value,
    secondary: inputB.value,
    mode: inputC.value,
    output: output.textContent || ''
  }));
}

function restoreDraft() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    inputA.value = saved.primary || '';
    inputB.value = saved.secondary || '';
    inputC.value = saved.mode || 'steady';
    output.textContent = saved.output || '';
  } catch (_error) {
    inputC.value = inputC.value || 'steady';
  }
}

function runEngine() {
  const state = hydrateState();
  if (state.water === 0) {
    output.textContent = 'Not enough water';
    saveDraft();
    return;
  }

  const report = {
    tool: 'starter-farm-generator',
    status: 'farm_initialized',
    day: state.day,
    resources: {
      water: state.water,
      credits: state.credits,
      nutrients: state.nutrients,
      stress: state.stress,
      pests: state.pests
    },
    seedSlots: 1 + Math.max(0, Math.floor(state.nutrients / 50)),
    generatedAt: new Date().toISOString()
  };

  output.textContent = JSON.stringify(report, null, 2);
  syncState(state);
  emitEvent('engine:farm_initialized', report);
  saveDraft();
}

document.getElementById('run').addEventListener('click', runEngine);
document.getElementById('copy').addEventListener('click', () => navigator.clipboard.writeText(output.textContent || ''));
document.getElementById('download').addEventListener('click', () => {
  const blob = new Blob([output.textContent || ''], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'starter-farm-generator-output.json';
  a.click();
});

restoreDraft();
