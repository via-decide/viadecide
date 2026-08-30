const templateInput = document.getElementById('template');
const goalInput = document.getElementById('goal');
const teamInput = document.getElementById('team');
const output = document.getElementById('output');

const templates = {
  'repo-upgrade': [
    'tool-search-discovery',
    'repo-improvement-brief',
    'task-splitter',
    'context-packager',
    'output-evaluator'
  ],
  'prompt-quality': [
    'idea-remixer',
    'prompt-compare',
    'promptalchemy',
    'output-evaluator'
  ],
  'release-readiness': [
    'spec-builder',
    'code-reviewer',
    'task-splitter',
    'export-studio'
  ],
  'research-to-implementation': [
    'multi-source-research-explained',
    'repo-improvement-brief',
    'task-splitter',
    'workflow-template-gallery'
  ]
};

function renderSequence() {
  const selectedTemplate = templateInput.value;
  const sequence = templates[selectedTemplate] || [];
  const lines = sequence.map((toolId, index) => `${index + 1}. ${toolId}`);

  output.textContent = [
    '# Workflow Template Launch Brief',
    '',
    `## Template`,
    selectedTemplate,
    '',
    '## Goal',
    goalInput.value.trim() || '(missing goal)',
    '',
    '## Team Context',
    teamInput.value.trim() || '(missing context)',
    '',
    '## Sequence',
    ...lines,
    '',
    '## Launch Notes',
    '- Run each tool in order and carry forward outputs.',
    '- Preserve intermediate artifacts for auditing.',
    '- End with an evaluator/reporting step.'
  ].join('\n');

  ToolStorage.write('workflow-template-gallery.draft', {
    template: selectedTemplate,
    goal: goalInput.value,
    team: teamInput.value,
    output: output.textContent
  });
}

document.getElementById('generate').addEventListener('click', renderSequence);
document.getElementById('copy').addEventListener('click', () => navigator.clipboard.writeText(output.textContent));
document.getElementById('download').addEventListener('click', () => {
  const blob = new Blob([output.textContent], { type: 'text/markdown' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'workflow-template-gallery-output.md';
  link.click();
});

const saved = ToolStorage.read('workflow-template-gallery.draft', null);
if (saved) {
  templateInput.value = saved.template || templateInput.value;
  goalInput.value = saved.goal || '';
  teamInput.value = saved.team || '';
  output.textContent = saved.output || '';
}
