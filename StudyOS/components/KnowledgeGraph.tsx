(function (global) {
  const graphState = {
    nodes: [],
    edges: []
  };

  function nodeColor(type) {
    if (type === 'topic') return '#29B6F6';
    if (type === 'entity') return '#a78bfa';
    return '#52B756';
  }

  function renderGraph(root) {
    if (!root) return;
    if (!graphState.nodes.length) {
      root.innerHTML = '<div class="text-sm text-[var(--muted)]">Run a search to build graph nodes for documents, topics, and entities.</div>';
      return;
    }

    const width = 300;
    const height = 220;

    const nodeMarkup = graphState.nodes.map((node, index) => {
      const angle = (index / Math.max(graphState.nodes.length, 1)) * Math.PI * 2;
      const x = Math.round(width / 2 + Math.cos(angle) * 90);
      const y = Math.round(height / 2 + Math.sin(angle) * 80);
      return `<g data-node-id="${node.id}" style="cursor:pointer"><circle cx="${x}" cy="${y}" r="11" fill="${nodeColor(node.type)}"></circle><text x="${x + 14}" y="${y + 4}" fill="#f0e4d0" font-size="10">${node.label.slice(0, 20)}</text></g>`;
    }).join('');

    const edgeMarkup = graphState.edges.map((edge) => {
      const from = graphState.nodes.findIndex((n) => n.id === edge.from);
      const to = graphState.nodes.findIndex((n) => n.id === edge.to);
      if (from < 0 || to < 0) return '';
      const fromAngle = (from / Math.max(graphState.nodes.length, 1)) * Math.PI * 2;
      const toAngle = (to / Math.max(graphState.nodes.length, 1)) * Math.PI * 2;
      const x1 = Math.round(width / 2 + Math.cos(fromAngle) * 90);
      const y1 = Math.round(height / 2 + Math.sin(fromAngle) * 80);
      const x2 = Math.round(width / 2 + Math.cos(toAngle) * 90);
      const y2 = Math.round(height / 2 + Math.sin(toAngle) * 80);
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#3a2e28" stroke-width="1"></line>`;
    }).join('');

    root.innerHTML = `
      <div class="text-xs text-[var(--muted)] mb-2">Click a document node to open.</div>
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="220">
        ${edgeMarkup}
        ${nodeMarkup}
      </svg>
    `;

    root.querySelectorAll('[data-node-id]').forEach((nodeEl) => {
      nodeEl.addEventListener('click', () => {
        const id = nodeEl.getAttribute('data-node-id');
        const node = graphState.nodes.find((n) => n.id === id);
        if (node && node.type === 'document' && typeof global.StudyOSResearchApp?.openDocumentById === 'function') {
          global.StudyOSResearchApp.openDocumentById(node.id);
        }
      });
    });
  }

  function updateFromResults(results) {
    const safe = Array.isArray(results) ? results : [];
    const nodes = [];
    const edges = [];

    safe.slice(0, 8).forEach((item, index) => {
      const docId = item.document_id || `doc-${index}`;
      nodes.push({ id: docId, label: item.title || docId, type: 'document' });

      const topicId = `topic-${index}`;
      nodes.push({ id: topicId, label: (item.source || 'Topic').split('/').pop(), type: 'topic' });
      edges.push({ from: docId, to: topicId });

      const entityId = `entity-${index}`;
      const firstWord = String(item.passage || '').split(' ').find(Boolean) || 'Entity';
      nodes.push({ id: entityId, label: firstWord, type: 'entity' });
      edges.push({ from: topicId, to: entityId });
    });

    graphState.nodes = nodes;
    graphState.edges = edges;
  }

  function mountKnowledgeGraph(root) {
    renderGraph(root);
  }

  global.KnowledgeGraph = {
    mount: mountKnowledgeGraph,
    updateFromResults,
    renderGraph
  };
})(window);
