(() => {
  const getHomeHref = () => {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const repoSegment = parts[0] === 'decide.engine-tools' ? `/${parts[0]}/` : '/';
    return repoSegment;
  };

  const addNav = () => {
    if (document.querySelector('[data-vd-nav-fix="true"]')) return;

    const bar = document.createElement('a');
    bar.href = getHomeHref();
    bar.dataset.vdNavFix = 'true';
    bar.textContent = '← Back to ViaDecide';
    bar.setAttribute('aria-label', 'Back to ViaDecide home');
    bar.style.cssText = [
      'position:fixed',
      'top:calc(10px + env(safe-area-inset-top))',
      'left:calc(10px + env(safe-area-inset-left))',
      'z-index:99999',
      'padding:8px 12px',
      'border-radius:999px',
      'border:1px solid rgba(255,255,255,.24)',
      'background:rgba(10,14,22,.82)',
      'color:#e5e7eb',
      'font:600 12px/1.1 Inter,system-ui,sans-serif',
      'text-decoration:none',
      'backdrop-filter:blur(8px)',
      '-webkit-backdrop-filter:blur(8px)',
      '-webkit-tap-highlight-color:transparent'
    ].join(';');

    bar.addEventListener('mouseenter', () => {
      bar.style.borderColor = 'rgba(34,197,94,.7)';
    });
    bar.addEventListener('mouseleave', () => {
      bar.style.borderColor = 'rgba(255,255,255,.24)';
    });

    document.body.appendChild(bar);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addNav, { once: true });
  } else {
    addNav();
  }
})();
