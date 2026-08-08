# ViaDecide Root Page — Roadmap Engine Feature Blueprint

> Status: feature proposal; not wired to the production root route.

## Product thesis

ViaDecide is the roadmap engine for choices. The root experience should let a visitor touch a real decision graph before signing in, find a relevant roadmap, and turn an execution-oriented node into a portable contract that can be reviewed locally by LogicHub.

The current cross-product relationship is:

> **ViaDecide defines what should be done. The user or agent performs the work. LogicHub proves whether it stayed inside the declared boundary.**

## Constraints

- Sovereign, zero-npm, vanilla JavaScript SPA on Cloudflare Pages.
- Existing Firebase Auth/Firestore and `VDRouter v3` remain in place.
- Existing modal/iframe launcher is reused for diagnostics and node detail.
- Canvas2D renders a pre-baked graph; the browser does not run force layout.
- Fonts are self-hosted WOFF2 assets.
- Mobile defaults to a linear decision list, with spatial mode as an explicit fullscreen view.
- The feature remains isolated until explicitly promoted to the root route.

## Experience pipeline

```text
SOURCE
ViaDecide roadmap, node metadata, prerequisites, and graph layout

↓ ACCESS / ENTRY
Full-bleed interactive hero, command search, catalog, or diagnostic

↓ INTENT CAPTURE
Selected graph path, filters, diagnostic answers, and execution node

↓ STATE / LOGIC ENGINE
Static DAG validation, deterministic matching, local progress, contract generation

↓ ACTIONS
Explore path, open roadmap, mark complete, or export execution contract

↓ OUTPUT / METRICS
Resolved path, node state, contract fingerprint, optional LogicHub receipt
```

## Visual system

| Token | Value | Meaning |
|---|---|---|
| `canvas-void` | `#0A0E12` | Page background |
| `surface-raised` | `#11161C` | Cards and panels |
| `trace-idle` | `#2B333B` | Unvisited edge or node |
| `signal-cyan` | `#4DE8E0` | Available action, hover, focus |
| `trace-amber` | `#F2A93C` | Active path or in-progress state |
| `verified-emerald` | `#34D399` | Persistent completion or verification |
| `alert-magenta` | `#E8487A` | High-stakes or blocked state |
| `text-primary` | `#E7EDF2` | Primary text |
| `text-muted` | `#7C8791` | Secondary text |

Typography pairs IBM Plex Sans for human-readable labels with IBM Plex Mono for node IDs, status messages, contracts, and receipts.

The signature interaction is **Live Trace Compile**: selecting a node draws an amber trace across an eligible edge and resolves a synchronized monospace status message.

```text
resolving → node_auth-strategy ... LOCKED
```

## Root-page hierarchy

1. Sticky 64px HUD navigation.
2. Full-bleed Canvas2D hero with a curated 14–18-node graph.
3. Command search and instant filters.
4. Dense roadmap catalog.
5. Five-to-seven-question diagnostic using the existing modal launcher.
6. Markdown and graph-spec creator teaser.
7. Dense technical footer with build/version metadata.

The initial graph interaction is available without authentication. Authentication is requested only when the visitor saves a path or opens gated lesson content.

## Graph implementation

Roadmap authoring and rendering remain separate:

1. Markdown plus graph specification is validated at build/publish time.
2. Layout is precomputed into static `{id, x, y, edges[]}` JSON.
3. Canvas2D draws nodes and edges and performs circle hit-testing.
4. The client interpolates pan, zoom, trace animation, and viewport state only.
5. The same graph data generates the mobile linear decision list.

The legacy Zayvora Topology Engine remains useful only as a donor architecture for deterministic four-pass matching, precomputed lookup, fingerprint identity, DAG validation, per-stage telemetry, and graceful fallback. Its page-builder roles, component manifests, seven-node cap, and canvas-hydration contract are not part of current LogicHub positioning.

## ViaDecide to LogicHub boundary

Only execution-oriented nodes expose:

`Export execution contract →`

Conceptual or comparison nodes do not expose this action.

ViaDecide never sends a repository, source code, credentials, or account session to LogicHub. The handoff is a portable file imported locally, not a natural-language prompt embedded in a URL.

### Execution-contract schema

