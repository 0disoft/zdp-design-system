# Text action design QA

- Source visual truth: `C:\Users\cherr\AppData\Local\Temp\codex-clipboard-02bc24ec-7a26-4bcb-a17e-3fce8c102159.png`
- Implementation screenshot: `C:\Users\cherr\AppData\Local\Temp\zdp-text-action-qa-20260809\implementation-storybook-v4.png`
- Focus-state screenshot: `C:\Users\cherr\AppData\Local\Temp\zdp-text-action-qa-20260809\implementation-storybook-v2.png`
- Combined comparison: `C:\Users\cherr\AppData\Local\Temp\zdp-text-action-qa-20260809\source-vs-implementation.png`
- Browser viewport: 1280 × 720 CSS px, device scale 1
- Source pixels: 570 × 125
- Implementation pixels: 1280 × 720; the visible dark text-action region was cropped to 365 × 80 and fitted into a 570 × 125 comparison canvas while preserving its aspect ratio
- State: dark theme, default row plus keyboard-focus evidence

## Full-view comparison evidence

The Storybook Button States screen shows the text actions in light and dark themes without per-action boxes. At the available column width, all four Korean labels remain on one line after the text variant applies compact inline padding. The implementation keeps the selected source's espresso surface, warm cream text, persistent short underline, centered horizontal rhythm, and borderless action silhouette.

## Focused region comparison evidence

The combined comparison confirms that the implementation preserves the source hierarchy and interaction cue. The implementation uses design-system tokens instead of copying the product-specific raw colors. The Storybook panel border visible outside the focused region belongs to the review fixture, not `.zdp-button--text`.

## Required fidelity surfaces

- Fonts and typography: Pretendard-first sans stack, medium control weight, readable one-line Korean labels; passed.
- Spacing and layout rhythm: compact inline padding and tokenized 12 px group gap keep four actions on one line; passed.
- Colors and visual tokens: dark canvas, strong ink, line, hover, and focus colors use semantic ZDP tokens; passed.
- Image quality and asset fidelity: no raster or icon asset is part of this text-only pattern; not applicable.
- Copy and content: `제품 보기`, `가격 보기`, `업데이트`, `고객 지원` match the selected source; passed.

## Interaction and accessibility evidence

- Native anchors preserve navigation semantics in the framework-neutral example.
- Svelte `Button variant="text"` remains available for command actions.
- Keyboard focus retains a 2.4 px outline, a 3 px underline, and a 44 px minimum hit target.
- Package Storybook runtime accessibility and browser accessibility checks passed.
- No implementation console error was observed. Storybook 10.5.7 emitted only its manager-owned future `PopoverProvider ariaLabel` deprecation warning, unrelated to the rendered component.

## Findings

No actionable P0, P1, or P2 mismatch remains.

- P3: the Storybook fixture surrounds each theme column with a review-only border. This is intentionally outside the public text-action surface and does not appear when consumers use `.zdp-button--text` directly.

## Comparison history

1. The first render wrapped `고객 지원` because the text variant inherited framed-button inline padding.
2. The implementation added compact tokenized inline padding while preserving the 44 px hit target.
3. The revised render keeps all four actions on one line in both themes and matches the selected source's density.

## TermTrigger bottom-border correction

- Issue reference: `C:\Users\cherr\AppData\Local\Temp\codex-clipboard-700e429e-7c5e-4f48-b1de-2ef6c5dfbf58.png`
- Default-state screenshot: `C:\Users\cherr\AppData\Local\Temp\zdp-term-trigger-default-qa-20260809.png`
- Hover-state screenshot: `C:\Users\cherr\AppData\Local\Temp\zdp-term-trigger-hover-qa-20260809.png`
- Focus-return screenshot: `C:\Users\cherr\AppData\Local\Temp\zdp-term-trigger-focus-qa-20260809.png`
- Browser viewport: 1280 × 720 CSS px

The issue reference showed the inline term with a rounded bottom border that resembled a short text field. The revised light and dark Storybook states remove that default border and retain medium-weight text for term recognition. Hover uses the existing soft accent background, while keyboard focus after closing the sheet remains visibly outlined. Computed browser styles confirm `border-bottom-width: 0px`, `border-bottom-style: none`, and `font-weight: 500`.

No actionable P0, P1, or P2 mismatch remains. The only console warning is Storybook's manager-owned future `PopoverProvider ariaLabel` deprecation notice and is unrelated to TermTrigger.

## Text action light-theme hover correction

