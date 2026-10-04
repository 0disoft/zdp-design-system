---
bump: patch
---

- Render the first enabled LocaleSwitcher and TextScaleControl option during SSR when the requested value is missing or disabled, preserving the initial keyboard entry point through hydration.
