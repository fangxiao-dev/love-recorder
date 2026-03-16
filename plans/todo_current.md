# Current Task Tracker

## Workflow Notes
- Status lifecycle: `UNPLANNED -> PLANNED -> DONE`
- This repository is not yet a git repository, so these planning artifacts are prepared manually ahead of formal `wt-plan` execution.
- Branch and worktree creation should happen later from trunk once git is initialized.

| Task ID | Slug | Title | Status | Plan ID | Dependencies | Parallel | Notes |
|---------|------|-------|--------|---------|--------------|----------|-------|
| LR-001 | foundation-miniapp | Bootstrap native mini program foundation | PLANNED | 20260316-1401 | none | no | Must land first; freezes scaffold, model shapes, and storage interface |
| LR-002 | feature-module-home | Build status-first menstrual module homepage | PLANNED | 20260316-1402 | LR-001 | yes | Can run with seed data before full persistence |
| LR-003 | feature-record-actions | Implement quick recording flows | PLANNED | 20260316-1403 | LR-001 | yes | Keep homepage edits minimal to reduce merge conflicts |
| LR-004 | feature-history-editor | Build history list and record editor | PLANNED | 20260316-1404 | LR-001 | yes | Depends on shared record shape and edit service contract |
| LR-005 | feature-shared-shell | Build modules page and shared-space shell | PLANNED | 20260316-1405 | LR-001 | yes | UI shell only; no real multi-user sync in this phase |
| LR-006 | integration-persistence-qa | Integrate persistence, merge features, and run QA | PLANNED | 20260316-1406 | LR-002, LR-003, LR-004, LR-005 | no | Final integration and acceptance gate |
