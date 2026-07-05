(() => {
  async function init() {
    if (!window.GrowthStageEngine?.init) return null;
    return window.GrowthStageEngine.init();
  }

  async function applyTick() {
    if (!window.GrowthStageEngine?.applyTick) return null;
    return window.GrowthStageEngine.applyTick();
  }

  async function waterPlant(amount = 0) {
    if (!window.GrowthStageEngine?.waterPlant) return null;
    return window.GrowthStageEngine.waterPlant(amount);
  }

  window.ProgressionEngine = { init, applyTick, waterPlant };
})();
