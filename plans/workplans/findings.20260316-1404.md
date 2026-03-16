# Findings & Decisions

## Requirements
- Provide a history list for recorded cycles.
- Allow editing of daily record date and optional abnormal details.
- Keep the editor compatible with the homepage state model.
- Keep cycle as the history container while keeping flow/pain at day granularity.

## Research Findings
- The MVP homepage should answer current-state questions first; historical review belongs on a secondary screen.
- Records need stable identity so edits do not look like new data copies.
- Optional fields such as flow, pain, and notes should not be mandatory in edit flows either.

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| Use a dedicated editor page instead of inline editing on the list | Simpler mini-program interaction model and cleaner merge boundaries |
| Keep record sorting and mapping in one place | Prevents view drift between history and homepage summaries |
| Keep edit validation in `cycle-record-service` | Avoids duplicating rules in page code and stabilizes behavior for future shared/home routes |
| Switch LR-004 history/editor to daily record model (`recordDate`) | User-validated requirement: symptoms vary by day and should not be stored as one value per whole cycle |
| Validate only MVP-critical constraints (`recordDate` required, optional enums) | Maintains low-friction prototype while preventing clearly invalid data |
| Re-introduce cycle-level history view using contiguous-day grouping | Preserves user expectation that history is viewed by cycle, not by isolated days |
| Defer calendar-card rendering | Current task focuses on interaction correctness; calendar skin can land in later UI-focused task |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| `cycle-record-service` missing during test-first workflow | Added service module and completed red-green cycle |
| Existing UI and data model mismatched user expectation (cycle-range record editing) | Migrated LR-004 scope to daily record editing and updated seed/service/page/tests |
| Daily-only history list conflicted with product expectation | Added cycle detail page and grouped daily entries into cycle cards |

## Resources
- [2026-03-16-menstrual-module-design.md](D:\CodeSpace\love-recorder\docs\plans\2026-03-16-menstrual-module-design.md)
- [2026-03-16-menstrual-module-implementation-plan.md](D:\CodeSpace\love-recorder\docs\plans\2026-03-16-menstrual-module-implementation-plan.md)

## Visual/Browser Findings
- The agreed design places history as a supporting view, not the primary screen.
- History list as secondary page plus dedicated editor aligns with this boundary and keeps homepage untouched in LR-004.
