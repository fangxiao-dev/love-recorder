# Findings & Decisions (20260316-LR-008)

## Requirements
- LR-008: Align calendar interaction and storage to the day-state recording model

## Research Findings
- Approved product/data model:
  - `day_record` is the only source of truth
  - implicit `none` for missing dates
  - explicit `period` and non-period extra-record states
  - derived cycle blocks from consecutive `period` days
- Approved interaction model:
  - homepage uses the 3-week Cycle Window as the main editor
  - tap opens single-day detail/editing
  - long press enters multi-select mode
  - long-press start cell decides whether the current drag is selecting or deselecting
  - while remaining in multi-select mode, tapping a cell toggles only that day
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
| Service contract | Keep `cycle-record-service` as the public entry for now, but make its persistence and derived cycle logic operate on `day_record`. |
| Homepage editor | Replace the old start/end-only selected-day panel with direct single-day state editing for `period`, `special`, and clear. |
| Revised interaction contract | Remove the dedicated quick actions area; fast recording should move into the selected-day panel with a `月经正常` shortcut and direct attribute editing. |
| Multi-select behavior | Use long-press start cell state to lock the current drag into `select` or `deselect` mode, and allow single-cell tap toggles before exiting selection mode. |
| Batch edit persistence | Save only the dates touched in the current multi-select session so drag-select and drag-cancel can coexist without rewriting unrelated visible period days. |
| Normal shortcut defaults | `月经正常` writes `period` plus default observations: `flowLevel=medium`, `painLevel=none`, `colorLevel=normal`. |
| Non-period naming | Use `特殊` as the user-facing name for non-period extra records, not `点滴/spotting`, to avoid implying spotting-only semantics. |
| Day marker semantics | Show the calendar dot only for `特殊`; `period` is already represented by the filled period block and should not duplicate the marker. |
| Calendar hierarchy | Keep only three primary visual zones on the calendar: `经期 / 预测 / 普通`; `特殊` stays in the secondary marker layer and must not use a full-cell background or outline. |
| State toggle rule | Tapping an already active `经期` or `特殊` state button should clear back to `none` instead of forcing the separate clear action. |
| Future-date feedback | Keep future dates blocked, but show a lightweight toast on tap/long-press/drag attempts so the restriction is visible. |

## Issues Encountered
| Issue | Resolution |
|---|---|
| `planning-with-files` could not parse `plans/todo_current.md` | Updated `plan_tracker.py` to support the repository's richer task table schema. |
| Initial LR-008 plan files were created manually instead of through `planning-with-files` | Reset LR-008 to `UNPLANNED`, removed the manual files, then regenerated the plan via `quick-plan`. |
| Existing homepage tests assumed inferred active-window days should behave like explicit `period` records | Updated tests to match the approved contract: missing days remain implicit `none` unless explicitly recorded. |
| The first LR-008 homepage pass still kept a quick-actions area and two-tap range-selection behavior | Re-opened the interaction contract and updated the design/task plan before further implementation. |

## Resources
- plans/todo_current.md
- plans/workplans/task_plan.20260316-LR-008.md
- docs/period_model.md
- docs/plans/2026-03-16-day-state-recording-alignment-plan.md
- docs/checklists/day-state-rules.md
- docs/checklists/module-home-manual-qa.md
