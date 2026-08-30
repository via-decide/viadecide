import { emit, read, buildPipelineStatus } from '../../shared/tool-bus.js';

const steps = ['context-packager', 'spec-builder', 'code-generator', 'code-reviewer'];
const ids = ['project', 'stack', 'existing', 'task', 'constraints'];
const output = document.getElementById('output');
const pipeline = document.getElementById('pipeline');

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

function buildPacket(data) {
  return [
    `## CONTEXT PACKET — ${data.project || 'Untitled Project'}`,
    '### Stack',
    data.stack || '- Not provided',
    '### Existing Architecture',
    data.existing || '- Not provided',
    '### Task',
    data.task || '- Not provided',
    '### Constraints',
    data.constraints || '- None provided',
    '### Relevant Patterns',
    '- Preserve existing naming and folder layout.',
    '- Extend current modules instead of rewriting.',
    '### Suggested Approach',
    '1. Map touched files and boundaries.',
    '2. Implement additive change in small slices.',
    '3. Validate acceptance criteria and edge cases.'
  ].join('\n');
}

function collect() {
  const data = {};
  ids.forEach((id) => {
    data[id] = document.getElementById(id).value.trim();
  });
  return data;
}

function packageContext() {
  const data = collect();
  const packet = buildPacket(data);
  output.textContent = packet;
  ToolStorage.write('context-packager.draft', data);
  emit('agent:context-packager:output', { packet, ...data });
  emit('agent:pipeline:active', { toolId: 'context-packager', steps });
}

const seeded = read('agent:context-packager:output');
if (seeded?.data?.taskFromSplitter) {
  document.getElementById('project').value = seeded.data.taskFromSplitter.feature || '';
  document.getElementById('task').value = seeded.data.taskFromSplitter.label || '';
  document.getElementById('existing').value = seeded.data.taskFromSplitter.input || '';
}

const saved = ToolStorage.read('context-packager.draft', null);
if (saved) ids.forEach((id) => { document.getElementById(id).value ||= saved[id] || ''; });

pipeline.innerHTML = buildPipelineStatus(steps, 'context-packager');
emit('agent:pipeline:active', { toolId: 'context-packager', steps });

document.getElementById('package').addEventListener('click', packageContext);
document.getElementById('copy').addEventListener('click', () => copyText(output.textContent || ''));
document.getElementById('pass').addEventListener('click', () => {
  if (!output.textContent.trim()) packageContext();
  window.location.href = '../../tools/spec-builder/index.html';
});
