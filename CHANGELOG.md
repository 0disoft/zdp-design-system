# Changelog

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
