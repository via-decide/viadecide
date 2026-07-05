(function (global) {
  'use strict';

  const AGENT_KEY = 'viadecide.agents';

  function loadAll() {
    try {
      const raw = localStorage.getItem(AGENT_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
      return [];
    }
  }

  function saveAll(agents) {
    localStorage.setItem(AGENT_KEY, JSON.stringify(Array.isArray(agents) ? agents : []));
  }

  function save(agent) {
    const all = loadAll().filter((item) => item.id !== agent.id);
    all.push(agent);
    saveAll(all);
    return agent;
  }

  function findById(id) {
    return loadAll().find((agent) => agent.id === id) || null;
  }

  global.AgentStorage = { loadAll, saveAll, save, findById };
})(window);
