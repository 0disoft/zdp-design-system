# Changelog

## Unreleased

- No unreleased changes.

## 0.46.5

- Pinned every release workflow action to a verified upstream commit SHA so mutable action tags cannot change code executed with npm OIDC and release permissions.
- Replaced the missing long-lived npm publish token dependency with GitHub Actions OIDC trusted publishing and an exact repository identity contract.
- Packed once per release and verified the published registry integrity against that exact tarball so validation and publication cannot diverge.
- Aligned packaged standalone-consumer guidance with the release version instead of pointing new consumers at the older `^0.46.3` range.
- Added a tag-triggered release workflow that verifies the package, publishes with npm provenance, verifies the exact registry version, and creates the matching GitHub Release.
- Pinned the Bun release toolchain and bounded tag publishing with per-tag concurrency and a 20-minute job timeout.
- Bound reruns and post-publish verification to npm's immutable `gitHead` so moved or mismatched release tags cannot create a misleading GitHub Release.
- Bumped the package contract to `0.46.4` and added a real Chromium accessibility regression gate for Card region semantics and keyboard focus order instead of treating Storybook addon configuration as runtime proof.
- Bumped the package contract to `0.46.3`, made Card a clearly non-interactive container with labelled regions only, and added automatic public-component compilation plus Storybook and consumer fixture coverage for Card and CardHeader.
- Bumped the package contract to `0.46.2`, added `SECURITY.md` to the public npm package surface, and documented `^0.46.2` as the default semver range for standalone consumers and public examples.
- Raised the Svelte peer dependency floor to `^5.56.0` and bumped the package contract to `0.46.0` so downstream Svelte 5 consumers use the same compiler/runtime floor as the generated package surface.
- Added layer and mobile-safe viewport tokens, then moved overlay z-index and `100vh`/`100vw` sizing to named token usage across Svelte components and static utilities.
- Strengthened package checks for overlay token usage and overrideable default labels.
- Documented that repeated mobile keyboard, long option, async option, grouped option, virtualized list, or collision pressure should move Menu, Popover, and Combobox flows to Sheet or a headless spike.
- Added `AdSlot` plus static `.zdp-ad-slot` utilities for provider-neutral ad or sponsorship placement reservation while keeping provider scripts, consent, slot ids, `ads.txt`, personalized ads, and automatic content insertion in consuming apps.
- Documented the dependency adoption policy: active ZDP sibling consumers may keep `file:../zdp-design-system`, while standalone consumers, public templates, and external examples should use the npm package from `^0.46.0`.
- Added a single-component consumer fixture proof so the root barrel keeps tree-shaking unused component exports out of Button-only bundles.
- Strengthened consumer fixture checks so examples fail on raw color literals, pixel sizing, z-index numbers, and raw `100vh`/`100vw` viewport sizing instead of bypassing shared tokens.

## 0.43.8

