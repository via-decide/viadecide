import { emit, read, buildPipelineStatus } from '../../shared/tool-bus.js';

const spec = document.getElementById('spec');
const code = document.getElementById('code');
const mode = document.getElementById('mode');
const output = document.getElementById('output');
const nextButton = document.getElementById('next');

const steps = ['context-packager', 'spec-builder', 'code-generator', 'code-reviewer'];
document.getElementById('pipeline').innerHTML = buildPipelineStatus(steps, 'code-reviewer');

const incoming = read('agent:spec-builder:output');
if (incoming?.data?.spec) spec.value = incoming.data.spec;
emit('agent:pipeline:active', { toolId: 'code-reviewer', steps });

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

function extractCriteria(specText) {
  return specText.split('\n').filter((line) => line.trim().startsWith('- [ ]')).map((line) => line.replace('- [ ]', '').trim());
}

function unclosedBrackets(text) {
  const opens = (text.match(/[\[{(]/g) || []).length;
  const closes = (text.match(/[\]})]/g) || []).length;
  return opens !== closes;
}

function runReview() {
  const source = code.value;
  const issues = [];
  if (!source.trim()) {
    output.textContent = 'Please paste generated code before reviewing.';
    return;
  }

  if (/TODO|FIXME|placeholder/i.test(source)) issues.push({ sev: 'CRITICAL', message: 'Contains TODO/FIXME/placeholder markers.' });
  if (/console\.log\(/.test(source)) issues.push({ sev: 'WARNING', message: 'Contains console.log statements.' });
  if (/\bvar\b/.test(source)) issues.push({ sev: 'WARNING', message: 'Uses var; prefer let/const.' });
  if (/[^=!]==[^=]/.test(source)) issues.push({ sev: 'WARNING', message: 'Uses == instead of ===.' });
  if (unclosedBrackets(source)) issues.push({ sev: 'CRITICAL', message: 'Likely unclosed bracket/brace/parenthesis.' });

  const criteria = extractCriteria(spec.value);
  criteria.forEach((item) => {
    const keyword = item.split(/\s+/).slice(0, 4).join(' ').toLowerCase();
    if (!source.toLowerCase().includes(keyword) && mode.value === 'Deep') {
      issues.push({ sev: 'WARNING', message: `Acceptance criteria may be missing: ${item}` });
    }
  });

  let report;
  if (issues.length) {
    const list = issues.map((issue) => `- [${issue.sev}] ${issue.message}`).join('\n');
    report = [
      '## REPAIR REQUEST',
      '### Original spec summary',
      spec.value.trim().slice(0, 500) || 'No spec summary available.',
      '### Issues found',
      list,
      '### Repair instructions for Codex',
      'Return ONLY the corrected code. No explanation.',
      'Preserve everything not mentioned in issues.'
    ].join('\n');
    nextButton.textContent = '→ Re-run through Code Generator';
  } else {
    report = [
      '## ✅ CODE REVIEW PASSED',
      `Spec: ${(read('agent:spec-builder:output')?.data?.feature || 'Feature')}`,
      `Checks: ${5 + criteria.length} passed`,
      '→ Ready for output-evaluator'
    ].join('\n');
    nextButton.textContent = '→ Send to Output Evaluator';
  }

  output.textContent = report;
  ToolStorage.write('code-reviewer.draft', { spec: spec.value, code: code.value, mode: mode.value, output: report });
  emit('agent:code-reviewer:feedback', { report, issues, passed: issues.length === 0 });
}

const saved = ToolStorage.read('code-reviewer.draft', null);
if (saved) {
  spec.value ||= saved.spec || '';
  code.value = saved.code || '';
  mode.value = saved.mode || 'Quick';
  output.textContent = saved.output || '';
  nextButton.textContent = saved.output?.includes('PASSED') ? '→ Send to Output Evaluator' : '→ Re-run through Code Generator';
} else {
  nextButton.textContent = '→ Re-run through Code Generator';
}

document.getElementById('review').addEventListener('click', runReview);
document.getElementById('copy').addEventListener('click', () => copyText(output.textContent || ''));
nextButton.addEventListener('click', () => {
  const target = output.textContent.includes('PASSED') ? '../../tools/output-evaluator/index.html' : '../../tools/code-generator/index.html';
  window.location.href = target;
});