- Issue reference: `C:\Users\cherr\AppData\Local\Temp\codex-clipboard-a95337a4-d608-4f9e-8ee2-2576033d9cdc.png`
- Default-state screenshot: `C:\Users\cherr\AppData\Local\Temp\zdp-text-action-default-qa-20260809.png`
- Light-hover screenshot: `C:\Users\cherr\AppData\Local\Temp\zdp-text-action-light-hover-qa-20260809.png`
- Dark-hover screenshot: `C:\Users\cherr\AppData\Local\Temp\zdp-text-action-dark-hover-qa-20260809.png`
- Browser viewport: 1280 × 720 CSS px

The issue reference showed that the dark-theme underline color changed perceptibly while the light-theme change was difficult to notice. The revised hover and active states keep the borderless composition and expand the underline from 1 px to the 3 px focus-width token. Browser-computed styles confirm `min-block-size: 3px` and `scaleX(1.08)` in both themes, with their theme-specific strong accent colors.

No actionable P0, P1, or P2 mismatch remains. The isolated Storybook page emitted no console error or warning during this check.

## TermTrigger persistent discoverability correction

- Issue reference: `C:\Users\cherr\AppData\Local\Temp\codex-clipboard-8805fa1c-1dd1-46db-b6a4-1fbffc1c2f5c.png`
- Default-state screenshot: `C:\Users\cherr\AppData\Local\Temp\zdp-term-trigger-default-background-qa-20260809.png`
- Light-hover screenshot: `C:\Users\cherr\AppData\Local\Temp\zdp-term-trigger-light-hover-qa-20260809.png`
- Dark-hover screenshot: `C:\Users\cherr\AppData\Local\Temp\zdp-term-trigger-dark-hover-qa-20260809.png`
- Browser viewport: 1280 × 720 CSS px

The issue reference showed that the soft accent background only appeared on hover, leaving the default inline term difficult to recognize as interactive. The revised default state keeps that soft accent background in light and dark themes. Hover changes only to the semantic strong ink color, avoiding font-weight width changes or surrounding-text movement. Browser-computed styles confirm stable `font-weight: 500`, unchanged theme-specific backgrounds, and stronger hover ink in both themes. The focus-return state retains its 2.4 px outline and closed `aria-expanded` state.

No actionable P0, P1, or P2 mismatch remains. The isolated Storybook page emitted no console error or warning during this check.

## Surface-first control and container correction

- Issue references: `C:\Users\cherr\AppData\Local\Temp\codex-clipboard-02f41d69-ceb4-4b0a-afe8-c698eb94d639.png`, `C:\Users\cherr\AppData\Local\Temp\codex-clipboard-b1d24149-994b-48f1-9679-802bdd134b4f.png`, `C:\Users\cherr\AppData\Local\Temp\codex-clipboard-4ec2f804-7844-4662-b62f-31a0189d74c5.png`
- Button screenshot: `C:\Users\cherr\AppData\Local\Temp\zdp-surface-first-buttons-qa-20260809.png`
- Selection screenshot: `C:\Users\cherr\AppData\Local\Temp\zdp-surface-first-selection-qa-20260809.png`

The references identified visual stiffness from repeating borders around controls, groups, containers, and Storybook frames. The revised controls use filled or tonal surfaces for hierarchy: primary and danger actions are filled, secondary actions use a raised surface, ghost icon actions reveal a surface on interaction, and text actions retain their underline contract. LocaleSwitcher and SegmentedControl now use raised group surfaces with filled selected items. Panel and raised Surface/Card tones no longer draw decorative borders; explicit Card outline, text inputs, textareas, tables, modal boundaries, focus outlines, and forced-colors system borders remain structural exceptions.

Computed browser styles confirmed transparent resting border slots for Button, LocaleSwitcher, SegmentedControl, and Storybook theme panels in both themes. The full package verification passed component/static parity, 13 Storybook runtime accessibility stories, SSR hydration, Svelte diagnostics, release checks, and packed consumer browser fixtures. No actionable P0, P1, or P2 mismatch remains.

## Danger Button hover-label correction

- Issue reference: `C:\Users\cherr\AppData\Local\Temp\codex-clipboard-3caa34dd-43a2-4997-a9e6-df7ccbbf30d2.png`
- Verified screenshot: `C:\Users\cherr\AppData\Local\Temp\zdp-danger-hover-fixed-full-20260809.png`

The light-theme danger hover previously changed to the light panel surface while retaining inverse ink, which made the `삭제` label visually disappear. The revised hover state pairs the panel surface with semantic danger ink in both the Svelte component and framework-neutral CSS. Browser inspection confirmed the light hover uses `surface-panel` with `accent-danger`, the dark hover uses its dark panel and danger tokens, both borders remain transparent, and the label remains visible without changing button geometry.

No actionable P0, P1, or P2 mismatch remains.

## ConfirmAction, Select, and Menu borderless correction

