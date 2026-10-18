# Public package surface

This file is generated from `scripts/public-surface.ts`. Do not edit it directly. Run `bun run surface:generate` after changing the manifest.

## Stable package entries

| Consumer import | Kind | Purpose | Package target |
| --- | --- | --- | --- |
| `zdp-design-system` | runtime | Compatibility root barrel for Svelte components and helpers. | `types: ./dist/index.d.ts; svelte: ./dist/index.js; import: ./dist/index.js; default: ./dist/index.js` |
| `zdp-design-system/styles.css` | style | Tokens plus framework-neutral component CSS. | `./dist/styles/index.css` |
| `zdp-design-system/foundation.css` | style | Design tokens plus shared framework-neutral foundation rules. | `./dist/styles/foundation.css` |
| `zdp-design-system/tokens.css` | style | Design tokens without the full component stylesheet. | `./dist/styles/tokens.css` |
| `zdp-design-system/brand-fonts.css` | style | Optional brand wordmark font faces. | `./dist/styles/brand-fonts.css` |
| `zdp-design-system/expressive-fonts.css` | style | Optional expressive display font faces. | `./dist/styles/expressive-fonts.css` |
| `zdp-design-system/locale-fonts.css` | style | Optional multilingual webfont faces. | `./dist/styles/locale-fonts.css` |
| `zdp-design-system/components/*.css` | style | Generated framework-neutral CSS for one public component. | `./dist/styles/components/*.css` |
| `zdp-design-system/share` | runtime | Framework-neutral share icon definitions. | `types: ./dist/share.d.ts; import: ./dist/share.js; default: ./dist/share.js` |
| `zdp-design-system/brand-assets` | runtime | Brand asset metadata and integrity manifest. | `types: ./dist/brand-assets.d.ts; import: ./dist/brand-assets.js; default: ./dist/brand-assets.js` |
| `zdp-design-system/credit-assets` | runtime | Credit asset metadata and integrity manifest. | `types: ./dist/credit-assets.d.ts; import: ./dist/credit-assets.js; default: ./dist/credit-assets.js` |
| `zdp-design-system/split-pane` | runtime | Framework-neutral split-pane controller helpers. | `types: ./dist/split-pane.d.ts; import: ./dist/split-pane.js; default: ./dist/split-pane.js` |
| `zdp-design-system/tokens` | token | Raw design-token JSON for tooling consumers. | `./dist/tokens/zdp.tokens.json` |

## Svelte component subpaths

