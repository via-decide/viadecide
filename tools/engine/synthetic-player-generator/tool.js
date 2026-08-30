/* synthetic-player-generator/tool.js */
(function () {
  'use strict';

  const countInput = document.getElementById('playerCount');
  const seedInput  = document.getElementById('seed');
  const output     = document.getElementById('output');
  const tableBody  = document.getElementById('playerTable');
  const countLabel = document.getElementById('totalLabel');
  const archSliders = {};

  SimulationUtils.ARCHETYPE_NAMES.forEach(a => {
    archSliders[a] = document.getElementById('mix-' + a);
  });

  function readMix() {
    const mix = {};
    let total = 0;
    for (const [a, el] of Object.entries(archSliders)) {
      const v = parseInt(el.value, 10) || 0;
      if (v > 0) { mix[a] = v; total += v; }
    }
    return { mix: total > 0 ? mix : null, total };
  }

  function generate() {
    const count = Math.max(1, Math.min(500, parseInt(countInput.value, 10) || 24));
    const seed  = parseInt(seedInput.value, 10) || Date.now();
    seedInput.value = seed;
    const { mix } = readMix();

    const players = SimulationUtils.generateBatch(count, mix, seed);
    renderTable(players);
    output.textContent = JSON.stringify(players, null, 2);

    // Store for other tools to pick up
    try { localStorage.setItem('wave1.syntheticPlayers', JSON.stringify(players)); } catch(e){ console.warn("VIA Cockpit: Handled silent error", e); }
  }

  function renderTable(players) {
    tableBody.innerHTML = '';
    countLabel.textContent = players.length + ' players generated';
    for (const p of players) {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + p.id + '</td>' +
        '<td>' + p.displayName + '</td>' +
        '<td><span class="arch-tag arch-' + p.archetype + '">' + p.archetype + '</span></td>' +
        '<td>' + pct(p.consistency) + '</td>' +
        '<td>' + pct(p.qualityBias) + '</td>' +
        '<td>' + pct(p.completionRate) + '</td>' +
        '<td>' + pct(p.spamRisk) + '</td>' +
        '<td>' + pct(p.integrity) + '</td>';
      tableBody.appendChild(tr);
    }
  }

  function pct(v) { return (v * 100).toFixed(0) + '%'; }

  // Slider labels
  document.querySelectorAll('.arch-slider').forEach(el => {
    const label = el.parentElement.querySelector('.slider-val');
    el.addEventListener('input', () => { if (label) label.textContent = el.value; });
  });

  document.getElementById('generate').addEventListener('click', generate);
  document.getElementById('copy').addEventListener('click', () => navigator.clipboard.writeText(output.textContent || ''));
  document.getElementById('download').addEventListener('click', () => {
    const blob = new Blob([output.textContent || ''], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'synthetic-players.json';
    a.click();
  });
  document.getElementById('randomSeed').addEventListener('click', () => {
    seedInput.value = Math.floor(Math.random() * 999999);
  });

  // Auto-generate on load
  generate();
})();
