# Findings & Decisions

## Requirements
- Support one-tap `today started` and `today ended` actions.
- Support historical backfill with continuous selection.
- Keep abnormal fields optional and separate from the default action path.

## Research Findings
- The product discussion explicitly rejects slow field-heavy entry similar to mainstream cycle apps.
- Quick actions are part of the homepage, but their behavior should stay modular so the homepage layout branch remains mergeable.
- The same module instance must be updated, not cloned, no matter which entry path is used.

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| Put write logic in a cycle-record service | Keeps homepage UI and persistence behavior separated |
| Treat abnormal detail capture as a separate screen | Preserves the one-tap default flow |
| Persist quick actions as daily records instead of start/end range blobs | Matches the existing per-day record model used by history and detail editing |
| `今天结束了` fills any missing days from the latest recorded day through today | Keeps cycle grouping contiguous without rewriting the existing model |
| `记录异常` upserts a record for the selected day | Lets the lightweight form work for both brand-new notes and same-day补充 |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| Homepage and record actions both touch the same page files | Keep this branch focused on event wiring and service calls; avoid restyling the page |

## Resources
- [2026-03-16-menstrual-module-design.md](D:\CodeSpace\love-record\docs\plans\2026-03-16-menstrual-module-design.md)
- [2026-03-16-menstrual-module-implementation-plan.md](D:\CodeSpace\love-record\docs\plans\2026-03-16-menstrual-module-implementation-plan.md)

## Visual/Browser Findings
- The approved MVP interaction favors fast actions and only asks for extra detail in exceptional situations.
- LR-003 kept `pages/module-home/index.wxml` and `pages/module-home/index.wxss` untouched; homepage changes stay inside controller logic to reduce merge pressure with LR-007.
- WeChat DevTools manual verification passed for quick start/end, range backfill, exception save, and adjacent history editing flow.
