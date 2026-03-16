# AGENTS.md

## Project Introduction
- Project purpose: build a WeChat Mini Program relationship record product whose first MVP module is menstrual tracking
- Primary users: couples who may start from single-user use and later share the same module with a partner
- Current milestone: deliver a runnable prototype in WeChat DevTools, not a production-ready release
- Contract baseline: use `project-context.md`, `tech-stack-investigate.md`, and the approved docs under `docs/plans/` as the project contract

## Reading Order
1. Read [project-context.md](D:\CodeSpace\love-record\project-context.md).
2. Read [tech-stack-investigate.md](D:\CodeSpace\love-record\tech-stack-investigate.md).
3. Read the latest design or implementation plan under [docs/plans](D:\CodeSpace\love-record\docs\plans).

## Architecture Snapshot
- Main directories:
  - `docs/plans/`
  - app source directories will be added during scaffold
- Tech stack:
  - native WeChat Mini Program with JavaScript
  - local-first persistence for prototype stage
  - future migration path to WeChat Cloud capabilities
- Key commands:
  - no standard commands yet; use WeChat DevTools once the scaffold exists

## Architectural Boundaries
- Boundary rules:
  - treat the menstrual module as the only fully implemented module in this milestone
  - preserve the distinction between a user-owned module instance and a shared space
  - model sharing as access to the same instance, never as duplicated data
  - prefer native mini program primitives over speculative abstraction

## Workflow
- Task lifecycle:
  - inspect repo state
  - confirm or refine context if the task changes scope
  - write or update plans before substantial implementation
  - implement in small verifiable slices
  - verify in WeChat DevTools before claiming implementation complete
  - treat WT-PM task completion as a separate closure step after verification
- Planning expectations:
  - stabilize product/design context before implementation changes
  - do not expand scope beyond the current MVP unless the user explicitly changes the milestone
  - when the task is multi-step, update the relevant design or plan doc first
  - keep plans tied to the current milestone: runnable prototype
  - mark assumptions and open questions explicitly
- Implementation expectations:
  - keep the product centered on a single module instance that may be private or shared
  - avoid framework churn; prefer native mini program structures unless the project context changes
  - preserve the private-to-shared transition model without duplicating module data
  - avoid broadening into future modules unless the user asks
- Testing expectations:
  - verify behavior in WeChat DevTools before claiming the prototype works
  - prefer simple deterministic test data for cycle-state and timeline logic
  - call out anything that remains unverified
- Merge expectations:
  - do not treat a task as fully complete under WT-PM until it has passed manual verification, been merged back to trunk, and been marked `DONE` in `plans/todo_current.md`
  - distinguish clearly between:
    - implementation complete: code is written and verified in the task worktree
    - task complete: WT-PM closure is finished, including merge-back and status update
  - if work stops before merge-back or `DONE` status, report the exact remaining closure steps instead of saying the task is finished

## Skill Usage
- Default skills:
  - use `brainstorming` before creative design or feature changes
  - use `writing-plans` before substantial implementation work
  - use `verification-before-completion` before claiming success
- Trigger-based skills:
  - use `systematic-debugging` for bugs or failed behavior
  - use `test-driven-development` when implementing the MVP code
- Missing skill fallback:
  - state the gap briefly and continue with the closest disciplined workflow

## Important Rules
- Hard constraints:
  - optimize for a runnable WeChat Mini Program prototype, not production completeness
  - do not model sharing by copying module data
  - do not import unnecessary cross-platform frameworks into this milestone
  - keep UI and data decisions aligned with the approved menstrual-module design
- Freeze policy:
  - do not change core product assumptions silently
  - if a task would alter the private-to-shared data model or expand beyond MVP, surface that explicitly first
- Definition of done:
  - no success claim without verification
  - for UI and flow work, verification should include WeChat DevTools behavior
  - if verification is blocked, state the blocker precisely
  - do not call a WT-PM task `DONE` merely because implementation and manual testing passed
  - a WT-PM task is only truly complete when all of the following are true:
    - implementation is finished in the task worktree
    - required automated and manual verification has passed
    - plan evidence files are updated as needed
    - the task branch/worktree changes are merged back to trunk
    - `plans/todo_current.md` marks the task as `DONE`
- Update responsibilities:
  - update `project-context.md` when project purpose, scope, milestone, or constraints change
  - update `tech-stack-investigate.md` when the technical direction changes
  - update `docs/plans/` when a new validated design or implementation plan is created

## Contract Sources
- [project-context.md](D:\CodeSpace\love-record\project-context.md)
- [tech-stack-investigate.md](D:\CodeSpace\love-record\tech-stack-investigate.md)
- [2026-03-16-menstrual-module-design.md](D:\CodeSpace\love-record\docs\plans\2026-03-16-menstrual-module-design.md)
- [2026-03-16-menstrual-module-implementation-plan.md](D:\CodeSpace\love-record\docs\plans\2026-03-16-menstrual-module-implementation-plan.md)

## Maintenance
- What belongs here:
  - concise repo operating rules
  - project-specific architectural boundaries
  - workflow and verification expectations
- What belongs in separate docs:
  - broad product rationale in `project-context.md`
  - technical option analysis in `tech-stack-investigate.md`
  - feature-by-feature designs and plans in `docs/plans/`
- Update triggers:
  - revise this file when the project contract, architecture boundary, or workflow baseline changes

## Open Questions
- Whether shared invitation UX should be real or placeholder in the first runnable prototype
- Exact storage abstraction to use before cloud migration