- Added a publish-readiness check for package metadata, export targets, dist entries, and packaged public documents before npm release work.
- Hardened the npm package root export with generated `dist/index.js` and `dist/index.d.ts` entries instead of a TypeScript source entry.
- Changed component default user-facing text from Korean to English.
- Added `svelte-check` type validation to the package check chain.
- Replaced the design token `$schema` URL with a repo-local schema that is copied into package artifacts.
- Added MIT license metadata and package checks so public repository readiness keeps an explicit redistribution grant.
- Fixed Switch invalid-state accessibility so the native switch input exposes `aria-invalid` and can wire `errorMessageId` to `aria-errormessage`.
- Added Escape dismissal to `Tooltip` and aligned `_blank` link defaults on `Link` and `StatusToast` to `noopener noreferrer`.
- Optically centered the dark-mode moon glyph in `ThemeToggle` so it aligns visually with the sun glyph while keeping the same control frame.
- Added `LocaleSwitcher` plus static `.zdp-locale-switcher` utilities for locale preference controls while keeping message catalogs, routing, fallback locale, root language, storage, and user preference policy in consuming apps.
- Added `TextScaleControl` plus static `.zdp-text-scale-control` utilities for reader text-size preference controls while keeping document root scaling, storage, locale compensation, and user preference policy in consuming apps.
- Strengthened `CommandField` with shortcut, autocomplete, result-linkage, and keydown passthrough plus `InteractionProbe` coverage for consumer-owned command results.
- Fixed controlled `Combobox` Escape dismissal so filtered no-result text restores the selected label through `onQueryChange` while preserving the hidden submitted value.
- Strengthened Select and Combobox Storybook play coverage for invalid error linkage, native select value changes, consumer-owned combobox filtering, empty results, `aria-controls` cleanup, Escape restoration, and hidden submitted values.
- Fixed the generated package surface so Svelte/Vite consumers can type-check public component exports without `.ts` import-extension or loose HTML attribute type failures.
- Added `Sheet` as a shared right, left, and bottom modal edge panel primitive for settings, filters, and drawer-style auxiliary flows while keeping save, permission, data fetch, and routing decisions in consuming apps.
- Added `Combobox` as a searchable single-select primitive with listbox keyboard navigation, disabled option skipping, hidden submitted value support, and consumer-owned filtering/search/permission boundaries.
- Hardened `InteractionProbe` coverage for `Menu` and `Popover` keyboard, focus return, Escape close, and outside close contracts.
- Added an interactive primitive audit for Select, CommandField, Tooltip, Dialog, TermSheet, Menu, and Popover so headless dependency spikes happen only after concrete focus, keyboard, overlay, or collision requirements repeat.
- Added external UI adoption and third-party notice contracts so shadcn-svelte, Bits UI, Skeleton, Flowbite, daisyUI, Ark UI, Motion, SmoothUI, and Tailwind Plus-style sources are handled through explicit reference, porting, dependency, and prohibition rules.
- Switched package exports to generated `dist/` artifacts and added a Svelte/Vite consumer fixture so public imports are checked before release.
- Added token and share icon generation scripts for `zdpTokenNames`, `share.js`, and `share.d.ts` to keep generated consumer artifacts aligned with their source files.
- Promoted Storybook addon-a11y to the `error` gate and added CI coverage for `bun run check` and `bun run build`.
- Added a shared modal layer helper for `Dialog` and `TermSheet` so modal scroll locking and layer markers stay consistent.
- Hardened token/package checks so `zdpTokenNames`, share dock type declarations, Button label weight, and shared focusability behavior cannot drift from the public contract.
- Fixed `Tooltip` to generate a stable fallback tooltip id and wired `ShareDock` triggers to the slot-provided `aria-describedby` value when visual tooltips are enabled.
- Shared dialog focusable-element detection between `Dialog` and `TermSheet` without relying on `offsetParent`, so fixed-position and transformed controls stay reachable by keyboard.
- Fixed `Table` overflow wrappers so they no longer reserve a permanent scrollbar gutter that can leave a mismatched stripe beside header rows.
- Aligned `TermTrigger` with inline interactive text guidance by keeping text selectable, preserving inherited text color on hover, and reserving subtle inline padding.
- Added exported shortcut policy helpers for consumer-owned keydown dispatchers so apps can ignore text entry, IME composition, and browser-reserved shortcuts before wiring visible `Kbd` or `ShortcutHint` affordances.
- Added `ThemeToggle` plus static `.zdp-theme-toggle` utilities for light/dark mode controls while keeping initial theme selection, storage, system preference, and SSR paint decisions in consuming apps.
- Added `TermTrigger`, `TermSheet`, and matching static `.zdp-term-*` utilities for click-open glossary explanations with right/bottom sheet placement, backdrop/Escape close, focus handling, and an explicit `data-zdp-ad-exclude` boundary while keeping glossary manifests, locale fallback, routing, monetization, and detail-page decisions in consuming apps.
- Strengthened `TermSheet` with stable term identity data attributes and more reliable focusable-element detection so glossary QA, linter checks, and keyboard focus behavior stay aligned.

## 0.41.10

- Fixed Storybook a11y addon findings for Data Display, Feedback, Interaction, and Overview by giving scrollable CodeBlock regions unique focusable labels, removing repeated toolbar/disclosure landmarks, using valid Toast live-region elements, and moving decorative sort/menu glyph text into CSS pseudo content.
- Added optional `ariaLabel` passthrough on `Button` so icon-like Button usage can expose an accessible name without switching primitives.

## 0.41.9

