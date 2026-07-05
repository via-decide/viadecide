(function (global) {
  function renderSources(root, sources) {
    if (!root) return;
    const safeSources = Array.isArray(sources) ? sources : [];
    root.innerHTML = safeSources.length
      ? safeSources.map((source) => `<div class="border border-[var(--border)] rounded p-2">${source}</div>`).join('')
      : '<p class="text-sm text-[var(--muted)]">No sources loaded.</p>';
  }

  global.SourceExplorer = { render: renderSources };
})(window);
