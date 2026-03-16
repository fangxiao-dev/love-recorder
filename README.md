# love-recorder

`love-recorder` is a native WeChat Mini Program MVP for a relationship-oriented record space.
The current first module is menstrual tracking, designed to work for a single user first and later be shared into the same module instance with a partner.

## Current Status

The repository is no longer in planning-only state. The current trunk already includes:

- a runnable native WeChat Mini Program scaffold
- a menstrual module homepage built around a 3-week Cycle Window
- day-state recording with `day_record` as the source of truth
- derived cycle blocks and prediction support
- local-first persistence
- private/shared module shell pages
- history, detail, and reminder placeholder flows

The current task tracker is fully closed for this phase:

- `LR-001` through `LR-005`: `DONE`
- `LR-007`: `DONE`
- `LR-008`: `DONE`

## Product Shape

This MVP is intentionally narrow.

- Product direction: relationship record space
- First implemented module: menstrual tracking
- Platform: native WeChat Mini Program
- Storage: local-first, with a future migration path to WeChat Cloud capabilities

Core product rules:

- single-user use must work without partner setup
- sharing means access to the same module instance, never duplicated data
- homepage answers current status first
- menstrual records are stored as day-level state, not user-authored cycle objects

## Implemented Recording Model

The current menstrual module uses:

- `day_record` as the persisted truth
- implicit `none` for missing dates
- explicit `period` and `special` day states
- derived cycle blocks from consecutive `period` days

Homepage interaction is centered on the Cycle Window:

- tap a day to edit that day's state and attributes
- long-press to enter multi-select mode
- drag to select or deselect a continuous range
- month view stays secondary and browse-oriented

## Main Pages

Defined in [app.json](/D:/CodeSpace/love-recorder/app.json):

- `pages/index/index`
- `pages/modules/index`
- `pages/module-home/index`
- `pages/record-range/index`
- `pages/record-exception/index`
- `pages/history/index`
- `pages/cycle-detail/index`
- `pages/record-editor/index`
- `pages/shared-space/index`
- `pages/reminders/index`

The main user flow starts from the modules page and enters the menstrual module homepage.

## Local Run

There is no npm-based app runtime here.

To run the prototype:

1. Open [D:\CodeSpace\love-recorder](/D:/CodeSpace/love-recorder) in WeChat DevTools
2. Use the existing mini program project config in [project.config.json](/D:/CodeSpace/love-recorder/project.config.json)
3. Preview the app locally in DevTools

## Verification

The repo has lightweight Node-based tests for the model and service layer.

Useful commands:

```powershell
node --test tests/models/day-record.spec.js tests/history/cycle-record-service.test.js tests/services/module-home-service.test.js tests/services/module-instance-service.test.js tests/foundation/date.test.js
node --check pages/module-home/index.js
node --check services/module-home-service.js
node --check services/cycle-record-service.js
```

UI verification is still expected to happen in WeChat DevTools for key flows.

## Repository Layout

- [pages](/D:/CodeSpace/love-recorder/pages): mini program pages
- [services](/D:/CodeSpace/love-recorder/services): state assembly, persistence, and service-layer logic
- [models](/D:/CodeSpace/love-recorder/models): domain model helpers
- [tests](/D:/CodeSpace/love-recorder/tests): Node-based verification
- [docs/plans](/D:/CodeSpace/love-recorder/docs/plans): solution-level design and implementation planning
- [plans](/D:/CodeSpace/love-recorder/plans): task tracking and WT-PM workplan evidence

## Important Docs

- [project-context.md](/D:/CodeSpace/love-recorder/project-context.md)
- [tech-stack-investigate.md](/D:/CodeSpace/love-recorder/tech-stack-investigate.md)
- [docs/period_model.md](/D:/CodeSpace/love-recorder/docs/period_model.md)
- [docs/plans/2026-03-16-menstrual-module-design.md](/D:/CodeSpace/love-recorder/docs/plans/2026-03-16-menstrual-module-design.md)
- [docs/plans/2026-03-16-day-state-recording-alignment-plan.md](/D:/CodeSpace/love-recorder/docs/plans/2026-03-16-day-state-recording-alignment-plan.md)

## Scope Boundaries

What this repo is:

- a runnable prototype
- a WeChat Mini Program
- a menstrual-tracking-first shared record product

What this repo is not:

- a production-ready health app
- a real-time multi-user sync system
- a complete multi-module relationship platform yet
