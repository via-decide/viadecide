(function (global) {
  'use strict';

  async function callZayvoraReasoning(mergedPassages, query) {
    if (global.NexClient && typeof global.NexClient.getSummary === 'function') {
      try {
        const response = await global.NexClient.getSummary(query);
        if (response && typeof response.summary === 'string') {
          return {
            summary: response.summary,
            bullet_points: Array.isArray(response.bullet_points) ? response.bullet_points : [],
            sources: Array.isArray(response.sources) ? response.sources : []
          };
        }
      } catch (_) {
        // graceful fallback below
      }
    }

    const trimmed = String(mergedPassages || '').trim();
    if (!trimmed) {
      return {
        summary: 'No passages available for summarization.',
        bullet_points: [],
        sources: []
      };
    }

    const sentences = trimmed.split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, 4);
    return {
      summary: `Zayvora reasoning fallback for "${query}": ${sentences.join(' ')}`,
      bullet_points: sentences.slice(0, 3),
      sources: []
    };
  }

  async function generateSummary(searchResults, query) {
    const passages = (Array.isArray(searchResults) ? searchResults : [])
      .map((item) => item && (item.text || item.passage || item.content || ''))
      .filter(Boolean)
      .slice(0, 10);

    const mergedPassages = passages.join('\n\n');
    return callZayvoraReasoning(mergedPassages, query);
  }

  const engine = {
    generateSummary
  };

  global.SummaryEngine = engine;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = engine;
  }
})(typeof window !== 'undefined' ? window : globalThis);
