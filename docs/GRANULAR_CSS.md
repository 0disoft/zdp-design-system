# Granular CSS entries

`zdp-design-system/styles.css` remains the compatibility entry for framework-neutral pages that need every global utility and component style. Static HTML and Astro pages that use only a few ZDP classes should load the smaller granular surface instead.

## Static HTML and Astro

Load the foundation once, then add one CSS entry for every component class family rendered by the page.

```ts
import 'zdp-design-system/foundation.css';
import 'zdp-design-system/components/Button.css';
import 'zdp-design-system/components/Card.css';
```

```html
<article class="zdp-card zdp-card--panel zdp-card--padding-md">
  <div class="zdp-card__body">
    <h2>Export report</h2>
    <p>Generate the current report without loading the complete component stylesheet.</p>
  </div>
  <div class="zdp-card__actions">
    <button class="zdp-button zdp-button--primary zdp-button--md" type="button">
      Export
    </button>
  </div>
</article>
```

Component names are case-sensitive. `Button.svelte` is exported as `components/Button`, and its framework-neutral stylesheet is exported as `components/Button.css`.

`foundation.css` imports `tokens.css` and installs the shared forced-colors fallback. Component entries intentionally do not import the foundation. A page can therefore load several component styles without duplicating the shared foundation.

## Svelte

Svelte consumers should keep using the component subpath and token entry. The Svelte file already carries its scoped component CSS, so importing the matching granular CSS would duplicate those rules.

```ts
import 'zdp-design-system/tokens.css';
import Button from 'zdp-design-system/components/Button';
```

Do not combine `components/Button.css` with the Svelte `Button` component unless the same document also renders framework-neutral `.zdp-button` markup outside Svelte ownership.

## Compatibility entry

The existing entry remains unchanged.

```ts
import 'zdp-design-system/styles.css';
```

It still loads `tokens.css` and the complete `components.css`. Existing consumers do not need to migrate. Granular entries are an opt-in payload reduction for static or framework-neutral surfaces.

## Runtime boundary

CSS entries provide presentation only. Dialog, Sheet, TermSheet, Menu, Popover, Combobox, Tabs, Accordion, ResizableSplitPane and other interactive primitives still require their Svelte component or the documented framework-neutral controller. Copying their classes does not reproduce focus management, dismissal, keyboard navigation, hydration or persistence behavior.

An open shadow root must install `foundation.css` and the selected component CSS files inside that shadow root. Document-level styles do not cross the shadow boundary. Closed shadow roots remain unsupported.

## Generation contract

`bun run package:build` reads the generated public component barrel in `src/lib/index.ts`, extracts each component's `<style>` block, converts Svelte `:global(...)` selectors to ordinary CSS and writes `dist/styles/components/<Component>.css`. Package exports remain owned by `scripts/public-surface.ts`.

`bun run granular-css:check` verifies that every public Svelte component has exactly one generated CSS entry, stale files are absent, Svelte-only selectors are removed, package export resolution reaches the generated files and `foundation.css` remains independent from component-specific selectors.
