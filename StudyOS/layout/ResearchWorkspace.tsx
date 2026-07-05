(function (global) {
  function mountResearchWorkspace(root) {
    if (!root) return;
    root.innerHTML = `
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <aside class="xl:col-span-3 space-y-4">
          <div id="knowledge-graph-panel" class="os-card"><h3>Knowledge Graph</h3></div>
          <div id="saved-queries" class="os-card">
            <h3>Saved Searches</h3>
            <div id="saved-query-list" class="text-sm text-[var(--muted)] mt-2">No saved searches yet.</div>
          </div>
        </aside>
        <section class="xl:col-span-5 space-y-4">
          <div id="corpus-search-panel"></div>
          <div id="reasoning-output" class="os-card"><h3>AI Reasoning Output</h3><div id="reasoning-content" class="text-sm text-[var(--muted)]">Search to generate synthesis.</div></div>
          <div id="summary-output" class="os-card"><h3>Structured Summary</h3><div id="summary-content"></div></div>
        </section>
        <aside class="xl:col-span-4 space-y-4">
          <div id="document-viewer-panel" class="os-card"><h3>Document Viewer</h3></div>
          <div id="sources-explorer-panel" class="os-card"><h3>Sources Explorer</h3></div>
          <div id="notes-editor-panel" class="os-card"><h3>Research Notes</h3></div>
        </aside>
      </div>
    `;
  }

  global.ResearchWorkspace = { mount: mountResearchWorkspace };
})(window);
