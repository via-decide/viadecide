(function () {
  'use strict';

  const TYPE_COLORS = { tool: '#60a5fa', agent: '#f59e0b', workflow: '#34d399' };

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function buildLegend(container) {
    container.innerHTML = [
      { label: 'Tool', color: TYPE_COLORS.tool },
      { label: 'Agent', color: TYPE_COLORS.agent },
      { label: 'Workflow', color: TYPE_COLORS.workflow }
    ].map((item) => `<div class="legend-item"><span class="swatch" style="background:${item.color}"></span>${item.label}</div>`).join('');
  }

  function buildAgentNodes(agents) {
    const nodes = [];
    const edges = [];

    agents.forEach((agent) => {
      const agentNodeId = `agent:${agent.id}`;
      nodes.push({ id: agentNodeId, label: agent.name || agent.id, nodeType: 'agent', description: `Agent (${(agent.steps || []).length} steps)` });

      const workflowNodeId = `workflow:${agent.id}`;
      nodes.push({ id: workflowNodeId, label: `${agent.id}-workflow`, nodeType: 'workflow', description: 'Workflow definition' });
      edges.push({ from: agentNodeId, to: workflowNodeId, relation: 'owns' });

      (agent.steps || []).forEach((step, idx) => {
        if (!step.toolId) return;
        edges.push({ from: workflowNodeId, to: step.toolId, relation: 'step', label: `S${idx + 1}` });
      });
    });

    return { nodes, edges };
  }

  function renderGraph(svg, graphRoot, nodesGroup, edgesGroup, tooltip, nodes, edges) {
    const width = svg.clientWidth || 1000;
    const height = svg.clientHeight || 700;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    const radius = Math.min(width, height) * 0.35;
    const cx = width / 2;
    const cy = height / 2;

    const laidOut = nodes.map((node, index) => {
      const angle = (Math.PI * 2 * index) / Math.max(nodes.length, 1);
      return { ...node, x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
    });

    const byId = new Map(laidOut.map((node) => [node.id, node]));

    edgesGroup.innerHTML = '';
    edges.forEach((edge) => {
      const source = byId.get(edge.from);
      const target = byId.get(edge.to);
      if (!source || !target) return;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', source.x);
      line.setAttribute('y1', source.y);
      line.setAttribute('x2', target.x);
      line.setAttribute('y2', target.y);
      line.setAttribute('stroke', '#334155');
      line.setAttribute('stroke-width', edge.relation === 'step' ? '1.8' : '1');
      edgesGroup.appendChild(line);
    });

    nodesGroup.innerHTML = '';
    laidOut.forEach((node) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'node');
      g.setAttribute('transform', `translate(${node.x},${node.y})`);

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', node.nodeType === 'tool' ? '11' : '13');
      circle.setAttribute('fill', TYPE_COLORS[node.nodeType] || '#cbd5e1');

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('y', '24');
      text.textContent = node.label.slice(0, 16);

      g.appendChild(circle);
      g.appendChild(text);

      g.addEventListener('mouseenter', (event) => {
        tooltip.innerHTML = `<strong>${escapeHtml(node.label)}</strong><br>${escapeHtml(node.description || '')}`;
        tooltip.classList.add('show');
        tooltip.style.left = `${event.clientX + 10}px`;
        tooltip.style.top = `${event.clientY - 10}px`;
      });
      g.addEventListener('mouseleave', () => tooltip.classList.remove('show'));

      nodesGroup.appendChild(g);
    });

    const state = { scale: 1, tx: 0, ty: 0 };
    const apply = () => graphRoot.setAttribute('transform', `translate(${state.tx},${state.ty}) scale(${state.scale})`);
    svg.onwheel = (event) => {
      event.preventDefault();
      state.scale = Math.max(0.3, Math.min(3, state.scale * (event.deltaY > 0 ? 0.9 : 1.1)));
      apply();
    };
    document.getElementById('reset-view').onclick = () => {
      state.scale = 1; state.tx = 0; state.ty = 0; apply();
    };
  }

  async function init() {
    const svg = document.getElementById('graph');
    const graphRoot = document.getElementById('graph-root');
    const edgesGroup = document.getElementById('edges');
    const nodesGroup = document.getElementById('nodes');
    const tooltip = document.getElementById('tooltip');

    buildLegend(document.getElementById('legend'));

    const registry = await window.ToolRegistry.getGraph();
    const tools = registry.nodes || [];
    const toolEdges = registry.edges || [];
    const agents = window.AgentStorage ? window.AgentStorage.loadAll() : [];
    const agentGraph = buildAgentNodes(agents);

    renderGraph(
      svg,
      graphRoot,
      nodesGroup,
      edgesGroup,
      tooltip,
      [...tools, ...agentGraph.nodes],
      [...toolEdges, ...agentGraph.edges]
    );
  }

  init();
})();
