(function (global) {
  function asNumber(value, fallback = 0) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  }

  function baseMetrics(parsed, mode, secondary) {
    const base = asNumber(parsed.base, 50);
    const consistency = asNumber(parsed.consistency, 60);
    const quality = asNumber(parsed.quality, 55);
    const depth = asNumber(parsed.depth, 50);
    const peer = asNumber(parsed.peer, 45);
    const modifier = mode === 'accelerated' ? 1.15 : mode === 'resilient' ? 1.05 : 1;
    return { base, consistency, quality, depth, peer, modifier, secondary: asNumber(secondary, 0) };
  }

  function template(name, metrics, extras) {
    return {
      engine: name,
      roots: Math.round((metrics.base + metrics.consistency) * metrics.modifier / 2),
      trunk: Math.round((metrics.depth + metrics.quality) * metrics.modifier / 2),
      fruits: Math.round((metrics.quality + metrics.peer + metrics.secondary) * metrics.modifier / 2),
      seeds: Math.round((metrics.depth + metrics.peer) * metrics.modifier / 2),
      water: metrics.consistency,
      ...extras
    };
  }

  const models = {
    player_signup: (m,p,s) => template('player-signup', m, { archetype: p.archetype || 'steady-grower', starterOrchard: p.orchard || 'orchard-alpha' }),
    orchard_profile_builder: (m,p,s) => template('orchard-profile-builder', m, { summary: 'Recruiter-readable orchard shell prepared.', sections: ['roots','trunk','branches','leaves','fruits','seeds'] }),
    starter_farm_generator: (m,p,s) => template('starter-farm-generator', m, { treeSlots: 3 + Math.floor(m.base/40), minerals: 10 + Math.floor(m.depth/20), soil: 50 + Math.floor(m.consistency/4) }),
    root_strength_calculator: (m,p,s) => template('root-strength-calculator', m, { fundamentalsScore: Math.round((m.base*0.6 + m.consistency*0.4) * m.modifier) }),
    trunk_growth_calculator: (m,p,s) => template('trunk-growth-calculator', m, { depthResilience: Math.round((m.depth*0.7 + m.consistency*0.3) * m.modifier) }),
    fruit_yield_engine: (m,p,s) => template('fruit-yield-engine', m, { artifactCount: asNumber(p.artifacts,2), fruitYield: Math.round((asNumber(p.artifacts,2)*m.quality)/20) }),
    daily_quest_generator: (m,p,s) => template('daily-quest-generator', m, { quests: ['water roots (fundamentals)','strengthen trunk (deep work)','ship one fruit (output)'] }),
    weekly_harvest_engine: (m,p,s) => template('weekly-harvest-engine', m, { harvestScore: Math.round((m.consistency*0.35 + m.quality*0.35 + m.depth*0.3) * m.modifier) }),
    thirty_day_promotion_engine: (m,p,s) => template('thirty-day-promotion-engine', m, { promotionEligible: (m.consistency>=65 && m.quality>=60), reviewWindowDays: 30 }),
    fair_ranking_engine: (m,p,s) => template('fair-ranking-engine', m, { rankScore: Math.round(m.consistency*0.28 + m.quality*0.30 + m.depth*0.2 + m.peer*0.12 + (asNumber(p.improvement,50)*0.10)), antiVolumeBias: true }),
    seed_exchange: (m,p,s) => template('seed-exchange', m, { seedTopic: p.topic || 'reusable workflow', shareValue: Math.round((m.depth + m.peer)/2) }),
    fruit_sharing: (m,p,s) => template('fruit-sharing', m, { fruitType: p.type || 'project-output', usefulness: Math.round((m.quality + m.peer)/2) }),
    circle_builder: (m,p,s) => template('circle-builder', m, { circleSizeSuggested: Math.max(3, Math.round(m.peer/20)), trustFloor: 55 }),
    peer_validation_engine: (m,p,s) => template('peer-validation-engine', m, { validations: asNumber(p.validations, 4), usefulnessSignal: Math.round((m.peer + m.quality)/2) }),
    trust_score_engine: (m,p,s) => template('trust-score-engine', m, { trustScore: Math.round(m.peer*0.4 + m.consistency*0.35 + m.quality*0.25) }),
    recruiter_dashboard: (m,p,s) => template('recruiter-dashboard', m, { readOptimized: true, shortlistSignal: Math.round((m.quality + m.depth + m.peer)/3) }),
    orchard_discovery_search: (m,p,s) => template('orchard-discovery-search', m, { query: p.query || 'roots:strong AND fruits:recent', matchSignal: Math.round((m.depth + m.quality)/2) }),
    hire_readiness_scorer: (m,p,s) => template('hire-readiness-scorer', m, { readinessScore: Math.round(m.consistency*0.25 + m.quality*0.3 + m.depth*0.25 + m.peer*0.2) }),
    four_direction_pipeline: (m,p,s) => template('four-direction-pipeline', m, { pipeline: { playerState: p.playerState || 'baseline', environmentState: p.environmentState || 'neutral-soil', resourceState: p.resourceState || 'moderate-water', growthTarget: p.growthTarget || 'improve-fruit-quality' } }),
    growth_path_recommender: (m,p,s) => template('growth-path-recommender', m, { nextStep: m.consistency < 60 ? 'increase water cycle consistency' : m.quality < 60 ? 'ship one higher-quality fruit artifact' : 'share seeds in peer circle' }),
    ai_coach_console: (m,p,s) => template('ai-coach-console', m, { advisoryOnly: true, coachingNarrative: 'Strengthen roots daily, deepen trunk blocks, then ship fruits and share seeds.' }),
    simulation_runner: (m,p,s) => template('simulation-runner', m, { archetypes: ['sprinter','steady-grower','deep-specialist'], projectionDays: asNumber(p.days, 30) }),
    meta_health_dashboard: (m,p,s) => template('meta-health-dashboard', m, { fairnessIndex: Math.round((m.consistency + m.peer + m.quality)/3), abuseRisk: Math.max(0, 100 - Math.round((m.peer + m.consistency)/2)) })
  };

  global.EngineModels = { baseMetrics, ...models };
})(window);
