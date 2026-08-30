const ideaEl = document.getElementById('idea');
const contextEl = document.getElementById('context');
const goalEl = document.getElementById('goal');
const outputEl = document.getElementById('output');

const saved = ToolStorage.read('promptalchemy.draft', {});
ideaEl.value = saved.idea || '';
contextEl.value = saved.context || '';
goalEl.value = saved.goal || '';

function buildPrompt() {
  const idea = ideaEl.value.trim();
  const context = contextEl.value.trim();
  const goal = goalEl.value.trim() || 'Produce a clear implementation draft';

  const prompt = [
    '# Structured Prompt',
    '',
    '## Objective',
    goal,
    '',
    '## Core Idea',
    idea || '(missing idea)',
    '',
    '## Context',
    context || '(no context provided)',
    '',
    '## Requirements',
    '- Return a practical output.',
    '- Keep assumptions explicit.',
    '- Include next actions and validation steps.'
  ].join('\n');

  outputEl.textContent = prompt;
  ToolStorage.write('promptalchemy.draft', { idea, context, goal, prompt });
}

function copyOutput() {
  navigator.clipboard.writeText(outputEl.textContent || '');
}

function downloadOutput() {
  const blob = new Blob([outputEl.textContent || ''], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'promptalchemy-output.txt';
  link.click();
  URL.revokeObjectURL(link.href);
}

document.getElementById('generate').addEventListener('click', buildPrompt);
document.getElementById('copy').addEventListener('click', copyOutput);
document.getElementById('download').addEventListener('click', downloadOutput);

if (saved.prompt) {
  outputEl.textContent = saved.prompt;
}