- Added the optional `expressive-fonts.css` public export and `font.family.expression*` token stacks for Tangerine, Caesar Dressing, Google Sans, Merriweather, Fredericka the Great, Copse, Cabin, and Libertinus Keyboard without changing default product typography.

## 0.41.8

- Increased `.zdp-brand-wordmark` to the shared `medium` font weight so the Playwrite AU VIC Guides wordmark keeps a sturdier brand stroke in Storybook, static preview, and locale reset surfaces.

## 0.41.7

- Fixed `Pagination` horizontal scroll surfaces so focus outlines keep their top and bottom edges visible in Theme / Locale Stress and narrow overflow containers.

## 0.41.6

- Fixed `.zdp-brand-wordmark` so it keeps the Playwrite AU VIC Guides brand stack inside `.zdp-surface-reset` locale surfaces, including Korean pages where `:lang(ko)` switches normal content back to Pretendard.

## 0.41.5

- Fixed the Theme / Locale Stress story so table, pagination, and code examples keep fixed-format content on horizontal scroll surfaces instead of breaking Korean, Chinese, Hindi, and code strings into one-character columns.
- Added touch-friendly horizontal overflow contracts for `Table`, `Pagination`, and `CodeBlock` while keeping readable table cells and code text selectable.
- Updated `TableToolbar` wrapping so narrow embedded review frames collapse actions by component width instead of relying only on viewport media queries.

## 0.41.4

- Added the optional `brand-fonts.css` public export and `font.family.brand` token for the `8ailors` Playwrite AU VIC Guides wordmark without replacing Pretendard-first product typography.
- Added `.zdp-brand-lockup`, `.zdp-brand-lockup__mark`, and `.zdp-brand-wordmark` utilities plus Storybook/static preview wordmark coverage.
- Updated the token document to `0.6.9` and aligned token, preview, Storybook, package, and consumer checks with the brand font contract.

## 0.41.3

- Added scoped text-selection behavior utilities and control/decorative `user-select: none` coverage while keeping document, data, table cell, toast body, and code text selectable.
- Documented the rule that drag surfaces should use `.zdp-user-select-dragging` only while drag is active, never as a broad page/root selection block.

## 0.41.2

- Added themed text selection tokens and shared `::selection` styling so dragged text inside ZDP surfaces uses the parchment selection surface instead of the browser-default blue highlight.
- Updated the token document to `0.6.8` and aligned token, preview, Storybook, and consumer checks with the themed text selection contract.

## 0.41.1

- Added a `Design System/QA/Theme Locale Stress` Storybook surface for light/dark, narrow mobile width, long Korean, English, Chinese, and Hindi text, and forced focus-ring review without adding a new public component API.

## 0.41.0

- Added `InlineCode` and `CodeBlock` primitives plus static `.zdp-inline-code` and `.zdp-code-block` utilities for document, security, and architecture code snippets with optional copy feedback while keeping syntax highlighting, code execution, secret scanning, security classification, and command-palette behavior in consuming apps.

## 0.40.0

- Added `SortHeader` and `TableToolbar` primitives plus static `.zdp-sort-header` and `.zdp-table-toolbar` utilities for sortable column affordances, selected-row actions, and table density controls while keeping sorting, selection state, filtering, permissions, routing, and data loading in consuming apps.
- Added Storybook, static preview, public export, package check, and consumer contract coverage for table-adjacent tool surfaces and `aria-sort` guidance.

## 0.39.0

- Added `CommandField` as the Svelte primitive for search, quick navigation, and command entry inputs while keeping search indexes, result ordering, command palettes, routing, keyboard dispatch, permissions, and server-state decisions in consuming apps.
- Added Storybook, static preview, public export, package check, and consumer contract coverage for command field label, help/error id wiring, shortcut keycap, invalid, disabled, readonly, and focus-within states.

## 0.38.0

- Added `Avatar` and `IdentityChip` plus static `.zdp-avatar` and `.zdp-identity-chip` utilities for compact person, team, and organization identity surfaces while keeping account resolution, profile routing, presence, permissions, invitations, and server-state decisions in consuming apps.
- Added Storybook, static preview, public export, package check, and consumer contract coverage for avatar image/initial and identity chip label/meta accessibility.

## 0.37.0

