# Findings: LR-007 cycle window calendar

## Context
- Task: LR-007
- Plan ID: 20260316-1407
- Date: 2026-03-16

## Findings
- The worktree branch is `codex/LR-007-feature-cycle-window-calendar`; this does not match the older `feat/<task>` pattern in `wt-dev`, but the task ID and plan mapping are unambiguous from `plans/todo_current.md`.
- `pages/module-home/index.js` currently exposes only `goToHistory` and `onQuickActionTap`; LR-007 should keep those stable and add only calendar-specific handlers.
- `services/module-home-service.js` currently shapes a rolling 35-day timeline. LR-007 should move the new calendar data contract into this service to minimize homepage controller churn.
- Existing tests cover the current timeline contract and pass before LR-007 changes. New tests need to replace that contract with cycle-window and month-view assertions.
- The implemented month grid uses a Sunday-first week layout so March 2026 renders as a compact 5-row grid in the prototype.
- Recorded day taps route directly to `pages/record-editor/index` with the existing `recordId/moduleInstanceId/cycleId` contract. Days without a record currently show a toast instead of opening a new empty editor path.

## Risks
- Homepage markup replacement can conflict with LR-003 if quick action keys or handler names change.
- Manual verification in WeChat DevTools is still required for calendar scrolling and tap navigation even if service-layer tests pass.

## Open Questions
- Month view will be implemented as an in-page mode switch unless the page code reveals a stronger existing pattern that would reduce churn.
