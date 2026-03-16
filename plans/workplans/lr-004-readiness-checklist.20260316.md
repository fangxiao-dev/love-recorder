# LR-004 Readiness Checklist

## Purpose
Define the minimum gate to start LR-004 implementation in a dedicated worktree without changing MVP scope.

## Gate Items
- [x] `LR-004` remains within MVP boundary (history list + record editor only).
- [x] Record shape is confirmed from `models/cycle-record.js`.
- [x] History page is reserved as a secondary view (not homepage takeover).
- [x] Edit flow uses same record identity (`id`) and does not duplicate records.
- [x] Validation scope is defined for prototype-level strictness.
- [x] Dedicated worktree for LR-004 is created and opened.
- [ ] Manual verification script for history/edit flow is prepared in DevTools.

## Prototype Validation Boundary
- Required:
  - `startDate` required.
  - `endDate` optional, but if provided must be `>= startDate`.
  - `flowLevel` in `light|medium|heavy` when not empty.
  - `painLevel` in `mild|moderate|severe` when not empty.
- Allowed:
  - `notes` empty string.
  - open cycle (`endDate = null`) remains valid.
- Out of scope:
  - conflict resolution for multi-user concurrent edits.
  - hard medical-rule validation beyond date consistency.

## Ready-To-Start Decision
- Decision: `CONDITIONALLY READY`
- Required before coding:
  1. Add service contract implementation stub in task branch before page wiring.
  2. Prepare manual verification script for history/edit flow in DevTools.