- Added `SegmentedControl` plus static `.zdp-segmented-control` utilities for compact single-choice view, mode, density, and period selection while keeping filter meaning, URL state, sorting, data loading, permissions, and server-state decisions in consuming apps.
- Added Storybook, interaction probe, static preview, public export, package check, and consumer contract coverage for segmented control radiogroup/radio accessibility.

## 0.36.0

- Added `Accordion` and `Disclosure` primitives plus static `.zdp-disclosure` and `.zdp-accordion` utilities for folded guidance while keeping FAQ copy, settings values, item visibility, permissions, data fetch, and server-state decisions in consuming apps.
- Added Storybook, interaction probe, static preview, public export, package check, and consumer contract coverage for accordion/disclosure trigger-panel accessibility.

## 0.35.0

- Added `Pagination` plus static `.zdp-pagination` utilities for page movement while keeping total counts, current page state, page-size decisions, query routing, filtering, sorting, data fetch, permissions, and server-state decisions in consuming apps.

## 0.34.0

- Added `Progress`, `Spinner`, and `Skeleton` primitives plus static utilities for loading, waiting, and layout reservation while keeping loading conditions, progress calculation, completion/failure transitions, data fetch, retry, permissions, and server-state decisions in consuming apps.

## 0.33.0

- Added `Toast` and `StatusToast` primitives plus static utilities for save, sync, failure, and warning feedback while keeping notification triggers, queue order, timers, dedupe, retry policy, permissions, and server-state decisions in consuming apps.

## 0.32.0

- Added `Popover` and `Menu` primitives plus static utilities for settings, more, filter, and account surfaces while keeping item visibility, permissions, routing, filter meaning, and account state decisions in consuming apps.
- Added a reusable `Tooltip` primitive and moved ShareDock hints onto it so icon buttons, shortcut hints, and status affordances can share the same compact help surface.
- Fixed remaining Overview a11y addon findings by keeping labelled Inline sections out of landmark navigation and hiding the decorative motif mark itself.
- Fixed Overview story a11y addon findings by removing decorative ARIA labels from preview layout wrappers, avoiding repeated named `section` landmarks, and hiding the decorative motif strip.
- Fixed a11y addon findings by using an SVG ConfirmAction thumb glyph, labelled shortcut groups, unique Tabs id prefixes, and roles for labelled div-based layout primitives.
- Fixed remaining Storybook a11y addon findings by giving labelled PageHeader roots a valid role and separating Kbd visible keycaps from screen-reader labels.
- Fixed Storybook navigation a11y findings by moving resting Link and Breadcrumb text to ink tokens and giving repeated breadcrumb landmarks unique sample labels.
- Fixed Feedback story a11y findings by giving primary badges and surface kickers readable ink text and separating repeated callout landmark names.
- Replaced one-character breadcrumb sample labels with longer review text so Storybook color-contrast checks can classify link contrast reliably.
- Fixed light-theme `ConfirmAction` progress fill so slide progress stays visible against the hover background while preserving the existing dark-theme contrast.
- Fixed ShareDock anchor hover states so platform share links use the same icon color and focus rules as button share actions instead of inheriting generic link hover colors.
- Replaced browser-reserved shortcut examples with browser-safe key hints and documented that consumers must not show shortcuts swallowed by the browser or OS.
- Added Storybook a11y addon wiring, ZDP viewport presets, a Button controls playground, and interaction play coverage for Tabs, Dialog, and ConfirmAction.

## 0.31.0

- Added `Kbd` and `ShortcutHint` Svelte primitives plus static `.zdp-kbd` and `.zdp-shortcut-hint` utilities for visible shortcut hints.
- Added optional `ariaKeyShortcuts` passthrough on `Button`, `IconButton`, and `Link` for controls whose shortcuts are implemented by consuming apps.
- Documented that the design system owns keycap presentation only; keydown dispatch, command palette behavior, search focus movement, and shortcut collision handling stay in consuming apps.

## 0.30.2

- Added static `CommandField` utilities for search, quick navigation, and shortcut keycap affordance without adding product-owned search logic.
- Documented that search indexes, result ranking, routing, and permissions stay in consuming apps.

## 0.30.1

