import { emit, read, buildPipelineStatus } from '../../shared/tool-bus.js';

const source = document.getElementById('source');
const feature = document.getElementById('feature');
const criteria = document.getElementById('criteria');
const edge = document.getElementById('edge');
const output = document.getElementById('output');
const banner = document.getElementById('banner');

const steps = ['context-packager', 'spec-builder', 'code-generator', 'code-reviewer'];

document.getElementById('pipeline').innerHTML = buildPipelineStatus(steps, 'spec-builder');

const incoming = read('agent:context-packager:output');
if (incoming?.data?.packet) {
  source.value = incoming.data.packet;
  feature.value = incoming.data.project || feature.value;
  banner.textContent = '📥 Context loaded from context-packager';
}
emit('agent:pipeline:active', { toolId: 'spec-builder', steps });

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

function criteriaLines(value) {
  return value.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => `- [ ] ${line}`).join('\n') || '- [ ] Define acceptance criteria';
}

function buildSpec() {
  const body = [
    `## SPEC — ${feature.value.trim() || 'Untitled Feature'}`,
    '### Objective',
    source.value.trim() || 'No objective provided.',
    '### Files to create',
    '- List target files explicitly before implementation.',
    '### Files to modify (with exact function/section names)',
    '- Reference exact modules/functions to edit.',
    '### Interfaces (function signatures, API shapes)',
    '- Document expected signatures and payload contracts.',
    '### Acceptance criteria (checkboxes)',
    criteriaLines(criteria.value),
    '### Edge cases',
    edge.value.trim() || '- None listed',
    '### Do NOT touch',
    '- Unrelated tools, routing foundations, and shared contracts.',
    '### Example input → output',
    '- Input: request payload/context packet',
    '- Output: deterministic implementation result'
  ].join('\n');

  output.textContent = body;
  ToolStorage.write('spec-builder.draft', {
    source: source.value,
    feature: feature.value,
    criteria: criteria.value,
    edge: edge.value,
    output: body
  });
  emit('agent:spec-builder:output', { spec: body, feature: feature.value.trim() });
}

const saved = ToolStorage.read('spec-builder.draft', null);
if (saved) {
  source.value ||= saved.source || '';
  feature.value ||= saved.feature || '';
  criteria.value ||= saved.criteria || '';
  edge.value ||= saved.edge || '';
  output.textContent = saved.output || '';
}

document.getElementById('build').addEventListener('click', buildSpec);
document.getElementById('copy').addEventListener('click', () => copyText(output.textContent || ''));
document.getElementById('pass').addEventListener('click', () => {
  if (!output.textContent.trim()) buildSpec();
  window.location.href = '../../tools/code-generator/index.html';
});
