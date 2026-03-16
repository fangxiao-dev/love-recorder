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

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| None yet | Not started |

## Resources
- [2026-03-16-menstrual-module-design.md](D:\CodeSpace\love-record\docs\plans\2026-03-16-menstrual-module-design.md)
- [2026-03-16-menstrual-module-implementation-plan.md](D:\CodeSpace\love-record\docs\plans\2026-03-16-menstrual-module-implementation-plan.md)

## Visual/Browser Findings
- The agreed design places history as a supporting view, not the primary screen.
