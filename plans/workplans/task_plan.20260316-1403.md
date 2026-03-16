# Task Plan: Implement quick recording flows

## Goal
Implement fast record-entry flows for `今天来了`, `今天结束了`, `补录一段`, and `记录异常` while keeping default data entry minimal.

## Current Phase
Phase 1

## Phases
### Phase 1: Wire one-tap start and end actions
- [ ] Implement `今天来了`
- [ ] Implement `今天结束了`
- [ ] Refresh homepage-derived state after each action
- **Status:** in_progress

### Phase 2: Build backfill range flow
- [ ] Create the range selection page
- [ ] Support continuous historical selection
- [ ] Save a valid historical cycle segment
- **Status:** pending

### Phase 3: Build abnormal detail capture
- [ ] Create the exception entry page
- [ ] Keep optional fields non-blocking
- [ ] Support saving notes and abnormal indicators
- **Status:** pending

### Phase 4: Verification
- [ ] Verify start/end actions on seeded data
- [ ] Verify backfill creates a historical range
- [ ] Verify abnormal details save without breaking the record model
- **Status:** pending

## Key Questions
1. How should the action branch minimize merge pressure on `pages/module-home/index.*`?
2. Which fields belong to the default record path versus the optional abnormal-detail path?

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Default action should be one tap with no forced detail form | Matches the approved UX principle |
| Backfill should use range selection instead of day-by-day clicking | Faster and closer to the intended behavior |
| `pages/module-home/index.wxml` and `pages/module-home/index.wxss` are owned by LR-007 during parallel execution | Prevents homepage layout churn while LR-003 focuses on behavior wiring |
| LR-003 may only make minimal controller edits in `pages/module-home/index.js` | Keeps merge pressure limited to quick-action handlers and post-action refresh |
| Quick action IDs and handler entrypoint must remain stable: `start`, `end`, `range`, `exception` via `onQuickActionTap` | Lets LR-007 redesign the view without breaking LR-003 action binding |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
|       | 1       |            |

## Notes
- Reuse the shared storage and service contract from LR-001.
- Parallel contract with LR-007:
  - LR-003 owns behavior wiring for quick actions in [pages/module-home/index.js](/D:/CodeSpace/love-record/pages/module-home/index.js).
  - Allowed homepage edits in LR-003: `onQuickActionTap`, any action-specific helper methods, and the minimal reload path after save.
  - Forbidden homepage edits in LR-003: replacing calendar markup, renaming calendar-related data fields, changing visual structure in [pages/module-home/index.wxml](/D:/CodeSpace/love-record/pages/module-home/index.wxml), or editing styles in [pages/module-home/index.wxss](/D:/CodeSpace/love-record/pages/module-home/index.wxss).
  - LR-003 should push new logic into [services/cycle-record-service.js](/D:/CodeSpace/love-record/services/cycle-record-service.js) and dedicated pages such as [pages/record-range/index.js](/D:/CodeSpace/love-record/pages/record-range/index.js) instead of expanding homepage rendering logic.
  - LR-003 must preserve these page-level bindings for LR-007 to consume: `quickActions`, `moduleInstanceId`, `primaryStatusText`, `secondaryStatusText`, `goToHistory`, and `onQuickActionTap`.
