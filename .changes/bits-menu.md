---
bump: minor
---

- Adopt Bits UI as the internal headless implementation for Menu behind ZDP-owned props, classes, tokens, and named slots, keeping the existing `ZdpMenuItem` public type, Root public props and callbacks, and panel placement CSS unchanged.
- Close Menu on outside pointerdown, and close it with an `onfocusout` plus `flushSync` scope cleanup when focus moves outside programmatically. It previously stayed open until the outside click completed.
- Document the internal adoption and the Astro Svelte-island requirement for interactive menus, and record the Bits UI 2.19.5 MIT notice.
