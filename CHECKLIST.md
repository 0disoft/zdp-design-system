# CHECKLIST.md

이 저장소는 ZDP 디자인 토큰, shared CSS, share icon helpers, Svelte component package surface, Storybook/preview QA 표면을 소유한다. 작업 전 변경 대상이 token, component, package export, storybook, fixture, external UI adoption, release boundary 중 어디인지 먼저 고른다.

## Common Boundary

- Product-specific screens, marketing copy, routing, SEO, translation catalogs, auth, billing, identity, consent, admin decisions를 소유하지 않는다.
- Component text defaults may exist, but consuming products must be able to override user-facing labels, placeholders, aria labels, empty text, and dismiss text.
- Public API, CSS token names, class names, DOM exposure policy are ZDP-owned. External UI library types or Tailwind/shadcn structure must not leak into package surface.
- Accessible defaults are mandatory for focus, contrast, hit targets, reduced motion, semantic markup, keyboard movement, and screen reader names.

## Token And CSS Surface

- `tokens/zdp.tokens.json` is the token source.
- `src/styles/tokens.css` and generated token name surfaces must match token JSON.
- Colors need both hex fallback and OKLCH override.
- Role names such as `primary`, `surface`, `line`, `danger` are preferred over product or campaign names.
- `styles.css`, `brand-fonts.css`, `expressive-fonts.css`, and `locale-fonts.css` stay separate optional entries.

## Component Surface

- Package exports must point at `dist/**`.
- Consumers must not deep import `src/**`.
- Components provide frame, accessibility, state affordance, and event surfaces only.
- Authority decisions such as deletion, permissions, billing, search execution, routing, data fetching, ads policy, and locale fallback stay in consuming apps.
- New component props need story, fixture, type, package, and docs impact review.

## Storybook, Preview, And Fixtures

- Storybook is the review surface for component states and accessibility.
- Static preview proves shared CSS and core token/component surfaces without a dev server.
- Consumer fixtures must use public package exports and shared tokens instead of raw colors, px, z-index numbers, or raw viewport units.
- A11y addon stays an error gate.

## External UI Adoption

- Bits UI and shadcn-svelte are reference and test candidates, not package API owners.
- Skeleton, Flowbite Svelte, daisyUI, SmoothUI, Tailwind Plus, and Tailwind UI remain constrained by `docs/EXTERNAL_UI_ADOPTION.md`.
- Copying, porting, runtime dependency adoption, and third-party notices must be reviewed before merge.

## Manual Gates

- Package release requires explicit approval and publish-specific mustflow intents.
- Broad token or component API changes require consumer impact review.
- Docs under `docs/**` are included in the package files allowlist, so changing them requires package version impact review.
