---
bump: patch
---

- Detect clipping ancestors that contain fixed Menu and Popover panels, including transform and paint containment. Pass their bounds to the existing Bits UI positioning engine so long panels resize and scroll inside their parent boundaries.
- Preserve ordinary fixed positioning outside untransformed overflow containers, public props, original DOM placement, dismissal, focus return, and Astro paths.
- Add browser regressions for hidden and scrollable transformed parents and paint containment, checking both geometry and actual pointer visibility.
