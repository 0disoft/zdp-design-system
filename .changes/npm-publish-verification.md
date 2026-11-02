---
bump: patch
---

- Verify published npm artifacts from one bounded metadata read instead of suppressing separate lookup errors. Preserve failure causes and cancellation, retry transient reads and visibility lag with capped exponential backoff, and fail immediately on mismatched artifacts.
