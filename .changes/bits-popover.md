---
bump: minor
---

- Adopt Bits UI `Popover` (`Root`, `Content`) as the internal headless implementation for Popover, keeping the consumer-defined trigger, default legacy slot, public props, `.zdp-popover*` classes, tokens, and `role` (`null`/`group`/`dialog`) unchanged with no product-facing markup change. Automatic floating placement is now supported, and there is still no automatic DOM portal.
- Keep the existing shared dismissal stack, `closeOnEscape`/`closeOnOutside` opt-out, trigger focus behavior, and static Astro placement CSS. Bits' own dismissal and focus loop are turned off, so Popover still closes on the outside click rather than on Menu's pointerdown.
- Reuse the existing `bits-ui` 2 runtime dependency instead of adding a new one, extend the packed Astro consumer fixture to `static`, `menu`, and `popover` pages, and record the `browser:popover:check` verification command.
