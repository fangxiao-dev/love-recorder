# Task Plan: Adopt Cycle Window calendar and auxiliary month view

## Goal
Replace the current rolling timeline on the module homepage with the new Cycle Window calendar as the default view, while adding Month View as a secondary browse mode and preserving existing quick actions and day-detail entry.

## Current Phase
Phase 1

## Phases
### Phase 1: Lock the homepage integration contract
- [ ] Preserve homepage status card and quick action area
- [ ] Keep `onQuickActionTap` and `goToHistory` as stable page entrypoints
- [ ] Define the calendar data contract in `module-home-service`
- **Status:** pending

### Phase 2: Build Cycle Window view model
- [ ] Compute 3x7 window data centered by current period, prediction, then today
- [ ] Add week-step browsing metadata and jump targets
- [ ] Expose record, period, prediction, and today markers without changing record identity
- **Status:** pending

### Phase 3: Replace homepage calendar presentation
- [ ] Replace the 35-day timeline block with Cycle Window markup
- [ ] Add Today / Last cycle / Next prediction jumps
- [ ] Keep quick action placement stable so LR-003 can wire behavior without rework
- **Status:** pending

### Phase 4: Add Month View as secondary mode
- [ ] Add month-mode toggle and month grid
- [ ] Support previous/next month browsing
- [ ] Route day taps to the existing day-detail flow
- **Status:** pending

### Phase 5: Verification
- [ ] Verify active-cycle centering
- [ ] Verify predicted-window centering when not in period
- [ ] Verify day tap enters existing detail flow
- [ ] Verify quick actions still render and remain tappable after layout replacement
- **Status:** pending

## Key Questions
1. How much calendar interaction should stay in `pages/module-home/index.js` versus `services/module-home-service.js`?
2. Should Month View live inline under the same card or as a mode swap within the same content slot?

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Cycle Window is the default view and Month View is auxiliary | Matches `docs/calendar_style.md` and preserves the status-first homepage |
| LR-007 owns homepage structure and styling in `pages/module-home/index.wxml` and `pages/module-home/index.wxss` | Makes UI replacement independent from LR-003 action wiring |
| LR-007 should preserve quick action IDs and the `onQuickActionTap` page handler contract | Lets LR-003 proceed in parallel without rebasing on UI rename churn |
| Date tap should route into the existing cycle/day detail flow from LR-004 | Avoids duplicating editing UX and keeps the calendar task scoped |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
|       | 1       |            |

## Notes
- Parallel contract with LR-003:
  - LR-007 owns homepage markup and styles in [pages/module-home/index.wxml](/D:/CodeSpace/love-record/pages/module-home/index.wxml) and [pages/module-home/index.wxss](/D:/CodeSpace/love-record/pages/module-home/index.wxss).
  - LR-007 may extend [pages/module-home/index.js](/D:/CodeSpace/love-record/pages/module-home/index.js) only for calendar navigation handlers such as mode switch, day tap, window jump, and scroll-state updates.
  - LR-007 must not repurpose or rename the quick action keys `start`, `end`, `range`, `exception`, and must keep the page handler name `onQuickActionTap`.
  - LR-007 must keep the quick action container as a separate block fed by `quickActions`; it can restyle or move the block, but should not inline action-specific business logic into WXML.
  - Calendar data shaping should be pushed into [services/module-home-service.js](/D:/CodeSpace/love-record/services/module-home-service.js) and covered by [tests/services/module-home-service.test.js](/D:/CodeSpace/love-record/tests/services/module-home-service.test.js), so both worktrees avoid large controller conflicts in homepage JS.
  - Day tap should navigate to existing detail/history surfaces rather than introducing a second editor path.
