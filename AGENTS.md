# AGENTS.md

## Scope

This repository owns ZDP design tokens, shared CSS, icon guidance, and Svelte UI package boundaries.

## Read Order

1. `AGENTS.md`
2. `service.yaml`
3. `CHECKLIST.md`
4. `VALIDATION.md`
5. `.agents/README.md`
6. `.agents/context-map.md`
7. `README.md`
8. `SECURITY.md`
9. `RUNBOOK.md`
10. `CONTRIBUTING.md`
11. `CHANGELOG.md`
12. Matching `.agents/checklists/*.md`
13. Matching `.agents/skills/*/SKILL.md`
14. Matching `.agents/validations/*.md`
15. Relevant `docs/**`, `tokens/**`, `src/**`, `scripts/**`, `stories/**`, `fixtures/**`, `preview/**`

## Rules

- Do not add product-specific screens or marketing copy here.
- Do not make UI components the source of truth for authorization, billing, identity, consent, or admin decisions.
- Keep tokens stable, named by purpose, and reusable across public web, app shell, product lab, and game surfaces.
- User-visible component text must stay natural and product-facing; implementation descriptions must not leak into UI labels.
- Prefer accessible defaults for focus, contrast, hit targets, reduced motion, and semantic markup.
- Agent verification must use the configured root mustflow intents, not raw Bun, Storybook, npm, or package scripts copied from README, CI, or package metadata.

## Verification

- `zdp_architecture_validate_design_system_repository`: repository architecture validation.
- `zdp_design_system_package_verify`: tokens, CSS, components, stories, preview, fixtures, package readiness, and accessibility gate.
- `zdp_design_system_bundle_analyze`: Storybook static build and bundle evidence when Storybook or build configuration changes.
- `zdp_design_system_npm_pack_dry_run`: package file surface review before release preparation.
- `zdp_design_system_npm_publish_dry_run`: approved publish-readiness dry run only; it is not a publish command.
