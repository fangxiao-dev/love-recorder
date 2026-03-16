# Findings & Decisions

## Requirements
- Set up a native WeChat Mini Program JavaScript scaffold.
- Establish shared data structures for menstrual tracking and future shared-space behavior.
- Define enough storage and seed-data conventions to unblock parallel feature branches.

## Research Findings
- The approved project contract fixes the stack at native WeChat Mini Program plus JavaScript.
- The product model depends on a single user-owned module instance that may later be mounted into a shared space.
- Parallel branches will likely conflict on `app.json`, homepage files, and service contracts unless those are stabilized here first.

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| Reserve page entries early in `app.json` | Reduces branch conflicts when feature pages are added later |
| Keep persistence local-first in phase one | Fastest path to a runnable prototype while preserving cloud-migration options |
| Put shared shape logic in `models/` and date logic in `utils/` | Keeps downstream feature code from inventing ad hoc structures |
| Create placeholder files for all reserved routes | Lets downstream tasks focus on behavior instead of route plumbing |
| Add a Node-based helper test harness in parallel with WeChat files | Gives deterministic verification before full DevTools walkthrough |
| Freeze storage as a thin contract with in-memory fallback | Keeps foundation testable without prematurely integrating full storage behavior |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| Repo has no git metadata yet | Prepare plans manually and defer formal wt-plan execution until git is initialized |
| Repo now has git metadata but no commits yet | Created an orphan worktree branch and copied the current uncommitted project files into it so isolated execution could continue |

## Resources
- [project-context.md](D:\CodeSpace\love-record\project-context.md)
- [tech-stack-investigate.md](D:\CodeSpace\love-record\tech-stack-investigate.md)
- [2026-03-16-menstrual-module-design.md](D:\CodeSpace\love-record\docs\plans\2026-03-16-menstrual-module-design.md)
- [2026-03-16-menstrual-module-implementation-plan.md](D:\CodeSpace\love-record\docs\plans\2026-03-16-menstrual-module-implementation-plan.md)

## Visual/Browser Findings
- Manual verification in WeChat DevTools confirmed the landing page boots and all reserved placeholder routes open without runtime errors.

## Handoff Contract
- Reserved route list is frozen in `app.json` and must be reused by LR-002 to LR-005 without renaming.
- Canonical model files are:
  - `models/module-instance.js`
  - `models/cycle-record.js`
  - `models/shared-space.js`
- Canonical helper file is `utils/date.js`.
- Canonical storage contract is `services/storage.js` with `get`, `set`, `remove`, and `loadSeedData`.
- Canonical seed file is `mock/seed-data.js`.
- Shared storage keys are:
  - `love-record/module-instances`
  - `love-record/cycle-records`
  - `love-record/shared-spaces`
  - `love-record/memberships`
  - `love-record/reminders`
