/**
 * simulation-utils.js — Orchard Engine Wave 1 Simulation Helpers
 * Additive shared module. Does not modify any existing shared file.
 */
(function (global) {
  'use strict';

  /* ── Seeded PRNG (mulberry32) ── */
  function createRng(seed) {
    let s = seed | 0;
    return function () {
      s |= 0; s = s + 0x6D2B79F5 | 0;
      let t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* ── Archetype Definitions ── */
  const ARCHETYPES = {
    'slow-learner':              { consistency: 0.55, qualityBias: 0.40, completionRate: 0.50, researchDepth: 0.35, spamRisk: 0.10, improvementTrend: 0.30, integrity: 0.80 },
    'fast-learner':              { consistency: 0.70, qualityBias: 0.70, completionRate: 0.80, researchDepth: 0.65, spamRisk: 0.15, improvementTrend: 0.85, integrity: 0.75 },
    'spammer':                   { consistency: 0.85, qualityBias: 0.15, completionRate: 0.95, researchDepth: 0.10, spamRisk: 0.90, improvementTrend: 0.05, integrity: 0.20 },
    'consistent-player':         { consistency: 0.90, qualityBias: 0.65, completionRate: 0.85, researchDepth: 0.55, spamRisk: 0.05, improvementTrend: 0.40, integrity: 0.90 },
    'lazy-player':               { consistency: 0.20, qualityBias: 0.50, completionRate: 0.25, researchDepth: 0.30, spamRisk: 0.05, improvementTrend: 0.10, integrity: 0.70 },
    'high-potential-irregular':   { consistency: 0.35, qualityBias: 0.85, completionRate: 0.40, researchDepth: 0.80, spamRisk: 0.05, improvementTrend: 0.60, integrity: 0.85 }
  };

  const ARCHETYPE_NAMES = Object.keys(ARCHETYPES);

  /* ── Display Names ── */
  const FIRST = ['Kai','Noor','Priya','Luca','Ren','Suki','Javi','Aisha','Dara','Obi','Hana','Zayn','Mila','Tao','Elle'];
  const LAST  = ['Oak','Fern','Brook','Moss','Vine','Stone','Root','Leaf','Birch','Sage','Thorn','Vale','Glen','Reed','Shore'];

  function pickName(rng) {
    return FIRST[Math.floor(rng() * FIRST.length)] + ' ' + LAST[Math.floor(rng() * LAST.length)];
  }

  /* ── Generate Synthetic Player ── */
  function generatePlayer(id, archetype, rng) {
    const base = ARCHETYPES[archetype];
    if (!base) throw new Error('Unknown archetype: ' + archetype);
    const jitter = () => (rng() - 0.5) * 0.12; // ±6% variance
    const clamp01 = v => Math.max(0, Math.min(1, v));

    return {
      id: 'p-' + String(id).padStart(4, '0'),
      displayName: pickName(rng),
      archetype,
      consistency:      clamp01(base.consistency + jitter()),
      qualityBias:      clamp01(base.qualityBias + jitter()),
      completionRate:   clamp01(base.completionRate + jitter()),
      researchDepth:    clamp01(base.researchDepth + jitter()),
      spamRisk:         clamp01(base.spamRisk + jitter()),
      improvementTrend: clamp01(base.improvementTrend + jitter()),
      integrity:        clamp01(base.integrity + jitter())
    };
  }

  /* ── Generate Player Batch ── */
  function generateBatch(count, archetypeMix, seed) {
    const rng = createRng(seed);
    const players = [];
    // archetypeMix: { 'fast-learner': 3, 'spammer': 2, ... }
    // If null/undefined, distribute evenly
    let queue = [];
    if (archetypeMix && typeof archetypeMix === 'object') {
      for (const [arch, n] of Object.entries(archetypeMix)) {
        for (let i = 0; i < n; i++) queue.push(arch);
      }
      // Fill remainder with random archetypes
      while (queue.length < count) {
        queue.push(ARCHETYPE_NAMES[Math.floor(rng() * ARCHETYPE_NAMES.length)]);
      }
    } else {
      for (let i = 0; i < count; i++) {
        queue.push(ARCHETYPE_NAMES[i % ARCHETYPE_NAMES.length]);
      }
    }
    // Shuffle
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    for (let i = 0; i < count; i++) {
      players.push(generatePlayer(i + 1, queue[i], rng));
    }
    return players;
  }

  /* ── Day Simulation Step ── */
  function simulateDay(player, dayIndex, rng) {
    const didComplete = rng() < player.completionRate;
    const isSpam = didComplete && rng() < player.spamRisk;
    const improvementBoost = player.improvementTrend * 0.002 * dayIndex; // slow compound

    // Quality of today's work (0-100 scale internally)
    let quality = 0;
    if (didComplete) {
      quality = isSpam
        ? 5 + rng() * 15                                         // spam: 5-20
        : Math.min(100, (player.qualityBias * 70 + rng() * 30 + improvementBoost * 10));
    }

    // Research depth contribution today
    const researchToday = didComplete ? player.researchDepth * (40 + rng() * 20) : 0;

    // Root growth (fundamentals): consistency-weighted
    const rootDelta = didComplete
      ? (player.consistency * 1.2 + researchToday * 0.01) * (isSpam ? 0.2 : 1)
      : -0.3;

    // Trunk growth (depth): quality × research weighted
    const trunkDelta = didComplete
      ? (quality * 0.02 + researchToday * 0.015) * (isSpam ? 0.1 : 1)
      : -0.15;

    // Fruit generation: only if quality above threshold and completed
    const fruitGenerated = (didComplete && quality > 30 && !isSpam) ? 1 : 0;

    return {
      day: dayIndex + 1,
      completed: didComplete,
      isSpam,
      quality: Math.round(quality * 10) / 10,
      researchToday: Math.round(researchToday * 10) / 10,
      rootDelta:  Math.round(rootDelta * 100) / 100,
      trunkDelta: Math.round(trunkDelta * 100) / 100,
      fruitGenerated
    };
  }

  /* ── Weekly Harvest Score ── */
  function weeklyHarvest(weekDays) {
    const completions = weekDays.filter(d => d.completed).length;
    const avgQuality = weekDays.reduce((s, d) => s + d.quality, 0) / Math.max(1, weekDays.length);
    const fruits = weekDays.reduce((s, d) => s + d.fruitGenerated, 0);
    const spamDays = weekDays.filter(d => d.isSpam).length;

    const consistencyScore = (completions / 7) * 35;
    const qualityScore = (avgQuality / 100) * 35;
    const fruitScore = Math.min(fruits * 10, 30); // cap at 30
    const spamPenalty = spamDays * 8;

    return {
      completions,
      avgQuality: Math.round(avgQuality * 10) / 10,
      fruits,
      spamDays,
      score: Math.round(Math.max(0, consistencyScore + qualityScore + fruitScore - spamPenalty) * 10) / 10
    };
  }

  /* ── 30-Day Promotion Check ── */
  function promotionCheck(playerState) {
    const { roots, trunk, totalFruits, weeklyScores, spamTotal, consistency } = playerState;
    const avgWeekly = weeklyScores.length > 0
      ? weeklyScores.reduce((a, b) => a + b, 0) / weeklyScores.length : 0;

    const eligible =
      roots >= 18 &&
      trunk >= 10 &&
      totalFruits >= 6 &&
      avgWeekly >= 40 &&
      spamTotal <= 3 &&
      consistency >= 0.5;

    return {
      eligible,
      roots: Math.round(roots * 10) / 10,
      trunk: Math.round(trunk * 10) / 10,
      totalFruits,
      avgWeeklyScore: Math.round(avgWeekly * 10) / 10,
      spamTotal,
      reasons: eligible ? ['All thresholds met'] : [
        roots < 18 ? 'Roots below 18' : null,
        trunk < 10 ? 'Trunk below 10' : null,
        totalFruits < 6 ? 'Fewer than 6 fruits' : null,
        avgWeekly < 40 ? 'Avg weekly score below 40' : null,
        spamTotal > 3 ? 'Too many spam days (>3)' : null,
        consistency < 0.5 ? 'Consistency below 50%' : null
      ].filter(Boolean)
    };
  }

  /* ── Fair Ranking Score ── */
  function fairRankScore(playerState) {
    const { roots, trunk, totalFruits, avgQuality, consistency, spamTotal, improvementTrend } = playerState;
    return Math.round((
      roots * 0.20 +
      trunk * 0.20 +
      totalFruits * 1.5 +
      avgQuality * 0.25 +
      consistency * 15 +
      improvementTrend * 8 -
      spamTotal * 4
    ) * 10) / 10;
  }

  /* ── Full Player Simulation ── */
  function simulatePlayer(player, durationDays, rng) {
    let roots = 5, trunk = 2, totalFruits = 0, spamTotal = 0;
    const dailyLog = [];
    const weeklyScores = [];
    let totalQuality = 0, completedDays = 0;

    for (let d = 0; d < durationDays; d++) {
      const dayResult = simulateDay(player, d, rng);
      roots = Math.max(0, roots + dayResult.rootDelta);
      trunk = Math.max(0, trunk + dayResult.trunkDelta);
      totalFruits += dayResult.fruitGenerated;
      if (dayResult.isSpam) spamTotal++;
      if (dayResult.completed) { totalQuality += dayResult.quality; completedDays++; }
      dailyLog.push(dayResult);

      // Weekly harvest every 7 days
      if ((d + 1) % 7 === 0) {
        const weekDays = dailyLog.slice(d - 6, d + 1);
        const harvest = weeklyHarvest(weekDays);
        weeklyScores.push(harvest.score);
      }
    }

    const avgQuality = completedDays > 0 ? totalQuality / completedDays : 0;
    const consistency = completedDays / durationDays;

    const state = {
      roots, trunk, totalFruits, weeklyScores, spamTotal,
      consistency, avgQuality, improvementTrend: player.improvementTrend
    };

    const promotion = durationDays >= 30 ? promotionCheck(state) : null;
    const rankScore = fairRankScore(state);

    // Streak analysis
    let maxStreak = 0, currentStreak = 0;
    for (const d of dailyLog) {
      if (d.completed && !d.isSpam) { currentStreak++; maxStreak = Math.max(maxStreak, currentStreak); }
      else currentStreak = 0;
    }

    // Exploit indicators
    const exploitFlags = [];
    if (spamTotal > durationDays * 0.25) exploitFlags.push('High spam ratio');
    if (completedDays > 0 && avgQuality < 20 && completedDays / durationDays > 0.8) exploitFlags.push('Volume-over-quality pattern');
    if (totalFruits === 0 && completedDays > 14) exploitFlags.push('No fruit output despite activity');

    return {
      player: { id: player.id, displayName: player.displayName, archetype: player.archetype },
      duration: durationDays,
      roots:       Math.round(roots * 100) / 100,
      trunk:       Math.round(trunk * 100) / 100,
      totalFruits,
      avgQuality:  Math.round(avgQuality * 10) / 10,
      consistency: Math.round(consistency * 1000) / 1000,
      spamTotal,
      weeklyScores,
      maxStreak,
      exploitFlags,
      rankScore,
      promotion
    };
  }

  /* ── Run Full Simulation ── */
  function runSimulation(players, durationDays, seed) {
    const rng = createRng(seed);
    const results = players.map(p => simulatePlayer(p, durationDays, rng));

    // Sort by rankScore desc for leaderboard
    const leaderboard = results.slice().sort((a, b) => b.rankScore - a.rankScore)
      .map((r, i) => ({ rank: i + 1, id: r.player.id, name: r.player.displayName, archetype: r.player.archetype, score: r.rankScore }));

    // Fairness summary
    const byArchetype = {};
    for (const r of results) {
      const a = r.player.archetype;
      if (!byArchetype[a]) byArchetype[a] = { roots: [], trunk: [], fruits: [], scores: [], promoted: 0, count: 0 };
      byArchetype[a].roots.push(r.roots);
      byArchetype[a].trunk.push(r.trunk);
      byArchetype[a].fruits.push(r.totalFruits);
      byArchetype[a].scores.push(r.rankScore);
      if (r.promotion && r.promotion.eligible) byArchetype[a].promoted++;
      byArchetype[a].count++;
    }

    const avg = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 100) / 100 : 0;

    const archetypeSummary = {};
    for (const [a, d] of Object.entries(byArchetype)) {
      archetypeSummary[a] = {
        count: d.count,
        avgRoots: avg(d.roots),
        avgTrunk: avg(d.trunk),
        avgFruits: avg(d.fruits),
        avgRankScore: avg(d.scores),
        promotionRate: d.count > 0 ? Math.round(d.promoted / d.count * 100) : 0
      };
    }

    const spammerStats = archetypeSummary['spammer'];
    const consistentStats = archetypeSummary['consistent-player'];

    const fairnessNotes = [];
    if (spammerStats && consistentStats && spammerStats.avgRankScore > consistentStats.avgRankScore) {
      fairnessNotes.push('WARNING: Spammers outrank consistent players on average — rebalance needed.');
    }
    if (spammerStats && spammerStats.promotionRate > 30) {
      fairnessNotes.push('WARNING: Spammer promotion rate exceeds 30% — tighten spam gates.');
    }
    if (consistentStats && consistentStats.promotionRate < 50) {
      fairnessNotes.push('NOTE: Consistent player promotion rate below 50% — thresholds may be too strict.');
    }

    const allExploits = results.flatMap(r => r.exploitFlags.map(f => ({ player: r.player.id, flag: f })));
    if (allExploits.length === 0) fairnessNotes.push('No exploit indicators detected.');

    return {
      playerCount: players.length,
      durationDays,
      seed,
      results,
      leaderboard,
      archetypeSummary,
      fairnessNotes,
      exploitIndicators: allExploits,
      generatedAt: new Date().toISOString()
    };
  }

  /* ── Exports ── */
  global.SimulationUtils = {
    ARCHETYPES, ARCHETYPE_NAMES,
    createRng, generatePlayer, generateBatch,
    simulateDay, weeklyHarvest, promotionCheck, fairRankScore,
    simulatePlayer, runSimulation
  };

})(window);
