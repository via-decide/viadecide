const inputA = document.getElementById('inputA');
const inputB = document.getElementById('inputB');
const inputC = document.getElementById('inputC');
const output = document.getElementById('output');
const STORE_KEY = 'engine.orchard-profile-builder.draft';

function runEngine() {
  const primary = inputA.value.trim();
  const secondary = inputB.value.trim();
  const mode = inputC.value;
  const parsed = EngineUtils.tryParse(primary);
  const metrics = EngineModels.baseMetrics(parsed, mode, secondary);
  const result = EngineModels.orchard_profile_builder(metrics, parsed, secondary);

  output.textContent = JSON.stringify({
    tool: 'orchard-profile-builder',
    purpose: 'build orchard profile sections',
    mode,
    metrics,
    result,
    generatedAt: new Date().toISOString()
  }, null, 2);

  ToolStorage.write(STORE_KEY, { primary, secondary, mode, output: output.textContent });
}

document.getElementById('run').addEventListener('click', runEngine);
document.getElementById('copy').addEventListener('click', () => navigator.clipboard.writeText(output.textContent || ''));
document.getElementById('download').addEventListener('click', () => {
  const blob = new Blob([output.textContent || ''], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'orchard-profile-builder-output.json';
  a.click();
});

const saved = ToolStorage.read(STORE_KEY, null);
if (saved) {
  inputA.value = saved.primary || '';
  inputB.value = saved.secondary || '';
  inputC.value = saved.mode || 'steady';
  output.textContent = saved.output || '';
}
