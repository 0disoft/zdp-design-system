---
bump: patch
---

- Serialize release artifact writers per output directory with an exclusive filesystem lock, and clean temporary staging and lock resources on setup failure, cancellation, and generation errors.
