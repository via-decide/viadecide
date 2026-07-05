(function (global) {
  'use strict';

  const DEFAULT_CATEGORY = 'misc';
  const PLUGIN_STORAGE_KEY = 'viadecide.tool-registry.plugins';

  const CATEGORY_ALIASES = {
    operators: 'business',
    founders: 'business',
    students: 'education',
    engine: 'simulations'
  };

  const BUILTIN_TOOLS = [
    {
      id: 'decision-matrix',
      name: 'Decision Matrix',
      description: 'Weighted decision-making with scored criteria analysis.',
      category: 'business',
      tags: ['decision', 'matrix', 'scoring'],
      entry: 'decision-matrix.html',
      featured: true
    },
    {
      id: 'opportunity-radar',
      name: 'Opportunity Radar',
      description: 'Identify, evaluate, and prioritize opportunities systematically.',
      category: 'business',
      tags: ['opportunities', 'radar', 'assessment'],
      entry: 'opportunity-radar.html',
      featured: true
    },
    {
      id: 'reality-check',
      name: 'Reality Check',
      description: 'Validate decisions and identify blind spots through reality testing.',
      category: 'business',
      tags: ['validation', 'risk', 'decisions'],
      entry: 'reality-check.html',
      featured: true
    },
    {
      id: 'founder',
      name: 'Founder Narrative Builder',
      description: 'Build founder positioning and narrative assets.',
      category: 'business',
      audience: ['founders', 'creators'],
      inputs: ['story', 'offer'],
      outputs: ['founder_narrative'],
      entry: 'founder/index.html',
      tags: ['legacy', 'positioning']
    },
    {
      id: 'mars-decision-lab',
      name: 'Mars Decision Lab',
      description: 'Mars rover decision game launcher.',
      category: 'education',
      tags: ['game', 'mars', 'simulation'],
      entry: 'mars.html'
    }
  ];


  /* Engine/template tools removed from UI — backend-only, not user-facing */
  const GAME_ENHANCEMENT_TOOLS = [];

  /* Only real, user-facing tools are importable */
  const importableToolDirs = [
    'tools/decision-matrix', 'tools/scenario-planner', 'tools/eco-engine-test',
    'tools/color-palette', 'tools/json-formatter', 'tools/pomodoro',
    'tools/regex-tester',
    'tools/games/hex-wars', 'tools/games/freecell-classic',
    'tools/games/snake-game', 'tools/games/wings-of-fire-quiz',
    'tools/games/skillhex-mission-control', 'tools/games/vialogic',
    'tools/business/kutch-map'
  ];

  function normalizeCategory(category) {
    const raw = String(category || '').trim().toLowerCase();
    return CATEGORY_ALIASES[raw] || raw || DEFAULT_CATEGORY;
  }

  function normalizeTool(meta, toolDir) {
    const id = String(meta.id || toolDir.split('/').pop() || 'unknown').trim();
    const entry = String(meta.entry || `${toolDir}/index.html`).replace(/^\.\//, '');
    const category = normalizeCategory(meta.category);

    return {
      id,
      name: meta.name || id,
      description: meta.description || '',
      category,
      audience: Array.isArray(meta.audience) ? meta.audience : [],
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      inputs: Array.isArray(meta.inputs) ? meta.inputs : [],
      outputs: Array.isArray(meta.outputs) ? meta.outputs : [],
      relatedTools: Array.isArray(meta.relatedTools) ? meta.relatedTools : [],
      featured: Boolean(meta.featured),
      isEngineTool: Boolean(meta.isEngineTool) || entry.startsWith('tools/engine/'),
      entry
    };
  }

  function getPersistedPlugins() {
    try {
      const raw = localStorage.getItem(PLUGIN_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
      return [];
    }
  }

  function savePlugins(plugins) {
    try {
      localStorage.setItem(PLUGIN_STORAGE_KEY, JSON.stringify(plugins));
      return true;
    } catch (_error) {
      return false;
    }
  }

  async function loadManifest() {
    try {
      const res = await fetch('tools-manifest.json', { cache: 'no-cache' });
      if (!res.ok) return [];
      const payload = await res.json();
      return Array.isArray(payload.entries) ? payload.entries : [];
    } catch (_error) {
      return [];
    }
  }

  async function loadToolMeta({ toolDir, metaPath }) {
    try {
      const res = await fetch(metaPath, { cache: 'no-cache' });
      if (!res.ok) return null;
      const json = await res.json();
      return normalizeTool(json, toolDir);
    } catch (_error) {
      return null;
    }
  }

  async function loadAll() {
    const [entries, manifest] = await Promise.all([
      Promise.resolve([...BUILTIN_TOOLS, ...GAME_ENHANCEMENT_TOOLS].map((tool) => normalizeTool(tool, tool.id))),
      loadManifest()
    ]);

    const loaded = await Promise.all(manifest.map(loadToolMeta));
    const plugins = getPersistedPlugins().map((tool) => normalizeTool(tool, tool.toolDir || 'tools/plugin'));
    const runtimePlugins = Array.isArray(global.TOOL_REGISTRY_PLUGINS)
      ? global.TOOL_REGISTRY_PLUGINS.map((tool) => normalizeTool(tool, tool.toolDir || 'tools/plugin'))
      : [];

    const merged = new Map();
    [...loaded.filter(Boolean), ...entries, ...plugins, ...runtimePlugins].forEach((tool) => {
      merged.set(tool.id, tool);
    });

    return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async function findById(id) {
    const all = await loadAll();
    return all.find((tool) => tool.id === id) || null;
  }

  async function getCategories() {
    const all = await loadAll();
    return Array.from(new Set(all.map((tool) => tool.category))).sort();
  }

  function registerPlugin(pluginMeta) {
    if (!pluginMeta || typeof pluginMeta !== 'object') return null;
    const plugins = getPersistedPlugins();
    const normalized = normalizeTool(pluginMeta, pluginMeta.toolDir || 'tools/plugin');
    const next = plugins.filter((tool) => tool.id !== normalized.id);
    next.push(normalized);
    savePlugins(next);
    return normalized;
  }

  function registerPlugins(plugins) {
    if (!Array.isArray(plugins)) return [];
    return plugins.map(registerPlugin).filter(Boolean);
  }

  async function getGraph() {
    const tools = await loadAll();
    const nodes = tools.map((tool) => ({
      id: tool.id,
      label: tool.name,
      category: tool.category,
      nodeType: 'tool',
      entry: tool.entry,
      description: tool.description
    }));

    const edges = [];
    const known = new Set(tools.map((tool) => tool.id));
    tools.forEach((tool) => {
      (tool.relatedTools || []).forEach((target) => {
        if (known.has(target)) {
          edges.push({ from: tool.id, to: target, relation: 'related' });
        }
      });
    });

    return { nodes, edges, tools };
  }



  function normalizeLLMText(payload) {
    if (!payload || typeof payload !== 'object') return '';

    if (typeof payload.text === 'string') return payload.text;
    if (typeof payload.output_text === 'string') return payload.output_text;

    if (Array.isArray(payload.content)) {
      const textParts = payload.content
        .map((part) => {
          if (typeof part === 'string') return part;
          if (part && typeof part.text === 'string') return part.text;
          return '';
        })
        .filter(Boolean);
      if (textParts.length) return textParts.join('\n');
    }

    const choiceText = payload.choices && payload.choices[0] && payload.choices[0].message && payload.choices[0].message.content;
    if (typeof choiceText === 'string') return choiceText;

    const candidateText = payload.candidates && payload.candidates[0] && payload.candidates[0].content
      && Array.isArray(payload.candidates[0].content.parts)
      ? payload.candidates[0].content.parts.map((part) => part.text || '').join('\n')
      : '';
    if (candidateText) return candidateText;

    return '';
  }

  async function llmRouter(input = {}, options = {}) {
    const provider = String(input.provider || '').trim().toLowerCase();
    const prompt = String(input.prompt || '').trim();

    if (!provider || !['groq', 'gemini', 'claude'].includes(provider)) {
      throw new Error('llm_router requires provider: groq | gemini | claude');
    }
    if (!prompt) {
      throw new Error('llm_router requires a non-empty prompt');
    }

    const config = options.config || global.__GN8R_CONFIG__ || {};
    const headers = { 'Content-Type': 'application/json' };
    let endpoint = '';
    let body = {};

    if (provider === 'groq') {
      if (config.groqApiKey) headers.Authorization = `Bearer ${config.groqApiKey}`;
      endpoint = 'https://api.groq.com/openai/v1/chat/completions';
      body = {
        model: input.model || 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: Number.isFinite(input.temperature) ? input.temperature : 0.2
      };
    } else if (provider === 'gemini') {
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(input.model || 'gemini-1.5-flash')}:generateContent${config.geminiApiKey ? `?key=${encodeURIComponent(config.geminiApiKey)}` : ''}`;
      body = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: Number.isFinite(input.temperature) ? input.temperature : 0.2
        }
      };
    } else {
      if (config.claudeApiKey) headers['x-api-key'] = config.claudeApiKey;
      headers['anthropic-version'] = '2023-06-01';
      endpoint = 'https://api.anthropic.com/v1/messages';
      body = {
        model: input.model || 'claude-3-5-sonnet-latest',
        max_tokens: input.maxTokens || 1024,
        messages: [{ role: 'user', content: prompt }]
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`llm_router request failed (${provider}): ${response.status} ${errorText}`);
    }

    const payload = await response.json();
    return { text: normalizeLLMText(payload) };
  }
  global.ToolRegistry = {
    normalizeCategory,
    normalizeTool,
    loadAll,
    findById,
    getCategories,
    registerPlugin,
    registerPlugins,
    getGraph,
    llmRouter
  };
})(window);
