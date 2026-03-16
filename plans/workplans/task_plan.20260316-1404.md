# Task Plan: Build history list and record editor

## Goal
Implement the history view and record editor so users can review past cycles and update optional details without breaking the fast-entry model.

## Current Phase
Phase 1

## Phases
### Phase 1: Build the history list
- [ ] Create the history list UI
- [ ] Sort records by latest start date first
- [ ] Handle empty-state rendering
- **Status:** in_progress

### Phase 2: Build record editing
- [ ] Create the record editor page
- [ ] Support editing date range and optional detail fields
- [ ] Validate edits against the shared record shape
- **Status:** pending

### Phase 3: Sync edited results back to the module state
- [ ] Refresh homepage-derived state after edits
- [ ] Refresh the history list after edits
- [ ] Preserve record identity across edits
- **Status:** pending

### Phase 4: Verification
- [ ] Verify editing recent and historical records
- [ ] Verify optional empty fields remain valid
- [ ] Verify invalid edits are blocked or surfaced clearly
- **Status:** pending

## Key Questions
1. How strict should edit validation be in the prototype?
2. Should history and editor live as one page flow or a list page plus dedicated edit page?

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Keep history separate from the homepage | Avoids overloading the status-first main screen |
| Allow optional detail fields to remain empty | Consistent with the low-friction MVP model |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
|       | 1       |            |

## Notes
- Avoid re-implementing cycle calculations in the editor; use shared helpers from LR-001.
