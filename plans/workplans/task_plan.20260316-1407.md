# Task Plan: Adopt Cycle Window calendar and auxiliary month view

## Goal
Replace the current rolling timeline on the module homepage with the new Cycle Window calendar as the default view, add Month View as a secondary browse mode, and evolve the homepage from passive viewing into inline date-state editing.

## Current Phase
Phase 1

## Phases
### Phase 1: Lock the homepage integration contract
- [ ] Preserve homepage status card and quick action area
- [ ] Keep `onQuickActionTap` and `goToHistory` as stable page entrypoints
- [ ] Define the calendar data contract in `module-home-service`
- [ ] Keep Month View state stable across reloads and mode switches
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
- [ ] Add selected-day inline panel under the calendar instead of toast-only empty-day behavior
- **Status:** pending

### Phase 4: Add Month View as secondary mode
- [ ] Add month-mode toggle and month grid
- [ ] Support previous/next month browsing
- [ ] Keep Month View from snapping back to Cycle Window during page reload
- **Status:** pending

### Phase 5: Inline recording and backfill behavior
- [ ] Clicking any date should open inline date-state editing for that day
- [ ] Empty dates should default to a "月经来了" action instead of dead-end feedback
- [ ] In-progress cycle days should expose "月经走了：是/否" where "是" closes the cycle on that selected day
- [ ] Default menstrual length should be 7 days and auto-close cycles when the user does not end them manually
- [ ] `补录一段` should enter inline range selection instead of navigating to the placeholder page
- [ ] `记录异常` should stay lightweight and only expand detailed fields when the user marks the day as abnormal
- **Status:** pending

### Phase 6: Verification
- [ ] Verify active-cycle centering
- [ ] Verify predicted-window centering when not in period
- [ ] Verify Month View remains selected when switching mode and browsing months
- [ ] Verify empty-day tap opens inline editing instead of toast dead-end
- [ ] Verify "月经来了" starts a cycle and "月经走了：是" closes it on the selected day
- [ ] Verify cycles auto-close at the default 7-day length when there is no manual end
- [ ] Verify `补录一段` stays inline on the homepage
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
| Date tap should open an inline day-state panel on the homepage | Empty dates must remain editable; homepage becomes the primary recording surface |
| `补录一段` remains a separate feature from single-day editing | Range backfill and single-day status editing solve different jobs |
| Default menstrual length is 7 days until user settings exist | Supports inferred in-progress state and automatic cycle closure in MVP |
| During an active inferred period, selected dates use `月经走了：是/否` and `是` closes on the selected day | Matches the approved interaction semantics and keeps the end-date action explicit |
| Abnormal details should expand only when the user marks a day as abnormal | Keeps normal-day recording lightweight and lowers input cost |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
|       | 1       |            |

## Notes
- Parallel contract with LR-003:
  - LR-007 owns homepage markup and styles in [pages/module-home/index.wxml](/D:/CodeSpace/love-recorder/pages/module-home/index.wxml) and [pages/module-home/index.wxss](/D:/CodeSpace/love-recorder/pages/module-home/index.wxss).
  - LR-007 may extend [pages/module-home/index.js](/D:/CodeSpace/love-recorder/pages/module-home/index.js) only for calendar navigation handlers such as mode switch, day tap, window jump, and scroll-state updates.
  - LR-007 must not repurpose or rename the quick action keys `start`, `end`, `range`, `exception`, and must keep the page handler name `onQuickActionTap`.
  - LR-007 must keep the quick action container as a separate block fed by `quickActions`; it can restyle or move the block, but should not inline action-specific business logic into WXML.
  - Calendar data shaping should be pushed into [services/module-home-service.js](/D:/CodeSpace/love-recorder/services/module-home-service.js) and covered by [tests/services/module-home-service.test.js](/D:/CodeSpace/love-recorder/tests/services/module-home-service.test.js), so both worktrees avoid large controller conflicts in homepage JS.
  - LR-007 now owns the inline day-state editing shell on the homepage; LR-004 detail pages remain useful for deeper history editing but are no longer the primary tap target from the calendar.
