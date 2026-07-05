(() => {
  const STAGES = [
    { id: 0, name: 'Dormant Seed', xp: 0 },
    { id: 1, name: 'Sprout', xp: 120 },
    { id: 2, name: 'Sapling', xp: 300 },
    { id: 3, name: 'Young Tree', xp: 640 },
    { id: 4, name: 'Elder Tree', xp: 1200 }
  ];

  const state = { xp: 0, stageId: 0, water: 70, nutrients: 80, pests: 0, lastTickAt: Date.now() };

  function getInitData() {
    return window.Telegram?.WebApp?.initData || '';
  }

  function stageForXP(xp) {
    let stage = STAGES[0];
    STAGES.forEach((candidate) => {
      if (xp >= candidate.xp) stage = candidate;
    });
    return stage;
  }

  function syncStage() {
    const prev = state.stageId;
    const stage = stageForXP(state.xp);
    state.stageId = stage.id;
    if (prev !== stage.id) {
      window.dispatchEvent(new CustomEvent('growth:stage_evolved', { detail: { stage } }));
    }
    return stage;
  }

  function hydrateFromServer(payload = {}) {
    state.xp = Number(payload.xp ?? state.xp);
    state.stageId = Number(payload.stage_id ?? payload.stageId ?? state.stageId);
    state.water = Number(payload.hydration ?? payload.water ?? state.water);
    state.nutrients = Number(payload.nutrients ?? state.nutrients);
    state.pests = Number(payload.pests ?? state.pests);
    state.lastTickAt = Number(payload.last_tick_at ?? payload.lastTickAt ?? Date.now());
    const stage = syncStage();
    window.dispatchEvent(new CustomEvent('growth:state_updated', { detail: { ...state, stage } }));
    return { ...state, stage };
  }

  async function postPlantUpdate(delta) {
    const initData = getInitData();
    const response = await fetch('/api/plant/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: initData ? `Bearer ${initData}` : ''
      },
      body: JSON.stringify({ initData, ...delta })
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.ok) {
      throw new Error(payload?.error || 'Plant update failed');
    }

    return payload;
  }

  async function init() {
    try {
      const payload = await postPlantUpdate({ action: 'sync' });
      return hydrateFromServer(payload.state || {});
    } catch (_error) {
      return hydrateFromServer(state);
    }
  }

  async function applyTick() {
    const payload = await postPlantUpdate({ action: 'tick', amount: 1 });
    return hydrateFromServer(payload.state || {});
  }

  async function addXP(amount = 0) {
    const payload = await postPlantUpdate({ action: 'add_xp', amount: Math.max(0, Number(amount) || 0) });
    return hydrateFromServer(payload.state || {});
  }

  async function waterPlant(amount = 0) {
    const payload = await postPlantUpdate({ action: 'water', amount: Math.max(0, Number(amount) || 0) });
    const next = hydrateFromServer(payload.state || {});
    return next.water;
  }

  function getState() {
    return { ...state, stage: STAGES[state.stageId] };
  }

  window.GrowthStageEngine = { init, applyTick, addXP, waterPlant, getState };
})();
