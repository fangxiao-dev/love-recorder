# Current Task Tracker

## Workflow Notes
- Status lifecycle: `UNPLANNED -> PLANNED -> DONE`
- Git is initialized; tasks should now follow the normal WT-PM closure flow once planned work enters implementation.
- A task is only fully complete after merge-back to trunk and status update to `DONE`.

| Task ID | Slug | Title | Status | Plan ID | Dependencies | Parallel | Notes |
|---------|------|-------|--------|---------|--------------|----------|-------|
| LR-001 | foundation-miniapp | Bootstrap native mini program foundation | DONE | 20260316-1401 | none | no | Landed on trunk; scaffold, model shapes, and storage interface are now frozen |
| LR-002 | feature-module-home | Build status-first menstrual module homepage | PLANNED | 20260316-1402 | LR-001 | yes | Can run with seed data before full persistence |
| LR-003 | feature-record-actions | Implement quick recording flows | PLANNED | 20260316-1403 | LR-001 | yes | Keep homepage edits minimal to reduce merge conflicts |
| LR-004 | feature-history-editor | Build history list and record editor | PLANNED | 20260316-1404 | LR-001 | yes | Readiness docs added: `lr-004-readiness-checklist.20260316.md`, `lr-004-edit-service-contract.20260316.md`; waiting for dedicated worktree |
| LR-005 | feature-shared-shell | Build modules page and shared-space shell | DONE | 20260316-1405 | LR-001 | yes | UI shell only; no real multi-user sync in this phase |
| LR-006 | integration-persistence-qa | Integrate persistence, merge features, and run QA | PLANNED | 20260316-1406 | LR-002, LR-003, LR-004, LR-005 | no | Final integration and acceptance gate |

