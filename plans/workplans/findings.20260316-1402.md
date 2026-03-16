# Findings & Decisions

## Requirements
- Display either `经期中第 X 天` or `距离上次开始第 X 天`.
- Show a light prediction status beneath the main state.
- Replace natural-month calendar UI with a rolling 30-45 day time band.

## Research Findings
- The design explicitly rejects Meiyou-style natural-month home layout.
- The homepage should answer "what is the current state" before exposing detailed history or heavy data input.
- Quick action buttons must exist visually here, but their full behavior can be integrated later.

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| Keep homepage derived state pure and helper-driven | Makes it easier for action and history branches to merge into the same page |
| Render timeline from computed day descriptors | Simplifies WXML loops and future styling changes |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| Homepage likely to conflict with action branch | Restrict this task to layout and derived view state as much as possible |

## Resources
- [2026-03-16-menstrual-module-design.md](D:\CodeSpace\love-record\docs\plans\2026-03-16-menstrual-module-design.md)
- [2026-03-16-menstrual-module-implementation-plan.md](D:\CodeSpace\love-record\docs\plans\2026-03-16-menstrual-module-implementation-plan.md)

## Visual/Browser Findings
- The product discussion concluded that the homepage should be state-first, not calendar-first.
