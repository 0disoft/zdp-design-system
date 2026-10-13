---
bump: minor
---

- Use Bits UI DropdownMenu Content behind the existing Menu API to flip and shift panels inside the viewport. Preserve logical alignment when there is room, use ZDP spacing, and cap long menus to the available space.
- Keep the panel inside its original Menu DOM tree with no automatic portal, preserving dismissal, focus return, native Tab exit, named trigger slots, and Astro's Svelte island/static CSS boundary.
- Add corner, RTL/alignment, long-menu, resize, anchor movement, scroll-container, SSR, and packed Astro regression coverage.
