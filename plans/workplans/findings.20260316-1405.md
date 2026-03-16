# Findings & Decisions

## Requirements
- Show a modules page with private/shared state.
- Add a shared-space entry page that reflects the product structure.
- Preserve the same-instance model between personal and shared access paths.

## Research Findings
- The product explicitly supports single-user-first use before sharing.
- Sharing is a mounting/access concept, not a data-copy concept.
- Shared-space behavior in phase one is structural and UI-level, not a real cloud-backed collaboration feature.

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| Keep invitation UX placeholder-only for now | Reduces scope while preserving navigation structure |
| Store shared-state metadata alongside the module instance | Simplifies same-instance routing and view labeling |
| Expose module-home route as `/pages/module-home/index?moduleInstanceId=<id>&entry=<source>` | Makes same-instance behavior explicit and debuggable across both entry paths |
| Compute `lastEditorName` from latest cycle record and seed users map | Delivers collaboration metadata placeholder without introducing real sync |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| Risk of overstating sync capability in the UI | Keep wording and labels explicit about current prototype limitations |
| `rg.exe` unavailable in current environment | Switched to PowerShell `Select-String` for repository search |

## Resources
- [project-context.md](D:\CodeSpace\love-record\project-context.md)
- [2026-03-16-menstrual-module-design.md](D:\CodeSpace\love-record\docs\plans\2026-03-16-menstrual-module-design.md)

## Visual/Browser Findings
- The shared-space design is intentionally medium-intensity: shared state and last editor, without heavy social interaction.
- Implemented shared copy uses "共享中（原型阶段）" and invitation placeholder copy to avoid implying realtime collaboration.
