# Findings & Decisions (20260316-LR-008)

## Requirements
- LR-008: Align calendar interaction and storage to the day-state recording model

## Research Findings
- Approved product/data model:
  - `day_record` is the only source of truth
  - implicit `none` for missing dates
  - explicit `period` and `spotting` states
  - derived cycle blocks from consecutive `period` days
- Approved interaction model:
  - homepage uses the 3-week Cycle Window as the main editor
  - tap opens single-day detail/editing
  - long press enters multi-select mode
  - month view stays browse-only
- Approved workflow layering:
  - `docs/plans/` holds solution-level plans
  - `plans/workplans/` holds WT-PM task execution plans
  - task-specific planning inside WT-PM must use `planning-with-files`

## Technical Decisions
| Decision | Rationale |
|---|---|
| Task selection | Task scope explicitly provided by user. |
| Task selection | Selected tasks: LR-008. |
| Data model | Migrate toward `day_record` as storage truth and derive cycle summaries from consecutive `period` days. |
| Interaction model | Keep editing on the homepage time window; do not reintroduce a separate backfill page. |
| Workflow repair | Patch `plan_tracker.py` to support the repository's richer `plans/todo_current.md` table instead of forcing a lossy migration. |
| Plan regeneration | Replace the manual `20260316-1408` planning files with a standard `planning-with-files` plan using `20260316-LR-008`. |

## Issues Encountered
| Issue | Resolution |
|---|---|
| `planning-with-files` could not parse `plans/todo_current.md` | Updated `plan_tracker.py` to support the repository's richer task table schema. |
| Initial LR-008 plan files were created manually instead of through `planning-with-files` | Reset LR-008 to `UNPLANNED`, removed the manual files, then regenerated the plan via `quick-plan`. |

## Resources
- plans/todo_current.md
- plans/workplans/task_plan.20260316-LR-008.md
- docs/period_model.md
- docs/plans/2026-03-16-day-state-recording-alignment-plan.md
