/* wave1-simulation-runner/tool.js */
(function () {
  'use strict';

  const SU = SimulationUtils;

  const countInput    = document.getElementById('playerCount');
  const durationInput = document.getElementById('duration');
  const seedInput     = document.getElementById('seed');
  const statusEl      = document.getElementById('status');
  const leaderboardEl = document.getElementById('leaderboard');
  const summaryEl     = document.getElementById('summary');
  const fairnessEl    = document.getElementById('fairness');
  const exploitEl     = document.getElementById('exploits');
  const jsonOutput    = document.getElementById('jsonOutput');

  let lastSimulation = null;

  function run() {
    const count    = Math.max(2, Math.min(500, parseInt(countInput.value, 10) || 24));
    const duration = parseInt(durationInput.value, 10) || 30;
    const seed     = parseInt(seedInput.value, 10) || Date.now();
    seedInput.value = seed;

    statusEl.textContent = 'Running simulation: ' + count + ' players × ' + duration + ' days…';
    statusEl.style.color = 'var(--warn)';

    // Allow UI to repaint before heavy compute
    setTimeout(() => {
      try {
        // Check localStorage for pre-generated players
        let players = null;
        try {
          const stored = localStorage.getItem('wave1.syntheticPlayers');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) players = parsed.slice(0, count);
          }
        } catch(e){ console.warn("VIA Cockpit: Handled silent error", e); }

        if (!players || players.length < count) {
          players = SU.generateBatch(count, null, seed);
        }

        const sim = SU.runSimulation(players, duration, seed);
        lastSimulation = sim;

        renderLeaderboard(sim.leaderboard);
        renderArchetypeSummary(sim.archetypeSummary);
        renderFairness(sim.fairnessNotes);
        renderExploits(sim.exploitIndicators);
        jsonOutput.textContent = JSON.stringify(sim, null, 2);

        statusEl.textContent = 'Simulation complete — ' + count + ' players × ' + duration + ' days (seed ' + seed + ')';
        statusEl.style.color = 'var(--accent-2)';

        try { localStorage.setItem('wave1.lastSimulation', JSON.stringify(sim)); } catch(e){ console.warn("VIA Cockpit: Handled silent error", e); }
      } catch (err) {
        statusEl.textContent = 'Error: ' + err.message;
        statusEl.style.color = '#f87171';
      }
    }, 30);
  }

  function renderLeaderboard(board) {
    let html = '<tr><th>#</th><th>ID</th><th>Name</th><th>Archetype</th><th>Score</th></tr>';
    for (const entry of board.slice(0, 50)) {
      html += '<tr>' +
        '<td>' + entry.rank + '</td>' +
        '<td>' + entry.id + '</td>' +
        '<td>' + entry.name + '</td>' +
        '<td><span class="arch-tag arch-' + entry.archetype + '">' + entry.archetype + '</span></td>' +
        '<td class="num">' + entry.score + '</td>' +
        '</tr>';
    }
    leaderboardEl.innerHTML = html;
  }

  function renderArchetypeSummary(summary) {
    let html = '<tr><th>Archetype</th><th>Count</th><th>Avg Roots</th><th>Avg Trunk</th><th>Avg Fruits</th><th>Avg Score</th><th>Promo %</th></tr>';
    for (const [a, s] of Object.entries(summary)) {
      html += '<tr>' +
        '<td><span class="arch-tag arch-' + a + '">' + a + '</span></td>' +
        '<td class="num">' + s.count + '</td>' +
        '<td class="num">' + s.avgRoots + '</td>' +
        '<td class="num">' + s.avgTrunk + '</td>' +
        '<td class="num">' + s.avgFruits + '</td>' +
        '<td class="num">' + s.avgRankScore + '</td>' +
        '<td class="num">' + s.promotionRate + '%</td>' +
        '</tr>';
    }
    summaryEl.innerHTML = html;
  }

  function renderFairness(notes) {
    if (!notes.length) { fairnessEl.innerHTML = '<li class="good">No issues detected.</li>'; return; }
    fairnessEl.innerHTML = notes.map(n => {
      const cls = n.startsWith('WARNING') ? 'warn' : n.startsWith('NOTE') ? 'note' : 'good';
      return '<li class="' + cls + '">' + n + '</li>';
    }).join('');
  }

  function renderExploits(indicators) {
    if (!indicators.length) { exploitEl.innerHTML = '<li class="good">No exploit indicators.</li>'; return; }
    exploitEl.innerHTML = indicators.map(i =>
      '<li class="warn">' + i.player + ': ' + i.flag + '</li>'
    ).join('');
  }

  // Event handlers
  document.getElementById('run').addEventListener('click', run);
  document.getElementById('randomSeed').addEventListener('click', () => {
    seedInput.value = Math.floor(Math.random() * 999999);
  });
  document.getElementById('copy').addEventListener('click', () => navigator.clipboard.writeText(jsonOutput.textContent || ''));
  document.getElementById('download').addEventListener('click', () => {
    const blob = new Blob([jsonOutput.textContent || ''], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'wave1-simulation-' + (durationInput.value || 30) + 'd.json';
    a.click();
  });

  // Auto-run on load with defaults
  run();
})();
