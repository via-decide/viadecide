(function (global) {
  'use strict';

  function unique(values) {
    return [...new Set((values || []).filter(Boolean))];
  }

  function buildFallback(results, query) {
    const passages = (results || []).map((item) => item.passage || '').filter(Boolean);
    const topSentences = passages.join(' ').split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, 3);

    return {
      summary: topSentences.length
        ? `Synthesis for "${query}": ${topSentences.join(' ')}`
        : `No high-confidence passages found for "${query}".`,
      insights: topSentences,
      sources: unique((results || []).map((item) => item.source))
    };
  }

  async function synthesize(results, query) {
    const payload = {
      query,
      results: (results || []).slice(0, 10)
    };

    try {
      const response = await fetch('http://localhost:8000/zayvora/reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        return {
          summary: String(data.summary || ''),
          insights: Array.isArray(data.insights) ? data.insights : [],
          sources: Array.isArray(data.sources) ? data.sources : []
        };
      }
    } catch (_) {
      // fallback below
    }

    return buildFallback(results, query);
  }

  global.ZayvoraReasoning = {
    synthesize
  };
})(window);
