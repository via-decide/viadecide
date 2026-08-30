const ideaInput = document.getElementById('idea');
const goalInput = document.getElementById('goal');
const constraintsInput = document.getElementById('constraints');
const output = document.getElementById('output');

function linesFrom(text) {
  return text
    .split(/[\n,]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function buildVariants(idea, goal, constraints) {
  const keyPhrases = linesFrom(idea);
  const base = keyPhrases[0] || idea || 'Untitled idea';

  const angleShifts = [
    `Speed-first: reduce setup friction and deliver a first result in under 5 minutes for \"${base}\".`,
    `Quality-first: focus on stronger review gates and confidence checks around \"${base}\".`,
    `Automation-first: maximize repeatability and handoff readiness for \"${base}\".`,
    `Learning-first: design \"${base}\" as a guided workflow users improve over time.`
  ];

  const audienceVariants = [
    `For maintainers: \"${base}\" with clear ownership boundaries and regression-safe defaults.`,
    `For contributors: \"${base}\" with lightweight onboarding and starter templates.`,
    `For product operators: \"${base}\" with clear KPI hooks and status reporting.`,
    `For AI-agent pipelines: \"${base}\" with structured outputs and deterministic formatting.`
  ];

  const namingVariants = [
    `${base} Sprint`,
    `${base} Studio`,
    `${base} Planner`,
    `${base} Mesh`,
    `${base} Flow`
  ];

  const positioningVariants = [
    `\"${base}\" as a reliability layer that improves quality before execution.`,
    `\"${base}\" as an acceleration layer that converts ideas into ready-to-run tasks.`,
    `\"${base}\" as a collaboration layer that standardizes team handoffs.`,
    `\"${base}\" as an experimentation layer for rapid variant testing.`
  ];

  return [
    '# Idea Remix Pack',
    '',
    `## Core Idea`,
    idea || '(missing idea)',
    '',
    '## Primary Goal',
    goal || '(missing goal)',
    '',
    '## Constraints',
    constraints || '(none provided)',
    '',
    '## Angle Shifts',
    ...angleShifts.map((item) => `- ${item}`),
    '',
    '## Audience Variants',
    ...audienceVariants.map((item) => `- ${item}`),
    '',
    '## Naming Variants',
    ...namingVariants.map((item) => `- ${item}`),
    '',
    '## Positioning Variants',
    ...positioningVariants.map((item) => `- ${item}`)
  ].join('\n');
}

function generate() {
  const payload = {
    idea: ideaInput.value.trim(),
    goal: goalInput.value.trim(),
    constraints: constraintsInput.value.trim()
  };

  output.textContent = buildVariants(payload.idea, payload.goal, payload.constraints);
  ToolStorage.write('idea-remixer.draft', { ...payload, output: output.textContent });
}

document.getElementById('generate').addEventListener('click', generate);
document.getElementById('copy').addEventListener('click', () => navigator.clipboard.writeText(output.textContent));
document.getElementById('download').addEventListener('click', () => {
  const blob = new Blob([output.textContent], { type: 'text/markdown' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'idea-remixer-output.md';
  link.click();
});

const saved = ToolStorage.read('idea-remixer.draft', null);
if (saved) {
  ideaInput.value = saved.idea || '';
  goalInput.value = saved.goal || '';
  constraintsInput.value = saved.constraints || '';
  output.textContent = saved.output || '';
}
