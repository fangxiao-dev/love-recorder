# Progress: LR-007 cycle window calendar

## Session Log

### 2026-03-16 20:23
- Restored task context from `plans/todo_current.md` and `task_plan.20260316-1407.md`.
- Created missing `findings.20260316-1407.md` and `progress.20260316-1407.md`.
- Ran baseline tests:
  - `node --test tests/services/module-home-service.test.js`
  - `node --test tests/history/cycle-record-service.test.js`
- Result: all baseline tests passed before LR-007 implementation.

### 2026-03-16 20:35
- Replaced the old homepage timeline contract with `cycleWindow` and `monthView` in `services/module-home-service.js`.
- Added service-layer tests for:
  - active-cycle centering
  - prediction centering
  - jump targets
  - month-view grid data
  - record identity mapping for day taps
- Updated `pages/module-home/index.js`, `pages/module-home/index.wxml`, and `pages/module-home/index.wxss` to render:
  - default Cycle Window 3x7 calendar
  - auxiliary Month View
  - week stepping and jump chips
  - recorded-day tap navigation into the existing record editor flow
- Regression and syntax checks passed:
  - `node --test tests/foundation/date.test.js tests/history/cycle-record-service.test.js tests/services/module-home-service.test.js tests/services/module-instance-service.test.js`
  - `node --check pages/module-home/index.js`
- Remaining: manual verification in WeChat DevTools for layout, interactions, and navigation.

### 2026-03-16 21:08
- Fixed Month View state loss by passing `calendarMode`, `monthCursor`, and `selectedDate` through `getModuleHomeViewModel`.
- Added inline selected-day panel behavior on the homepage:
  - empty date defaults to `月经来了`
  - dates inside the inferred active window show `月经走了：是/否`
- Added homepage inline range-backfill mode for `补录一段`; date taps now support start/end selection without leaving the page.
- Added cycle record service helpers:
  - `markCycleStart`
  - `markCycleEnd`
  - `createCycleRangeRecord`
- Added and passed new automated tests for:
  - Month View persistence
  - selected-day panel states
  - start/end/range record mutations
- Regression and syntax checks passed:
  - `node --test tests/foundation/date.test.js tests/history/cycle-record-service.test.js tests/services/module-home-service.test.js tests/services/module-instance-service.test.js`
  - `node --check pages/module-home/index.js`
  - `node --check services/cycle-record-service.js`
  - `node --check services/module-home-service.js`
- Remaining:
  - WeChat DevTools manual verification
  - abnormal detail flow is still routed through the existing exception page, not yet expanded inline
  - default menstrual length is implemented as 7 days in code; settings UI to change it is not yet built

## Phase Status
- Phase 1: completed
- Phase 2: completed
- Phase 3: completed
- Phase 4: completed
- Phase 5: in_progress
