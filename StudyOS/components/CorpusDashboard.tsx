(function (global) {
  async function renderCorpusDashboard(root) {
    if (!root) return;
    root.innerHTML = '<p class="text-sm text-[var(--muted)]">Loading corpus status...</p>';
    try {
      const stats = await global.NexClient.getCorpusStats();
      root.innerHTML = `
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="os-card !p-3"><strong>Books indexed</strong><div>${stats.books_indexed ?? 0}</div></div>
          <div class="os-card !p-3"><strong>Duplicates removed</strong><div>${stats.duplicates_removed ?? 0}</div></div>
          <div class="os-card !p-3"><strong>Corpus size</strong><div>${stats.corpus_size ?? '0 MB'}</div></div>
          <div class="os-card !p-3"><strong>Embedding count</strong><div>${stats.embedding_count ?? stats.embeddings_created ?? 0}</div></div>
        </div>
      `;
    } catch (error) {
      root.innerHTML = `<p class="text-sm text-[var(--rose)]">Failed to load corpus status: ${error.message}</p>`;
    }
  }

  global.CorpusDashboard = { render: renderCorpusDashboard };
})(window);
