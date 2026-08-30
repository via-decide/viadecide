const promptAInput = document.getElementById('promptA');
const promptBInput = document.getElementById('promptB');
const promptCInput = document.getElementById('promptC');
const output = document.getElementById('output');

function scorePrompt(text) {
  const trimmed = text.trim();
  const length = trimmed.length;
  const lines = trimmed ? trimmed.split('\n').filter(Boolean).length : 0;
  const hasSteps = /(step|first|then|finally|checklist|requirements)/i.test(trimmed);
  const hasConstraints = /(must|should|avoid|do not|never|required)/i.test(trimmed);
  const hasOutputFormat = /(output|format|json|markdown|table|sections?)/i.test(trimmed);

  return {
    length,
    lines,
    structure: Math.min(5, Math.max(1, Math.round(lines / 3) + (hasSteps ? 1 : 0))),
    clarity: Math.min(5, Math.max(1, Math.round(length / 200) + (hasConstraints ? 1 : 0))),
    downstreamUse: Math.min(5, (hasOutputFormat ? 3 : 1) + (hasSteps ? 1 : 0) + (hasConstraints ? 1 : 0))
  };
}

function comparePrompts() {
  const prompts = [
    ['Prompt A', promptAInput.value],
    ['Prompt B', promptBInput.value],
    ['Prompt C', promptCInput.value]
  ].filter(([, text]) => text.trim());

  if (prompts.length < 2) {
    output.textContent = 'Please enter at least two prompts to compare.';
    return;
  }

  const scored = prompts.map(([name, text]) => ({ name, text, score: scorePrompt(text) }));
  scored.sort((a, b) => {
    const aTotal = a.score.structure + a.score.clarity + a.score.downstreamUse;
    const bTotal = b.score.structure + b.score.clarity + b.score.downstreamUse;
    return bTotal - aTotal;
  });

  const rows = scored.map((item, index) => {
    const total = item.score.structure + item.score.clarity + item.score.downstreamUse;
    return [
      `### ${index + 1}. ${item.name}`,
      `- Structure: ${item.score.structure}/5`,
      `- Clarity: ${item.score.clarity}/5`,
      `- Downstream Utility: ${item.score.downstreamUse}/5`,
      `- Total: ${total}/15`,
      `- Character Count: ${item.score.length}`,
      `- Line Count: ${item.score.lines}`
    ].join('\n');
  });

  output.textContent = [
    '# Prompt Comparison',
    '',
    ...rows,
    '',
    '## Recommendation',
    `${scored[0].name} appears strongest for downstream usage based on structure, constraints, and output specificity.`,
    '',
    '## Improvement Moves',
    '- Add explicit output format requirements.',
    '- Add concrete constraints and acceptance criteria.',
    '- Add step-by-step execution sequence.'
  ].join('\n');

  ToolStorage.write('prompt-compare.draft', {
    promptA: promptAInput.value,
    promptB: promptBInput.value,
    promptC: promptCInput.value,
    output: output.textContent
  });
}

document.getElementById('generate').addEventListener('click', comparePrompts);
document.getElementById('copy').addEventListener('click', () => navigator.clipboard.writeText(output.textContent));
document.getElementById('download').addEventListener('click', () => {
  const blob = new Blob([output.textContent], { type: 'text/markdown' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'prompt-compare-output.md';
  link.click();
});

const saved = ToolStorage.read('prompt-compare.draft', null);
if (saved) {
  promptAInput.value = saved.promptA || '';
  promptBInput.value = saved.promptB || '';
  promptCInput.value = saved.promptC || '';
  output.textContent = saved.output || '';
}
