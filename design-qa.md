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

final result: passed
