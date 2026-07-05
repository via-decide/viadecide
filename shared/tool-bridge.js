(function (global) {
  const CHANNEL = 'viadecide.toolbridge';

  function createEnvelope(payload) {
    return {
      ...payload,
      timestamp: new Date().toISOString(),
      version: '0.1.0'
    };
  }

  function sendContext(fromToolId, toToolId, data) {
    const envelope = createEnvelope({ fromToolId, toToolId, data });
    localStorage.setItem(`${CHANNEL}.incoming.${toToolId}`, JSON.stringify(envelope));
    localStorage.setItem(`${CHANNEL}.last`, JSON.stringify(envelope));
    global.dispatchEvent(new CustomEvent('toolbridge:send', { detail: envelope }));
    return envelope;
  }

  function receiveContext(toolId) {
    const raw = localStorage.getItem(`${CHANNEL}.incoming.${toolId}`);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      localStorage.removeItem(`${CHANNEL}.incoming.${toolId}`);
      return parsed;
    } catch (error) {
      console.warn('Failed to parse incoming tool bridge message', error);
      return null;
    }
  }

  function peekContext(toolId) {
    const raw = localStorage.getItem(`${CHANNEL}.incoming.${toolId}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function openTool(entryPath) {
    if (!entryPath) return;
    global.location.href = entryPath;
  }

  global.ToolBridge = { sendContext, receiveContext, peekContext, openTool };
})(window);
