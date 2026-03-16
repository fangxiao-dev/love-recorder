# Current Task Tracker

## Workflow Notes
- Status lifecycle: `UNPLANNED -> PLANNED -> DONE`
- Git is initialized; tasks should now follow the normal WT-PM closure flow once planned work enters implementation.
- A task is only fully complete after merge-back to trunk and status update to `DONE`.

| task id | slug | title | status | plan id | dependencies | parallel | notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| LR-001 | foundation-miniapp | Bootstrap native mini program foundation | DONE | 20260316-1401 | none | no | Landed on trunk; scaffold, model shapes, and storage interface are now frozen |
| LR-002 | feature-module-home | Build status-first menstrual module homepage | DONE | 20260316-1402 | LR-001 | yes | Status-first homepage landed; follow-up calendar replacement tracked in LR-007 |
| LR-003 | feature-record-actions | Implement quick recording flows | DONE | 20260316-1403 | LR-001 | yes | Keep homepage edits minimal to reduce merge conflicts |
| LR-004 | feature-history-editor | Build history list and record editor | DONE | 20260316-1404 | LR-001 | yes | cycle-list + cycle-detail(daily edit) merged to trunk |
| LR-005 | feature-shared-shell | Build modules page and shared-space shell | DONE | 20260316-1405 | LR-001 | yes | UI shell only; no real multi-user sync in this phase |
| LR-007 | feature-cycle-window-calendar | Adopt Cycle Window calendar and auxiliary month view | DONE | 20260316-1407 | LR-002, LR-004 | yes | Replace the current rolling timeline with the 3x7 cycle window; reuse day-detail editing and keep month view as secondary browse mode |
| LR-008 | feature-day-state-recording | Align calendar interaction and storage to the day-state recording model | DONE | 20260316-LR-008 | LR-003, LR-004, LR-007 | no | Derived from approved day-state recording design docs |
