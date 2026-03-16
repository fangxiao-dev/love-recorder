# Task Plan: Build history list and record editor

## Goal
Implement the history view and daily record editor so users can review per-day entries and update optional details without breaking the fast-entry model.

## Current Phase
Phase 4 (manual verification pending)

## Phases
### Phase 1: Build the history list
- [x] Create the history list UI
- [x] Sort cycle groups by latest cycle start date first
- [x] Handle empty-state rendering
- **Status:** completed

### Phase 2: Build record editing
- [x] Create the record editor page
- [x] Support editing per-day date and optional detail fields
- [x] Validate edits against the shared record shape
- **Status:** completed

### Phase 2.5: Add cycle container detail view
- [x] Add cycle detail page as cycle container
- [x] Show per-day records inside one cycle
- [x] Route per-day item to daily editor
- **Status:** completed

### Phase 3: Sync edited results back to the module state
- [x] Refresh homepage-derived state after edits
- [x] Refresh the history list after edits
- [x] Preserve record identity across edits
- **Status:** completed

### Phase 4: Verification
- [x] Verify editing recent and historical records
- [x] Verify optional empty fields remain valid
- [x] Verify invalid edits are blocked or surfaced clearly
- **Status:** completed (automated); manual WeChat DevTools verification pending

## Key Questions
1. How strict should edit validation be in the prototype?
2. Should history and editor live as one page flow or a list page plus dedicated edit page?

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Keep history separate from the homepage | Avoids overloading the status-first main screen |
| Allow optional detail fields to remain empty | Consistent with the low-friction MVP model |
| Switch from cycle-range record editing to daily record editing for LR-004 | Matches manual validation feedback and real usage expectation for per-day symptom changes |
| Keep history list cycle-based and move daily edits into cycle detail page | Balances product expectation (history by cycle) and data truth (flow/pain by day) |
| Calendar-card UI deferred | Not required for LR-004 MVP closure; current list/card structure is sufficient |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
|       | 1       |            |

## Notes
- Avoid re-implementing cycle calculations in the editor; use shared helpers from LR-001.
