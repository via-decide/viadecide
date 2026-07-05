(function (global) {
  'use strict';

  const DRAFT_KEY = 'viadecide.workflow-builder.plan-draft';
  const state = { tools: [], steps: [] };

  const el = (id) => document.getElementById(id);

  function uid() {
    return `step-${Math.random().toString(36).slice(2, 8)}`;
  }

  function currentAgent() {
    const id = el('workflow-id').value.trim() || `agent-${Date.now()}`;
    const name = el('workflow-name').value.trim() || id;
    return {
      id,
      name,
      type: 'agent',
      createdAt: new Date().toISOString(),
      steps: state.steps.map((step, index) => global.WorkflowEngine.createStep({ ...step, id: step.id || `step-${index + 1}` }, index))
    };
  }

  function saveDraft() {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(currentAgent()));
    const status = el('autosave-status');
    if (status) status.textContent = `Autosaved ${new Date().toLocaleTimeString()}`;
  }

  function renderToolOptions(selectedId) {
    return state.tools
      .map((tool) => `<option value="${tool.id}"${tool.id === selectedId ? ' selected' : ''}>${tool.name}</option>`)
      .join('');
  }

  function updatePreview(extra) {
    const payload = { agent: currentAgent(), runtime: extra || null };
    el('workflow-steps-preview').textContent = JSON.stringify(payload, null, 2);
  }

  function bindStepInputs() {
    el('steps-list').querySelectorAll('[data-step-id]').forEach((row) => {
      const id = row.getAttribute('data-step-id');
      const step = state.steps.find((item) => item.id === id);
      if (!step) return;

      row.querySelectorAll('[data-field]').forEach((input) => {
        input.addEventListener('input', () => {
          step[input.getAttribute('data-field')] = input.value;
          updatePreview();
          saveDraft();
        });
      });

      row.querySelector('[data-action="remove"]')?.addEventListener('click', () => {
        state.steps = state.steps.filter((item) => item.id !== id);
        render();
      });

      row.querySelector('[data-action="up"]')?.addEventListener('click', () => {
        const index = state.steps.findIndex((item) => item.id === id);
        if (index <= 0) return;
        [state.steps[index - 1], state.steps[index]] = [state.steps[index], state.steps[index - 1]];
        render();
      });

      row.querySelector('[data-action="down"]')?.addEventListener('click', () => {
        const index = state.steps.findIndex((item) => item.id === id);
        if (index < 0 || index >= state.steps.length - 1) return;
        [state.steps[index + 1], state.steps[index]] = [state.steps[index], state.steps[index + 1]];
        render();
      });
    });
  }

  function render() {
    const host = el('steps-list');
    host.innerHTML = state.steps.map((step, index) => `
      <article class="step-card" data-step-id="${step.id}">
        <header>
          <strong>Step ${index + 1}</strong>
          <div class="step-actions">
            <button type="button" class="btn" data-action="up">↑</button>
            <button type="button" class="btn" data-action="down">↓</button>
            <button type="button" class="btn" data-action="remove">Remove</button>
          </div>
        </header>
        <div class="step-grid">
          <label>Title<input data-field="title" value="${step.title || ''}" /></label>
          <label>Tool<select data-field="toolId">${renderToolOptions(step.toolId)}</select></label>
          <label>Action<input data-field="action" value="${step.action || 'execute'}" /></label>
          <label>Output Key<input data-field="outputKey" value="${step.outputKey || ''}" /></label>
        </div>
        <label>Input<textarea data-field="input" rows="2">${step.input || ''}</textarea></label>
      </article>
    `).join('') || '<p class="muted">No steps yet. Add a step to start your plan.</p>';

    bindStepInputs();
    updatePreview();
    saveDraft();
  }

  function addStep(prefill) {
    const first = state.tools[0] || { id: '' };
    state.steps.push({
      id: uid(),
      title: 'New Step',
      toolId: first.id,
      action: 'execute',
      input: '',
      outputKey: '',
      ...prefill
    });
    render();
  }

  function refreshSavedAgents() {
    const select = el('saved-workflows');
    const items = global.AgentStorage.loadAll().sort((a, b) => a.name.localeCompare(b.name));
    select.innerHTML = '<option value="">Select saved agent</option>' + items.map((agent) => `<option value="${agent.id}">${agent.name}</option>`).join('');
  }

  function loadAgent(agent) {
    if (!agent) return;
    el('workflow-id').value = agent.id || '';
    el('workflow-name').value = agent.name || '';
    state.steps = Array.isArray(agent.steps) ? agent.steps.map((step) => ({ ...step, id: step.id || uid() })) : [];
    render();
  }

  function bindControls() {
    el('add-step').addEventListener('click', () => addStep());
    el('save-workflow').addEventListener('click', () => {
      const agent = currentAgent();
      global.AgentStorage.save(agent);
      refreshSavedAgents();
      updatePreview({ message: 'Agent saved as JSON.' });
    });

    el('load-workflow').addEventListener('click', () => {
      const id = el('saved-workflows').value;
      if (!id) return;
      loadAgent(global.AgentStorage.findById(id));
    });

    el('run-workflow').addEventListener('click', () => {
      const result = global.AgentRuntime.runSequentially(currentAgent(), state.tools, { source: 'workflow-builder' });
      updatePreview(result);
    });

    el('clear-canvas').addEventListener('click', () => {
      state.steps = [];
      render();
    });

    el('export-workflow').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(currentAgent(), null, 2)], { type: 'application/json' });
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = `${currentAgent().id}.json`;
      link.click();
      URL.revokeObjectURL(href);
    });

    el('import-workflow').addEventListener('change', async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const parsed = JSON.parse(await file.text());
        loadAgent(parsed);
      } catch (_error) {
        alert('Invalid JSON file.');
      }
      event.target.value = '';
    });

    el('build-agent-workflow').addEventListener('click', () => {
      const prompt = el('agent-task-prompt').value.trim();
      const candidateTools = global.AgentLayer.pickToolsForTask(prompt, state.tools, 4);
      state.steps = candidateTools.map((tool, index) => ({
        id: uid(),
        title: `Auto Step ${index + 1}`,
        toolId: tool.id,
        action: index === 0 ? 'collect' : 'execute',
        input: prompt,
        outputKey: `step_${index + 1}`
      }));
      render();
    });

    el('run-agent-workflow').addEventListener('click', () => {
      const result = global.AgentRuntime.runSequentially(currentAgent(), state.tools, { source: 'agent-preview' });
      updatePreview(result);
    });
  }

  function restoreDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      loadAgent(JSON.parse(raw));
    } catch (_error) {
      // no-op
    }
  }

  async function init() {
    state.tools = await global.ToolRegistry.loadAll();
    bindControls();
    refreshSavedAgents();
    restoreDraft();
    if (!state.steps.length) addStep();
    else render();
  }

  global.WorkflowUI = { init };
})(window);