| Consumer import | Package target | Type declaration | Repository source |
| --- | --- | --- | --- |
| `zdp-design-system/components/Accordion` | `./dist/components/Accordion.svelte` | `./dist/components/Accordion.svelte.d.ts` | `src/lib/components/Accordion.svelte` |
| `zdp-design-system/components/AdSlot` | `./dist/components/AdSlot.svelte` | `./dist/components/AdSlot.svelte.d.ts` | `src/lib/components/AdSlot.svelte` |
| `zdp-design-system/components/Avatar` | `./dist/components/Avatar.svelte` | `./dist/components/Avatar.svelte.d.ts` | `src/lib/components/Avatar.svelte` |
| `zdp-design-system/components/Badge` | `./dist/components/Badge.svelte` | `./dist/components/Badge.svelte.d.ts` | `src/lib/components/Badge.svelte` |
| `zdp-design-system/components/Breadcrumb` | `./dist/components/Breadcrumb.svelte` | `./dist/components/Breadcrumb.svelte.d.ts` | `src/lib/components/Breadcrumb.svelte` |
| `zdp-design-system/components/Button` | `./dist/components/Button.svelte` | `./dist/components/Button.svelte.d.ts` | `src/lib/components/Button.svelte` |
| `zdp-design-system/components/Callout` | `./dist/components/Callout.svelte` | `./dist/components/Callout.svelte.d.ts` | `src/lib/components/Callout.svelte` |
| `zdp-design-system/components/Card` | `./dist/components/Card.svelte` | `./dist/components/Card.svelte.d.ts` | `src/lib/components/Card.svelte` |
| `zdp-design-system/components/CardHeader` | `./dist/components/CardHeader.svelte` | `./dist/components/CardHeader.svelte.d.ts` | `src/lib/components/CardHeader.svelte` |
| `zdp-design-system/components/Checkbox` | `./dist/components/Checkbox.svelte` | `./dist/components/Checkbox.svelte.d.ts` | `src/lib/components/Checkbox.svelte` |
| `zdp-design-system/components/CodeBlock` | `./dist/components/CodeBlock.svelte` | `./dist/components/CodeBlock.svelte.d.ts` | `src/lib/components/CodeBlock.svelte` |
| `zdp-design-system/components/Combobox` | `./dist/components/Combobox.svelte` | `./dist/components/Combobox.svelte.d.ts` | `src/lib/components/Combobox.svelte` |
| `zdp-design-system/components/CommandField` | `./dist/components/CommandField.svelte` | `./dist/components/CommandField.svelte.d.ts` | `src/lib/components/CommandField.svelte` |
| `zdp-design-system/components/ConfirmAction` | `./dist/components/ConfirmAction.svelte` | `./dist/components/ConfirmAction.svelte.d.ts` | `src/lib/components/ConfirmAction.svelte` |
| `zdp-design-system/components/Container` | `./dist/components/Container.svelte` | `./dist/components/Container.svelte.d.ts` | `src/lib/components/Container.svelte` |
| `zdp-design-system/components/Dialog` | `./dist/components/Dialog.svelte` | `./dist/components/Dialog.svelte.d.ts` | `src/lib/components/Dialog.svelte` |
| `zdp-design-system/components/Disclosure` | `./dist/components/Disclosure.svelte` | `./dist/components/Disclosure.svelte.d.ts` | `src/lib/components/Disclosure.svelte` |
| `zdp-design-system/components/Divider` | `./dist/components/Divider.svelte` | `./dist/components/Divider.svelte.d.ts` | `src/lib/components/Divider.svelte` |
| `zdp-design-system/components/EmptyState` | `./dist/components/EmptyState.svelte` | `./dist/components/EmptyState.svelte.d.ts` | `src/lib/components/EmptyState.svelte` |
| `zdp-design-system/components/ErrorText` | `./dist/components/ErrorText.svelte` | `./dist/components/ErrorText.svelte.d.ts` | `src/lib/components/ErrorText.svelte` |
| `zdp-design-system/components/Field` | `./dist/components/Field.svelte` | `./dist/components/Field.svelte.d.ts` | `src/lib/components/Field.svelte` |
| `zdp-design-system/components/Grid` | `./dist/components/Grid.svelte` | `./dist/components/Grid.svelte.d.ts` | `src/lib/components/Grid.svelte` |
| `zdp-design-system/components/HelpText` | `./dist/components/HelpText.svelte` | `./dist/components/HelpText.svelte.d.ts` | `src/lib/components/HelpText.svelte` |
| `zdp-design-system/components/Icon` | `./dist/components/Icon.svelte` | `./dist/components/Icon.svelte.d.ts` | `src/lib/components/Icon.svelte` |
| `zdp-design-system/components/IconButton` | `./dist/components/IconButton.svelte` | `./dist/components/IconButton.svelte.d.ts` | `src/lib/components/IconButton.svelte` |
| `zdp-design-system/components/Inline` | `./dist/components/Inline.svelte` | `./dist/components/Inline.svelte.d.ts` | `src/lib/components/Inline.svelte` |
| `zdp-design-system/components/InlineCode` | `./dist/components/InlineCode.svelte` | `./dist/components/InlineCode.svelte.d.ts` | `src/lib/components/InlineCode.svelte` |
| `zdp-design-system/components/Input` | `./dist/components/Input.svelte` | `./dist/components/Input.svelte.d.ts` | `src/lib/components/Input.svelte` |
| `zdp-design-system/components/IdentityChip` | `./dist/components/IdentityChip.svelte` | `./dist/components/IdentityChip.svelte.d.ts` | `src/lib/components/IdentityChip.svelte` |
| `zdp-design-system/components/Kbd` | `./dist/components/Kbd.svelte` | `./dist/components/Kbd.svelte.d.ts` | `src/lib/components/Kbd.svelte` |
| `zdp-design-system/components/KeyValue` | `./dist/components/KeyValue.svelte` | `./dist/components/KeyValue.svelte.d.ts` | `src/lib/components/KeyValue.svelte` |
| `zdp-design-system/components/Label` | `./dist/components/Label.svelte` | `./dist/components/Label.svelte.d.ts` | `src/lib/components/Label.svelte` |
| `zdp-design-system/components/Link` | `./dist/components/Link.svelte` | `./dist/components/Link.svelte.d.ts` | `src/lib/components/Link.svelte` |
| `zdp-design-system/components/LocaleSwitcher` | `./dist/components/LocaleSwitcher.svelte` | `./dist/components/LocaleSwitcher.svelte.d.ts` | `src/lib/components/LocaleSwitcher.svelte` |
| `zdp-design-system/components/Menu` | `./dist/components/Menu.svelte` | `./dist/components/Menu.svelte.d.ts` | `src/lib/components/Menu.svelte` |
| `zdp-design-system/components/Page` | `./dist/components/Page.svelte` | `./dist/components/Page.svelte.d.ts` | `src/lib/components/Page.svelte` |
| `zdp-design-system/components/PageHeader` | `./dist/components/PageHeader.svelte` | `./dist/components/PageHeader.svelte.d.ts` | `src/lib/components/PageHeader.svelte` |
| `zdp-design-system/components/Pagination` | `./dist/components/Pagination.svelte` | `./dist/components/Pagination.svelte.d.ts` | `src/lib/components/Pagination.svelte` |
| `zdp-design-system/components/Popover` | `./dist/components/Popover.svelte` | `./dist/components/Popover.svelte.d.ts` | `src/lib/components/Popover.svelte` |
| `zdp-design-system/components/Progress` | `./dist/components/Progress.svelte` | `./dist/components/Progress.svelte.d.ts` | `src/lib/components/Progress.svelte` |
| `zdp-design-system/components/Radio` | `./dist/components/Radio.svelte` | `./dist/components/Radio.svelte.d.ts` | `src/lib/components/Radio.svelte` |
| `zdp-design-system/components/ResizableSplitPane` | `./dist/components/ResizableSplitPane.svelte` | `./dist/components/ResizableSplitPane.svelte.d.ts` | `src/lib/components/ResizableSplitPane.svelte` |
| `zdp-design-system/components/Section` | `./dist/components/Section.svelte` | `./dist/components/Section.svelte.d.ts` | `src/lib/components/Section.svelte` |
| `zdp-design-system/components/Select` | `./dist/components/Select.svelte` | `./dist/components/Select.svelte.d.ts` | `src/lib/components/Select.svelte` |
| `zdp-design-system/components/SegmentedControl` | `./dist/components/SegmentedControl.svelte` | `./dist/components/SegmentedControl.svelte.d.ts` | `src/lib/components/SegmentedControl.svelte` |
| `zdp-design-system/components/ShareDock` | `./dist/components/ShareDock.svelte` | `./dist/components/ShareDock.svelte.d.ts` | `src/lib/components/ShareDock.svelte` |
| `zdp-design-system/components/Sheet` | `./dist/components/Sheet.svelte` | `./dist/components/Sheet.svelte.d.ts` | `src/lib/components/Sheet.svelte` |
| `zdp-design-system/components/ShortcutHint` | `./dist/components/ShortcutHint.svelte` | `./dist/components/ShortcutHint.svelte.d.ts` | `src/lib/components/ShortcutHint.svelte` |
| `zdp-design-system/components/Skeleton` | `./dist/components/Skeleton.svelte` | `./dist/components/Skeleton.svelte.d.ts` | `src/lib/components/Skeleton.svelte` |
| `zdp-design-system/components/SkipLink` | `./dist/components/SkipLink.svelte` | `./dist/components/SkipLink.svelte.d.ts` | `src/lib/components/SkipLink.svelte` |
| `zdp-design-system/components/SortHeader` | `./dist/components/SortHeader.svelte` | `./dist/components/SortHeader.svelte.d.ts` | `src/lib/components/SortHeader.svelte` |
| `zdp-design-system/components/Stack` | `./dist/components/Stack.svelte` | `./dist/components/Stack.svelte.d.ts` | `src/lib/components/Stack.svelte` |
| `zdp-design-system/components/StatusToast` | `./dist/components/StatusToast.svelte` | `./dist/components/StatusToast.svelte.d.ts` | `src/lib/components/StatusToast.svelte` |
| `zdp-design-system/components/Spinner` | `./dist/components/Spinner.svelte` | `./dist/components/Spinner.svelte.d.ts` | `src/lib/components/Spinner.svelte` |
| `zdp-design-system/components/Surface` | `./dist/components/Surface.svelte` | `./dist/components/Surface.svelte.d.ts` | `src/lib/components/Surface.svelte` |
| `zdp-design-system/components/Switch` | `./dist/components/Switch.svelte` | `./dist/components/Switch.svelte.d.ts` | `src/lib/components/Switch.svelte` |
| `zdp-design-system/components/Tabs` | `./dist/components/Tabs.svelte` | `./dist/components/Tabs.svelte.d.ts` | `src/lib/components/Tabs.svelte` |
| `zdp-design-system/components/Table` | `./dist/components/Table.svelte` | `./dist/components/Table.svelte.d.ts` | `src/lib/components/Table.svelte` |
| `zdp-design-system/components/TableToolbar` | `./dist/components/TableToolbar.svelte` | `./dist/components/TableToolbar.svelte.d.ts` | `src/lib/components/TableToolbar.svelte` |
| `zdp-design-system/components/TermSheet` | `./dist/components/TermSheet.svelte` | `./dist/components/TermSheet.svelte.d.ts` | `src/lib/components/TermSheet.svelte` |
| `zdp-design-system/components/TermTrigger` | `./dist/components/TermTrigger.svelte` | `./dist/components/TermTrigger.svelte.d.ts` | `src/lib/components/TermTrigger.svelte` |
| `zdp-design-system/components/Textarea` | `./dist/components/Textarea.svelte` | `./dist/components/Textarea.svelte.d.ts` | `src/lib/components/Textarea.svelte` |
| `zdp-design-system/components/TextScaleControl` | `./dist/components/TextScaleControl.svelte` | `./dist/components/TextScaleControl.svelte.d.ts` | `src/lib/components/TextScaleControl.svelte` |
| `zdp-design-system/components/ThemeToggle` | `./dist/components/ThemeToggle.svelte` | `./dist/components/ThemeToggle.svelte.d.ts` | `src/lib/components/ThemeToggle.svelte` |
| `zdp-design-system/components/Tooltip` | `./dist/components/Tooltip.svelte` | `./dist/components/Tooltip.svelte.d.ts` | `src/lib/components/Tooltip.svelte` |
| `zdp-design-system/components/Toast` | `./dist/components/Toast.svelte` | `./dist/components/Toast.svelte.d.ts` | `src/lib/components/Toast.svelte` |
| `zdp-design-system/components/Toolbar` | `./dist/components/Toolbar.svelte` | `./dist/components/Toolbar.svelte.d.ts` | `src/lib/components/Toolbar.svelte` |
| `zdp-design-system/components/VisuallyHidden` | `./dist/components/VisuallyHidden.svelte` | `./dist/components/VisuallyHidden.svelte.d.ts` | `src/lib/components/VisuallyHidden.svelte` |