- Issue references: `C:\Users\cherr\AppData\Local\Temp\codex-clipboard-2940b2a8-7bc4-49c3-b101-c63e4b7ea382.png`, `C:\Users\cherr\AppData\Local\Temp\codex-clipboard-e0a4f514-9577-43dc-9b37-52344d495ec3.png`, `C:\Users\cherr\AppData\Local\Temp\codex-clipboard-0c2507b7-d89b-4fcd-9bee-cc4fedabd474.png`
- ConfirmAction screenshot: `C:\Users\cherr\AppData\Local\Temp\zdp-confirm-action-borderless-final-20260809.png`
- Select screenshot: `C:\Users\cherr\AppData\Local\Temp\zdp-select-borderless-final-20260809.png`
- Menu screenshot: `C:\Users\cherr\AppData\Local\Temp\zdp-menu-borderless-20260809.png`

ConfirmAction now uses a raised resting surface, accent hover surface, progress fill, and thumb color without outer or thumb borders. Select and its customizable native picker use raised surfaces with a borderless picker and option states; keyboard focus keeps one outline, while invalid state remains connected through ARIA and ErrorText without adding another frame. Menu trigger, floating panel, and item hover/focus states use raised and soft accent surfaces without visible resting or hover borders. All three restore system borders in forced-colors mode.

Browser-computed styles confirmed transparent borders for ConfirmAction and its thumb, Menu trigger/panel/items, and Select in light and dark themes. No actionable P0, P1, or P2 mismatch remains.

## Compact credit-pack glyph refinement

- Issue reference: `C:\Users\cherr\AppData\Local\Temp\codex-clipboard-2c888605-9335-418c-9373-af194a867e02.png`
- Refined Storybook screenshot: `C:\Users\cherr\AppData\Local\Temp\zdp-credit-pack-glyphs-refined-20260809.png`

The previous compact pack family scaled tier value by stacking rectangular sails and hull blocks, which read as crude pixel art rather than a premium product system. The replacement keeps the stable asset names, `currentColor`, 48×48 viewBox, fill-only geometry, 24 CSS px minimum and exact path budgets while introducing curved hulls, triangular sail rhythm, negative gaps and a clearer progression from oared dinghy to pennant-bearing flagship. A contract check now requires curved geometry for every compact pack glyph.

Browser inspection at both rendered sizes confirmed that each tier remains distinguishable without the block-stack effect. No actionable P0, P1, or P2 mismatch remains.

## Responsive square fallback correction

- Issue references: `C:\Users\cherr\AppData\Local\Temp\codex-clipboard-0454ded3-81a4-4709-bfa6-29d051298564.png`, `C:\Users\cherr\AppData\Local\Temp\codex-clipboard-e9c47d9e-7d0b-49cf-a59c-6b91ef1ef90d.png`, `C:\Users\cherr\AppData\Local\Temp\codex-clipboard-beaaed3d-68ca-4319-83e0-91e45c130cce.png`
- Corrected Storybook screenshot: `C:\Users\cherr\AppData\Local\Temp\zdp-brand-square-responsive-qa-20260809.png`

The 256px derivative was valid at its intended intrinsic size, but the Storybook card stretched it to roughly 450 CSS px and made it look materially softer than neighboring assets. The story now supplies the existing 256, 512 and 1024px derivatives as one responsive source set with a truthful `sizes` hint, leaving the browser to select enough source pixels for the rendered width and device pixel ratio. No raster bytes were re-encoded, so the approved source provenance and published asset hashes remain unchanged.

Browser inspection confirmed that the square preview selects a higher-resolution derivative rather than upscaling the 256px file. No actionable P0, P1, or P2 mismatch remains.

## Twelve-locale stress coverage correction

- Issue reference: `C:\Users\cherr\AppData\Local\Temp\codex-clipboard-87a0bb5d-aa9c-4aeb-a644-cf6bd42a1c37.png`
- Corrected Storybook screenshot: `C:\Users\cherr\AppData\Local\Temp\zdp-theme-locale-stress-12-locales-qa-20260809.png`

The Theme / Locale Stress story covered only eight samples while the Architecture contract defines 12 target locales: `en`, `zh`, `es`, `fr`, `hi`, `ko`, `ja`, `vi`, `ru`, `id`, `ms`, and `th`. Spanish, French, Japanese, and Indonesian fixtures are now present in both light and dark mobile-width panels. The story explicitly distinguishes that QA target set from the initially active `ko` and `en` locales. Static Storybook checks require all 12 IDs and representative strings so coverage cannot silently shrink.

Browser inspection confirmed 12 locale cards per theme without horizontal page overflow. No actionable P0, P1, or P2 mismatch remains.

final result: passed
