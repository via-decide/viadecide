import { emit } from '../../shared/tool-bus.js';

const PIPELINE_KEY = 'agent:task-splitter:tasks';
const elEpic = document.getElementById('epic');
const elCards = document.getElementById('cards');
const elProgress = document.getElementById('progress');

function buildTasks(epic) {
  const title = epic.split(/\n|\./).find(Boolean)?.trim() || 'Feature';
  const base = [
    { name: 'Scope and contracts', dependsOn: 'none', complexity: 'low' },
    { name: 'Core implementation', dependsOn: 'Task 1', complexity: 'medium' },
    { name: 'Validation and QA', dependsOn: 'Task 2', complexity: 'medium' },
    { name: 'Polish and handoff', dependsOn: 'Task 3', complexity: 'low' }
  ];
  return base.map((task, index) => ({
    id: `task-${index + 1}`,
    label: `Task ${index + 1} — ${task.name}`,
    feature: title,
    input: index === 0 ? epic : `Output from Task ${index}`,
    output: `Deliverable for ${task.name.toLowerCase()}`,
    dependsOn: task.dependsOn,
    complexity: task.complexity,
    promptSeed: `Implement ${task.name.toLowerCase()} for ${title}.\nFollow existing patterns only.\nReturn complete code with no placeholders.`,
    status: 'TODO'
  }));
}

function copy(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const temp = document.createElement('textarea');
  temp.value = text;
  document.body.appendChild(temp);
  temp.select();
  document.execCommand('copy');
  temp.remove();
  return Promise.resolve();
}

function save(tasks) {
  ToolStorage.write(PIPELINE_KEY, tasks);
  emit('agent:task-splitter:output', { tasks, epic: elEpic.value.trim() });
  emit('agent:pipeline:active', { toolId: 'task-splitter' });
}

function render(tasks) {
  const done = tasks.filter((task) => task.status === 'DONE').length;
  elProgress.textContent = `${done}/${tasks.length} tasks done`;
  elCards.innerHTML = tasks.map((task) => `
    <article class="card" data-id="${task.id}">
      <h3>${task.label}</h3>
      <p><span class="badge">Depends on: ${task.dependsOn}</span> <span class="badge">${task.complexity}</span></p>
      <p class="small">Input: ${task.input}</p>
      <p class="small">Output: ${task.output}</p>
      <pre class="output" style="min-height:80px;">${task.promptSeed}</pre>
      <div class="toolbar">
        <select data-role="status">
          <option ${task.status === 'TODO' ? 'selected' : ''}>TODO</option>
          <option ${task.status === 'IN PROGRESS' ? 'selected' : ''}>IN PROGRESS</option>
          <option ${task.status === 'DONE' ? 'selected' : ''}>DONE</option>
        </select>
        <button data-role="send" class="primary">→ Spec Builder</button>
      </div>
    </article>
  `).join('');
}

let tasks = ToolStorage.read(PIPELINE_KEY, []);
if (tasks.length) render(tasks);

document.getElementById('split').addEventListener('click', () => {
  const epic = elEpic.value.trim();
  if (!epic) return;
  tasks = buildTasks(epic);
  save(tasks);
  render(tasks);
});

elCards.addEventListener('change', (event) => {
  if (event.target.dataset.role !== 'status') return;
  const card = event.target.closest('[data-id]');
  const task = tasks.find((item) => item.id === card.dataset.id);
  if (!task) return;
  task.status = event.target.value;
  save(tasks);
  render(tasks);
});

elCards.addEventListener('click', (event) => {
  if (event.target.dataset.role !== 'send') return;
  const card = event.target.closest('[data-id]');
  const task = tasks.find((item) => item.id === card.dataset.id);
  if (!task) return;
  emit('agent:context-packager:output', { taskFromSplitter: task, source: 'task-splitter' });
  emit('agent:pipeline:active', { toolId: 'context-packager' });
  window.location.href = '../../tools/spec-builder/index.html';
});

document.getElementById('start').addEventListener('click', async () => {
  const first = tasks[0];
  if (!first) return;
  await copy(first.promptSeed);
  emit('agent:context-packager:output', { taskFromSplitter: first, source: 'task-splitter' });
  emit('agent:pipeline:active', { toolId: 'context-packager' });
  window.location.href = '../../tools/context-packager/index.html';
});
