# Task Plan: Build history list and record editor

## Goal
Implement the history view and record editor so users can review past cycles and update optional details without breaking the fast-entry model.

## Current Phase
Phase 0

## Phases
### Phase 0: Readiness gate (added 2026-03-16)
- [x] Confirm LR-004 stays inside MVP scope
- [x] Define prototype edit validation boundary
- [x] Freeze edit service contract for list/get/update
- [ ] Create and enter LR-004 dedicated worktree
- **Status:** in_progress

### Phase 1: Build the history list
- [ ] Create the history list UI
- [ ] Sort records by latest start date first
- [ ] Handle empty-state rendering
- **Status:** pending

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
| Freeze `list/get/update` contract before coding | Reduce cross-branch drift and unblock worktree implementation |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
|       | 1       |            |

## Notes
- Avoid re-implementing cycle calculations in the editor; use shared helpers from LR-001.
- Readiness references:
  - `plans/workplans/lr-004-readiness-checklist.20260316.md`
  - `plans/workplans/lr-004-edit-service-contract.20260316.md`
