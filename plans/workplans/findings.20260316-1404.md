# Findings & Decisions

## Requirements
- Provide a history list for recorded cycles.
- Allow editing of date range and optional abnormal details.
- Keep the editor compatible with the homepage state model.

## Research Findings
- The MVP homepage should answer current-state questions first; historical review belongs on a secondary screen.
- Records need stable identity so edits do not look like new data copies.
- Optional fields such as flow, pain, and notes should not be mandatory in edit flows either.

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| Use a dedicated editor page instead of inline editing on the list | Simpler mini-program interaction model and cleaner merge boundaries |
| Keep record sorting and mapping in one place | Prevents view drift between history and homepage summaries |
| Define service contract as `listRecordsByModule/getRecordById/updateRecord` | Gives LR-004 a stable implementation boundary before coding |
| Use prototype-level strict validation only for date range + enums | Balances data integrity with MVP speed |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| No dedicated LR-004 worktree yet | Marked as readiness blocker; coding remains blocked until worktree exists |

## Resources
- [2026-03-16-menstrual-module-design.md](D:\CodeSpace\love-record\docs\plans\2026-03-16-menstrual-module-design.md)
- [2026-03-16-menstrual-module-implementation-plan.md](D:\CodeSpace\love-record\docs\plans\2026-03-16-menstrual-module-implementation-plan.md)
- [lr-004-readiness-checklist.20260316.md](D:\CodeSpace\love-record\plans\workplans\lr-004-readiness-checklist.20260316.md)
- [lr-004-edit-service-contract.20260316.md](D:\CodeSpace\love-record\plans\workplans\lr-004-edit-service-contract.20260316.md)

## Visual/Browser Findings
- The agreed design places history as a supporting view, not the primary screen.
