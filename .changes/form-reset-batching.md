---
bump: patch
---

- Batch native form reset synchronization into one deferred task per reset event instead of one timer per input. Preserve cancelled resets, control teardown, callback order, and error isolation across controls.
