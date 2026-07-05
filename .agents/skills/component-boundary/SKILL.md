# Component Boundary Skill

## Use When

Component props, Svelte exports, stories, fixtures, consumer contract docs, or package API boundaries change.

## Procedure

1. Read the target `src/lib/**` component, related stories, fixtures, `docs/CONSUMER_CONTRACT.md`, and relevant checker scripts.
2. Keep authority decisions in consuming apps.
3. Preserve accessible defaults and overrideable user-facing text.
4. Check package version impact when public exports, packaged docs, or package metadata change.
5. Verify with `zdp_design_system_package_verify`; add npm pack dry-run when package surface changes.
