const promptEl = document.getElementById('prompt');
const formatEl = document.getElementById('format');
const lengthEl = document.getElementById('length');
const outputEl = document.getElementById('output');

function generateScript() {
  const prompt = promptEl.value.trim();
  const format = formatEl.value;
  const length = lengthEl.value.trim() || '60 seconds';

  const framing = {
    video: 'Hook → Setup → Value → CTA',
    demo: 'Problem → Steps → Result → Next Step',
    sales: 'Pain → Proof → Offer → Close'
  };

  outputEl.textContent = [
    `# ${format.toUpperCase()} SCRIPT`,
    '',
    `Length target: ${length}`,
    `Flow: ${framing[format]}`,
    '',
    '## Source Prompt',
    prompt || '(missing prompt)',
    '',
    '## Draft Script',
    `1) Opening line aligned with ${format} format.`,
    '2) Explain context in plain language.',
    '3) Deliver key points with one concrete example.',
    '4) Close with one explicit call to action.'
  ].join('\n');

  ToolStorage.write('script-generator.draft', {
    prompt,
    format,
    length,
    output: outputEl.textContent
  });
}

document.getElementById('generate').addEventListener('click', generateScript);
document.getElementById('copy').addEventListener('click', () => navigator.clipboard.writeText(outputEl.textContent));
document.getElementById('download').addEventListener('click', () => {
  const blob = new Blob([outputEl.textContent], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'script-generator-output.txt';
  link.click();
});

const saved = ToolStorage.read('script-generator.draft', null);
if (saved) {
  promptEl.value = saved.prompt || '';
  formatEl.value = saved.format || 'video';
  lengthEl.value = saved.length || '';
  outputEl.textContent = saved.output || '';
}
