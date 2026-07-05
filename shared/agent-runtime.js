(function (global) {
  'use strict';

  const RUN_KEY = 'viadecide.agent-runtime.last-run';

  const DEFAULT_IDENTITY_MAX_CHARS = 4000;

  async function getIdentityForUser(userId) {
    if (!userId || !global.DatabaseService || typeof global.DatabaseService.getUserProfile !== 'function') {
      return '';
    }

    try {
      const profile = await global.DatabaseService.getUserProfile(userId);
      return profile && typeof profile.identityMd === 'string' ? profile.identityMd.trim() : '';
    } catch (_error) {
      return '';
    }
  }

  async function injectIdentity(prompt, userId, options = {}) {
    const rawPrompt = String(prompt || '').trim();
    if (!rawPrompt) return rawPrompt;

    const identity = await getIdentityForUser(userId);
    if (!identity) return rawPrompt;

    const maxChars = Number.isFinite(options.maxIdentityChars) ? options.maxIdentityChars : DEFAULT_IDENTITY_MAX_CHARS;
    const boundedIdentity = identity.length > maxChars ? `${identity.slice(0, maxChars)}
[IDENTITY TRUNCATED]` : identity;
    return `System Instruction:
${boundedIdentity}

User Prompt:
${rawPrompt}`;
  }

  function run(agent, tools, options) {
    return global.WorkflowEngine.runWorkflow(agent, tools, options);
  }

  function runSequentially(agent, tools, context = {}) {
    const toolMap = new Map((tools || []).map((tool) => [tool.id, tool]));
    const logs = [];
    let activeContext = { ...context, agentId: agent.id };

    (agent.steps || []).forEach((step, index) => {
      const tool = toolMap.get(step.toolId) || null;
      const output = {
        stepId: step.id,
        toolId: step.toolId,
        action: step.action || 'execute',
        message: tool ? `Executed ${tool.name}` : `Executed ${step.toolId}`
      };
      logs.push({ index, step, output, timestamp: new Date().toISOString() });
      activeContext = { ...activeContext, lastOutput: output };
    });

    const payload = {
      ok: true,
      message: `Executed ${logs.length} step(s).`,
      logs,
      context: activeContext
    };

    localStorage.setItem(RUN_KEY, JSON.stringify(payload));
    return payload;
  }


  async function runSequentiallyAsync(agent, tools, context = {}) {
    const toolMap = new Map((tools || []).map((tool) => [tool.id, tool]));
    const logs = [];
    let activeContext = { ...context, agentId: agent.id };

    for (let index = 0; index < (agent.steps || []).length; index += 1) {
      const step = agent.steps[index];
      const tool = toolMap.get(step.toolId) || null;
      const output = {
        stepId: step.id,
        toolId: step.toolId,
        action: step.action || 'execute',
        message: tool ? `Executed ${tool.name}` : `Executed ${step.toolId}`
      };

      if (step.toolId === 'llm_router' && global.ToolRegistry && typeof global.ToolRegistry.llmRouter === 'function') {
        const stepInput = typeof step.input === 'object' && step.input ? step.input : {};
        const identityPrompt = await injectIdentity(stepInput.prompt || activeContext.prompt || '', activeContext.userId || context.userId);
        const result = await global.ToolRegistry.llmRouter({
          ...stepInput,
          prompt: identityPrompt
        });
        output.result = result;
      }

      logs.push({ index, step, output, timestamp: new Date().toISOString() });
      activeContext = { ...activeContext, lastOutput: output };
    }

    const payload = {
      ok: true,
      message: `Executed ${logs.length} step(s).`,
      logs,
      context: activeContext
    };

    localStorage.setItem(RUN_KEY, JSON.stringify(payload));
    return payload;
  }

  function getLastRun() {
    try {
      const raw = localStorage.getItem(RUN_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_error) {
      return null;
    }
  }

  global.AgentRuntime = { run, runSequentially, runSequentiallyAsync, injectIdentity, getLastRun };
})(window);
