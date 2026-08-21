# VALIDATION.md

이 문서는 `zdp-design-system` 변경 후 확인할 기준을 모은다. 실행 권한은 mustflow command contract가 소유한다.

## Configured Validation

| Change scope | Check |
| --- | --- |
| tokens, CSS, components, stories, preview, fixtures, package readiness | `zdp_design_system_package_verify` |
| browser accessibility semantics, responsive geometry, forced colors, and keyboard focus order | `zdp_design_system_browser_accessibility_check` |
| high-risk component geometry and theme rendering | GitHub Actions advisory gate backed by `scripts/check-visual-regressions.mjs` |
| Storybook static build or bundle evidence | `zdp_design_system_bundle_analyze` |
| npm package contents or release readiness | `zdp_design_system_npm_pack_dry_run` |
| repository architecture contract | `zdp_architecture_validate_design_system_repository` |
| architecture catalog or linter rule changes | `zdp_architecture_validate_fast` |
| docs-router-only changes outside packaged `docs/**` | `docs_validate_fast` |

`zdp_design_system_install_frozen` is needed only when dependencies are missing or package metadata changes require dependency installation. Publish dry-run and public publish intents remain gated by explicit release approval and network access.

Package-size enforcement is a CI guard that runs after package verification has already built `dist`. `scripts/check-package-size.ts` packs that exact working-tree surface, enforces `.github/package-size-budget.json`, and emits Markdown plus JSON evidence. It first compares with the published package at the same version and falls back to the latest published version. Registry or baseline failure never disables the absolute limits unless `baseline.required` is explicitly enabled.

## Source Of Truth Checks

- Service boundary: `service.yaml`
- Package metadata: `package.json`
- Public package surface manifest: `scripts/public-surface.ts`
- Generated public surface: `src/lib/index.ts`, the `package.json` `exports` field, and `docs/PUBLIC_SURFACE.md`; `bun run surface:check` rejects drift
- Token source: `tokens/zdp.tokens.json`
- Web token CSS: `src/styles/tokens.css`
- Package build/check scripts: `scripts/build-package.ts`, `scripts/check-package.ts`, `scripts/check-publish-readiness.ts`
- Package-size budget and reporting: `.github/package-size-budget.json`, `scripts/check-package-size.ts`, `scripts/package-size/**`, `.github/workflows/design-system.yml`
- Atomic package-build regression: `scripts/check-package-build.ts` verifies rollback after promotion failure, interrupted-swap recovery, cleanup, and direct exported declaration preservation.
- Release preparation: `.changes/**`, `.github/workflows/release-pr.yml`, `scripts/release-changes.ts`
- Release publishing: `.github/workflows/publish-npm.yml`, `scripts/check-release-workflow.ts`
- Token/share generators: `scripts/generate-tokens.ts`, `scripts/generate-share.ts`
- Consumer contract docs: `docs/CONSUMER_CONTRACT.md`
- External UI rules: `docs/EXTERNAL_UI_ADOPTION.md`, `docs/INTERACTIVE_PRIMITIVE_AUDIT.md`, `THIRD_PARTY_NOTICES.md`
- Storybook and preview surfaces: `.storybook/**`, `stories/**`, `preview/**`
- Targeted visual regression surface: `scripts/check-visual-regressions.mjs`, `.github/workflows/design-system.yml`, `tests/visual/README.md`
- Consumer fixtures: `fixtures/**`

## Targeted Visual Regression

The visual gate deliberately covers only surfaces where CSS drift is expensive to spot manually: light and dark form controls, an open Combobox, an open Menu, Dialog, Sheet, and the mobile light Theme / Locale Stress fixture. It does not capture every Storybook story.

For each pull request, GitHub Actions checks out the exact base SHA in a temporary worktree and builds both base and head Storybooks on the same hosted runner. The checker captures ephemeral expected images from the base build and immediately compares the head build against them. PNG baselines are not committed, so approved visual changes do not create snapshot-update churn in the repository.

The capture context fixes the viewport, device scale factor, locale, timezone, color scheme, and reduced-motion preference. Animation, transitions, smooth scrolling, and caret rendering are disabled. A pinned Noto Sans KR stylesheet is loaded before capture so Korean text does not depend on the runner image. External browser requests are blocked except for the pinned jsDelivr font host.

A pixel is considered changed only when a channel differs by more than 20. A case reports a mismatch when more than 0.1% of pixels change or its dimensions change. Each mismatched case records `failure.txt` and, where available, `expected.png`, `actual.png`, and `diff.png` under `reports/visual-regression/`.

The GitHub Actions step starts as advisory through `continue-on-error`. A mismatch uploads the `targeted-visual-regression-report` artifact and emits a workflow warning without blocking unrelated delivery. Promote the step to blocking only after repeated stable runs on the hosted runner.

For local diagnosis, build Storybook and capture temporary expected images with `node scripts/check-visual-regressions.mjs --update`. Rebuild after the candidate change, then run `node scripts/check-visual-regressions.mjs` to compare it. The local images are written to `tests/visual/__snapshots__/`; that directory is ignored and must not be committed.

## Forbidden Drift Checks

- Public component names, root-barrel exports, package subpaths, and generated public-surface documentation must agree with `scripts/public-surface.ts`.
- Brand and credit asset package subpaths must derive from the `packagePath` values in `src/lib/brand-assets.ts` and `src/lib/credit-assets.ts`.
- Public package exports must not point at `src/**`.
- Component CSS must not introduce raw product-specific colors, raw spacing, unreviewed z-index numbers, or unmanaged viewport units.
- `preview:check` invokes `styles:parity:check`, which requires every Svelte component interaction-state selector plus every conditional `@media`, `@supports`, `@container`, `@scope`, and `@starting-style` selector and declaration to remain represented under the same conditional context in `src/styles/components.css`, while allowing shared utility-only selectors.
- UI primitives must not own authorization, billing, identity, consent, admin, routing, data fetching, search execution, ads policy, or locale fallback truth.
- External UI dependency types, Tailwind/shadcn class contracts, or copied proprietary snippets must not leak into public API.
- Storybook, preview, fixtures, package metadata, and docs must not contradict the same token or component contract.
- Generated release pull requests must not publish packages, create tags, request OIDC, or bypass the explicit human review gate.
- Published-package deltas are informational and must not become an automatic regression threshold. Only reviewed absolute limits block CI.
- Do not raise package-size limits merely to silence a failure. Explain the new public surface or asset growth in the pull request before changing a limit.

## Version Impact

`package.json` version is the package version source. `docs/**`, `README.md`, `CHANGELOG.md`, `SECURITY.md`, `THIRD_PARTY_NOTICES.md`, `dist/**`, and package metadata are included in the package surface. Changes to those files require package version impact review. Source-only agent docs under `.agents/**`, `CHECKLIST.md`, `VALIDATION.md`, and `AGENTS.md` are not part of the current package `files` allowlist.

Consumer-visible package changes and release-tooling changes add one validated `.changes/*.md` fragment. The generated release pull request applies the highest requested bump and consumes those fragments; it cannot replace explicit review of the resulting version and changelog.

Source-text checks may protect public exports, semantic markup, stable CSS hooks, token names, generated assets, and package metadata. They must not require a particular private function name or event implementation when a configured Chromium, SSR, hydration, or type contract already verifies the behavior. Focus movement, pointer capture, dismissal, controlled-state transitions, and focus restoration belong in runtime regression checks.
