const inputA = document.getElementById('inputA');
const inputB = document.getElementById('inputB');
const inputC = document.getElementById('inputC');
const output = document.getElementById('output');

const PLAYER_STATE_KEY = 'orchard_engine_player_state';
const STORE_KEY = 'engine.seed-exchange.draft';

function hydrateState() {
  const defaults = { water: 30, credits: 60, nutrients: 100, stress: 0, pests: 0, day: 1, seedSlots: 0 };
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
  if (state.credits < 1) {
    output.textContent = 'Not enough credits';
    saveDraft();
    return;
  }

  state.credits = Math.max(0, state.credits - 10);
  state.seedSlots = (state.seedSlots || 0) + 1;

  const report = {
    tool: 'seed-exchange',
    status: 'seed_exchanged',
    creditsSpent: 10,
    seedsGained: 1,
    creditsRemaining: state.credits,
    totalSeedSlots: state.seedSlots,
    generatedAt: new Date().toISOString()
  };

  output.textContent = JSON.stringify(report, null, 2);
  syncState(state);
  emitEvent('engine:seed_exchanged', { creditsSpent: 10, seedsGained: 1 });
  saveDraft();
}

document.getElementById('run').addEventListener('click', runEngine);
document.getElementById('copy').addEventListener('click', () => navigator.clipboard.writeText(output.textContent || ''));
document.getElementById('download').addEventListener('click', () => {
  const blob = new Blob([output.textContent || ''], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'seed-exchange-output.json';
  a.click();
});

restoreDraft();
