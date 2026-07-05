(function (global) {
  'use strict';

  const RUN_STATE_KEY = 'viadecide.workflow-builder.run-state';

  function createStep(step, index) {
    return {
      id: step.id || `step-${index + 1}`,
      title: step.title || `Step ${index + 1}`,
      toolId: step.toolId || '',
      action: step.action || 'execute',
      input: step.input || '',
      outputKey: step.outputKey || '',
      config: step.config || {}
    };
  }

  function createWorkflow(id, name, steps) {
    return {
      id: id || `workflow-${Date.now()}`,
      name: name || id || 'Untitled Workflow',
      createdAt: new Date().toISOString(),
      steps: (steps || []).map(createStep)
    };
  }

  function setRunState(state) {
    localStorage.setItem(RUN_STATE_KEY, JSON.stringify(state));
  }

  function getRunState() {
    try {
      const raw = localStorage.getItem(RUN_STATE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_error) {
      return null;
    }
  }

  function clearRunState() {
    localStorage.removeItem(RUN_STATE_KEY);
  }

  function runWorkflow(workflow, allTools, options = {}) {
    if (!workflow || !Array.isArray(workflow.steps) || workflow.steps.length === 0) {
      return { ok: false, message: 'Workflow has no steps.' };
    }

    const toolMap = new Map((allTools || []).map((tool) => [tool.id, tool]));
    const logs = [];
    const context = {};

    workflow.steps.forEach((step, index) => {
      const tool = toolMap.get(step.toolId) || null;
      const output = {
        toolId: step.toolId,
        action: step.action,
        result: tool ? `Executed ${tool.name}` : `Executed ${step.toolId}`
      };
      if (step.outputKey) context[step.outputKey] = output;
      logs.push({ index, step, output, timestamp: new Date().toISOString() });
    });

    setRunState({
      workflowId: workflow.id,
      startedAt: new Date().toISOString(),
      currentIndex: workflow.steps.length - 1,
      logs,
      steps: workflow.steps
    });

    const firstStep = workflow.steps[0];
    const firstTool = toolMap.get(firstStep.toolId);
    if (options.navigate === true && firstTool && firstTool.entry) {
      global.location.href = firstTool.entry;
    }

    return {
      ok: true,
      message: `Executed ${workflow.steps.length} sequential step(s).`,
      logs,
      context,
      firstTool: firstTool || null
    };
  }

  global.WorkflowEngine = {
    createStep,
    createWorkflow,
    runWorkflow,
    getRunState,
    clearRunState
  };
})(window);
