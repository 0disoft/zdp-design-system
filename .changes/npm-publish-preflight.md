---
bump: patch
---

- Fail npm publication preflight on registry outages instead of treating errors as an unpublished version. Bound GET lookups with deadlines and exponential retries, preserve causes and cancellation, and keep publication to one attempt with a deadline and network retries disabled.
