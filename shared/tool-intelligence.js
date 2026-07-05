(function (global) {
  'use strict';

  function uniqueEdges(edges) {
    const seen = new Set();
    return edges.filter((edge) => {
      const key = `${edge.from}|${edge.to}|${edge.relation}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function ioDependencies(tools) {
    const edges = [];
    const byId = new Map(tools.map((tool) => [tool.id, tool]));

    tools.forEach((source) => {
      const outputs = Array.isArray(source.outputs) ? source.outputs : [];
      if (!outputs.length) return;

      tools.forEach((target) => {
        if (source.id === target.id) return;
        const inputs = Array.isArray(target.inputs) ? target.inputs : [];
        const overlap = outputs.find((output) => inputs.includes(output));
        if (!overlap) return;
        edges.push({ from: source.id, to: target.id, relation: 'dependency', signal: overlap });
      });
    });

    return edges.filter((edge) => byId.has(edge.from) && byId.has(edge.to));
  }

  function relatedEdges(tools) {
    const edges = [];
    const byId = new Set(tools.map((tool) => tool.id));

    tools.forEach((tool) => {
      (tool.relatedTools || []).forEach((targetId) => {
        if (!byId.has(targetId)) return;
        edges.push({ from: tool.id, to: targetId, relation: 'related' });
      });
    });

    return edges;
  }

  function scoreTool(tool) {
    const tags = Array.isArray(tool.tags) ? tool.tags.length : 0;
    const related = Array.isArray(tool.relatedTools) ? tool.relatedTools.length : 0;
    const ioWeight = (Array.isArray(tool.inputs) ? tool.inputs.length : 0) + (Array.isArray(tool.outputs) ? tool.outputs.length : 0);
    return related * 2 + ioWeight + tags;
  }

  function analyze(tools) {
    const safeTools = Array.isArray(tools) ? tools : [];
    const nodes = safeTools.map((tool) => ({
      id: tool.id,
      label: tool.name,
      category: tool.category,
      score: scoreTool(tool)
    }));

    const edges = uniqueEdges([...relatedEdges(safeTools), ...ioDependencies(safeTools)]);
    const clusters = new Map();

    safeTools.forEach((tool) => {
      const key = tool.category || 'misc';
      if (!clusters.has(key)) clusters.set(key, []);
      clusters.get(key).push(tool.id);
    });

    return {
      nodes,
      edges,
      clusters: Array.from(clusters.entries()).map(([category, toolIds]) => ({ category, toolIds }))
    };
  }

  global.ToolIntelligenceEngine = { analyze };
})(window);
