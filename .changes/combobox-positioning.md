---
bump: minor
---

- Position Combobox lists with Floating UI while retaining the existing selection, filtering, keyboard, IME, form and public API contracts. Flip above the field when necessary and limit long lists to available space.
- Keep the list in the existing DOM without automatic portalling. Track scrolling, resizing and anchor movement, and scroll the active option inside the list without scrolling the page.
- Add viewport, RTL, long-list, active-option, resize, scroll and packed Astro island regression coverage while preserving static CSS consumption.
