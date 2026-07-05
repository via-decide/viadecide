(function (global) {
  'use strict';

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderLayout({ mount, title = 'decide.engine tools', navItems = [] }) {
    if (!mount) return null;

    mount.innerHTML = `
      <div class="platform-layout">
        <header class="platform-header">
          <h1>${escapeHtml(title)}</h1>
          <p>Connected tool platform powered by the shared registry.</p>
        </header>
        <nav class="platform-nav" id="platform-nav" aria-label="Tool navigation">
          ${navItems.map((item) => `<button class="nav-item" type="button" data-tool-id="${escapeHtml(item.id)}">${escapeHtml(item.name)}</button>`).join('')}
        </nav>
        <main class="platform-main">
          <aside class="platform-sidebar">
            <label>
              Search tools
              <input id="tool-search" type="search" placeholder="Search by name or tag" />
            </label>
            <label>
              Category
              <select id="tool-category-filter">
                <option value="all">All categories</option>
              </select>
            </label>
            <div id="tool-list" class="tool-list"></div>
          </aside>
          <section class="platform-tool-container">
            <div id="tool-state" class="tool-state">Select a tool to load it in this container.</div>
            <iframe id="tool-frame" class="tool-frame" title="Active tool" loading="lazy"></iframe>
          </section>
        </main>
        <footer class="platform-footer">Vanilla JS · Dynamic routing · Registry-first architecture</footer>
      </div>
    `;

    return {
      nav: mount.querySelector('#platform-nav'),
      search: mount.querySelector('#tool-search'),
      category: mount.querySelector('#tool-category-filter'),
      list: mount.querySelector('#tool-list'),
      frame: mount.querySelector('#tool-frame'),
      state: mount.querySelector('#tool-state')
    };
  }

  global.PlatformLayout = { renderLayout };
})(window);
