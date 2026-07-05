(function (global) {
  function escapeRegExp(text) {
    return String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlight(content, query) {
    if (!query) return String(content || '');
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'ig');
    return String(content || '').replace(regex, '<mark>$1</mark>');
  }

  async function loadChunkRange(docId, offset, limit) {
    if (!global.NexClient || typeof global.NexClient.getDocument !== 'function') return null;
    return global.NexClient.getDocument(docId, { offset, limit });
  }

  function renderDocument(root, documentData, query) {
    if (!root) return;
    const metadata = documentData && documentData.metadata ? documentData.metadata : {};
    const chunks = Array.isArray(documentData && documentData.chunks) ? documentData.chunks : [];
    const documentId = documentData?.document_id || documentData?.doc_id || '';

    root.innerHTML = `
      <div class="text-xs text-[var(--muted)] mb-2 space-y-1">
        <div><strong>document_id:</strong> ${documentId || 'Unknown'}</div>
        <div><strong>book_title:</strong> ${metadata.book_title || documentData?.title || 'Unknown'}</div>
        <div><strong>source:</strong> ${documentData?.source || metadata.source || 'Unknown'}</div>
        <div><strong>chapter:</strong> ${metadata.chapter || 'Unknown'}</div>
      </div>
      <div id="document-viewer-scroll" style="max-height:320px;overflow:auto;" class="space-y-2 border border-[var(--border)] rounded p-2 bg-[var(--bg)]">
        ${chunks.map((chunk) => `<p class="text-sm leading-relaxed">${highlight(chunk.text || chunk, query)}</p>`).join('') || '<p class="text-sm text-[var(--muted)]">Open a result to load document chunks.</p>'}
      </div>
      <div class="mt-2 flex justify-end">
        <button id="load-more-chunks" class="os-btn-ghost !py-2 !px-3 text-xs">Load more chunks</button>
      </div>
    `;

    const loadMoreButton = root.querySelector('#load-more-chunks');
    let offset = chunks.length;

    loadMoreButton?.addEventListener('click', async () => {
      if (!documentId) return;
      loadMoreButton.setAttribute('disabled', 'true');
      loadMoreButton.textContent = 'Loading…';
      try {
        const next = await loadChunkRange(documentId, offset, 5);
        const nextChunks = Array.isArray(next?.chunks) ? next.chunks : [];
        const scroll = root.querySelector('#document-viewer-scroll');
        if (!nextChunks.length) {
          loadMoreButton.textContent = 'No more chunks';
          return;
        }
        const html = nextChunks.map((chunk) => `<p class="text-sm leading-relaxed">${highlight(chunk.text || chunk, query)}</p>`).join('');
        scroll.insertAdjacentHTML('beforeend', html);
        offset += nextChunks.length;
        loadMoreButton.textContent = 'Load more chunks';
        loadMoreButton.removeAttribute('disabled');
      } catch (_) {
        loadMoreButton.textContent = 'Retry load';
        loadMoreButton.removeAttribute('disabled');
      }
    });
  }

  global.DocumentViewer = { render: renderDocument };
})(window);
