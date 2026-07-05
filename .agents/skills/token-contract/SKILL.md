# Token Contract Skill

## Use When

Design tokens, CSS variables, generated token names, font entries, preview token usage, or flat UI rules change.

## Procedure

1. Read `tokens/zdp.tokens.json`, `src/styles/tokens.css`, `scripts/generate-tokens.ts`, and `scripts/check-tokens.ts`.
2. Keep token names role-based.
3. Preserve hex fallback plus OKLCH override for color tokens.
4. Keep optional brand, expressive, and locale font entries separate from base styles.
5. Verify with `zdp_design_system_package_verify`; use bundle analysis only when Storybook/static build evidence changes.
