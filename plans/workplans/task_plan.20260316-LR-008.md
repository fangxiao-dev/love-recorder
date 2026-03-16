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
- [x] Write findings and rationale
- **Status:** completed

### Phase 2: Planning & Structure
- [x] Map current implementation files that still assume cycle-first records
- [x] Define migration sequence for model, service, homepage interaction, and QA
- [x] Confirm dependencies and risks
- [x] Re-align the task plan to the revised interaction contract: drag-select/drag-cancel multi-select plus panel-first recording
- **Status:** completed

### Phase 3: Implementation
- [x] Refactor domain/service layer to day-state source-of-truth
- [x] Replace two-tap range selection with long-press drag-select/drag-cancel multi-select
- [x] Replace the current selected-day action panel with a panel-first attributes editor
- [x] Remove the quick actions area and move fast recording into the selected-day panel
- [x] Add a single-day `月经正常` fast path that writes default/normal observations
- [x] Rename the non-period extra state to `特殊` and make the day marker represent only that state
- [x] Support tapping the active state again to clear back to `none`
- [x] Add lightweight user feedback for future-date operations
- [x] Preserve month-view browse-only behavior
- [ ] Keep progress and errors updated
- **Status:** in_progress

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
3. Long press enters multi-select mode and drag behavior selects or deselects continuous dates based on the start cell state.
4. While still in multi-select mode, tapping a day can toggle just that day for micro-adjustment.
5. Tap-based single-day editing opens a property panel instead of a start/end action panel.
6. The selected-day panel supports `月经正常`, property editing, and clearing without a separate “记录异常” flow.
7. The homepage no longer depends on a dedicated quick actions area.
6. Shared and private entry points still resolve to the same module instance.

## Risks
- Existing implementation may still rely on cycle-first assumptions in multiple files.
- The current task tracker format diverged from the original `plan_tracker.py` schema and required compatibility fixes.
- The revised interaction contract removes the previously implemented quick actions area and two-tap range selection, so part of the in-progress homepage work must be reworked.
