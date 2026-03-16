# LR-008 Task Plan

- Plan ID: `20260316-1408`
- Task ID: `LR-008`
- Slug: `feature-day-state-recording`
- Status: `PLANNED`

## Goal

Align the menstrual module to the approved day-state recording model so the homepage calendar becomes the primary editor, `day_record` becomes the source of truth, and cycles are derived from consecutive `period` days.

## Higher-Level Inputs

- `docs/period_model.md`
- `docs/plans/2026-03-16-menstrual-module-design.md`
- `docs/plans/2026-03-16-day-state-recording-alignment-plan.md`

## Acceptance Criteria

1. The domain model stores day-level menstrual states rather than cycle-first records.
2. Missing dates resolve to implicit `none`.
3. The homepage 3-week cycle window supports long-press multi-select with explicit save/cancel.
4. Tap-based single-day editing remains available and does not conflict with long-press selection.
5. Quick actions remain available only as shortcuts into the same day-state model.
6. Derived cycle blocks and prediction inputs are recomputed from consecutive `period` days.
7. Manual verification passes in WeChat DevTools.

## Phases

### Phase 1: Freeze contract in code-facing artifacts

- Re-read approved design docs before touching implementation.
- Confirm the implementation-side rules for `none`, `period`, `spotting`, derived cycles, and month-view scope.

### Phase 2: Refactor domain and service layer

- Introduce or normalize `day_record` shape.
- Remove cycle-first persistence assumptions.
- Implement derived cycle aggregation from day-state data.

### Phase 3: Update homepage interaction

- Add long-press multi-select mode in the 3-week cycle window.
- Preserve tap-based day detail editing.
- Keep month view browse-only.

### Phase 4: Unify quick actions and verify

- Make `今天来了` / `今天结束了` wrappers over the same day-state editing service.
- Verify deterministic seed cases and full manual flow in WeChat DevTools.

## Verification Plan

- Service/model checks for day-state aggregation and quick-action wrappers
- Manual verification in WeChat DevTools for tap/long-press separation and cycle rendering

## Notes

- Do not reintroduce a separate backfill page or cycle-first object flow.
- Do not treat the task as complete until merge-back and `DONE` status update are finished.
