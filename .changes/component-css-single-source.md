---
bump: patch
---

- `src/styles/components.css` is now generated from the Svelte component `<style>` blocks in the order declared by `scripts/component-style-order.ts`; shared utility classes that do not overlap a component and the forced-colors overrides stay in `src/styles/component-utilities.css`, and the duplicate `component-parts/*.css` fragments plus the component-parity parser check are removed.
