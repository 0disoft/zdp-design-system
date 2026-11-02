---
bump: patch
---

- Index radio groups during focus traversal to avoid quadratic candidate scans. Preserve DOM and tabindex ordering, independent form and shadow-root groups, and immediate updates after silent selection or form-owner changes.
