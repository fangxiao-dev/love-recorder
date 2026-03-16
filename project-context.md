# Project Context

## Project Summary
- Name: love-record
- Project type: WeChat Mini Program MVP
- One-sentence purpose: Build a relationship-oriented record space that starts with a shared-capable menstrual tracking module.
- Primary audience: couples who want a lightweight shared record space, with single-user onboarding supported before sharing
- Current phase: project initialization and runnable prototype planning

## Background
- Why this project exists: the original idea was a menstrual tracking mini program, then expanded into a broader concept for recording small but meaningful details in a relationship.
- Real product / prototype / course project / internal tool: prototype intended to validate product direction and core UX loop before broader expansion

## Product Theme
- Domain or product theme: relationship record space with modular personal-to-shared workflows
- Why this theme fits the project: the product is not meant to be only a menstrual tracker; the menstrual module is the first concrete module inside a broader shared-space concept.

## Key User Scenarios
- Scenario 1: a single user starts using the menstrual module alone and completes a full record/view/edit loop without needing a partner account.
- Scenario 2: the user later creates or joins a shared space and mounts the same menstrual module into that space so both people can view and maintain the same data.
- Scenario 3: the owner withdraws the module from the shared space, preserving the original data while removing partner access.

## Goals And Scope
- Current milestone: deliver a runnable WeChat Mini Program prototype in WeChat DevTools that validates the product structure and core menstrual-recording loop
- Success condition: the prototype supports private use, shared-state labeling, status-first home view, quick start/end recording, range backfill, and a same-instance model between personal and shared entry points
- Minimum usable closed loop: open the mini program, enter the menstrual module, record "today started" or "today ended", view current status and recent timeline, and review/edit existing history
- Required deliverables:
  - project context document
  - technical investigation document
  - repo-level `AGENTS.md`
  - repo-level `CLAUDE.md`
  - design and implementation plan docs
  - runnable WeChat Mini Program prototype
- In scope:
  - native WeChat Mini Program prototype
  - menstrual tracking module MVP
  - single-user-first flow with optional shared-space model
  - lightweight local persistence
  - architecture that can later migrate sharing features to cloud-backed storage
- Out of scope:
  - production-grade authentication and security hardening
  - full real-time shared editing
  - complex health analytics and charting
  - AI interpretation
  - multi-module expansion beyond placeholders or architecture hooks
- Constraints:
  - primary target is WeChat Mini Program
  - current delivery target is a runnable prototype, not a production launch
  - implementation should avoid over-abstracting for future modules
  - the product must support both private and shared mental models without duplicating module data
- Non-goals:
  - replicating full-featured menstrual apps such as Meiyou
  - building a full relationship operating system in the first milestone
  - solving all backend and cross-device sync concerns before validating the UX
- Risks:
  - over-scoping the product beyond the menstrual module MVP
  - introducing premature framework or backend complexity
  - under-defining the transition from private to shared mode

## Repository Facts
- Key directories:
  - `docs/plans/`
- Main entrypoints: none yet; no application scaffold exists
- Test entrypoints: none yet
- Important scripts: none yet

## Candidate Technical Direction
- Summary: use a native WeChat Mini Program for the first runnable prototype, with local storage for MVP speed and a data shape that can later migrate to WeChat Cloud capabilities for sharing
- Link to `tech-stack-investigate.md`: [tech-stack-investigate.md](D:\CodeSpace\love-record\tech-stack-investigate.md)

## Confirmed Facts
- The product target is a WeChat Mini Program.
- The long-term direction is a relationship detail record space.
- The first MVP module is menstrual tracking.
- The product must support single-user usage before sharing.
- Shared access must point to the same module instance rather than copied data.
- The current milestone is a runnable prototype.
- The preferred frontend direction is native WeChat Mini Program.
- The preferred storage direction is local-first with a migration path toward cloud-backed sharing.

## Reasonable Inferences
- A native mini program will reduce startup complexity compared with cross-platform frameworks at this stage.
- The repository is intentionally at an early phase, so context and operating docs should stay concise and adjustable.
- Shared-space behavior should be represented in the architecture before real cloud sync is implemented.

## Open Questions
- Whether UI design tokens or a component kit should be defined before implementation
- Whether the first runnable prototype should include any invitation UX beyond placeholder shared-state flows
