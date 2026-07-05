(function (global) {
  'use strict';

  const state = {
    query: '',
    results: [],
    selectedDoc: null,
    searchCache: new Map(),
    debounceTimer: null,
    savedQueries: []
  };

  function renderSummary(summaryData) {
    const target = document.getElementById('summary-content');
    if (!target) return;
    target.innerHTML = `
      <p class="text-sm mb-3">${summaryData.summary || 'No summary generated.'}</p>
      <ul class="list-disc pl-5 text-sm space-y-1">${(summaryData.insights || []).map((point) => `<li>${point}</li>`).join('')}</ul>
      <p class="text-xs mt-3 text-[var(--muted)]">Sources: ${(summaryData.sources || []).join(', ') || 'N/A'}</p>
    `;
  }

  function renderReasoningOutput(data) {
    const target = document.getElementById('reasoning-content');
    if (!target) return;
    target.innerHTML = `
      <p class="text-sm mb-2">${data.summary || 'No synthesis yet.'}</p>
      <ul class="list-disc pl-5 text-sm space-y-1">${(data.insights || []).map((item) => `<li>${item}</li>`).join('')}</ul>
      <div class="text-xs mt-2 text-[var(--muted)]">Sources: ${(data.sources || []).join(', ') || 'N/A'}</div>
    `;
  }

  function renderSavedQueries() {
    const root = document.getElementById('saved-query-list');
    if (!root) return;
    root.innerHTML = state.savedQueries.length
      ? state.savedQueries.map((query) => `<button class="w-full text-left text-sm border border-[var(--border)] rounded p-2 mb-2" data-saved-query="${query}">${query}</button>`).join('')
      : '<div class="text-sm text-[var(--muted)]">No saved searches yet.</div>';

    root.querySelectorAll('[data-saved-query]').forEach((node) => {
      node.addEventListener('click', () => runSearch(node.getAttribute('data-saved-query') || ''));
    });
  }

  function rememberQuery(query) {
    if (!query) return;
    if (!state.savedQueries.includes(query)) {
      state.savedQueries.unshift(query);
      state.savedQueries = state.savedQueries.slice(0, 12);
      renderSavedQueries();
    }
  }

  async function openDocumentById(docId) {
    if (!docId) return;
    const documentData = await global.NexClient.getDocument(docId);
    state.selectedDoc = documentData;
    global.DocumentViewer.render(document.getElementById('document-viewer-panel'), documentData, state.query);
  }

  async function runSearch(query) {
    const normalized = String(query || '').trim();
    state.query = normalized;

    if (!normalized) {
      renderSummary({ summary: '', insights: [], sources: [] });
      renderReasoningOutput({ summary: '', insights: [], sources: [] });
      global.SourceExplorer.render(document.getElementById('sources-explorer-panel'), []);
      return [];
    }

    rememberQuery(normalized);

    let searchPayload = state.searchCache.get(normalized);
    if (!searchPayload) {
      searchPayload = await global.NexClient.searchCorpus(normalized, 10);
      state.searchCache.set(normalized, searchPayload);
    }

    state.results = (searchPayload.results || []).slice(0, 10);

    const reasoning = await global.ZayvoraReasoning.synthesize(state.results, normalized);
    renderReasoningOutput(reasoning);
    renderSummary(reasoning);

    const sourcePayload = await global.NexClient.getSources(normalized);
    const sources = sourcePayload.sources || [];
    global.SourceExplorer.render(document.getElementById('sources-explorer-panel'), sources);

    if (global.KnowledgeGraph) {
      global.KnowledgeGraph.updateFromResults(state.results);
      global.KnowledgeGraph.renderGraph(document.getElementById('knowledge-graph-panel'));
    }

    if (state.results.length > 0) {
      const firstDocId = state.results[0].document_id;
      if (firstDocId) {
        await openDocumentById(firstDocId);
      }
    }

    return state.results;
  }

  function initWorkspaceTab() {
    const researchRoot = document.getElementById('research-workspace-root');
    if (!researchRoot || !global.ResearchWorkspace) return;

    global.ResearchWorkspace.mount(researchRoot);
    global.CorpusSearchPanel.mount(
      document.getElementById('corpus-search-panel'),
      async (value) => {
        clearTimeout(state.debounceTimer);
        return new Promise((resolve) => {
          state.debounceTimer = setTimeout(async () => {
            const results = await runSearch(value);
            resolve(results);
          }, 300);
        });
      },
      async (selected, query) => {
        state.query = query;
        await openDocumentById(selected.document_id);
      }
    );

    global.NotesEditor.mount(document.getElementById('notes-editor-panel'));
    global.KnowledgeGraph.mount(document.getElementById('knowledge-graph-panel'));
    renderSavedQueries();

    const copyBtn = document.getElementById('copy-summary-to-notes');
    const notesArea = document.getElementById('research-notes-text');
    copyBtn?.addEventListener('click', () => {
      const summaryText = document.getElementById('summary-content')?.innerText || '';
      notesArea.value = `${notesArea.value}\n\n${summaryText}`.trim();
      global.NotesEditor.saveNote(notesArea.value);
    });
  }

  function initSourcesTab() {
    const mount = document.getElementById('sources-tab-mount');
    if (mount && !mount.dataset.ready) {
      mount.dataset.ready = 'true';
      mount.innerHTML = '<div class="os-card"><h3>Sources Explorer</h3><div id="sources-tab-content" class="space-y-2 text-sm text-[var(--muted)]">Search the corpus from Research tab to load sources.</div></div>';
    }
  }

  function initNotesTab() {
    const notesMount = document.getElementById('notes-tab-mount');
    if (!notesMount || notesMount.dataset.ready) return;
    notesMount.dataset.ready = 'true';
    global.NotesEditor.mount(notesMount);
  }

  async function initCorpusStatsTab() {
    const statsMount = document.getElementById('corpus-stats-mount');
    if (!statsMount || statsMount.dataset.ready) return;
    statsMount.dataset.ready = 'true';
    await global.CorpusDashboard.render(statsMount);
  }

  function init() {
    initWorkspaceTab();
    initSourcesTab();
    initNotesTab();
    initCorpusStatsTab();
  }

  global.StudyOSResearchApp = { init, runSearch, openDocumentById };
})(window);
