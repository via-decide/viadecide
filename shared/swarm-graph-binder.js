/**
 * swarm-graph-binder.js
 * Synchronizes mathematical SVG data streams reflecting agent states visually.
 * Utilizes requestAnimationFrame matching 60FPS DOM batches.
 * Targets `.swarm-node`, `.swarm-link`, `.active`, `.heavy-load`.
 */

function updateSwarmGraph(activeAgentsArray) {
  // Batch DOM mutation logic pushing frame updates
  requestAnimationFrame(() => {
    activeAgentsArray.forEach(agent => {
      // Node State Logic
      const node = document.querySelector(`.swarm-node[data-agent-id="${agent.id}"]`);
      if (node) {
        if (agent.status === 'idle') {
          node.classList.remove('active');
        } else if (agent.status === 'computing') {
          node.classList.add('active');
        }
      }

      // Link Stress Logic
      if (agent.linkedTo) {
        const link = document.querySelector(`.swarm-link[data-link-source="${agent.id}"]`);
        if (link) {
          if (agent.status === 'idle') {
            link.classList.remove('heavy-load');
          } else if (agent.status === 'computing') {
            link.classList.add('heavy-load');
          }
        }
      }
    });
  });
}

window.updateSwarmGraph = updateSwarmGraph;
