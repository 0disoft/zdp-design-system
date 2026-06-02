# Changelog

## 0.26.0

- Added layout composition primitives: `Grid` and `Toolbar`.
- Added static `.zdp-grid` and `.zdp-toolbar` utility classes for Astro and non-Svelte consumers.
- Added Storybook and static preview coverage for responsive card grids and action toolbars.
- Strengthened package, Storybook, preview, and consumer contract checks so layout composition primitives stay responsive, flat, and free of product-owned decisions.

## 0.25.0

- Added data display primitives: `Table`, `KeyValue`, and `EmptyState`.
- Added static `.zdp-table`, `.zdp-key-value`, and `.zdp-empty-state` utility classes for Astro and non-Svelte consumers.
- Added Storybook and static preview examples for operational tables, repository boundary facts, and empty roadmap states.
- Strengthened package, Storybook, preview, and consumer contract checks so data display primitives stay semantic, responsive, flat, and free of product-owned data decisions.

## 0.24.0

- Strengthened form accessibility props for `Input`, `Select`, and `Textarea` so help and error text can be connected with multiple `aria-describedby` ids.
- Added `errorMessageId` support for invalid text controls so consumers can wire `aria-errormessage` without hand-editing markup.
- Added screen-reader required text to `Label`, live-region support to `ErrorText`, and field-level required, readonly, disabled, and invalid state markers.
- Updated Storybook form examples and contract checks so required, readonly, invalid, and disabled states stay visible in light and dark themes.

## 0.23.0

- Added layout primitives: `Page`, `Container`, `Section`, and `PageHeader`.
- Added static `.zdp-page`, `.zdp-container`, `.zdp-section`, and `.zdp-page-header` utility classes for Astro and non-Svelte consumers.
- Added a focused Storybook layout story and static preview coverage so page width, section rhythm, header actions, and flat layout rules stay aligned.
- Strengthened package, Storybook, preview, and consumer contract checks so layout primitives stay exported, documented, compiled, responsive, and free of decorative effects.

## 0.22.0

- Added readonly state support to `Input` and `Textarea`.
- Added static readonly styling for `.zdp-input[readonly]` and `.zdp-textarea[readonly]`.
- Updated Storybook, preview, and contract checks so readonly controls stay focusable, flat, and visually distinct from disabled controls.
- Added focused Storybook stories for Button/IconButton states and form control states.
- Added focused Storybook stories for navigation and feedback surfaces.
- Added a focused Storybook story for Tabs and Dialog interaction states.
- Centered tab labels with explicit inline-flex alignment so tab controls keep stable vertical and horizontal placement.
- Added native action and aria linkage props to Button, IconButton, and Dialog examples so consumers can wire interaction state without raw button class fallbacks.
- Strengthened Button and IconButton stories so action handlers, described-by status text, expanded state, and pressed state stay covered by Storybook contract checks.
- Relaxed Storybook and preview heading line-height to the shared title token so large labels avoid vertical clipping.

## 0.21.0

- Added `Divider` for shared flat separators without page-layout ownership.
- Added static `.zdp-divider` utility classes for Astro and non-Svelte consumers.
- Strengthened package, Storybook, preview, and consumer contract checks so Divider stays exported, documented, compiled, semantic when needed, and free of decorative effects.

## 0.20.0

- Added `Inline` for shared horizontal wrapping flow without product-specific layout decisions.
- Added static `.zdp-inline` utility classes for Astro and non-Svelte consumers.
- Strengthened package, Storybook, preview, and consumer contract checks so Inline stays exported, documented, compiled, and free of decorative effects.

## 0.19.0

- Added `Stack` for shared vertical spacing without product-specific layout decisions.
- Added static `.zdp-stack` utility classes for Astro and non-Svelte consumers.
- Strengthened package, Storybook, preview, and consumer contract checks so Stack stays exported, documented, compiled, and free of decorative effects.

## 0.18.0

- Added `VisuallyHidden` for shared screen-reader-only text without product-specific CSS copies.
- Added static `.zdp-visually-hidden` utility coverage for Astro and non-Svelte consumers.
- Strengthened package, token, Storybook, preview, and consumer contract checks so hidden accessible text stays exported, compiled, documented, and free of decorative effects.

