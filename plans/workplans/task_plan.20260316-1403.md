# Task Plan: Implement quick recording flows

## Goal
Implement fast record-entry flows for `今天来了`, `今天结束了`, `补录一段`, and `记录异常` while keeping default data entry minimal.

## Current Phase
Phase 1

## Phases
### Phase 1: Wire one-tap start and end actions
- [ ] Implement `今天来了`
- [ ] Implement `今天结束了`
- [ ] Refresh homepage-derived state after each action
- **Status:** in_progress

### Phase 2: Build backfill range flow
- [ ] Create the range selection page
- [ ] Support continuous historical selection
- [ ] Save a valid historical cycle segment
- **Status:** pending

### Phase 3: Build abnormal detail capture
- [ ] Create the exception entry page
- [ ] Keep optional fields non-blocking
- [ ] Support saving notes and abnormal indicators
- **Status:** pending

### Phase 4: Verification
- [ ] Verify start/end actions on seeded data
- [ ] Verify backfill creates a historical range
- [ ] Verify abnormal details save without breaking the record model
- **Status:** pending

## Key Questions
1. How should the action branch minimize merge pressure on `pages/module-home/index.*`?
2. Which fields belong to the default record path versus the optional abnormal-detail path?

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Default action should be one tap with no forced detail form | Matches the approved UX principle |
| Backfill should use range selection instead of day-by-day clicking | Faster and closer to the intended behavior |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
|       | 1       |            |

## Notes
- Reuse the shared storage and service contract from LR-001.
