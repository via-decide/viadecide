(function (global) {
  'use strict';

  function tokenize(text) {
    return String(text || '')
      .toLowerCase()
      .split(/[^a-z0-9]+/g)
      .map((token) => token.trim())
      .filter(Boolean);
  }

  function scoreTool(tool, tokens) {
    const corpus = [
      tool.id,
      tool.name,
      tool.description,
      ...(tool.tags || []),
      ...(tool.inputs || []),
      ...(tool.outputs || [])
    ].join(' ').toLowerCase();

    let score = 0;
    tokens.forEach((token) => {
      if (corpus.includes(token)) score += 2;
    });

    if (tool.featured) score += 1;
    if (tool.isEngineTool) score += 0.25;
    return score;
  }

  function pickToolsForTask(taskPrompt, tools, limit = 5) {
    const tokens = tokenize(taskPrompt);
    if (!tokens.length) return (tools || []).slice(0, limit);

    return (tools || [])
      .map((tool) => ({ tool, score: scoreTool(tool, tokens) }))
      .sort((a, b) => b.score - a.score || (a.tool.name || '').localeCompare(b.tool.name || ''))
      .slice(0, limit)
      .map((row) => row.tool);
  }

  function createAgentWorkflow(agentName, taskPrompt, tools) {
    const selectedTools = pickToolsForTask(taskPrompt, tools, 6);
    const nodes = selectedTools.map((tool, index) => ({
      instanceId: `agent-node-${index + 1}`,
      toolId: tool.id,
      nodeType: index === 0 ? 'tool' : (index % 2 === 0 ? 'transform' : 'decision'),
      x: 60 + index * 150,
      y: 80 + (index % 2) * 120
    }));

    const edges = [];
    for (let i = 0; i < nodes.length - 1; i += 1) {
      edges.push({ from: nodes[i].instanceId, to: nodes[i + 1].instanceId });
    }

    return {
      id: `agent-${Date.now()}`,
      name: agentName || 'Auto Agent Workflow',
      taskPrompt,
      nodes,
      edges,
      selectedTools
    };
  }

  function runAgentTask(agentWorkflow, allTools, options = {}) {
    const workflow = global.WorkflowEngine.createWorkflow(
      agentWorkflow.id,
      agentWorkflow.name,
      agentWorkflow.nodes,
      agentWorkflow.edges
    );

    return global.WorkflowEngine.runWorkflow(workflow, allTools, {
      navigate: options.navigate === true
    });
  }

  global.AgentLayer = {
    tokenize,
    pickToolsForTask,
    createAgentWorkflow,
    runAgentTask
  };
})(window);
