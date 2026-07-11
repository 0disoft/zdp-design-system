# zdp-design-system Runbook

This repository owns design tokens, shared CSS entries, share icon helpers, Svelte component package boundaries, Storybook review surfaces, preview checks, and consumer fixtures. It must not become a product screen repository, routing layer, auth or billing decision point, translation catalog, ad policy owner, or generated app shell.

## Normal Checks

- Use the configured mustflow intent `zdp_architecture_validate_design_system_repository` for repository architecture validation.
- Use the configured mustflow intent `zdp_design_system_package_verify` for token generation checks, consumer contract checks, share icon checks, preview checks, Storybook configuration checks, accessibility gates, Svelte type checks, package build, package surface checks, publish-readiness checks, and consumer fixtures.
- Use `zdp_design_system_browser_accessibility_check` for real Chromium region semantics and keyboard focus-order evidence.
- Use `zdp_design_system_bundle_analyze` when Storybook stories, Storybook configuration, bundle-sensitive package exports, or visual review surfaces change.
- Use `zdp_design_system_npm_pack_dry_run` before package file surface review or release preparation.
- Use `zdp_design_system_npm_publish_dry_run` only for approved publish-readiness dry runs; it is not a publish command.
- Do not run raw Bun, Storybook, npm, browser server, package publish, or dependency install commands as agent verification unless the root command contract exposes them as eligible mustflow intents.

## Token And CSS Response

If token checks fail, treat `tokens/zdp.tokens.json` as the source of truth and verify the generated CSS/token name surfaces before changing components. Do not patch generated package output by hand. Token names must stay role-based, and color tokens need both hex fallback and OKLCH override coverage.

If CSS checks fail, keep shared entries separate: `styles.css`, `brand-fonts.css`, `expressive-fonts.css`, and `locale-fonts.css` have different consumer costs. Do not fold optional font entries into the base stylesheet unless the package contract and consumer fixtures are updated together.

## Component Response

If a component contract fails, first identify whether the failure is public API, accessibility, styling token use, Storybook coverage, preview coverage, or consumer fixture coverage. Components provide frames, accessible state, event surfaces, and layout primitives only. Authorization, billing, identity, consent, admin decisions, routing, data fetching, search execution, ads policy, and locale fallback remain in consuming apps.

If a user-visible label or default text changes, verify that consumers can override the label, placeholder, aria label, empty state, and dismissal text where applicable. Implementation descriptions must not leak into component text.

## Storybook, Preview, And Fixtures

Storybook is the primary visual review surface, but agents must not start the dev server from this runbook. Static Storybook builds and bundle evidence go through `zdp_design_system_bundle_analyze`.

The static preview proves shared CSS and core token/component surfaces without a dev server. Consumer fixtures must use public package exports and shared tokens instead of raw colors, raw pixel spacing, unmanaged z-index numbers, or raw viewport units.

## Package And Release Boundary

Package exports must point at `dist/**`; consumers must not deep import `src/**`. The package file allowlist includes `dist/`, `docs/`, `README.md`, `LICENSE`, `CHANGELOG.md`, `SECURITY.md`, and `THIRD_PARTY_NOTICES.md`. Changes to packaged docs or package metadata require version impact review before release preparation.

Publishing is never implied by a green package check. Release preparation needs package verification, package dry run, publish dry run when approved, changelog review, and explicit publish approval before the public publish intent is eligible.
The tag-triggered publish workflow uses npm trusted publishing with GitHub Actions OIDC and does not use a long-lived publish token. Before the first release, configure the `zdp-design-system` package's npm Trusted Publisher as GitHub Actions with organization `0disoft`, repository `zdp-design-system`, workflow filename `publish-npm.yml`, and allowed action `npm publish`. The workflow requires a GitHub-hosted runner and `id-token: write`; the package `repository.url` must keep matching this repository exactly.
Release workflow actions are pinned to full upstream commit SHAs; the adjacent major-version comments are update hints, not executable references. Review the upstream commit and rerun the release checks before changing a pin.
The GitHub Release is created with the exact npm tarball and `release-artifact.json`, which records package identity, version, tag commit, tarball filename, and SHA-512 integrity. A rerun downloads both immutable assets and compares their bytes with the rebuilt artifact; it never clobbers an existing release asset.

## Failure Response

If package verification fails, freeze downstream consumer adoption until the token, component, fixture, or package surface drift is fixed.

If Storybook or accessibility gates fail, do not hide the failure by removing stories, disabling controls, weakening addon settings, or moving the component out of the review surface. Fix the component, token, story, or documented boundary that owns the failing behavior.

If an external UI reference introduces public API drift, copied proprietary snippets, Tailwind or shadcn structural leakage, or third-party notice gaps, stop adoption until `docs/EXTERNAL_UI_ADOPTION.md`, `docs/INTERACTIVE_PRIMITIVE_AUDIT.md`, and `THIRD_PARTY_NOTICES.md` agree with the implementation.
