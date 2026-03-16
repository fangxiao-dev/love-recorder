# Technology Investigation

## Role Of This Document
- Purpose: record the provisional technical direction for the runnable prototype and identify which choices are confirmed versus intentionally deferred
- Relation to `project-context.md`: this document translates the project milestone and scope into an implementation-oriented stack recommendation
- Scope note: this is for the current prototype milestone, not a final production architecture decision

## Selection Principles
- Principle 1: prefer the fastest path to a runnable, testable WeChat Mini Program prototype
- Principle 2: keep the architecture compatible with a later migration from local-only data to shared cloud-backed data
- Principle 3: avoid frameworks or backend systems whose complexity is not justified by the first milestone

## Candidate Stack
- Frontend: native WeChat Mini Program with JavaScript
- Backend: none for the first prototype; defer server responsibilities while preserving a migration path to WeChat Cloud functions
- Database: local mini program storage for the prototype; future candidate is WeChat Cloud Database
- ORM / schema management: none initially; define explicit data-shape helpers in code instead of adding schema tooling prematurely
- Hosting / deployment: WeChat DevTools local preview for the prototype; later candidate is standard WeChat Mini Program release flow
- External integrations: none required for the first milestone

## Why These Choices Fit The Project
- Match to project goals: native mini program development aligns directly with the target platform and reduces adaptation overhead
- Match to scope constraints: local-first persistence enables quick validation of status views, recording flows, and module ownership/shared-state behavior
- Match to delivery constraints: avoiding cloud setup at the start keeps the team focused on the MVP loop, while still allowing the data model to anticipate shared-space migration

## How The Stack Supports Required Features
- Single-user menstrual recording: fully supported with native pages, local state, and storage APIs
- Status-first module homepage: well suited to native mini program page composition
- Quick actions such as "today started" and "today ended": straightforward to implement in native event handlers
- Shared-state labeling: can be simulated locally with module-instance metadata before true multi-user sync exists
- Migration path to shared space: preserved by modeling owner, module instance, shared space, and membership explicitly from the start

## Status
- Confirmed choices:
  - target platform is WeChat Mini Program
  - first implementation target is a runnable prototype
  - frontend direction is native WeChat Mini Program
  - the initial scaffold language is JavaScript
  - persistence direction is local-first
- Candidate choices:
  - whether to introduce a lightweight local state management pattern beyond page-local state
  - whether to prototype shared invitation UX now or keep it as a placeholder
- Open technical questions:
  - when to switch from local storage to WeChat Cloud Database
  - how to model last-editor metadata before real multi-user sync exists
  - whether the first prototype should adopt a reusable component structure or stay page-scoped until the UI stabilizes
