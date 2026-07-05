(function (global) {
  const NOTES_KEY = 'studyos_research_note_v2';

  function saveNote(content) {
    localStorage.setItem(NOTES_KEY, content);
    return content;
  }

  function downloadNote(content) {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `StudyOS-notes-${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 0);
  }

  function mountNotesEditor(root) {
    if (!root) return;
    root.innerHTML = `
      <textarea id="research-notes-text" class="os-input" style="min-height:220px" placeholder="# Research notes\n\n- Capture findings\n- Add citations"></textarea>
      <div class="mt-3 flex gap-2 flex-wrap">
        <button id="copy-summary-to-notes" class="os-btn-ghost">Copy Research Output</button>
        <button id="save-research-notes" class="os-btn">Save Notes</button>
        <button id="download-research-notes" class="os-btn-ghost">Download .md</button>
      </div>
      <p class="text-xs text-[var(--muted)] mt-2">Autosave enabled every 30 seconds (local browser storage).</p>
    `;

    const textarea = root.querySelector('#research-notes-text');
    const saveButton = root.querySelector('#save-research-notes');
    const downloadButton = root.querySelector('#download-research-notes');
    textarea.value = localStorage.getItem(NOTES_KEY) || '';

    saveButton.addEventListener('click', () => saveNote(textarea.value));
    downloadButton.addEventListener('click', () => downloadNote(textarea.value));

    if (!root.dataset.autosaveBound) {
      root.dataset.autosaveBound = 'true';
      setInterval(() => {
        const value = root.querySelector('#research-notes-text')?.value || '';
        saveNote(value);
      }, 30000);
    }
  }

  global.NotesEditor = { mount: mountNotesEditor, saveNote };
})(window);
