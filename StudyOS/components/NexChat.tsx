(function (global) {
  function mountNexChat(root) {
    if (!root) return;
    root.innerHTML = `
      <div class="text-sm text-[var(--muted)]">Research Chat</div>
      <div class="text-xs">Ask follow-up questions to Nex based on current query context.</div>
    `;
  }

  global.NexChat = { mount: mountNexChat };
})(window);
