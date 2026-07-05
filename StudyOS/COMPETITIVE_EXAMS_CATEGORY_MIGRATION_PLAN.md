# Competitive Exams B.Sc. → StudyOS Category Migration Plan

## Goal
Integrate content and workflows from `via-decide/compitative-exams-B.Sc.` into the main StudyOS experience as a first-class category (similar to existing tracks like UPSC and Programming), while preserving StudyOS' no-build, standalone browser architecture.

---

## What was found in source repo
From a structural review of the target repository:

- It is a **Vite + React + TypeScript** app (not vanilla standalone HTML).
- Domain model is chemistry-focused and exam-oriented:
  - Metadata names it “Chemistry StudyOS”.
  - Resources are grouped for `GATE`, `JAM`, `TIFR` with year-wise papers/keys links.
  - It includes quiz banks and “lore mode” simulation-style learning modules.
- This means direct copy-paste into this repository will **not** fit current architecture and needs extraction + adaptation.

---

## Category placement in main StudyOS
Create a new top-level StudyOS category:

- **Category name**: `Competitive Exams`
- **Suggested subjects under category**:
  - `B.Sc. Chemistry`
  - `B.Sc. Physics` (future placeholder)
  - `B.Sc. Mathematics` (future placeholder)
  - `General Aptitude`

Alternative (if you want narrower scope for phase 1):

- Keep category as `Competitive Exams`
- Start with only one subject: `B.Sc. Chemistry`

---

## Migration strategy (recommended)

### Phase 1 — Data-first integration (low-risk)
1. Add the new category/subject options to StudyOS category dictionary.
2. Extract chemistry exam resources (GATE/JAM/TIFR links + labels) into a StudyOS-compatible data block.
3. Feed these into existing StudyOS “Vault / PYQ / Resource” surfaces rather than building new UI first.
4. Keep this phase additive and non-breaking.

**Outcome:** Users can choose `Competitive Exams > B.Sc. Chemistry` and immediately access structured resources.

### Phase 2 — Quiz/test integration
1. Convert sample quiz banks into StudyOS quiz/question model.
2. Add exam filters (`GATE`, `JAM`, `TIFR`) in test center panel.
3. Add attempt tracking using existing StudyOS local storage patterns.

**Outcome:** Competitive Exams category has working mock tests in native StudyOS flow.

### Phase 3 — Lore/simulation adaptation
1. Recreate lore missions as lightweight StudyOS modules (plain JS/HTML snippets).
2. Keep modules optional (enhancement only), not blocking core prep features.
3. Add only after Phase 1 + 2 stabilize.

**Outcome:** Engagement layer without introducing React/Vite dependency.

---

## Technical constraints and decisions

### Constraint
Source repo is React/Vite; this repo is static vanilla HTML/JS/CSS.

### Decision
Do **not** embed source app directly. Instead:

- Port content/data and UX concepts.
- Re-implement minimal required UI in current StudyOS style.
- Avoid introducing npm/build tooling into this repository.

---

## Data model mapping

### Source model (competitive-exams repo)
- `Resource`: `{ id, title, category, year, url, type }`
- `QuizQuestion`: `{ id, text, options[], correctAnswer, explanation }`
- Lore missions: nested mission objects with learner/gamer modes.

### Target StudyOS mapping
- Vault docs/resources:
  - `category` ← exam type (`GATE`/`JAM`/`TIFR`)
  - `title` ← resource title
  - `content` ← short summary + URL
- PYQ/test center:
  - year and exam tags for filtering
- Simulation/lore:
  - separate optional module list under Competitive Exams workspace.

---

## UX blueprint for StudyOS

When user selects `Competitive Exams > B.Sc. Chemistry`:

1. Sidebar title updates to this domain.
2. Vault preloads:
   - Official repositories
   - Recent papers
   - Answer keys
3. PYQ section defaults to chemistry paper stream.
4. Test center offers:
   - Chapter quiz
   - Previous-year mock
   - Exam-type filter chips
5. Optional module card:
   - “Mission Mode” (phase 3)

---

## Rollout checklist

### Pre-implementation
- Confirm exact category label: `Competitive Exams` vs `Competitive`.
- Confirm phase-1 scope: Chemistry-only or multi-subject stubs.
- Confirm whether to include only official links in first release.

### Implementation
- Add dictionary entry + subject list in StudyOS category config.
- Add resource seed set for chemistry.
- Add filter logic for exam type.
- Add quiz seed questions.

### Validation
- Category appears in onboarding selection.
- Workspace renders without JS errors.
- Resources are clickable and categorized correctly.
- Existing UPSC/Programming flows are unchanged.

---

## Risk log

1. **Architecture mismatch risk** (React vs vanilla)  
   Mitigation: data/content port instead of framework port.

2. **Link rot in external PYQ resources**  
   Mitigation: add fallback official repository links + periodic link checker.

3. **Scope expansion into full simulation UI too early**  
   Mitigation: defer lore modules to phase 3.

---

## Suggested execution order in this repository
1. Add category + subject options in StudyOS selection dictionary.
2. Add chemistry competitive resource bundle to StudyOS data section.
3. Add exam-type filters in relevant StudyOS panels.
4. Add initial quiz bank.
5. QA and regression checks for existing categories.

---

## Deliverable definition for Phase 1 (done criteria)
- New category visible and selectable in StudyOS.
- `Competitive Exams > B.Sc. Chemistry` generates a valid workspace.
- Vault includes at least:
  - 3 official repository links
  - 6+ PYQ/key entries
- No regressions in UPSC/Programming routes and panels.
