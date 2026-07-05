(function (global) {
  'use strict';

  const state = {
    tools: [],
    normalizedCategory: 'all'
  };

  function getToolBaseURL() {
    return new URL('../', global.location.href);
  }

  function resolveEntry(entry) {
    try {
      return new URL(entry, getToolBaseURL());
    } catch (_) {
      return null;
    }
  }

  function categoryLabel(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderFilters(categories) {
    const filterBar = document.getElementById('tools-filter-bar');
    if (!filterBar) return;

    const allCategories = ['all', ...categories];
    filterBar.innerHTML = allCategories.map((category) => {
      const isActive = state.normalizedCategory === category;
      const btnClass = isActive
        ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
        : 'bg-[var(--bg-base)] text-[var(--text-primary)] border-[var(--border-color)]';
      return `
        <button
          type="button"
          class="px-3 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-colors ${btnClass}"
          data-tool-category="${category}"
        >${categoryLabel(category)}</button>
      `;
    }).join('');

    filterBar.querySelectorAll('[data-tool-category]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.normalizedCategory = btn.dataset.toolCategory || 'all';
        render();
      });
    });
  }

  function renderCards(tools) {
    const container = document.getElementById('tools-container');
    const count = document.getElementById('tools-count');
    if (!container || !count) return;

    count.textContent = `${tools.length} Tool${tools.length === 1 ? '' : 's'} Visible`;

    if (!tools.length) {
      container.innerHTML = '<p class="text-sm text-[var(--text-muted)]">No tools found for this category.</p>';
      return;
    }

    container.innerHTML = tools.map((tool) => {
      const tags = Array.isArray(tool.tags) ? tool.tags : [];
      const safeEntry = escapeHtml(tool.entry || '');
      const safeTags = tags.length ? tags.map((tag) => `<span class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--bg-base)]">${escapeHtml(tag)}</span>`).join(' ') : '<span class="text-xs text-[var(--text-muted)]">No tags</span>';

      return `
        <article class="border border-[var(--border-color)] rounded-xl p-4 bg-[var(--bg-surface)] flex flex-col gap-3">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-primary)]">${escapeHtml(tool.category || 'misc')}</p>
              <h4 class="font-bold text-lg text-[var(--text-primary)]">${escapeHtml(tool.name || tool.id)}</h4>
            </div>
            <span class="text-[10px] bg-[var(--bg-base)] border border-[var(--border-color)] px-2 py-1 rounded font-bold">${escapeHtml(tool.id)}</span>
          </div>
          <p class="text-sm text-[var(--text-muted)]">${escapeHtml(tool.description || 'No description provided.')}</p>
          <p class="text-xs text-[var(--text-muted)] break-all"><span class="font-bold text-[var(--text-primary)]">Entry:</span> ${safeEntry}</p>
          <div class="flex flex-wrap gap-2">${safeTags}</div>
          <button type="button" data-tool-entry="${safeEntry}" class="os-btn !bg-[var(--accent-primary)] !text-white w-full">Open Tool</button>
        </article>
      `;
    }).join('');

    container.querySelectorAll('[data-tool-entry]').forEach((button) => {
      button.addEventListener('click', () => {
        const target = resolveEntry(button.dataset.toolEntry || '');
        if (!target || target.origin !== global.location.origin) return;
        global.location.href = target.href;
      });
    });
  }

  function render() {
    if (!global.ToolRegistry) return;

    const categories = Array.from(new Set(state.tools.map((tool) => global.ToolRegistry.normalizeCategory(tool.category)))).sort();
    renderFilters(categories);

    const visible = state.normalizedCategory === 'all'
      ? state.tools
      : state.tools.filter((tool) => global.ToolRegistry.normalizeCategory(tool.category) === state.normalizedCategory);

    renderCards(visible);
  }

  async function boot() {
    if (!global.ToolRegistry) return;

    const count = document.getElementById('tools-count');
    if (count) count.textContent = 'Loading tools...';

    state.tools = await global.ToolRegistry.loadAll();
    state.tools.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    state.normalizedCategory = 'all';

    render();
  }

  global.ToolIntegration = {
    boot,
    render
  };
})(window);
