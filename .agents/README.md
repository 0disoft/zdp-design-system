# Design System Agent Notes

Start with `CHECKLIST.md`, `VALIDATION.md`, and the existing package docs listed in `README.md`. This repository is a shared package boundary, not a product screen owner.

## High-Risk Mistakes

- Adding product-specific screens or marketing copy.
- Letting UI components decide authorization, billing, identity, consent, admin, routing, data fetching, ads, or locale fallback.
- Leaking external UI library types, Tailwind/shadcn class contracts, or copied snippets into public API.
- Changing packaged docs or package metadata without version impact review.

## Local Routes

- `.agents/checklists/token-surface.md`
- `.agents/checklists/component-boundary.md`
- `.agents/checklists/package-surface.md`
- `.agents/checklists/external-ui-adoption.md`
- `.agents/skills/token-contract/SKILL.md`
- `.agents/skills/component-boundary/SKILL.md`
- `.agents/validations/design-system-contract.md`
