(function (global) {
  'use strict';

  const BASE_URL = 'http://localhost:8000';
  const DEFAULT_LIMIT = 10;
  const cache = new Map();

  function withTimeout(promise, ms) {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(`Nex API timeout after ${ms}ms`)), ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
  }

  function normalizeResult(item) {
    const normalized = item || {};
    return {
      document_id: normalized.document_id || normalized.doc_id || normalized.id || '',
      title: normalized.title || normalized.book_title || 'Untitled',
      passage: normalized.passage || normalized.text || normalized.content || '',
      score: Number(normalized.score || 0),
      source: normalized.source || normalized.book_title || normalized.corpus_path || 'Unknown',
      metadata: normalized.metadata || {}
    };
  }

  function cacheGet(key) {
    const hit = cache.get(key);
    if (!hit) return null;
    if (Date.now() > hit.expiresAt) {
      cache.delete(key);
      return null;
    }
    return hit.value;
  }

  function cacheSet(key, value, ttlMs) {
    cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs
    });
  }

  async function request(path, payload, options) {
    const settings = options || {};
    const method = payload ? 'POST' : 'GET';
    const cacheKey = `${method}:${path}:${payload ? JSON.stringify(payload) : ''}`;

    if (settings.useCache) {
      const cached = cacheGet(cacheKey);
      if (cached) return cached;
    }

    const fetchPromise = fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: payload ? JSON.stringify(payload) : undefined
    });

    const response = await withTimeout(fetchPromise, settings.timeoutMs || 2000);

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Nex API ${path} failed (${response.status}): ${text || response.statusText}`);
    }

    const data = await response.json();
    if (settings.useCache) {
      cacheSet(cacheKey, data, settings.ttlMs || 15000);
    }
    return data;
  }

  async function searchCorpus(query, topK) {
    const payload = await request('/search', {
      query,
      limit: topK || DEFAULT_LIMIT
    }, {
      useCache: true,
      ttlMs: 20000,
      timeoutMs: 1500
    });

    const raw = payload.results || payload.passages || [];
    return {
      ...payload,
      results: raw.map(normalizeResult).slice(0, topK || DEFAULT_LIMIT)
    };
  }

  async function getDocument(doc_id, options) {
    const doc = await request('/document', {
      doc_id,
      offset: (options && options.offset) || 0,
      limit: (options && options.limit) || 5
    }, {
      useCache: true,
      ttlMs: 30000,
      timeoutMs: 2000
    });

    const chunks = Array.isArray(doc.chunks) ? doc.chunks : [];
    return {
      ...doc,
      document_id: doc.document_id || doc.doc_id || doc_id,
      title: doc.title || doc.metadata?.book_title || 'Untitled',
      source: doc.source || doc.metadata?.book_title || 'Unknown',
      chunks
    };
  }

  async function getSources(query) {
    let payload;
    try {
      payload = await request('/sources', { query }, {
        useCache: true,
        ttlMs: 20000,
        timeoutMs: 1500
      });
    } catch (_) {
      payload = await request('/search', { query, limit: DEFAULT_LIMIT }, {
        useCache: true,
        ttlMs: 20000,
        timeoutMs: 1500
      });
    }
    const normalized = (payload.results || payload.passages || payload.sources || []).map((entry) => {
      if (typeof entry === 'string') {
        return normalizeResult({ source: entry, passage: '', title: entry });
      }
      return normalizeResult(entry);
    });
    return {
      sources: normalized.map((item) => item.source),
      results: normalized
    };
  }

  async function getSummary(query) {
    return request('/summary', { query }, { timeoutMs: 2000 });
  }

  async function getCorpusStats() {
    return request('/status', null, {
      useCache: true,
      ttlMs: 30000,
      timeoutMs: 1500
    });
  }

  async function getCorpusStatus() {
    return getCorpusStats();
  }

  const client = {
    searchCorpus,
    getDocument,
    getSources,
    getSummary,
    getCorpusStats,
    getCorpusStatus,
    _cache: cache
  };

  global.NexClient = client;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = client;
  }
})(typeof window !== 'undefined' ? window : globalThis);
