/* balance-dashboard/tool.js */
(function () {
  'use strict';

  const SU = SimulationUtils;
  const EB = EngineBalance;

  const countInput    = document.getElementById('playerCount');
  const durationInput = document.getElementById('duration');
  const seedInput     = document.getElementById('seed');
  const verdictEl     = document.getElementById('verdict');
  const issuesEl      = document.getElementById('issues');
  const chartsEl      = document.getElementById('charts');
  const detailEl      = document.getElementById('detail');
  const jsonOutput    = document.getElementById('jsonOutput');
  const statusEl      = document.getElementById('status');

  const COLORS = {
    'slow-learner':            '#94a3b8',
    'fast-learner':            '#86efac',
    'spammer':                 '#fca5a5',
    'consistent-player':       '#7dd3fc',
    'lazy-player':             '#a1a1aa',
    'high-potential-irregular': '#c4b5fd'
  };

  let lastReport = null;

  function analyze() {
    const count    = Math.max(2, Math.min(500, parseInt(countInput.value, 10) || 30));
    const duration = parseInt(durationInput.value, 10) || 30;
    const seed     = parseInt(seedInput.value, 10) || Date.now();
    seedInput.value = seed;

    statusEl.textContent = 'Running simulation + balance analysis…';
    statusEl.style.color = 'var(--warn)';

    setTimeout(() => {
      try {
        const players = SU.generateBatch(count, null, seed);
        const sim     = SU.runSimulation(players, duration, seed);
        const report  = EB.analyzeBalance(sim);
        lastReport = report;

        renderVerdict(report);
        renderIssues(report);
        renderCharts(report);
        renderDetail(report);
        jsonOutput.textContent = JSON.stringify(report, null, 2);

        statusEl.textContent = 'Analysis complete — ' + count + ' players × ' + duration + ' days';
        statusEl.style.color = 'var(--accent-2)';
      } catch (err) {
        statusEl.textContent = 'Error: ' + err.message;
        statusEl.style.color = '#f87171';
      }
    }, 30);
  }

  /* ── Verdict ── */
  function renderVerdict(report) {
    const colors = { 'BALANCED': '#4ade80', 'MINOR ISSUES': '#fbbf24', 'REBALANCE NEEDED': '#f87171' };
    verdictEl.innerHTML =
      '<span style="font-size:1.6rem;font-weight:800;color:' + (colors[report.verdict] || '#e5e7eb') + ';">' + report.verdict + '</span>' +
      '<span style="font-size:0.82rem;color:var(--muted);margin-left:12px;">' + report.playerCount + ' players · ' + report.durationDays + ' days</span>';
  }

  /* ── Issues ── */
  function renderIssues(report) {
    if (!report.issues.length) {
      issuesEl.innerHTML = '<li class="good">✓ No balance issues detected.</li>';
      return;
    }
    issuesEl.textContent = '';
    for (const issue of report.issues) {
      const li = document.createElement('li');
      li.className = 'warn';
      li.textContent = '⚠ ' + issue;
      issuesEl.appendChild(li);
    }
  }

  /* ── Bar Charts (pure CSS) ── */
  function renderCharts(report) {
    const ad = report.archetypeDetail;
    const archetypes = Object.keys(ad);

    let html = '';

    // Helper: horizontal bar chart
    function barChart(title, getter, unit) {
      const values = archetypes.map(a => getter(ad[a]));
      const max = Math.max(1, ...values);
      let out = '<div class="chart-block"><div class="chart-title">' + title + '</div>';
      for (let i = 0; i < archetypes.length; i++) {
        const a = archetypes[i];
        const pct = (values[i] / max * 100).toFixed(1);
        const label = shortName(a);
        out += '<div class="bar-row">' +
          '<span class="bar-label">' + label + '</span>' +
          '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%;background:' + COLORS[a] + ';"></div></div>' +
          '<span class="bar-val">' + values[i] + (unit || '') + '</span>' +
          '</div>';
      }
      out += '</div>';
      return out;
    }

    html += barChart('Average Root Strength (fundamentals)', d => d.avgRoots);
    html += barChart('Average Trunk Growth (depth)', d => d.avgTrunk);
    html += barChart('Average Fruit Output', d => d.avgFruits);
    html += barChart('Average Rank Score', d => d.avgRankScore);
    html += barChart('Promotion Rate', d => d.promotionRate, '%');
    html += barChart('Average Spam Days', d => d.avgSpam);

    // Spam advantage ratio
    html += '<div class="chart-block"><div class="chart-title">Spam Advantage Ratio</div>' +
      '<div class="metric-big">' +
      (report.spamAdvantageRatio !== null ? report.spamAdvantageRatio.toFixed(2) : 'N/A') +
      '</div>' +
      '<div class="metric-note">' + (report.spamAdvantageRatio !== null
        ? (report.spamAdvantageRatio < 0.7 ? 'Spam well suppressed ✓' : report.spamAdvantageRatio < 0.85 ? 'Acceptable range' : 'Spam advantage too high ⚠')
        : 'No data') +
      '</div></div>';

    // Quality vs Volume
    const qv = report.qualityVsVolume;
    html += '<div class="chart-block"><div class="chart-title">Quality vs Volume</div>' +
      '<div style="display:flex;gap:20px;">' +
      '<div><div class="metric-label">High Quality Players</div><div class="metric-num">' + qv.highQualityCount + '</div><div class="metric-sub">Avg rank: ' + qv.highQualityAvgRank + '</div></div>' +
      '<div><div class="metric-label">High Volume (Low Quality)</div><div class="metric-num">' + qv.highVolumeCount + '</div><div class="metric-sub">Avg rank: ' + qv.highVolumeAvgRank + '</div></div>' +
      '</div>' +
      '<div class="metric-note">' + (qv.qualityWins === true ? 'Quality wins ✓' : qv.qualityWins === false ? 'Volume wins ⚠' : 'Insufficient data') + '</div>' +
      '</div>';

    // Domination risk
    html += '<div class="chart-block"><div class="chart-title">Archetype Domination Risk</div>' +
      '<div class="metric-big">' + (report.dominantArchetype || 'None') + '</div>' +
      '<div class="metric-note">' + (report.dominantArchetype ? 'Holds >50% of top quartile ⚠' : 'No single archetype dominates ✓') + '</div></div>';

    // Weekly score distribution
    const wd = report.weeklyDist;
    html += '<div class="chart-block"><div class="chart-title">Weekly Score Distribution</div>' +
      '<div style="display:flex;gap:16px;flex-wrap:wrap;">' +
      stat('Mean', wd.mean) + stat('Median', wd.median) + stat('Std Dev', wd.stddev) + stat('Min', wd.min) + stat('Max', wd.max) +
      '</div></div>';

    // Fruit distribution
    const fd = report.fruitDist;
    html += '<div class="chart-block"><div class="chart-title">Fruit Output Distribution</div>' +
      '<div style="display:flex;gap:16px;flex-wrap:wrap;">' +
      stat('Mean', fd.mean) + stat('Median', fd.median) + stat('Std Dev', fd.stddev) + stat('Min', fd.min) + stat('Max', fd.max) +
      '</div></div>';

    chartsEl.innerHTML = html;
  }

  function stat(label, val) {
    return '<div><div class="metric-label">' + label + '</div><div class="metric-num">' + val + '</div></div>';
  }

  function shortName(archetype) {
    return archetype.replace('high-potential-', 'hi-pot ').replace('-player', '').replace('-learner', ' lrn');
  }

  /* ── Detail Table ── */
  function renderDetail(report) {
    const ad = report.archetypeDetail;
    let html = '<tr><th>Archetype</th><th>N</th><th>Roots</th><th>Trunk</th><th>Fruits</th><th>Score</th><th>Median</th><th>Promo %</th><th>Streak</th><th>Spam</th></tr>';
    for (const [a, d] of Object.entries(ad)) {
      html += '<tr>' +
        '<td><span class="arch-tag arch-' + a + '">' + a + '</span></td>' +
        '<td class="num">' + d.count + '</td>' +
        '<td class="num">' + d.avgRoots + '</td>' +
        '<td class="num">' + d.avgTrunk + '</td>' +
        '<td class="num">' + d.avgFruits + '</td>' +
        '<td class="num">' + d.avgRankScore + '</td>' +
        '<td class="num">' + d.medianScore + '</td>' +
        '<td class="num">' + d.promotionRate + '%</td>' +
        '<td class="num">' + d.avgStreak + '</td>' +
        '<td class="num">' + d.avgSpam + '</td>' +
        '</tr>';
    }
    detailEl.innerHTML = html;
  }

  // Events
  document.getElementById('run').addEventListener('click', analyze);
  document.getElementById('randomSeed').addEventListener('click', () => {
    seedInput.value = Math.floor(Math.random() * 999999);
  });
  document.getElementById('copy').addEventListener('click', () => navigator.clipboard.writeText(jsonOutput.textContent || ''));
  document.getElementById('download').addEventListener('click', () => {
    const blob = new Blob([jsonOutput.textContent || ''], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'balance-report.json';
    a.click();
  });

  // Auto-run
  analyze();
})();
