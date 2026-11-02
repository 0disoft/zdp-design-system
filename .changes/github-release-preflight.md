---
bump: patch
---

- Stop GitHub release creation when its existence lookup fails instead of treating all failures as absence. Bound authenticated GET reads and retry only transient reads, preserve causes and cancellation, and keep release creation to one time-limited invocation.
