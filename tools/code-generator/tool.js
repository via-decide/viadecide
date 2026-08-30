import { emit, read, buildPipelineStatus } from '../../shared/tool-bus.js';

const spec = document.getElementById('spec');
const lang = document.getElementById('lang');
const style = document.getElementById('style');
const test = document.getElementById('test');
const output = document.getElementById('output');

const steps = ['context-packager', 'spec-builder', 'code-generator', 'code-reviewer'];
document.getElementById('pipeline').innerHTML = buildPipelineStatus(steps, 'code-generator');

const incoming = read('agent:spec-builder:output');
if (incoming?.data?.spec) {
  spec.value = incoming.data.spec;
  document.getElementById('banner').textContent = '📥 Spec loaded from spec-builder';
}
emit('agent:pipeline:active', { toolId: 'code-generator', steps });

function copyText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const temp = document.createElement('textarea');
  temp.value = text;
  document.body.appendChild(temp);
  temp.select();
  document.execCommand('copy');
  temp.remove();
  return Promise.resolve();
}

function buildPrompt() {
  const prompt = [
    `SYSTEM: You are a ${lang.value.trim() || 'software'} expert. You write production-ready code.`,
    style.value.trim() ? `Style rules: ${style.value.trim()}` : 'Style rules: Preserve existing repository patterns.',
    `Test requirement: ${test.value}.`,
    'Output format rules: Return ONLY code. No explanation. No markdown fences.',
    '',
    'USER:',
    '## Task',
    spec.value.trim() || 'No spec provided.',
    '',
    '## Output format',
    'Return ONLY the code. No explanation. No markdown fences.',
    'If multiple files: use "// FILE: path/to/file.js" as separator.',
    '',
    '## Quality gates (check before returning)',
    '- [ ] No TODO or placeholder',
    '- [ ] All imports resolve',
    '- [ ] Edge cases from spec handled',
    '- [ ] Follows style guide'
  ].join('\n');

  output.textContent = prompt;
  ToolStorage.write('code-generator.draft', {
    spec: spec.value,
    lang: lang.value,
    style: style.value,
    test: test.value,
    output: prompt
  });
  emit('agent:code-generator:output', { prompt, spec: spec.value });
}

const saved = ToolStorage.read('code-generator.draft', null);
if (saved) {
  spec.value ||= saved.spec || '';
  lang.value ||= saved.lang || '';
  style.value ||= saved.style || '';
  test.value = saved.test || test.value;
  output.textContent = saved.output || '';
}

document.getElementById('generate').addEventListener('click', buildPrompt);
document.getElementById('copy').addEventListener('click', () => copyText(output.textContent || ''));
document.getElementById('pass').addEventListener('click', () => {
  if (!output.textContent.trim()) buildPrompt();
  window.location.href = '../../tools/code-reviewer/index.html';
});
