const content = document.getElementById('content');
const format = document.getElementById('format');
const output = document.getElementById('output');

function toFormat(text, fmt) {
  if (fmt === 'md') return `# Export\n\n${text}`;
  if (fmt === 'json') return JSON.stringify({ exportedAt: new Date().toISOString(), content: text }, null, 2);
  return text;
}

function prepare() {
  const text = content.value.trim();
  output.textContent = toFormat(text, format.value);
  ToolStorage.write('export-studio.draft', {
    content: text,
    format: format.value,
    output: output.textContent
  });
}

document.getElementById('prepare').addEventListener('click', prepare);
document.getElementById('copy').addEventListener('click', () => navigator.clipboard.writeText(output.textContent));
document.getElementById('download').addEventListener('click', () => {
  const ext = format.value;
  const mime = ext === 'json' ? 'application/json' : 'text/plain';
  const blob = new Blob([output.textContent], { type: mime });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `export-studio-output.${ext}`;
  link.click();
});

const saved = ToolStorage.read('export-studio.draft', null);
if (saved) {
  content.value = saved.content || '';
  format.value = saved.format || 'txt';
  output.textContent = saved.output || '';
}
