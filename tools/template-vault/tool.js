const nameEl = document.getElementById('name');
const bodyEl = document.getElementById('body');
const templatesEl = document.getElementById('templates');
const outputEl = document.getElementById('output');

function loadTemplates() {
  return ToolStorage.read('template-vault.items', []);
}

function saveTemplates(items) {
  ToolStorage.write('template-vault.items', items);
}

function refreshList() {
  const items = loadTemplates();
  templatesEl.innerHTML = '';
  items.forEach((item, idx) => {
    const option = document.createElement('option');
    option.value = String(idx);
    option.textContent = item.name;
    templatesEl.appendChild(option);
  });
}

function saveTemplate() {
  const name = nameEl.value.trim();
  const body = bodyEl.value.trim();
  if (!name || !body) return;

  const items = loadTemplates();
  items.push({ name, body, createdAt: new Date().toISOString() });
  saveTemplates(items);
  refreshList();
  templatesEl.value = String(items.length - 1);
  outputEl.textContent = body;
  nameEl.value = '';
  bodyEl.value = '';
}

function getSelected() {
  const idx = Number(templatesEl.value);
  const items = loadTemplates();
  return Number.isInteger(idx) ? items[idx] : null;
}

templatesEl.addEventListener('change', () => {
  const item = getSelected();
  outputEl.textContent = item ? item.body : '';
});

document.getElementById('save').addEventListener('click', saveTemplate);
document.getElementById('copy').addEventListener('click', () => {
  const item = getSelected();
  navigator.clipboard.writeText(item ? item.body : '');
});
document.getElementById('download').addEventListener('click', () => {
  const item = getSelected();
  if (!item) return;
  const blob = new Blob([item.body], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;
  link.click();
});

refreshList();
