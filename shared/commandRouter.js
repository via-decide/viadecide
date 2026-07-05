(function (global) {
  'use strict';

  const VIA_LOGIC_PATH = 'tools/games/vialogic/index.html';
  const commandAliases = {

    vialogic: VIA_LOGIC_PATH,
    mathmap: VIA_LOGIC_PATH,
    cartography: VIA_LOGIC_PATH,
    minds: VIA_LOGIC_PATH,
    'promptalchemy': 'tools/promptalchemy/index.html',
    'script-generator': 'tools/script-generator/index.html',
    'spec-builder': 'tools/spec-builder/index.html',
    'code-generator': 'tools/code-generator/index.html',
    'code-reviewer': 'tools/code-reviewer/index.html',
    'tool-router': 'tools/tool-router/index.html',
    'export-studio': 'tools/export-studio/index.html',
    'template-vault': 'tools/template-vault/index.html',
    'idea-remixer': 'tools/idea-remixer/index.html',
    'task-splitter': 'tools/task-splitter/index.html',
    'prompt-compare': 'tools/prompt-compare/index.html',
    'repo-improvement-brief': 'tools/repo-improvement-brief/index.html',
    'workflow-template-gallery': 'tools/workflow-template-gallery/index.html',
    'tool-search-discovery': 'tools/tool-search-discovery/index.html',
    'context-packager': 'tools/context-packager/index.html',
    'output-evaluator': 'tools/output-evaluator/index.html',
    'player-signup': 'tools/engine/player-signup/index.html',
    'orchard-profile-builder': 'tools/engine/orchard-profile-builder/index.html',
    'starter-farm-generator': 'tools/engine/starter-farm-generator/index.html',
    'root-strength-calculator': 'tools/engine/root-strength-calculator/index.html',
    'trunk-growth-calculator': 'tools/engine/trunk-growth-calculator/index.html',
    'fruit-yield-engine': 'tools/engine/fruit-yield-engine/index.html',
    'daily-quest-generator': 'tools/engine/daily-quest-generator/index.html',
    'weekly-harvest-engine': 'tools/engine/weekly-harvest-engine/index.html',
    'thirty-day-promotion-engine': 'tools/engine/thirty-day-promotion-engine/index.html',
    'fair-ranking-engine': 'tools/engine/fair-ranking-engine/index.html',
    'seed-exchange': 'tools/engine/seed-exchange/index.html',
    'fruit-sharing': 'tools/engine/fruit-sharing/index.html',
    'circle-builder': 'tools/engine/circle-builder/index.html',
    'peer-validation-engine': 'tools/engine/peer-validation-engine/index.html',
    'trust-score-engine': 'tools/engine/trust-score-engine/index.html',
    'recruiter-dashboard': 'tools/engine/recruiter-dashboard/index.html',
    'orchard-discovery-search': 'tools/engine/orchard-discovery-search/index.html',
    'hire-readiness-scorer': 'tools/engine/hire-readiness-scorer/index.html',
    'four-direction-pipeline': 'tools/engine/four-direction-pipeline/index.html',
    'growth-path-recommender': 'tools/engine/growth-path-recommender/index.html',
    'ai-coach-console': 'tools/engine/ai-coach-console/index.html',
    'simulation-runner': 'tools/engine/simulation-runner/index.html',
    'seed-quality-scorer': 'tools/engine/seed-quality-scorer/index.html',
    'meta-health-dashboard': 'tools/engine/meta-health-dashboard/index.html',
    'synthetic-player-generator': 'tools/engine/synthetic-player-generator/index.html',
    'wave1-simulation-runner': 'tools/engine/wave1-simulation-runner/index.html',
    'balance-dashboard': 'tools/engine/balance-dashboard/index.html',
    'growth-milestone-engine': 'tools/engine/growth-milestone-engine/index.html',
    'hex-wars': 'tools/games/hex-wars/index.html',
    'wings-of-fire-quiz': 'tools/games/wings-of-fire-quiz/index.html',
    'script-generator-files': 'tools/engine/script-generator-files/index.html',
    'layer1-swipe-crucible': 'tools/engine/layer1-swipe-crucible/index.html'
  };

  function resolveCommandRoute(command) {
    const normalized = String(command || '').trim().toLowerCase();
    return commandAliases[normalized] || null;
  }

  global.CommandRouter = global.CommandRouter || {};
  global.CommandRouter.aliases = {
    ...(global.CommandRouter.aliases || {}),
    ...commandAliases
  };
  global.CommandRouter.resolve = resolveCommandRoute;
})(window);
