# ViaDecide 44-Asset Repair Log

Date: 2026-08-30
Target repository: `via-decide/viadecide`
Starting branch: `main`
Starting commit: `6e711f8f72c1b91ba71b7583ae310dbc048b3c8b`

## Scope

Repair exactly 44 standalone digital assets so each is available from a clean ViaDecide route such as `/promptalchemy`, while preserving the existing homepage, articles, router, modals, PWA, animations, and shared UI behavior.

The canonical list comes from `via-decide/decide.engine-tools` at source commit `f42a685f6ddebe0319c7c541b98075365076cb37`, reconciled with the 44-entry historical registry at `e5a9e6f54e6d627ea414debc6bf12e71d169efb7`.

## Repair design

- Import only the 44 canonical tool directories; do not replace ViaDecide's shared browser utilities.
- Keep each asset standalone with its existing `index.html`, `tool.js`, and `config.json`.
- Add an explicit base path per asset so relative scripts, styles, and metadata resolve from clean routes.
- Add 44 exact Vercel rewrites rather than a broad catch-all rewrite.
- Use a single `tools-manifest.json` as the route and metadata contract.
- Preserve local state and downloads; paid services or new external dependencies are not required for core use.
- Fail release validation if the manifest count, route count, required files, references, HTML structure, primary interaction, output, or refresh behavior diverges.

## Defects found and repaired

1. Production clean routes returned 404 because the tool directories and Vercel rewrites were absent.
2. Relative tool resources could resolve against the clean route rather than the physical tool directory.
3. Tool Registry fetched the manifest and metadata relative to the active tool route.
4. Seven metadata records lacked an explicit `entry` contract.
5. Template Vault saved successfully but did not expose the saved output until a second selection action.
6. Seed Quality Scorer contained two partially merged documents, duplicate IDs, and inconsistent controls.
7. Growth Stage Engine rejected core actions when the optional `/api/plant/update` endpoint was unavailable.
8. No repository gate protected the exact 44-asset count or exercised every primary interaction.

## Validation gates

- Static contract: 44 manifest entries, 44 unique clean routes, 132 required files, valid local references, unique HTML IDs, and one document structure per asset.
- Interaction contract: direct HTTP route, nonblank render, primary action, changed output, local resource loading, runtime/console errors, and refresh/deep-link render.
- Repository contract: JavaScript syntax checks, article build, and whitespace validation.
- Production contract: all 44 public routes return 200 and representative UI interactions pass after deployment.

## Asset results

| # | Asset | Clean route | Local verification |
|---:|---|---|---|
| 1 | PromptAlchemy | `/promptalchemy` | Passed |
| 2 | Script Generator | `/script-generator` | Passed |
| 3 | Spec Builder | `/spec-builder` | Passed |
| 4 | Code Generator | `/code-generator` | Passed |
| 5 | Code Reviewer | `/code-reviewer` | Passed |
| 6 | Tool Router | `/tool-router` | Passed |
| 7 | Export Studio | `/export-studio` | Passed |
| 8 | Template Vault | `/template-vault` | Passed |
| 9 | Idea Remixer | `/idea-remixer` | Passed |
| 10 | Task Splitter | `/task-splitter` | Passed |
| 11 | Prompt Compare | `/prompt-compare` | Passed |
| 12 | Repo Improvement Brief | `/repo-improvement-brief` | Passed |
| 13 | Workflow Template Gallery | `/workflow-template-gallery` | Passed |
| 14 | Tool Search Discovery | `/tool-search-discovery` | Passed |
| 15 | Context Packager | `/context-packager` | Passed |
| 16 | Output Evaluator | `/output-evaluator` | Passed |
| 17 | Player Signup | `/player-signup` | Passed |
| 18 | Orchard Profile Builder | `/orchard-profile-builder` | Passed |
| 19 | Starter Farm Generator | `/starter-farm-generator` | Passed |
| 20 | Root Strength Calculator | `/root-strength-calculator` | Passed |
| 21 | Trunk Growth Calculator | `/trunk-growth-calculator` | Passed |
| 22 | Fruit Yield Engine | `/fruit-yield-engine` | Passed |
| 23 | Daily Quest Generator | `/daily-quest-generator` | Passed |
| 24 | Weekly Harvest Engine | `/weekly-harvest-engine` | Passed |
| 25 | 30-Day Promotion Engine | `/thirty-day-promotion-engine` | Passed |
| 26 | Fair Ranking Engine | `/fair-ranking-engine` | Passed |
| 27 | Seed Exchange | `/seed-exchange` | Passed |
| 28 | Fruit Sharing | `/fruit-sharing` | Passed |
| 29 | Circle Builder | `/circle-builder` | Passed |
| 30 | Peer Validation Engine | `/peer-validation-engine` | Passed |
| 31 | Trust Score Engine | `/trust-score-engine` | Passed |
| 32 | Recruiter Dashboard | `/recruiter-dashboard` | Passed |
| 33 | Orchard Discovery Search | `/orchard-discovery-search` | Passed |
| 34 | Hire Readiness Scorer | `/hire-readiness-scorer` | Passed |
| 35 | Four Direction Pipeline | `/four-direction-pipeline` | Passed |
| 36 | Growth Path Recommender | `/growth-path-recommender` | Passed |
| 37 | AI Coach Console | `/ai-coach-console` | Passed |
| 38 | Simulation Runner | `/simulation-runner` | Passed |
| 39 | Seed Quality Scorer | `/seed-quality-scorer` | Passed |
| 40 | Meta Health Dashboard | `/meta-health-dashboard` | Passed |
| 41 | Synthetic Player Generator | `/synthetic-player-generator` | Passed |
| 42 | Wave 1 Simulation Runner | `/wave1-simulation-runner` | Passed |
| 43 | Balance Dashboard | `/balance-dashboard` | Passed |
| 44 | Growth Milestone Engine | `/growth-milestone-engine` | Passed |

## Recorded local result

- Static contract: 44/44 passed.
- Interaction contract: 44/44 passed.
- Failed assets: 0.
- Production verification: pending deployment.
