const artifact = document.getElementById('artifact');
const goal = document.getElementById('goal');
const output = document.getElementById('output');

const ROUTE_MAP = {
  idea: { validate: 'spec-builder', 'prepare implementation': 'task-splitter', 'generate code': 'code-generator' },
  prompt: { 'improve quality': 'prompt-compare', 'generate code': 'code-generator', evaluate: 'output-evaluator' },
  spec: { 'generate code': 'code-generator', 'review architecture': 'repo-improvement-brief', export: 'export-studio' },
  code: { review: 'code-reviewer', package: 'context-packager', export: 'export-studio' }
};

function toast(message, kind = 'ok') {
  let el = document.getElementById('tool-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'tool-toast';
    el.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:9999;background:#111;color:#fff;padding:10px 12px;border-radius:10px;border:1px solid #333;font:12px system-ui;opacity:0;transition:.2s';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.style.borderColor = kind === 'error' ? '#c53030' : '#2f855a';
  el.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.style.opacity = '0'; }, 1400);
}

function findGoalBucket(type, objective) {
  const map = ROUTE_MAP[type] || {};
  const lower = objective.toLowerCase();
  const found = Object.keys(map).find((k) => lower.includes(k));
  return found ? map[found] : null;
}

async function suggest() {
  const type = artifact.value;
  const objective = goal.value.trim() || 'Move to next implementation step';
  const toolId = findGoalBucket(type, objective);

  if (!toolId) {
    output.textContent = [
      '# Next Tool Suggestion',
      '',
      `Current artifact: ${type}`,
      `Goal: ${objective}`,
      '',
      'No deterministic route matched this artifact/goal combination.',
      'Try goals containing: review, generate code, export, validate, package.'
    ].join('\n');
    toast('No route match for this combo', 'error');
    return;
  }

  const tool = await ToolRegistry.findById(toolId);
  const entry = tool?.entry || `tools/${toolId}/index.html`;
  const name = tool?.name || toolId;

  output.textContent = [
    '# Next Tool Suggestion',
    '',
    `Current artifact: ${type}`,
    `Goal: ${objective}`,
    '',
    `Recommended tool: ${name}`,
    `Open link: ${entry}`,
    '',
    `Why: ${type} + "${objective}" best maps to ${name}.`
  ].join('\n');

  ToolStorage.write('tool-router.draft', { artifact: type, goal: objective, output: output.textContent });
  toast('Suggestion generated');
}

document.getElementById('suggest').addEventListener('click', suggest);
document.getElementById('copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(output.textContent || ''); toast('Copied to clipboard'); }
  catch (_e) { toast('Copy failed', 'error'); }
});
document.getElementById('download').addEventListener('click', () => {
  try {
    const blob = new Blob([output.textContent || ''], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'tool-router-suggestion.txt';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
    toast('Download started');
  } catch (_e) { toast('Download failed', 'error'); }
});

const saved = ToolStorage.read('tool-router.draft', null);
if (saved) {
  artifact.value = saved.artifact || 'idea';
  goal.value = saved.goal || '';
  output.textContent = saved.output || '';
}
