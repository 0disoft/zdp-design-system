# Migrating to 0.58

## Input type ownership

`Input` now accepts only value-based text, numeric, and date entry types:
`text`, `search`, `email`, `password`, `url`, `tel`, `number`, `date`,
`time`, `datetime-local`, `month`, and `week`.

- Replace `Input type="checkbox"` with `Checkbox`.
- Replace `Input type="radio"` with `Radio` or `SegmentedControl` when the UI is a compact exclusive choice.
- Use a native `input type="file"` because browsers own its file-list and writable-value contract.
- Use native hidden inputs for form transport; they are not visual design-system controls.
- Keep `range` and `color` native or product-owned until the design system provides dedicated semantics and keyboard-tested components.

`CommandField` now accepts only `search` and `text`. It remains a search or command-entry surface rather than a general form input.

The public `ZdpInputType` and `ZdpCommandFieldType` exports can be used by wrappers that mirror these contracts.

## Roving focus callbacks

Tabs, Menu, SegmentedControl, LocaleSwitcher, and TextScaleControl now share the same owner-document-aware focus movement. Horizontal controls follow their computed RTL direction.

Keyboard selection callbacks receive the original `KeyboardEvent`; they are no longer triggered through a synthetic element click. Consumers that inspected `event.type === 'click'` for every selection must branch on `KeyboardEvent` and `MouseEvent` instead.

## Multiple documents

Dialog, Sheet, and TermSheet layer state is isolated per `root.ownerDocument`. Consumers mounting into iframes or another same-realm document no longer need to serialize those modals with the primary document. Each document owns its own layer count, inert background, nesting level, and body scroll lock.
