/**
 * engine-balance.js — Orchard Engine Wave 1 Balance Analysis Helpers
 * Additive shared module. Does not modify any existing shared file.
 */
(function (global) {
  'use strict';

  const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const median = arr => {
    if (!arr.length) return 0;
    const s = arr.slice().sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  };
  const stddev = arr => {
    if (arr.length < 2) return 0;
    const m = avg(arr);
    return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
  };

  /**
   * Compute balance metrics from a simulation output.
   * @param {Object} sim — output of SimulationUtils.runSimulation()
   * @returns {Object} balance report
   */
  function analyzeBalance(sim) {
    const archetypes = Object.keys(sim.archetypeSummary);
    const allScores = sim.results.map(r => r.rankScore);
    const allFruits = sim.results.map(r => r.totalFruits);

    // Per-archetype detail
    const archetypeDetail = {};
    for (const a of archetypes) {
      const players = sim.results.filter(r => r.player.archetype === a);
      archetypeDetail[a] = {
        count: players.length,
        avgRoots:     round(avg(players.map(p => p.roots))),
        avgTrunk:     round(avg(players.map(p => p.trunk))),
        avgFruits:    round(avg(players.map(p => p.totalFruits))),
        avgRankScore: round(avg(players.map(p => p.rankScore))),
        medianScore:  round(median(players.map(p => p.rankScore))),
        promotionRate: players.length
          ? round(players.filter(p => p.promotion && p.promotion.eligible).length / players.length * 100)
          : 0,
        avgStreak:    round(avg(players.map(p => p.maxStreak))),
        avgSpam:      round(avg(players.map(p => p.spamTotal)))
      };
    }

    // Spam advantage ratio
    const spamAvg = archetypeDetail['spammer'] ? archetypeDetail['spammer'].avgRankScore : 0;
    const consistentAvg = archetypeDetail['consistent-player'] ? archetypeDetail['consistent-player'].avgRankScore : 1;
    const spamAdvantageRatio = consistentAvg > 0 ? round(spamAvg / consistentAvg) : null;

    // Quality vs volume balance
    const highQualityPlayers = sim.results.filter(r => r.avgQuality > 55);
    const highVolumePlayers  = sim.results.filter(r => r.consistency > 0.8 && r.avgQuality <= 35);
    const qualityVsVolume = {
      highQualityCount: highQualityPlayers.length,
      highQualityAvgRank: round(avg(highQualityPlayers.map(p => p.rankScore))),
      highVolumeCount: highVolumePlayers.length,
      highVolumeAvgRank: round(avg(highVolumePlayers.map(p => p.rankScore))),
      qualityWins: highQualityPlayers.length > 0 && highVolumePlayers.length > 0
        ? avg(highQualityPlayers.map(p => p.rankScore)) > avg(highVolumePlayers.map(p => p.rankScore))
        : null
    };

    // Archetype domination risk: does any single archetype hold >50% of top 25%?
    const topQuartile = sim.leaderboard.slice(0, Math.max(1, Math.ceil(sim.leaderboard.length * 0.25)));
    const topCounts = {};
    for (const t of topQuartile) {
      topCounts[t.archetype] = (topCounts[t.archetype] || 0) + 1;
    }
    let dominantArchetype = null;
    for (const [a, c] of Object.entries(topCounts)) {
      if (c / topQuartile.length > 0.5) dominantArchetype = a;
    }

    // Weekly score distribution stats
    const allWeeklyFlat = sim.results.flatMap(r => r.weeklyScores);
    const weeklyDist = {
      mean: round(avg(allWeeklyFlat)),
      median: round(median(allWeeklyFlat)),
      stddev: round(stddev(allWeeklyFlat)),
      min: allWeeklyFlat.length ? round(Math.min(...allWeeklyFlat)) : 0,
      max: allWeeklyFlat.length ? round(Math.max(...allWeeklyFlat)) : 0
    };

    // Overall fairness verdict
    const issues = [];
    if (spamAdvantageRatio !== null && spamAdvantageRatio > 0.85) issues.push('Spam advantage ratio too close to or exceeds consistent player scores');
    if (dominantArchetype) issues.push('Archetype domination: ' + dominantArchetype + ' holds >50% of top quartile');
    const irregularStats = archetypeDetail['high-potential-irregular'];
    if (irregularStats && irregularStats.promotionRate < 15) issues.push('High-potential irregular players rarely promoted — may need irregular-reward path');
    const lazyStats = archetypeDetail['lazy-player'];
    if (lazyStats && lazyStats.promotionRate > 10) issues.push('Lazy players promoted too easily — tighten thresholds');

    const verdict = issues.length === 0 ? 'BALANCED' : issues.length <= 2 ? 'MINOR ISSUES' : 'REBALANCE NEEDED';

    return {
      playerCount: sim.playerCount,
      durationDays: sim.durationDays,
      archetypeDetail,
      spamAdvantageRatio,
      qualityVsVolume,
      dominantArchetype,
      weeklyDist,
      fruitDist: {
        mean: round(avg(allFruits)),
        median: round(median(allFruits)),
        stddev: round(stddev(allFruits)),
        min: allFruits.length ? Math.min(...allFruits) : 0,
        max: allFruits.length ? Math.max(...allFruits) : 0
      },
      scoreDist: {
        mean: round(avg(allScores)),
        median: round(median(allScores)),
        stddev: round(stddev(allScores))
      },
      issues,
      verdict,
      generatedAt: sim.generatedAt
    };
  }

  function round(v) { return Math.round(v * 100) / 100; }

  global.EngineBalance = { analyzeBalance, avg, median, stddev };
})(window);
