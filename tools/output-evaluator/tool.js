import { emit, read, clear } from '../../shared/tool-bus.js';

const dimensions = [
  ['Spec coverage', 'specCoverage'],
  ['Constraint respect', 'constraintRespect'],
  ['Completeness', 'completeness'],
  ['Pattern alignment', 'patternAlignment'],
  ['Edge case handling', 'edgeCaseHandling']
];
const channels = [
  'agent:context-packager:output',
  'agent:spec-builder:output',
  'agent:code-generator:output',
  'agent:code-reviewer:feedback',
  'agent:output-evaluator:result',
  'agent:pipeline:active'
];

const rows = document.getElementById('scoreRows');
const output = document.getElementById('output');
const code = document.getElementById('code');

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

function scoreAuto(text, specText, contextText, reviewText) {
  const hasTodo = /TODO|FIXME|placeholder/i.test(text);
  const criteriaCount = (specText.match(/- \[ \]/g) || []).length;
  const criteriaHits = specText.split('\n').filter((line) => line.includes('- [ ]')).filter((line) => text.toLowerCase().includes(line.replace('- [ ]', '').trim().split(' ').slice(0, 3).join(' ').toLowerCase())).length;
  return {
    specCoverage: Math.max(0, Math.min(10, criteriaCount ? Math.round((criteriaHits / criteriaCount) * 10) : 6)),
    constraintRespect: contextText ? 7 : 5,
    completeness: hasTodo ? 2 : 8,
    patternAlignment: /class\s+|function\s+/.test(text) ? 7 : 6,
    edgeCaseHandling: /edge|fallback|default|error/i.test(text + specText + reviewText) ? 8 : 5
  };
}

function renderRows(scores) {
  rows.innerHTML = dimensions.map(([label, key]) => `
    <div class="row">
      <label>${label}</label>
      <input data-key="${key}" type="range" min="0" max="10" value="${scores[key]}" />
      <span id="${key}Val">${scores[key]}</span>
    </div>
  `).join('');
}

function getScores() {
  return dimensions.reduce((acc, [, key]) => {
    const value = Number(rows.querySelector(`[data-key="${key}"]`)?.value || 0);
    acc[key] = value;
    return acc;
  }, {});
}

function buildReport(scores, featureName) {
  const total = Object.values(scores).reduce((sum, value) => sum + value, 0);
  const verdict = total >= 40 ? 'SHIP IT' : total >= 28 ? 'NEEDS REVISION' : 'REJECT';
  const warnings = [];
  if (scores.completeness < 6) warnings.push('Completeness below threshold.');
  if (scores.specCoverage < 6) warnings.push('Spec coverage is weak.');

  return [
    `## DELIVERY REPORT — ${featureName || 'Feature'}`,
    `Score: ${total}/50`,
    '',
    '### Passed ✅',
    ...dimensions.filter(([, key]) => scores[key] >= 7).map(([label, key]) => `- ${label}: ${scores[key]}/10`),
    '### Warnings ⚠',
    ...(warnings.length ? warnings.map((w) => `- ${w}`) : ['- None']),
    '### Failed ❌',
    ...dimensions.filter(([, key]) => scores[key] <= 4).map(([label, key]) => `- ${label}: ${scores[key]}/10`),
    `### Verdict: ${verdict}`
  ].join('\n');
}

const context = read('agent:context-packager:output')?.data?.packet || '';
const spec = read('agent:spec-builder:output')?.data?.spec || '';
const review = read('agent:code-reviewer:feedback')?.data?.report || '';
const initial = scoreAuto(code.value, spec, context, review);
renderRows(initial);

rows.addEventListener('input', (event) => {
  const key = event.target.dataset.key;
  if (!key) return;
  const val = event.target.value;
  document.getElementById(`${key}Val`).textContent = val;
});

document.getElementById('evaluate').addEventListener('click', () => {
  const scores = getScores();
  const featureName = read('agent:spec-builder:output')?.data?.feature || '';
  const report = buildReport(scores, featureName);
  output.textContent = report;
  emit('agent:output-evaluator:result', { report, scores, featureName });
});

document.getElementById('copy').addEventListener('click', () => copyText(output.textContent || ''));
document.getElementById('clear').addEventListener('click', () => {
  channels.forEach((channel) => clear(channel));
  output.textContent = 'Pipeline cleared.';
});
document.getElementById('start').addEventListener('click', () => {
  window.location.href = '../../tools/context-packager/index.html';
});