- Reduced preview and Storybook page-heading samples from marketing-scale headings to shared product title tokens.
- Updated token document to `0.6.7` so consumers can distinguish ordinary page titles from product-owned hero art.

## 0.30.0

- Added Japanese font-family token and optional Noto Sans JP locale font export for the 10-locale ZDP plan.
- Expanded locale documentation from the previous 6-language wording to the 10-language target.

## 0.29.2

- Replaced ShareDock platform brand glyphs with Simple Icons paths for Telegram, LINE, WhatsApp, X, and Reddit.
- Added `share-icons:check` so platform brand glyphs cannot drift back into custom outline approximations.
- Documented that ShareDock owns brand icon shape data while consumers still own URLs, clipboard, `navigator.share`, and platform routing.

## 0.29.1

- Added `rail` placement for `ShareDock` so document pages can keep icon-only share controls beside the article instead of pinning them to the viewport edge.
- Reduced share dock action and glyph sizing to the small control tokens for a calmer sticky share rail.
- Moved the default side placement to the right side of the page frame and kept tooltips opening inward.

## 0.29.0

- Added `ShareDock` and `zdpShareIcons` for icon-only share surfaces with side, bottom, and inline placement.
- Added static `.zdp-share-*` utilities so Astro and static HTML consumers can use the same share dock without a Svelte island.
- Kept URL generation, clipboard, `navigator.share`, platform links, routing, and permission decisions in consuming apps.

## 0.28.3

- Moved the primary accent away from dusty blue into the parchment/brass palette so default actions, icon buttons, links, selected controls, and confirm progress no longer pop as a separate blue system.
- Muted success, warning, and danger accents into the same market palette so semantic states keep their meaning without fighting the page tone.
- Updated the token document to `0.6.6` and aligned token, preview, Storybook, and consumer checks with the unified accent contract.

## 0.28.2

- Raised only the large surface radius token to `0.5rem` while keeping shared controls at `0.375rem`, so flat cards read as a higher layer without returning to pill-shaped UI.
- Softened secondary Button and ghost IconButton resting borders to `line-subtle`, while keeping hover and active borders on `line-strong` for consistent flat feedback.
- Updated the token document to `0.6.5` and aligned token, preview, Storybook, and consumer checks with the flat premium surface contract.

## 0.28.1

- Muted primary, warning, success, and danger accent tokens so semantic states stay inside the parchment market palette instead of popping like separate UI systems.
- Updated the token document to `0.6.4` and kept the consumer checks aligned with the quieter accent contract.

## 0.28.0

- Added `ConfirmAction` for slide-or-hold confirmation flows such as payment and deletion gates without owning product decisions.
- Reduced the shared control border width from `2px` to `1px` so buttons and framed controls keep a lighter default edge.
- Kept the stronger sunlit focus outline unchanged so keyboard focus remains easy to find without making resting controls feel heavy.
- Updated token, consumer, Storybook, and preview contracts to treat thin framed controls as the default.
- Added compact choice-control tokens so Checkbox, Radio, and Switch no longer reuse icon button sizing.
- Reduced checkbox and radio marks to line-height-friendly dimensions while keeping the native input, label, hover, invalid, disabled, and focus-visible contracts intact.
- Added themed scrollbar tokens and shared reset styling so overflow panels use thin parchment/market scrollbars instead of browser-default gray controls.
- Fixed choice-control hover rules so checked Checkbox, Radio, and Switch states do not visually fall back to unchecked surfaces on hover.
- Aligned Callout marks to one title line so the accent bar no longer lands between the heading and body copy.
- Increased the Checkbox checkmark stroke so the selected state reads clearly while the outer control border stays thin.

## 0.27.0

- Added `Icon` for shared glyph sizing and centered inline alignment.
- Added static `.zdp-icon` utility classes for Astro and non-Svelte consumers.
- Added token document `0.6.0` with `control.glyphSm` and `control.glyphMd` so icon glyph size stays separate from icon button hit area size.
- Updated IconButton, Storybook, preview, package, token, and consumer contract checks so glyphs stay centered without shadows, gradients, hover motion, or product-owned decisions.

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

## 0.6.9

- Added `font.family.brand` for Playwrite AU VIC Guides wordmarks while keeping sans/display typography Pretendard-first.

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
