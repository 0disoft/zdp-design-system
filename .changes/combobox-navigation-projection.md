---
bump: patch
---

- Separate Combobox keyboard navigation calculation from event handling and state updates. Preserve input guards, opening callback order, directional endpoints, wraparound, and first-match selection without mutating caller options.