## Asset subpaths

Asset exports derive from the package paths in `src/lib/brand-assets.ts` and `src/lib/credit-assets.ts`.

| Consumer import | Package target |
| --- | --- |
| `zdp-design-system/assets/brand/og-background-1200x630.jpg` | `./dist/assets/brand/og-background-1200x630.jpg` |
| `zdp-design-system/assets/brand/brand-square-1024.webp` | `./dist/assets/brand/brand-square-1024.webp` |
| `zdp-design-system/assets/brand/brand-square-512.webp` | `./dist/assets/brand/brand-square-512.webp` |
| `zdp-design-system/assets/brand/brand-square-256.webp` | `./dist/assets/brand/brand-square-256.webp` |
| `zdp-design-system/assets/brand/editorial-1440x1080.webp` | `./dist/assets/brand/editorial-1440x1080.webp` |
| `zdp-design-system/assets/brand/editorial-720x540.webp` | `./dist/assets/brand/editorial-720x540.webp` |
| `zdp-design-system/assets/brand/landscape-1600x900.webp` | `./dist/assets/brand/landscape-1600x900.webp` |
| `zdp-design-system/assets/brand/landscape-960x540.webp` | `./dist/assets/brand/landscape-960x540.webp` |
| `zdp-design-system/assets/brand/landscape-640x360.webp` | `./dist/assets/brand/landscape-640x360.webp` |
| `zdp-design-system/assets/brand/ship-mark.svg` | `./dist/assets/brand/ship-mark.svg` |
| `zdp-design-system/assets/brand/ship-mark-simple-mono.svg` | `./dist/assets/brand/ship-mark-simple-mono.svg` |
| `zdp-design-system/assets/brand/ship-mark-simple-inverse.svg` | `./dist/assets/brand/ship-mark-simple-inverse.svg` |
| `zdp-design-system/assets/brand/ship-mark-simple-current-color.svg` | `./dist/assets/brand/ship-mark-simple-current-color.svg` |
| `zdp-design-system/assets/brand/ship-mark-simple-tricolor.svg` | `./dist/assets/brand/ship-mark-simple-tricolor.svg` |
| `zdp-design-system/assets/brand/rodi-mark.svg` | `./dist/assets/brand/rodi-mark.svg` |
| `zdp-design-system/assets/brand/rodi-mark-1254.png` | `./dist/assets/brand/rodi-mark-1254.png` |
| `zdp-design-system/assets/credits/credit-lemon-simple-mono.svg` | `./dist/assets/credits/credit-lemon-simple-mono.svg` |
| `zdp-design-system/assets/credits/credit-lemon-simple-inverse.svg` | `./dist/assets/credits/credit-lemon-simple-inverse.svg` |
| `zdp-design-system/assets/credits/credit-lemon-simple-current-color.svg` | `./dist/assets/credits/credit-lemon-simple-current-color.svg` |
| `zdp-design-system/assets/credits/credit-lemon-simple-color.svg` | `./dist/assets/credits/credit-lemon-simple-color.svg` |
| `zdp-design-system/assets/credits/credit-pack-dinghy.svg` | `./dist/assets/credits/credit-pack-dinghy.svg` |
| `zdp-design-system/assets/credits/credit-pack-skiff.svg` | `./dist/assets/credits/credit-pack-skiff.svg` |
| `zdp-design-system/assets/credits/credit-pack-sloop.svg` | `./dist/assets/credits/credit-pack-sloop.svg` |
| `zdp-design-system/assets/credits/credit-pack-brig.svg` | `./dist/assets/credits/credit-pack-brig.svg` |
| `zdp-design-system/assets/credits/credit-pack-frigate.svg` | `./dist/assets/credits/credit-pack-frigate.svg` |
| `zdp-design-system/assets/credits/credit-pack-galleon.svg` | `./dist/assets/credits/credit-pack-galleon.svg` |
| `zdp-design-system/assets/credits/credit-pack-flagship.svg` | `./dist/assets/credits/credit-pack-flagship.svg` |
| `zdp-design-system/assets/credits/credit-pack-keyart-dinghy.webp` | `./dist/assets/credits/credit-pack-keyart-dinghy.webp` |
| `zdp-design-system/assets/credits/credit-pack-keyart-skiff.webp` | `./dist/assets/credits/credit-pack-keyart-skiff.webp` |
| `zdp-design-system/assets/credits/credit-pack-keyart-sloop.webp` | `./dist/assets/credits/credit-pack-keyart-sloop.webp` |
| `zdp-design-system/assets/credits/credit-pack-keyart-brig.webp` | `./dist/assets/credits/credit-pack-keyart-brig.webp` |
| `zdp-design-system/assets/credits/credit-pack-keyart-frigate.webp` | `./dist/assets/credits/credit-pack-keyart-frigate.webp` |
| `zdp-design-system/assets/credits/credit-pack-keyart-galleon.webp` | `./dist/assets/credits/credit-pack-keyart-galleon.webp` |
| `zdp-design-system/assets/credits/credit-pack-keyart-flagship.webp` | `./dist/assets/credits/credit-pack-keyart-flagship.webp` |
