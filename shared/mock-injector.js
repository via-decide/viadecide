(async function () {
  if (typeof window === 'undefined' || !window.location.search.includes('env=test')) {
    return; // Fast exit if not in test environment
  }

  console.log('[VIA-MOCK-INJECTOR] Intercepting localStorage for "env=test"');

  try {
    const rawData = await fetch('/scripts/testing/mocks/data/reference-data.json');
    if (!rawData.ok) throw new Error("Could not find reference-data.json");
    
    const mockState = await rawData.json();

    const originalGetItem = Storage.prototype.getItem;
    
    Storage.prototype.getItem = function (key) {
      if (key.includes('WalletState') && mockState.WalletState) {
        return JSON.stringify(mockState.WalletState);
      }
      if (key.includes('PlantState') && mockState.PlantState) {
        return JSON.stringify(mockState.PlantState);
      }
      if (key.includes('AgentPlan') && mockState.AgentPlan) {
        return JSON.stringify(mockState.AgentPlan);
      }
      return originalGetItem.call(this, key);
    };
    
    console.log('[VIA-MOCK-INJECTOR] Successfully replaced getters with reference-data.json');
  } catch (err) {
    console.error('[VIA-MOCK-INJECTOR] Failed to bind', err);
  }
})();
