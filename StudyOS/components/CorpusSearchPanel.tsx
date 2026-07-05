(function (global) {
  function renderResultCard(item, index) {
    const scorePct = Math.round((Number(item.score) || 0) * 100);
    return `
      <button class="w-full text-left border border-[var(--border)] rounded p-3 hover:border-[var(--leaf)] transition" data-result-index="${index}">
        <div class="flex items-start justify-between gap-2 mb-1">
          <strong class="text-sm">${item.title || 'Untitled'}</strong>
          <span class="text-[10px] text-[var(--muted)]">score ${Number.isFinite(scorePct) ? scorePct : 0}%</span>
        </div>
        <p class="text-sm text-[var(--muted)] line-clamp-3">${(item.passage || 'No passage').slice(0, 240)}</p>
        <div class="text-[11px] mt-2 text-[var(--subtle)]">${item.source || 'Unknown source'}</div>
      </button>
    `;
  }

  function mountCorpusSearchPanel(root, onSearch, onResultSelect) {
    if (!root) return;
    root.innerHTML = `
      <div class="os-card">
        <h3 class="mb-2">Semantic Corpus Search</h3>
        <input id="nex-search-input" class="os-input" placeholder="Ask in natural language… e.g., Compare federalism in India vs US" />
        <div class="text-xs text-[var(--muted)] mt-2">Top-k retrieval enabled · default 10 passages</div>
        <div id="nex-search-results" class="mt-4 space-y-2 text-sm"></div>
      </div>
    `;

    const input = root.querySelector('#nex-search-input');
    const resultsNode = root.querySelector('#nex-search-results');
    let timer;

    function renderResults(results) {
      const safe = Array.isArray(results) ? results : [];
      resultsNode.innerHTML = safe.length
        ? safe.map((item, index) => renderResultCard(item, index)).join('')
        : '<p class="text-sm text-[var(--muted)]">No results yet.</p>';

      resultsNode.querySelectorAll('[data-result-index]').forEach((node) => {
        node.addEventListener('click', () => {
          const idx = Number(node.getAttribute('data-result-index') || 0);
          const selected = safe[idx];
          if (selected && typeof onResultSelect === 'function') {
            onResultSelect(selected, input.value);
          }
        });
      });
    }

    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        if (typeof onSearch === 'function') {
          const results = await onSearch(input.value);
          renderResults((results || []).slice(0, 10));
        }
      }, 300);
    });
  }

  global.CorpusSearchPanel = { mount: mountCorpusSearchPanel };
})(window);
