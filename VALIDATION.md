# VALIDATION.md

이 문서는 `zdp-design-system` 변경 후 확인할 기준을 모은다. 실행 권한은 mustflow command contract가 소유한다.

## Configured Validation

| Change scope | Check |
| --- | --- |
| tokens, CSS, components, stories, preview, fixtures, package readiness | `zdp_design_system_package_verify` |
| browser accessibility semantics, responsive geometry, forced colors, and keyboard focus order | `zdp_design_system_browser_accessibility_check` |
| Storybook static build or bundle evidence | `zdp_design_system_bundle_analyze` |
| npm package contents or release readiness | `zdp_design_system_npm_pack_dry_run` |
| repository architecture contract | `zdp_architecture_validate_design_system_repository` |
| architecture catalog or linter rule changes | `zdp_architecture_validate_fast` |
| docs-router-only changes outside packaged `docs/**` | `docs_validate_fast` |

`zdp_design_system_install_frozen` is needed only when dependencies are missing or package metadata changes require dependency installation. Publish dry-run and public publish intents remain gated by explicit release approval and network access.

## Source Of Truth Checks

- Service boundary: `service.yaml`
- Package metadata: `package.json`
- Token source: `tokens/zdp.tokens.json`
- Web token CSS: `src/styles/tokens.css`
- Package build/check scripts: `scripts/build-package.ts`, `scripts/check-package.ts`, `scripts/check-publish-readiness.ts`
- Release workflow: `.github/workflows/publish-npm.yml`, `scripts/check-release-workflow.ts`
- Token/share generators: `scripts/generate-tokens.ts`, `scripts/generate-share.ts`
- Consumer contract docs: `docs/CONSUMER_CONTRACT.md`
- External UI rules: `docs/EXTERNAL_UI_ADOPTION.md`, `docs/INTERACTIVE_PRIMITIVE_AUDIT.md`, `THIRD_PARTY_NOTICES.md`
- Storybook and preview surfaces: `.storybook/**`, `stories/**`, `preview/**`
- Consumer fixtures: `fixtures/**`

## Forbidden Drift Checks

- Public package exports must not point at `src/**`.
- Component CSS must not introduce raw product-specific colors, raw spacing, unreviewed z-index numbers, or unmanaged viewport units.
- `preview:check` invokes `styles:parity:check`, which requires every Svelte component interaction-state selector plus every conditional `@media`, `@supports`, `@container`, `@scope`, and `@starting-style` selector and declaration to remain represented under the same conditional context in `src/styles/components.css`, while allowing shared utility-only selectors.
- UI primitives must not own authorization, billing, identity, consent, admin, routing, data fetching, search execution, ads policy, or locale fallback truth.
- External UI dependency types, Tailwind/shadcn class contracts, or copied proprietary snippets must not leak into public API.
- Storybook, preview, fixtures, package metadata, and docs must not contradict the same token or component contract.

## Version Impact

`package.json` version is the package version source. `docs/**`, `README.md`, `CHANGELOG.md`, `SECURITY.md`, `THIRD_PARTY_NOTICES.md`, `dist/**`, and package metadata are included in the package surface. Changes to those files require package version impact review. Source-only agent docs under `.agents/**`, `CHECKLIST.md`, `VALIDATION.md`, and `AGENTS.md` are not part of the current package `files` allowlist.
