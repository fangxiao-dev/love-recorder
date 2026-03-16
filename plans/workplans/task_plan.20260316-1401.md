# Task Plan: Bootstrap native mini program foundation

## Goal
Create the native WeChat Mini Program JavaScript scaffold and establish the shared foundation needed by all later feature worktrees.

## Current Phase
Phase 1

## Phases
### Phase 1: Scaffold the app shell
- [x] Create the native mini program root files
- [x] Create `app.js`, `app.json`, `app.wxss`, `project.config.json`, and `sitemap.json`
- [x] Register all reserved MVP page paths in `app.json` to reduce downstream merge conflicts
- [ ] Reserved page paths:
  - [x] Reserved page paths:
  - [x] `pages/index/index`
  - [x] `pages/modules/index`
  - [x] `pages/module-home/index`
  - [x] `pages/record-range/index`
  - [x] `pages/record-exception/index`
  - [x] `pages/history/index`
  - [x] `pages/shared-space/index`
  - [x] `pages/reminders/index`
- [x] Ensure the project opens in WeChat DevTools
- **Status:** completed

### Phase 2: Freeze domain shapes and service contracts
- [x] Define `moduleInstance`, `cycleRecord`, `sharedSpace`, and `membership` shapes in dedicated files under `models/`
- [x] Add date and cycle calculation helpers in `utils/date.js`
- [x] Create `services/storage.js` with interface only, not full persistence wiring
- [ ] Freeze the storage contract to the minimum shared API:
  - [x] Freeze the storage contract to the minimum shared API:
  - [x] `get(key)`
  - [x] `set(key, value)`
  - [x] `remove(key)`
  - [x] `loadSeedData()`
- [ ] Freeze the service/data ownership boundary:
  - [x] Freeze the service/data ownership boundary:
  - [x] `models/` owns data shape definitions
  - [x] `utils/date.js` owns pure date and cycle calculations
  - [x] `services/storage.js` owns persistence access only
  - [x] Feature pages must not define competing record or module shapes
- **Status:** completed

### Phase 3: Seed data and handoff docs
- [x] Add deterministic seed data shape in `mock/seed-data.js`
- [ ] Include at least these deterministic scenarios:
  - [x] Include at least these deterministic scenarios:
  - [x] private module with active cycle
  - [x] private module with inactive cycle
  - [x] shared module with last-editor metadata
- [x] Document page paths, model ownership, and service boundaries for parallel worktrees
- [x] Document the canonical IDs and storage keys used by seed data
- [x] Record merge-risk notes in findings and progress files
- **Status:** completed

### Phase 4: Verification
- [x] Verify the scaffold runs in WeChat DevTools
- [x] Verify helper functions return expected sample outputs from fixed seed cases
- [x] Verify `app.json` already contains the reserved route list needed by LR-002 to LR-005
- [x] Verify the handoff contract is specific enough that downstream tasks can implement without redefining shapes or routes
- [x] Confirm downstream task contracts are stable enough for parallel work
- **Status:** completed

## Deliverables
- `app.js`
- `app.json`
- `app.wxss`
- `project.config.json`
- `sitemap.json`
- `pages/index/index.js`
- `pages/index/index.wxml`
- `pages/index/index.wxss`
- `models/module-instance.js`
- `models/cycle-record.js`
- `models/shared-space.js`
- `utils/date.js`
- `services/storage.js`
- `mock/seed-data.js`
- updated handoff notes in `plans/workplans/findings.20260316-1401.md`
- updated execution evidence in `plans/workplans/progress.20260316-1401.md`

## Key Questions
1. Which exact page paths should be reserved up front to reduce `app.json` merge conflicts?
   - Decision: reserve all MVP page paths in this task, even if later tasks only populate placeholder files initially.
2. What is the smallest storage API that all downstream worktrees can share safely?
   - Decision: foundation freezes only `get`, `set`, `remove`, and `loadSeedData`; real persistence behavior is integrated later in LR-006.

## Fixed Verification Samples
1. Active cycle sample
   - Records: one cycle with `startDate=2026-03-14`, `endDate` empty
   - Today: `2026-03-16`
   - Expected:
     - current status = active
     - cycle day = 3
     - days since last start = 2
2. Inactive cycle sample
   - Records: latest cycle with `startDate=2026-02-20`, `endDate=2026-02-25`
   - Today: `2026-03-16`
   - Expected:
     - current status = inactive
     - days since last start = 24
3. Prediction sample
   - Records: cycle starts on `2026-01-21`, `2026-02-20`, `2026-03-22`
   - Expected:
     - average cycle length logic is deterministic and documented
     - predicted next window output format is fixed before LR-002 consumes it

## Boundaries
- This task may create route placeholders and shared contracts, but must not build feature-page UI beyond the landing shell.
- This task may define the storage interface, but must not implement the full persistence workflow promised to LR-006.
- This task must not expand product scope beyond the approved menstrual-module MVP.

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Use native WeChat Mini Program with JavaScript | Matches the current milestone and minimizes startup complexity |
| Freeze shared data shapes in the foundation task | Prevents downstream drift across parallel worktrees |
| Reserve all MVP page routes in `app.json` during foundation | Avoids repeated route edits across parallel tasks |
| Keep storage shallow and contract-only in foundation | Prevents premature persistence complexity before integration |
| Seed data must cover private, shared, active, and inactive states | Gives all downstream tasks deterministic development fixtures |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
|       | 1       |            |

## Definition Of Done
- The mini program opens in WeChat DevTools without runtime errors.
- Reserved MVP routes are present in `app.json`.
- Shared model files and helper files exist and are referenced as canonical sources by downstream tasks.
- `services/storage.js` exposes only the agreed minimal interface.
- `mock/seed-data.js` can support private/shared and active/inactive deterministic states.
- Verification evidence and contract notes are recorded in the matching findings/progress files.

## Notes
- This task blocks all other worktrees.
- Keep the storage layer shallow; only define the interface needed by phase-one features.