```json
{
  "schema": "viadecide.execution-contract.v1",
  "contractId": "vd_backend_auth_0042",
  "source": {
    "roadmapId": "backend-architecture",
    "nodeId": "node_auth-strategy",
    "pathFingerprint": "sha256:..."
  },
  "objective": "Implement session-based authentication for the existing API.",
  "scope": {
    "repository": "user-selected",
    "allowedPaths": ["src/auth/**", "tests/auth/**"],
    "deniedPaths": ["billing/**", "infrastructure/production/**"]
  },
  "constraints": [
    "No outbound telemetry",
    "No secrets committed to the repository",
    "Existing public API routes must remain compatible"
  ],
  "acceptanceChecks": [
    "Unauthenticated protected requests return 401",
    "Expired sessions are rejected",
    "Authentication tests pass"
  ],
  "evidenceRequired": ["diff", "test-results", "policy-report"],
  "risk": {
    "level": "high",
    "reasons": ["authentication", "session-state"]
  }
}
```

### Review loop

1. ViaDecide exports `execution-contract.json`.
2. A human or coding agent performs the implementation.
3. LogicHub imports the contract locally.
4. LogicHub reviews the repository diff against deterministic AST and policy checks.
5. LogicHub produces a signed, fingerprinted receipt.
6. ViaDecide may import a matching receipt and promote the node from `COMPLETED` to `VERIFIED`.

LogicHub may return `PASS`, `PASS_WITH_WARNINGS`, `REVISE`, or `BLOCK`. A receipt proves conformance to the declared contract; it does not prove that the original business or architectural decision was correct.

### Receipt contract

```json
{
  "schema": "logichub.execution-receipt.v1",
  "contractFingerprint": "sha256:...",
  "diffFingerprint": "sha256:...",
  "decision": "PASS_WITH_WARNINGS",
  "checks": {
    "scopeBoundary": "PASS",
    "astPolicy": "PASS",
    "acceptanceTests": "PASS",
    "secretScan": "PASS",
    "dependencyPolicy": "WARNING"
  },
  "warnings": ["One new dependency was introduced."],
  "policyVersion": "zayvora-engine-v0.4.1",
  "reviewedAt": "2026-08-08T17:45:00Z",
  "signature": "..."
}
```

## State model

| State | Meaning | Visual treatment |
|---|---|---|
| Available | Can be started | Cyan |
| Active | Currently traversed | Amber |
| Completed | User marked complete | Emerald outline |
| Verified | Matching LogicHub receipt imported | Emerald fill and receipt glyph |
| Blocked | LogicHub policy failure or hard constraint | Magenta |
| Locked | Prerequisites unmet | Muted slate |

## Delivery order

1. Freeze `viadecide.execution-contract.v1`.
2. Build static layout JSON generation and DAG validation.
3. Build the framework-free Canvas2D renderer and hit-testing.
4. Add the isolated hero shell and command palette.
5. Add catalog cards and filters.
6. Add the diagnostic resolver in the existing modal launcher.
7. Generate the mobile linear decision list from the same graph source.
8. Add contract export.
9. Add LogicHub receipt import and verified-node state.
10. Run accessibility, reduced-motion, low-end-device, and route-isolation audits before production consideration.

## Risks and failure modes

- Execution contracts can become oversized task specifications.
- Weak acceptance criteria can create false confidence despite passing policy checks.
- Receipt importing can degrade into superficial gamification.
- Signing has limited value until key ownership, rotation, and verification are defined.
- Large graphs can create cognitive noise even when rendering performance is acceptable.
- Canvas accessibility can diverge from the linear fallback if both are not generated from one source.
- LogicHub can verify conformance while the original ViaDecide recommendation remains wrong.

## Monetisation logic

- ViaDecide Free: browse roadmaps and export basic contracts.
- ViaDecide Pro: reusable contract templates, private/team roadmaps, and receipt history.
- LogicHub Individual: local deterministic review.
- LogicHub Team: shared policy packs, receipt verification, and compliance history.
- Enterprise: organization-specific boundaries and audit exports.

The governed execution workflow and evidence history are the paid unit; individual roadmap nodes are not.

## Verdict

**CHANGE:** retain the root-page roadmap concept and legacy engine donor patterns, but replace the obsolete “ViaDecide decides, LogicHub builds” integration with contract → execution → local review → receipt.

The production `index.html` remains unchanged until the feature is implemented, benchmarked, and explicitly promoted.