## 0.17.0

- Added `SkipLink` for shared keyboard-first page bypass navigation with sunlit focus highlighting.
- Added SkipLink examples to Storybook and the static preview.
- Strengthened package, token, Storybook, preview, and consumer contract checks so skip links stay exported, compiled, documented, and free of decorative effects.

## 0.16.0

- Added `Link` for shared text navigation with hover color changes and sunlit focus highlighting.
- Added light and dark link examples to Storybook and the static preview.
- Strengthened package, token, Storybook, preview, and consumer contract checks so link stays exported, compiled, documented, and free of decorative effects.

## 0.15.0

- Added `Breadcrumb` for accessible page-location trails with `nav`, ordered list markup, link items, separators, and `aria-current="page"`.
- Added light and dark breadcrumb examples to Storybook and the static preview.
- Strengthened package, token, Storybook, preview, and consumer contract checks so breadcrumb stays exported, compiled, documented, and free of decorative effects.

## 0.14.0

- Added `Dialog` for accessible modal layers with backdrop close, Escape close, focus restoration, focus trap, and labelled dialog semantics.
- Added light and dark dialog examples to Storybook and the static preview.
- Strengthened package, token, Storybook, preview, and consumer contract checks so the dialog surface stays exported, compiled, documented, and free of decorative effects.

## 0.13.0

- Added `docs/CONSUMER_CONTRACT.md` to pin Astro, Svelte, Tauri, Flutter, and native token consumption boundaries.
- Added `consumer:check` so package metadata, README, contributing rules, service policy, token JSON, and public component exports stay aligned with the consumer contract.
- Included `docs/` in the package file surface so the consumer contract ships with reviewed package artifacts.

## 0.12.0

- Added `Tabs` for accessible in-page section switching with keyboard arrow, Home, and End navigation.
- Added light and dark tab examples to Storybook and the static preview.
- Strengthened package, token, Storybook, and preview checks so the tab structure stays exported, compiled, and focus-visible.

## 0.11.0

- Added shared feedback components: `Badge` for compact statuses and `Callout` for inline information, warning, and danger messages.
- Added light and dark feedback examples to Storybook and the static preview.
- Strengthened package, token, Storybook, and preview checks so feedback components stay exported, compiled, and free of decorative effects.

## 0.10.0

- Added shared choice controls for product forms: `Checkbox`, `Radio`, and `Switch`.
- Added light and dark choice-control examples to Storybook and the static preview.
- Strengthened package, token, Storybook, and preview checks so choice controls stay exported, compiled, focusable, and free of decorative effects.

## 0.9.0

- Added the first shared form component set: `Field`, `Label`, `Input`, `Textarea`, `Select`, `HelpText`, and `ErrorText`.
- Added light and dark form examples to Storybook and the static preview, including help text and invalid states.
- Strengthened package, token, Storybook, and preview checks so the new form public surface stays exported and visually aligned.

## 0.8.1

- Added package artifact validation for export targets, package files, and CSS side-effect entries.
- Added Svelte compile validation for shared components and the Storybook overview surface.
- Included package validation in the default `bun run check` contract.

## 0.8.0

- Added accessible focus color tokens for sunlit gold focus surfaces, dark focus text, and dark focus lines.
- Added shared control focus width tokens for outline, offset, and link underline states.
- Updated links, inputs, buttons, and icon buttons to use the same high-visibility keyboard focus contract.
- Added focus examples to Storybook and the static preview so link and search input focus can be reviewed with the Tab key.
- Strengthened token, preview, and Storybook checks for the focus contract.

## 0.7.0

- Added an optional `zdp-design-system/locale-fonts.css` package export for explicit Latin, Chinese, and Devanagari webfont loading.
- Kept the default `styles.css` path Pretendard-first so consumers can avoid heavy non-Korean locale font loads unless they opt in.
- Strengthened package export and side-effect checks for the optional locale font CSS surface.

## 0.6.8

- Added language-specific font family tokens for Latin, Korean, Chinese, Devanagari, and multiscript surfaces.
- Added `:lang(en/es/fr/ko/zh/hi)` CSS overrides so shared surfaces can switch font stacks without product-specific CSS.
- Updated preview, Storybook, and token checks to keep the multiscript typography contract synchronized.

