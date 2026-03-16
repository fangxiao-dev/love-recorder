# Task Plan: Integrate persistence, merge features, and run QA

## Goal
Integrate the phase-one feature branches into a single runnable prototype with local persistence, stable cross-page behavior, and a documented acceptance pass.

## Current Phase
Phase 1

## Phases
### Phase 1: Merge feature work into one flow
- [ ] Integrate homepage, actions, history, and shared-shell behavior
- [ ] Resolve app registration and route conflicts
- [ ] Ensure the same module instance is used across all entry points
- **Status:** in_progress

### Phase 2: Connect local persistence
- [ ] Persist module instances and cycle records
- [ ] Persist shared-state metadata
- [ ] Add or finalize deterministic seed-mode behavior
- **Status:** pending

### Phase 3: Acceptance and bug-fix pass
- [ ] Run the single-user core loop end to end
- [ ] Run the shared-shell navigation loop end to end
- [ ] Fix integration bugs and update docs
- **Status:** pending

### Phase 4: Final documentation and handoff
- [ ] Create the MVP acceptance checklist
- [ ] Update plan progress and findings with actual outcomes
- [ ] Prepare the prototype for the next milestone discussion
- **Status:** pending

## Key Questions
1. Which integration conflicts are most likely after the parallel worktrees merge?
2. What exact manual acceptance checks are required before calling phase one complete?

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Use a final integration task instead of letting each branch wire its own persistence | Reduces cross-branch duplication and merge churn |
| Keep QA manual and deterministic in WeChat DevTools | Fits the prototype milestone and current repo maturity |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
|       | 1       |            |

## Notes
- This task should start only after LR-002 through LR-005 are ready to integrate.
