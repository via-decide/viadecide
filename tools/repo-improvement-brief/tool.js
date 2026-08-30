const ideaInput = document.getElementById('idea');
const repoInput = document.getElementById('repo');
const impactInput = document.getElementById('impact');
const output = document.getElementById('output');

function buildBrief(idea, repo, impact) {
  return [
    '# Repository Improvement Brief',
    '',
    '## 1) Context',
    `- Repository: ${repo || '(missing repository)'}`,
    `- Improvement Theme: ${idea || '(missing idea)'}`,
    '',
    '## 2) Objective',
    'Deliver additive improvements without breaking existing behavior or routing.',
    '',
    '## 3) Proposed Changes',
    '- Add/modify focused files tied directly to the idea.',
    '- Preserve all existing tools and standalone runtime behavior.',
    '- Update registry, navigation, and documentation only where needed.',
    '',
    '## 4) Expected Impact',
    impact || '(impact not provided)',
    '',
    '## 5) Constraints & Risks',
    '- Avoid destructive refactors.',
    '- Validate every changed path and config linkage.',
    '- Keep outputs deterministic enough for downstream automation.',
    '',
    '## 6) Implementation Checklist',
    '- [ ] Audit current structure',
    '- [ ] Implement additive changes',
    '- [ ] Validate routing and discovery',
    '- [ ] Update README/registry references',
    '- [ ] Package final summary for review',
    '',
    '## 7) Acceptance Criteria',
    '- Existing tools continue working.',
    '- New/updated functionality is directly usable.',
    '- Documentation reflects operational intent.'
  ].join('\n');
}

function generate() {
  const payload = {
    idea: ideaInput.value.trim(),
    repo: repoInput.value.trim(),
    impact: impactInput.value.trim()
  };

  output.textContent = buildBrief(payload.idea, payload.repo, payload.impact);
  ToolStorage.write('repo-improvement-brief.draft', { ...payload, output: output.textContent });
}

document.getElementById('generate').addEventListener('click', generate);
document.getElementById('copy').addEventListener('click', () => navigator.clipboard.writeText(output.textContent));
document.getElementById('download').addEventListener('click', () => {
  const blob = new Blob([output.textContent], { type: 'text/markdown' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'repo-improvement-brief-output.md';
  link.click();
});

const saved = ToolStorage.read('repo-improvement-brief.draft', null);
if (saved) {
  ideaInput.value = saved.idea || '';
  repoInput.value = saved.repo || '';
  impactInput.value = saved.impact || '';
  output.textContent = saved.output || '';
}
