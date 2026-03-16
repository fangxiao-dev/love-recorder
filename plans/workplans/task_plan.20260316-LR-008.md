# Task Plan: 20260316-LR-008

## Goal
Align the menstrual module to the approved day-state recording model so the homepage calendar becomes the primary editor, `day_record` becomes the storage truth, and cycle blocks are derived from consecutive `period` days.

## Scope
- LR-008: Align calendar interaction and storage to the day-state recording model

## Higher-Level Inputs
- `docs/period_model.md`
- `docs/plans/2026-03-16-menstrual-module-design.md`
- `docs/plans/2026-03-16-day-state-recording-alignment-plan.md`
- `docs/calendar_style.md`

## Current Phase
Phase 1

## Phases
### Phase 1: Requirements & Discovery
- [x] Confirm selected tasks and constraints
- [x] Confirm the approved day-state rules and homepage interaction contract
- [x] Record workflow constraints from WT-PM and planning-with-files
- [ ] Write findings and rationale
- **Status:** in_progress

### Phase 2: Planning & Structure
- [ ] Map current implementation files that still assume cycle-first records
- [ ] Define migration sequence for model, service, homepage interaction, and QA
- [ ] Confirm dependencies and risks
- **Status:** pending

### Phase 3: Implementation
- [ ] Refactor domain/service layer to day-state source-of-truth
- [ ] Add long-press multi-select editing in the 3-week cycle window
- [ ] Preserve tap-based single-day editing and month-view browse-only behavior
- [ ] Keep quick actions as wrappers over the same editing model
- [ ] Keep progress and errors updated
- **Status:** pending

### Phase 4: Testing & Verification
- [ ] Run service/model verification for day-state aggregation behavior
- [ ] Run manual WeChat DevTools verification for tap/long-press separation
- [ ] Record validation results and blockers
- **Status:** pending

### Phase 5: Delivery
- [ ] Update task evidence files
- [ ] Merge the task worktree back to trunk
- [ ] Update task status in todo_current to `DONE`
- [ ] Summarize output and residual risks
- **Status:** pending

## Files Expected To Change
- `models/day-record.js`
- `models/cycle-record.js`
- `services/cycle-record-service.js`
- `pages/module-home/index.js`
- `pages/module-home/index.wxml`
- `pages/module-home/index.wxss`
- `mock/seed-data.js`
- related verification docs under `docs/checklists/` if needed

## Acceptance Checks
1. Missing days resolve to implicit `none`.
2. Consecutive `period` days render as a single derived cycle block.
3. Long press enters multi-select mode and save applies default `period` across the selected range.
4. Tap-based single-day editing remains available and does not conflict with long-press behavior.
5. Quick actions do not create a second data model.
6. Shared and private entry points still resolve to the same module instance.

## Risks
- Existing implementation may still rely on cycle-first assumptions in multiple files.
- The current task tracker format diverged from the original `plan_tracker.py` schema and required compatibility fixes.
- The existing `LR-008` worktree was created before the standard task plan was regenerated and must be updated before implementation starts.
