# Task Plan: Build status-first menstrual module homepage

## Goal
Implement the menstrual module homepage that emphasizes current state, secondary prediction, and a rolling 30-45 day timeline.

## Current Phase
Phase 1

## Phases
### Phase 1: Build the homepage layout
- [ ] Create the module homepage page files
- [ ] Render the primary and secondary status blocks
- [ ] Establish the page structure for timeline and quick actions
- **Status:** in_progress

### Phase 2: Render the timeline visualization
- [ ] Show recorded cycle segments
- [ ] Mark today clearly
- [ ] Show the prediction window visually
- **Status:** pending

### Phase 3: Connect seed-driven view state
- [ ] Read seeded module and record data
- [ ] Compute active-cycle and inactive-cycle display states
- [ ] Make the view resilient to no-history data
- **Status:** pending

### Phase 4: Verification
- [ ] Verify the homepage with active-cycle seed data
- [ ] Verify the homepage with inactive-cycle seed data
- [ ] Verify the page still renders before record actions are integrated
- **Status:** pending

## Key Questions
1. How much of the quick-action section should be visual placeholder versus wired behavior in this branch?
2. What timeline rendering approach keeps WXML simple enough to merge later with action wiring?

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Status-first layout over natural-month calendar | Matches the approved product design |
| Use seed data before full persistence wiring | Keeps this branch focused on display logic |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
|       | 1       |            |

## Notes
- Keep edits to homepage event handlers light; action-specific behavior belongs mainly to LR-003.
