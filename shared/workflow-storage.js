(function (global) {
  const KEY = 'viadecide.workflow-builder.workflows';

  function loadAll() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('WorkflowStorage.loadAll failed', error);
      return [];
    }
  }

  function saveAll(workflows) {
    try {
      localStorage.setItem(KEY, JSON.stringify(workflows));
      return true;
    } catch (error) {
      console.warn('WorkflowStorage.saveAll failed', error);
      return false;
    }
  }

  function save(workflow) {
    const items = loadAll().filter((item) => item.id !== workflow.id);
    items.push(workflow);
    return saveAll(items);
  }

  function findById(id) {
    return loadAll().find((item) => item.id === id) || null;
  }

  function remove(id) {
    const items = loadAll().filter((item) => item.id !== id);
    return saveAll(items);
  }

  global.WorkflowStorage = {
    loadAll,
    saveAll,
    save,
    findById,
    remove
  };
})(window);