## 0.6.7

- Loaded Pretendard Variable dynamic subset from the shared CSS token entry and moved sans/display stacks to `"Pretendard Variable", Pretendard`.
- Increased body, body-small, label, caption, data, and supporting font-size tokens by one step for better balance against larger headings.
- Changed button labels from semibold to medium weight.

## 0.6.6

- Added a shared 2px control border width token for framed action controls.
- Normalized Button and IconButton hover states so light and dark themes change background and border consistently.
- Strengthened preview and Storybook checks for the framed-control hover contract.

## 0.6.5

- Reduced shared core component radius from 0.5rem to 0.375rem for a more squared-off control shape.
- Updated token checks and contribution docs to keep buttons, icon buttons, surfaces, Storybook, and preview panels closer to rectangular forms.

## 0.6.4

- Clarified semantic state color roles for success, warning, and danger tokens.
- Added flat active-state contracts for buttons and icon buttons without motion, shadows, or gradients.
- Extended type tokens with body small, caption, and data text roles for product dashboards and detail surfaces.
- Strengthened preview and Storybook checks for compact type tokens and active component states.

## 0.6.3

- Tightened the flat UI contract with a 0.5rem shared radius ceiling for core components and previews.
- Changed default body line-height tokens to 1.6 for calmer reading rhythm without decorative separation.
- Added checks that reject pill-radius usage in shared components, Storybook overview, and static preview surfaces.

## 0.6.2

- Softened destructive button styling in light and dark themes so danger actions read as lower-emphasis outlines.
- Smoothed raised surface gold gradients to avoid hard visual cutoffs in compact cards.
- Normalized swatch labels so color names do not look like links in dark theme previews.
- Added underline-free link defaults with hover color transitions inside design-system surfaces.
- Replaced button lift-and-shadow hover motion with flat color and border-state changes.
- Changed default and display typography to a Pretendard-first sans-serif stack while keeping serif available as an explicit token.
- Removed decorative gradients and shadows from shared buttons, icon buttons, surfaces, Storybook, and static preview panels.
- Documented the flat UI contract and centralized checks that reject decorative gradients, shadows, sheen pseudo-elements, and hover movement in shared surfaces.

## 0.6.0

- Added foundation token groups for typography roles, responsive breakpoints, control metrics, and i18n-safe text behavior.
- Added CSS variables for `type`, `breakpoint`, `control`, and `i18n` token groups.
- Updated button and icon button sizing to consume shared control metric tokens.
- Added Storybook and static preview foundation token review surfaces.
- Strengthened token, preview, and Storybook checks for the new foundation contract.

## 0.5.0

- Changed the core visual language to a bright medieval watercolor palette.
- Updated light and dark CSS variables to use parchment, dusty blue, sage, sunlit gold, burgundy, and terracotta tones.
- Added serif and display font family tokens for parchment-style text and titles.
- Updated shared button, icon button, and surface styles to use parchment panels, heraldic accents, and softer watercolor depth.
- Refreshed Storybook and static preview examples for the new visual direction.
- Refined light glow, dark action hierarchy, button sizing, swatch labels, and OKLCH badge tone.

## 0.4.0

- Changed color tokens to carry both `hex` fallback and `oklch` values.
- Added OKLCH CSS variable overrides behind `@supports`.
- Added Storybook Svelte/Vite configuration and scripts.
- Added a Storybook design system overview story for visual review.
- Added `dev` and `build` package script entrypoints for Workduck repository actions.
- Added a static browser preview page for visual feedback.
- Added a shared style entry that includes token and component CSS.
- Strengthened `tokens:check` to verify color token shape and CSS fallback/override alignment.
- Added preview and Storybook contract checks to the default `check` script.

## 0.2.0

- Added the first token source in `tokens/zdp.tokens.json`.
- Added CSS custom properties in `src/styles/tokens.css`.
- Added initial Svelte package exports for `Button`, `IconButton`, and `Surface`.
- Added `tokens:check` to keep token JSON, CSS variables, and public exports aligned.

## 0.1.0

- Initial repository baseline for ZDP design tokens and UI package boundaries.
