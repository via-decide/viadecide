/**
 * siege-binder.js
 * Controller mapping realtime firebase HP state to visual CSS properties.
 * Targets `.siege-health-fill`, `--hp-percent`, `.siege-health-track`, and `.taking-damage`.
 */

function updateSiegeHealth(currentHp, maxHp) {
  const hpPercent = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  
  const fillElement = document.querySelector('.siege-health-fill');
  const trackElement = document.querySelector('.siege-health-track');

  // Push CSS Custom Property delta for native transition interpolation
  if (fillElement) {
    fillElement.style.setProperty('--hp-percent', `${hpPercent}%`);
  }

  // Trigger recoil animation class for 200ms
  if (trackElement) {
    trackElement.classList.add('taking-damage');
    setTimeout(() => {
      trackElement.classList.remove('taking-damage');
    }, 200);
  }
}

window.updateSiegeHealth = updateSiegeHealth;
