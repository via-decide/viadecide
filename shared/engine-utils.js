(function (global) {
  function tryParse(value) {
    if (!value) return {};
    try { return JSON.parse(value); } catch (error) { return { raw: value }; }
  }

  function clamp(num, min, max) {
    return Math.max(min, Math.min(max, num));
  }

  function weightedScore(parts) {
    return Object.values(parts).reduce((sum, item) => sum + (item.value * item.weight), 0);
  }

  global.EngineUtils = { tryParse, clamp, weightedScore };
})(window);
